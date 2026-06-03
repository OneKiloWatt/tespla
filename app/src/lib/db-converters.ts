/**
 * フロントエンド型 (TestPlan / PlanDraftState) ↔ DB 行 の変換ユーティリティ
 */

import type { TestPlan, StudyBlock, AutoSettings, TestResult } from './types';
import type { PlanDraftState } from './plan-draft-store';
import { subjectById } from './subjects';
import type { SupabaseClient } from '@supabase/supabase-js';

export type { PlanDraftState };

// DB 挿入用データ構造
export interface ExamInsert {
  id: string;
  user_id: string;
  version: number;
  name: string;
  start_date: string;
  end_date: string;
  status: 'active';
  planning_mode: 'auto' | 'manual';
  schedule_days: Record<string, string[]>;
}

export interface ExamSubjectInsert {
  id: string;
  exam_id: string;
  subject_id: string;
  subject_name: string;
  normalized_name: string;
  previous_score: null;
  previous_study_minutes: null;
  target_score: number;
  display_order: number;
}

export interface AvailabilityRuleInsert {
  id: string;
  exam_id: string;
  weekday_club_minutes: number;
  weekday_no_club_minutes: number;
  weekend_minutes: number;
  club_days: number[];
  study_start_date: string;
  pre_exam_rest_mode: boolean;
}

export interface DailyPlanInsert {
  id: string;
  exam_id: string;
  exam_subject_id: string;
  date: string;
  planned_minutes: number;
  source: 'auto' | 'manual';
  display_order: number;
}

export interface StudyPlanInsert {
  id: string;
  exam_subject_id: string;
  planned_minutes: number;
  planned_ratio: number;
}

export interface PlanInsertData {
  exam: ExamInsert;
  examSubjects: ExamSubjectInsert[];
  availabilityRule: AvailabilityRuleInsert | null;
  dailyPlans: DailyPlanInsert[];
  studyPlans: StudyPlanInsert[];
}

/** planDraftToInsertData に渡すデータ（state のうちデータ部分のみ） */
export type PlanDraftData = Pick<
  PlanDraftState,
  'testName' | 'startDate' | 'endDate' | 'subjects' | 'testDaySubjects' | 'mode' | 'settings' | 'studyDays' | 'customSubjects'
>;

/**
 * TestPlan（localStorage のお試し計画）→ PlanDraftData に変換
 * signup 完了時に DB へ移行するために使用する
 */
export function testPlanToPlanDraftData(plan: TestPlan): PlanDraftData {
  const defaultSettings: AutoSettings = {
    weekdayMins: 90,
    weekdayClubMins: 60,
    weekendMins: 120,
    clubDays: [],
    noClubBeforeTest: false,
  };
  return {
    testName: plan.testName,
    startDate: plan.startDate,
    endDate: plan.endDate,
    subjects: plan.subjects,
    testDaySubjects: plan.testDaySubjects,
    mode: plan.autoSettings ? 'auto' : 'manual',
    settings: plan.autoSettings ?? defaultSettings,
    studyDays: plan.studyDays,
    customSubjects: plan.customSubjects ?? [],
  };
}

/**
 * PlanDraftData → DB 挿入用データ構造に変換
 */
export function planDraftToInsertData(draft: PlanDraftData, userId: string): PlanInsertData {
  const examId = crypto.randomUUID();

  // exams
  const exam: ExamInsert = {
    id: examId,
    user_id: userId,
    version: 1,
    name: draft.testName,
    start_date: draft.startDate,
    end_date: draft.endDate,
    status: 'active',
    planning_mode: draft.mode,
    schedule_days: draft.testDaySubjects,
  };

  // exam_subjects
  const customMap = new Map(draft.customSubjects.map(c => [c.id, c.label]));
  const examSubjects: ExamSubjectInsert[] = draft.subjects.map((subjectId, idx) => {
    const label = customMap.get(subjectId) ?? subjectById(subjectId).label;
    return {
      id: crypto.randomUUID(),
      exam_id: examId,
      subject_id: subjectId,
      subject_name: label,
      normalized_name: subjectId,
      previous_score: null,
      previous_study_minutes: null,
      target_score: 0,
      display_order: idx,
    };
  });

  // availability_rules（auto モードのみ）
  let availabilityRule: AvailabilityRuleInsert | null = null;
  if (draft.mode === 'auto') {
    const studyDates = Object.keys(draft.studyDays).sort();
    const studyStartDate = studyDates.length > 0 ? studyDates[0] : draft.startDate;
    availabilityRule = {
      id: crypto.randomUUID(),
      exam_id: examId,
      weekday_club_minutes: draft.settings.weekdayClubMins,
      weekday_no_club_minutes: draft.settings.weekdayMins,
      weekend_minutes: draft.settings.weekendMins,
      club_days: draft.settings.clubDays,
      study_start_date: studyStartDate,
      pre_exam_rest_mode: draft.settings.noClubBeforeTest,
    };
  }

  // subjectId → exam_subject_id のマップ
  const subjectIdToExamSubjectId = new Map(
    examSubjects.map(es => [es.subject_id, es.id])
  );

  // daily_plans（同日同科目は合計）
  // キー: `${date}::${subjectId}` → {mins, source, examSubjectId}
  const dailyMap = new Map<string, { mins: number; source: 'auto' | 'manual'; examSubjectId: string; date: string; subjectId: string }>();

  for (const [date, blocks] of Object.entries(draft.studyDays)) {
    for (const block of blocks) {
      const examSubjectId = subjectIdToExamSubjectId.get(block.id);
      if (!examSubjectId) continue; // 存在しない科目はスキップ
      const key = `${date}::${block.id}`;
      const existing = dailyMap.get(key);
      if (existing) {
        existing.mins += block.mins;
      } else {
        dailyMap.set(key, {
          mins: block.mins,
          source: block.source ?? 'manual',
          examSubjectId,
          date,
          subjectId: block.id,
        });
      }
    }
  }

  const dailyPlans: DailyPlanInsert[] = Array.from(dailyMap.values()).map((entry, idx) => ({
    id: crypto.randomUUID(),
    exam_id: examId,
    exam_subject_id: entry.examSubjectId,
    date: entry.date,
    planned_minutes: entry.mins,
    source: entry.source,
    display_order: idx,
  }));

  // study_plans: 科目ごとの合計 planned_minutes から ratio を算出
  const totalMins = dailyPlans.reduce((a, dp) => a + dp.planned_minutes, 0);
  const subjectTotalMap = new Map<string, number>();
  for (const dp of dailyPlans) {
    subjectTotalMap.set(dp.exam_subject_id, (subjectTotalMap.get(dp.exam_subject_id) ?? 0) + dp.planned_minutes);
  }

  const studyPlans: StudyPlanInsert[] = Array.from(subjectTotalMap.entries()).map(([examSubjectId, mins]) => ({
    id: crypto.randomUUID(),
    exam_subject_id: examSubjectId,
    planned_minutes: Math.max(10, mins), // study_plans constraint: >= 10
    planned_ratio: totalMins > 0 ? Number((mins / totalMins).toFixed(4)) : 0,
  }));

  return { exam, examSubjects, availabilityRule, dailyPlans, studyPlans };
}

// DB クエリ結果の型（Supabase のネスト取得を想定）
export interface DbExam {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  planning_mode: string;
  schedule_days: Record<string, string[]> | null;
  created_at: string;
  updated_at: string;
}

export interface DbExamSubject {
  id: string;
  subject_id: string;
  subject_name: string;
  daily_plans?: DbDailyPlan[];
  exam_results?: DbExamResult[];
}

export interface DbDailyPlan {
  id: string;
  exam_subject_id: string;
  date: string;
  planned_minutes: number;
  source: string;
  display_order: number;
}

export interface DbAvailabilityRule {
  weekday_club_minutes: number;
  weekday_no_club_minutes: number;
  weekend_minutes: number;
  club_days: number[];
  pre_exam_rest_mode: boolean;
}

export interface DbExamResult {
  id: string;
  exam_subject_id: string;
  actual_score: number;
  actual_study_minutes: number | null;
  note: string | null;
  created_at: string;
}

export interface FinishedPlanSummary {
  id: string;
  testName: string;
  endDate: string;
  subjects: string[];
  avgScore: number | null;    // 全科目平均（結果未記入なら null）
  totalStudyMins: number;     // daily_plans の planned_minutes 合計
  hasResult: boolean;
}

/**
 * Supabase クエリ結果 → TestPlan 型に変換
 */
export function dbRowsToTestPlan(
  exam: DbExam,
  subjects: DbExamSubject[],
  dailyPlans: DbDailyPlan[],
  arRow?: DbAvailabilityRule | null,
  results?: DbExamResult[],
): TestPlan {
  // subjects[]
  const subjectIds = subjects.map(s => s.subject_id);

  const customSubjects = subjects
    .filter(s => s.subject_id.startsWith('custom_'))
    .map(s => ({ id: s.subject_id, label: s.subject_name }));

  // studyDays: Record<ISODate, StudyBlock[]>
  const studyDays: Record<string, StudyBlock[]> = {};
  for (const dp of dailyPlans) {
    const subject = subjects.find(s => s.id === dp.exam_subject_id);
    if (!subject) continue;
    if (!studyDays[dp.date]) studyDays[dp.date] = [];
    studyDays[dp.date].push({
      id: subject.subject_id,
      mins: dp.planned_minutes,
      source: (dp.source as 'auto' | 'manual') ?? 'manual',
    });
  }

  // testDaySubjects
  const testDaySubjects: Record<string, string[]> = exam.schedule_days ?? {};

  // autoSettings
  let autoSettings: AutoSettings | undefined;
  if (arRow) {
    autoSettings = {
      weekdayMins: arRow.weekday_no_club_minutes,
      weekdayClubMins: arRow.weekday_club_minutes,
      weekendMins: arRow.weekend_minutes,
      clubDays: Array.isArray(arRow.club_days) ? arRow.club_days : [],
      noClubBeforeTest: arRow.pre_exam_rest_mode,
    };
  }

  // result（results が渡された場合のみセット）
  const result = results !== undefined
    ? dbExamResultsToTestResult(subjects, results)
    : undefined;

  return {
    id: exam.id,
    testName: exam.name,
    startDate: exam.start_date,
    endDate: exam.end_date,
    subjects: subjectIds,
    testDaySubjects,
    studyDays,
    autoSettings,
    customSubjects: customSubjects.length > 0 ? customSubjects : undefined,
    result,
    createdAt: exam.created_at,
    updatedAt: exam.updated_at,
  };
}

/**
 * DB の exam_results 行群 → TestResult に変換
 */
export function dbExamResultsToTestResult(
  subjects: DbExamSubject[],
  results: DbExamResult[],
): TestResult | undefined {
  if (results.length === 0) return undefined;

  // examSubjectId → subjectId のマップ
  const examSubjectIdToSubjectId = new Map(
    subjects.map(s => [s.id, s.subject_id])
  );

  const scores: Record<string, number> = {};
  for (const r of results) {
    const subjectId = examSubjectIdToSubjectId.get(r.exam_subject_id);
    if (subjectId !== undefined) {
      scores[subjectId] = r.actual_score;
    }
  }

  const memo = results.find(r => r.note !== null)?.note ?? undefined;
  const recordedAt = results[0].created_at;

  return { scores, memo, recordedAt };
}

/**
 * ログインユーザーの finished な計画一覧を取得
 */
export async function fetchFinishedPlans(
  supabase: SupabaseClient,
  userId: string,
): Promise<FinishedPlanSummary[]> {
  const { data, error } = await supabase
    .from('exams')
    .select('id, name, end_date, exam_subjects(subject_id, exam_results(actual_score)), daily_plans(planned_minutes)')
    .eq('user_id', userId)
    .eq('status', 'finished')
    .order('end_date', { ascending: true });

  if (error || !data) return [];

  return (data as Array<{
    id: string;
    name: string;
    end_date: string;
    exam_subjects: Array<{
      subject_id: string;
      exam_results: Array<{ actual_score: number }>;
    }>;
    daily_plans: Array<{ planned_minutes: number }>;
  }>).map(row => {
    const examSubjects = row.exam_subjects ?? [];
    const allResults = examSubjects.flatMap(s => s.exam_results ?? []);
    const subjects = examSubjects.map(s => s.subject_id);

    const avgScore = allResults.length > 0
      ? Math.round(allResults.reduce((a, r) => a + r.actual_score, 0) / allResults.length)
      : null;

    const totalStudyMins = (row.daily_plans ?? []).reduce(
      (a: number, dp: { planned_minutes: number }) => a + dp.planned_minutes,
      0
    );

    return {
      id: row.id,
      testName: row.name,
      endDate: row.end_date,
      subjects,
      avgScore,
      totalStudyMins,
      hasResult: allResults.length > 0,
    };
  });
}

/**
 * 単一計画の詳細（結果込み）を取得
 */
export async function fetchExamDetail(
  supabase: SupabaseClient,
  examId: string,
  userId: string,
): Promise<TestPlan | null> {
  const { data, error } = await supabase
    .from('exams')
    .select('*, exam_subjects(*, exam_results(*)), daily_plans(*), availability_rules(*)')
    .eq('id', examId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;

  const subjects = (data.exam_subjects ?? []) as DbExamSubject[];
  // daily_plans はクエリでトップレベルに含まれる
  const dailyPlans = (data.daily_plans ?? []) as DbDailyPlan[];
  const flatResults: DbExamResult[] = subjects.flatMap((s: DbExamSubject) => s.exam_results ?? []);

  const arRow = Array.isArray(data.availability_rules)
    ? (data.availability_rules[0] ?? null) as DbAvailabilityRule | null
    : (data.availability_rules ?? null) as DbAvailabilityRule | null;

  return dbRowsToTestPlan(data as DbExam, subjects, dailyPlans, arRow, flatResults);
}

/**
 * ログインユーザーのアクティブな計画を DB から取得して TestPlan に変換する共通ヘルパー。
 * home/page.tsx と plan/page.tsx の重複クエリを集約する。
 */
export async function fetchActivePlan(
  supabase: SupabaseClient,
  userId: string,
): Promise<TestPlan | null> {
  const { data } = await supabase
    .from('exams')
    .select('*, exam_subjects(*, daily_plans(*)), availability_rules(*)')
    .eq('user_id', userId)
    .in('status', ['active', 'planning'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  const subjects = data.exam_subjects ?? [];
  const dailyPlans = subjects.flatMap((s: { daily_plans?: unknown[] }) => s.daily_plans ?? []);
  const arRow = Array.isArray(data.availability_rules)
    ? (data.availability_rules[0] ?? null)
    : (data.availability_rules ?? null);

  return dbRowsToTestPlan(data, subjects, dailyPlans, arRow);
}
