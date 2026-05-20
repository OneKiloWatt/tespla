'use server';

import { createClient } from '@/lib/supabase/server';
import { planDraftToInsertData } from '@/lib/db-converters';
import type { PlanDraftData } from '@/lib/db-converters';
import { savePlanSchema, updateDailyPlanSchema, saveResultSchema } from '@/lib/schemas';

/**
 * 計画を DB に保存する Server Action
 */
export async function savePlan(draft: PlanDraftData): Promise<{ planId: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Zod バリデーション
  const parsed = savePlanSchema.safeParse(draft);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(i => i.message).join(', '));
  }

  const insertData = planDraftToInsertData(parsed.data, user.id);
  const examId = insertData.exam.id;

  try {
    // 1. exams 挿入
    const { error: examError } = await supabase
      .from('exams')
      .insert(insertData.exam);
    if (examError) throw examError;

    // 2. exam_subjects 挿入（挿入した行の id, subject_id を取得）
    const { data: insertedSubjects, error: subjectsError } = await supabase
      .from('exam_subjects')
      .insert(insertData.examSubjects)
      .select('id, subject_id');
    if (subjectsError) throw subjectsError;

    // subject_id → DB の id マッピング（crypto.randomUUID() で生成した id と一致するはずだが念のため再マッピング）
    const subjectIdMap = new Map(
      (insertedSubjects ?? []).map(s => [s.subject_id, s.id])
    );

    // exam_subject_id を DB 返却値で更新
    const dailyPlansWithDbIds = insertData.dailyPlans.map(dp => {
      const examSubject = insertData.examSubjects.find(es => es.id === dp.exam_subject_id);
      if (!examSubject) return dp;
      const dbId = subjectIdMap.get(examSubject.subject_id);
      return dbId ? { ...dp, exam_subject_id: dbId } : dp;
    });

    const studyPlansWithDbIds = insertData.studyPlans.map(sp => {
      const examSubject = insertData.examSubjects.find(es => es.id === sp.exam_subject_id);
      if (!examSubject) return sp;
      const dbId = subjectIdMap.get(examSubject.subject_id);
      return dbId ? { ...sp, exam_subject_id: dbId } : sp;
    });

    // 3. availability_rules 挿入（auto モードのみ）
    if (insertData.availabilityRule) {
      const { error: arError } = await supabase
        .from('availability_rules')
        .insert(insertData.availabilityRule);
      if (arError) throw arError;
    }

    // 4. daily_plans 挿入（同日同科目は合計済み）
    if (dailyPlansWithDbIds.length > 0) {
      const { error: dpError } = await supabase
        .from('daily_plans')
        .insert(dailyPlansWithDbIds);
      if (dpError) throw dpError;
    }

    // 5. study_plans 挿入
    if (studyPlansWithDbIds.length > 0) {
      const { error: spError } = await supabase
        .from('study_plans')
        .insert(studyPlansWithDbIds);
      if (spError) throw spError;
    }

    return { planId: examId };
  } catch (e) {
    console.error('savePlan error:', e);
    // 失敗時: CASCADE DELETE で関連テーブルも削除
    await supabase.from('exams').delete().eq('id', examId);
    throw new Error('計画の保存に失敗しました');
  }
}

/**
 * 日次計画を更新する Server Action
 */
export async function updateDailyPlan(
  examId: string,
  date: string,
  subjectId: string,
  mins: number,
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 入力バリデーション
  const parsed = updateDailyPlanSchema.safeParse({ examId, date, subjectId, mins });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(i => i.message).join(', '));
  }

  // 所有権確認: examId が認証ユーザーのものであることを確認する
  const { data: examData } = await supabase
    .from('exams').select('id').eq('id', examId).eq('user_id', user.id).single();
  if (!examData) throw new Error('Unauthorized');

  // exam_subject を取得
  const { data: examSubjectData, error: esError } = await supabase
    .from('exam_subjects')
    .select('id')
    .eq('exam_id', examId)
    .eq('subject_id', subjectId)
    .single();
  if (esError || !examSubjectData) throw new Error('計画データの取得に失敗しました');

  const examSubjectId = examSubjectData.id;

  const now = new Date().toISOString();

  // daily_plans を UPDATE（0 件なら対象レコードが存在しないためエラー）
  const { data: dpData, error: dpError } = await supabase
    .from('daily_plans')
    .update({ planned_minutes: mins, updated_at: now })
    .eq('exam_id', examId)
    .eq('exam_subject_id', examSubjectId)
    .eq('date', date)
    .select();
  if (dpError) throw new Error('計画の更新に失敗しました');
  if (!dpData || dpData.length === 0) throw new Error('daily_plan not found');

  // study_plans の planned_minutes と planned_ratio を再計算
  const { data: allDailyPlans, error: allDpError } = await supabase
    .from('daily_plans')
    .select('exam_subject_id, planned_minutes')
    .eq('exam_id', examId);
  if (allDpError) throw new Error('計画の更新に失敗しました');

  const totalMins = (allDailyPlans ?? []).reduce((a, dp) => a + dp.planned_minutes, 0);
  const subjectTotalMins = (allDailyPlans ?? [])
    .filter(dp => dp.exam_subject_id === examSubjectId)
    .reduce((a, dp) => a + dp.planned_minutes, 0);

  if (totalMins > 0) {
    const { data: spData, error: spError } = await supabase
      .from('study_plans')
      .update({
        planned_minutes: Math.max(10, subjectTotalMins),
        planned_ratio: Number((subjectTotalMins / totalMins).toFixed(4)),
        updated_at: now,
      })
      .eq('exam_subject_id', examSubjectId)
      .select();
    if (spError) throw new Error('計画の更新に失敗しました');
    if (!spData || spData.length === 0) throw new Error('study_plan not found');
  }
}

/**
 * 既存の計画を終了して新規作成できるようにする Server Action
 */
export async function finishAndCreateNew(existingExamId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('exams')
    .update({ status: 'finished', updated_at: new Date().toISOString() })
    .eq('id', existingExamId)
    .eq('user_id', user.id)
    .select();
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Plan not found or unauthorized');
}

/**
 * テスト結果を DB に保存する Server Action
 */
export async function saveResult(
  examId: string,
  scores: Record<string, number>,
  memo?: string,
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Zod バリデーション
  const parsed = saveResultSchema.safeParse({ examId, scores, memo });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(i => i.message).join(', '));
  }

  // 所有権確認
  const { data: examData } = await supabase
    .from('exams')
    .select('id')
    .eq('id', examId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!examData) throw new Error('Unauthorized');

  // subjectId → examSubjectId マップを作成
  const { data: examSubjects, error: esError } = await supabase
    .from('exam_subjects')
    .select('id, subject_id')
    .eq('exam_id', examId);
  if (esError) throw new Error('科目データの取得に失敗しました');

  const subjectIdToExamSubjectId = new Map(
    (examSubjects ?? []).map((es: { id: string; subject_id: string }) => [es.subject_id, es.id])
  );

  // exam_results を INSERT or UPDATE（PK を変えないため SELECT で存在確認してから分岐）
  const now = new Date().toISOString();
  for (const [subjectId, score] of Object.entries(parsed.data.scores)) {
    const examSubjectId = subjectIdToExamSubjectId.get(subjectId);
    if (!examSubjectId) continue; // マップに存在しない科目はスキップ

    const { data: existing } = await supabase
      .from('exam_results')
      .select('id')
      .eq('exam_subject_id', examSubjectId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('exam_results')
        .update({ actual_score: score, note: parsed.data.memo ?? null, updated_at: now })
        .eq('id', existing.id);
      if (error) throw new Error('結果の保存に失敗しました');
    } else {
      const { error } = await supabase
        .from('exam_results')
        .insert({ id: crypto.randomUUID(), exam_subject_id: examSubjectId, actual_score: score, note: parsed.data.memo ?? null });
      if (error) throw new Error('結果の保存に失敗しました');
    }
  }

  // exam を finished に更新
  const { error: updateError } = await supabase
    .from('exams')
    .update({ status: 'finished', updated_at: now })
    .eq('id', examId)
    .eq('user_id', user.id);
  if (updateError) throw new Error('計画ステータスの更新に失敗しました');
}

/**
 * ログインユーザーのアクティブな計画 ID を取得する Server Action
 */
export async function getActivePlanId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('exams')
    .select('id')
    .eq('user_id', user.id)
    .in('status', ['planning', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}
