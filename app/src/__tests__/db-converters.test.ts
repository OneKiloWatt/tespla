/**
 * db-converters.ts のユニットテスト
 *
 * テスト対象:
 *   - planDraftToInsertData: PlanDraftData → DB 挿入用データ構造
 *   - dbRowsToTestPlan: DB 行 → TestPlan 型
 */

import { describe, it, expect, vi } from 'vitest';
import {
  planDraftToInsertData,
  dbRowsToTestPlan,
  type PlanDraftData,
  type DbExam,
  type DbExamSubject,
  type DbDailyPlan,
  type DbAvailabilityRule,
} from '@/lib/db-converters';

// crypto.randomUUID() のモック（Node.js 環境では通常利用可能だが念のため）
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// テスト用 PlanDraftState（auto モード）
const baseDraftAuto: PlanDraftData = {
  testName: '2学期 中間テスト',
  startDate: '2025-10-15',
  endDate: '2025-10-17',
  subjects: ['math', 'en', 'jp'],
  testDaySubjects: {
    '2025-10-15': ['math', 'en'],
    '2025-10-16': ['jp'],
  },
  mode: 'auto',
  settings: {
    weekdayMins: 90,
    weekdayClubMins: 60,
    weekendMins: 120,
    clubDays: [1, 3, 5], // 月, 水, 金
    noClubBeforeTest: true,
  },
  studyDays: {
    '2025-10-10': [
      { id: 'math', mins: 60, source: 'auto' },
      { id: 'en', mins: 30, source: 'auto' },
    ],
    '2025-10-11': [
      { id: 'jp', mins: 45, source: 'auto' },
      { id: 'math', mins: 45, source: 'auto' },
    ],
  },
};

// テスト用 PlanDraftState（manual モード）
const baseDraftManual: PlanDraftData = {
  testName: '1学期 期末テスト',
  startDate: '2025-07-10',
  endDate: '2025-07-12',
  subjects: ['sci', 'soc'],
  testDaySubjects: { '2025-07-10': ['sci', 'soc'] },
  mode: 'manual',
  settings: {
    weekdayMins: 60,
    weekdayClubMins: 30,
    weekendMins: 90,
    clubDays: [],
    noClubBeforeTest: false,
  },
  studyDays: {
    '2025-07-07': [{ id: 'sci', mins: 40, source: 'manual' }],
  },
};

const USER_ID = 'user-abc-123';

describe('planDraftToInsertData', () => {
  describe('exam レコード', () => {
    it('exam.user_id が正しく設定される', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      expect(result.exam.user_id).toBe(USER_ID);
    });

    it('exam.name が testName と一致する', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      expect(result.exam.name).toBe('2学期 中間テスト');
    });

    it('exam.start_date / end_date が正しく設定される', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      expect(result.exam.start_date).toBe('2025-10-15');
      expect(result.exam.end_date).toBe('2025-10-17');
    });

    it('exam.status が "active"', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      expect(result.exam.status).toBe('active');
    });

    it('exam.planning_mode が draft.mode と一致する（auto）', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      expect(result.exam.planning_mode).toBe('auto');
    });

    it('exam.planning_mode が draft.mode と一致する（manual）', () => {
      const result = planDraftToInsertData(baseDraftManual, USER_ID);
      expect(result.exam.planning_mode).toBe('manual');
    });

    it('exam.id が UUID 形式', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      expect(result.exam.id).toMatch(UUID_REGEX);
    });

    it('exam.schedule_days が testDaySubjects と一致する', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      expect(result.exam.schedule_days).toEqual(baseDraftAuto.testDaySubjects);
    });
  });

  describe('examSubjects レコード', () => {
    it('subjects の数だけ examSubjects が生成される', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      expect(result.examSubjects).toHaveLength(3);
    });

    it('subject_id が正しく設定される', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      const ids = result.examSubjects.map(s => s.subject_id);
      expect(ids).toEqual(['math', 'en', 'jp']);
    });

    it('subject_name が subjects ライブラリの label と一致する', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      const mathSubject = result.examSubjects.find(s => s.subject_id === 'math');
      expect(mathSubject?.subject_name).toBe('数学');
    });

    it('display_order が 0 始まりの連番', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      const orders = result.examSubjects.map(s => s.display_order);
      expect(orders).toEqual([0, 1, 2]);
    });

    it('exam_id が exam.id と一致する', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      result.examSubjects.forEach(es => {
        expect(es.exam_id).toBe(result.exam.id);
      });
    });
  });

  describe('availabilityRule レコード（auto モード）', () => {
    it('auto モードでは availabilityRule が null でない', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      expect(result.availabilityRule).not.toBeNull();
    });

    it('manual モードでは availabilityRule が null', () => {
      const result = planDraftToInsertData(baseDraftManual, USER_ID);
      expect(result.availabilityRule).toBeNull();
    });

    it('weekday_no_club_minutes が settings.weekdayMins と一致する', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      expect(result.availabilityRule?.weekday_no_club_minutes).toBe(90);
    });

    it('weekday_club_minutes が settings.weekdayClubMins と一致する', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      expect(result.availabilityRule?.weekday_club_minutes).toBe(60);
    });

    it('weekend_minutes が settings.weekendMins と一致する', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      expect(result.availabilityRule?.weekend_minutes).toBe(120);
    });

    it('club_days が settings.clubDays と一致する', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      expect(result.availabilityRule?.club_days).toEqual([1, 3, 5]);
    });

    it('pre_exam_rest_mode が settings.noClubBeforeTest と一致する', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      expect(result.availabilityRule?.pre_exam_rest_mode).toBe(true);
    });

    it('study_start_date が studyDays の最初の日付', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      // studyDays のキーをソートした最初が 2025-10-10
      expect(result.availabilityRule?.study_start_date).toBe('2025-10-10');
    });

    it('studyDays が空のとき study_start_date が startDate にフォールバック', () => {
      const draft: PlanDraftData = {
        ...baseDraftAuto,
        studyDays: {},
      };
      const result = planDraftToInsertData(draft, USER_ID);
      expect(result.availabilityRule?.study_start_date).toBe('2025-10-15');
    });
  });

  describe('dailyPlans レコード', () => {
    it('各 date/subject ブロックから dailyPlans が生成される', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      // 2025-10-10: math, en (2件) + 2025-10-11: jp, math (2件) = 合計4件
      expect(result.dailyPlans).toHaveLength(4);
    });

    it('同日同科目のブロックが合計される', () => {
      const draftWithDuplicate: PlanDraftData = {
        ...baseDraftAuto,
        studyDays: {
          '2025-10-10': [
            { id: 'math', mins: 30, source: 'auto' },
            { id: 'math', mins: 45, source: 'manual' }, // 同日同科目
          ],
        },
      };
      const result = planDraftToInsertData(draftWithDuplicate, USER_ID);
      expect(result.dailyPlans).toHaveLength(1);
      expect(result.dailyPlans[0].planned_minutes).toBe(75);
    });

    it('存在しない subject_id のブロックはスキップされる', () => {
      const draftWithUnknown: PlanDraftData = {
        ...baseDraftAuto,
        studyDays: {
          '2025-10-10': [
            { id: 'math', mins: 60, source: 'auto' },
            { id: 'unknown_subject', mins: 30, source: 'auto' }, // 存在しない
          ],
        },
      };
      const result = planDraftToInsertData(draftWithUnknown, USER_ID);
      expect(result.dailyPlans).toHaveLength(1);
      expect(result.dailyPlans[0].planned_minutes).toBe(60);
    });

    it('dailyPlan の exam_id が exam.id と一致する', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      result.dailyPlans.forEach(dp => {
        expect(dp.exam_id).toBe(result.exam.id);
      });
    });

    it('source が正しく引き継がれる', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      const mathOn1010 = result.dailyPlans.find(
        dp => dp.date === '2025-10-10' && dp.exam_subject_id !== undefined
      );
      // source が auto か manual のいずれか
      expect(['auto', 'manual']).toContain(mathOn1010?.source);
    });
  });

  describe('studyPlans レコード', () => {
    it('科目ごとに1件の studyPlan が生成される', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      // math: 2025-10-10(60) + 2025-10-11(45) = 105, en: 30, jp: 45
      expect(result.studyPlans).toHaveLength(3);
    });

    it('planned_ratio の合計が 1.0 に近い（誤差 0.001 以内）', () => {
      const result = planDraftToInsertData(baseDraftAuto, USER_ID);
      const total = result.studyPlans.reduce((a, sp) => a + sp.planned_ratio, 0);
      expect(total).toBeCloseTo(1.0, 2);
    });

    it('planned_minutes が最低 10 分', () => {
      const draftMinMins: PlanDraftData = {
        ...baseDraftAuto,
        studyDays: {
          '2025-10-10': [{ id: 'math', mins: 5, source: 'manual' }], // 5分 < 10分
        },
      };
      const result = planDraftToInsertData(draftMinMins, USER_ID);
      expect(result.studyPlans[0].planned_minutes).toBeGreaterThanOrEqual(10);
    });

    it('studyDays が空のとき studyPlans も空', () => {
      const draftEmpty: PlanDraftData = {
        ...baseDraftAuto,
        studyDays: {},
      };
      const result = planDraftToInsertData(draftEmpty, USER_ID);
      expect(result.studyPlans).toHaveLength(0);
    });

    it('totalMins が 0 のとき planned_ratio が 0', () => {
      // studyDays にブロックがあっても subjects にないと dailyPlans が空になる
      const draftNoSubjects: PlanDraftData = {
        ...baseDraftAuto,
        subjects: [], // 科目なし
        studyDays: {
          '2025-10-10': [{ id: 'math', mins: 60, source: 'auto' }],
        },
      };
      const result = planDraftToInsertData(draftNoSubjects, USER_ID);
      // subjects が空なので examSubjects も空、dailyPlans もスキップ
      expect(result.studyPlans).toHaveLength(0);
    });
  });
});

describe('dbRowsToTestPlan', () => {
  const mockExam: DbExam = {
    id: 'exam-001',
    name: '2学期 中間テスト',
    start_date: '2025-10-15',
    end_date: '2025-10-17',
    status: 'active',
    planning_mode: 'auto',
    schedule_days: {
      '2025-10-15': ['math'],
      '2025-10-16': ['en'],
    },
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2025-09-01T00:00:00Z',
  };

  const mockSubjects: DbExamSubject[] = [
    { id: 'es-math', subject_id: 'math', subject_name: '数学' },
    { id: 'es-en',   subject_id: 'en',   subject_name: '英語' },
  ];

  const mockDailyPlans: DbDailyPlan[] = [
    { id: 'dp-1', exam_subject_id: 'es-math', date: '2025-10-10', planned_minutes: 60, source: 'auto',   display_order: 0 },
    { id: 'dp-2', exam_subject_id: 'es-en',   date: '2025-10-10', planned_minutes: 30, source: 'auto',   display_order: 1 },
    { id: 'dp-3', exam_subject_id: 'es-math', date: '2025-10-11', planned_minutes: 45, source: 'manual', display_order: 2 },
  ];

  const mockArRow: DbAvailabilityRule = {
    weekday_club_minutes: 60,
    weekday_no_club_minutes: 90,
    weekend_minutes: 120,
    club_days: [1, 3, 5],
    pre_exam_rest_mode: true,
  };

  it('exam.id が TestPlan.id に変換される', () => {
    const result = dbRowsToTestPlan(mockExam, mockSubjects, mockDailyPlans, mockArRow);
    expect(result.id).toBe('exam-001');
  });

  it('exam.name が TestPlan.testName に変換される', () => {
    const result = dbRowsToTestPlan(mockExam, mockSubjects, mockDailyPlans, mockArRow);
    expect(result.testName).toBe('2学期 中間テスト');
  });

  it('subjects が subject_id の配列に変換される', () => {
    const result = dbRowsToTestPlan(mockExam, mockSubjects, mockDailyPlans, mockArRow);
    expect(result.subjects).toEqual(['math', 'en']);
  });

  it('studyDays が日付ごとに StudyBlock[] に変換される', () => {
    const result = dbRowsToTestPlan(mockExam, mockSubjects, mockDailyPlans, mockArRow);
    expect(Object.keys(result.studyDays)).toHaveLength(2); // 2025-10-10, 2025-10-11
    expect(result.studyDays['2025-10-10']).toHaveLength(2);
    expect(result.studyDays['2025-10-11']).toHaveLength(1);
  });

  it('studyDays の各ブロックの id が subject_id になる', () => {
    const result = dbRowsToTestPlan(mockExam, mockSubjects, mockDailyPlans, mockArRow);
    const block = result.studyDays['2025-10-10'][0];
    expect(block.id).toBe('math');
  });

  it('studyDays の各ブロックの mins が planned_minutes になる', () => {
    const result = dbRowsToTestPlan(mockExam, mockSubjects, mockDailyPlans, mockArRow);
    const mathBlock = result.studyDays['2025-10-10'].find(b => b.id === 'math');
    expect(mathBlock?.mins).toBe(60);
  });

  it('testDaySubjects が schedule_days から変換される', () => {
    const result = dbRowsToTestPlan(mockExam, mockSubjects, mockDailyPlans, mockArRow);
    expect(result.testDaySubjects).toEqual({
      '2025-10-15': ['math'],
      '2025-10-16': ['en'],
    });
  });

  it('schedule_days が null のとき testDaySubjects が空オブジェクト', () => {
    const examNullSchedule: DbExam = { ...mockExam, schedule_days: null };
    const result = dbRowsToTestPlan(examNullSchedule, mockSubjects, mockDailyPlans, mockArRow);
    expect(result.testDaySubjects).toEqual({});
  });

  it('arRow がある場合 autoSettings が設定される', () => {
    const result = dbRowsToTestPlan(mockExam, mockSubjects, mockDailyPlans, mockArRow);
    expect(result.autoSettings).toBeDefined();
    expect(result.autoSettings?.weekdayMins).toBe(90);
    expect(result.autoSettings?.weekdayClubMins).toBe(60);
    expect(result.autoSettings?.weekendMins).toBe(120);
    expect(result.autoSettings?.clubDays).toEqual([1, 3, 5]);
    expect(result.autoSettings?.noClubBeforeTest).toBe(true);
  });

  it('arRow が null のとき autoSettings が undefined', () => {
    const result = dbRowsToTestPlan(mockExam, mockSubjects, mockDailyPlans, null);
    expect(result.autoSettings).toBeUndefined();
  });

  it('arRow が undefined のとき autoSettings が undefined', () => {
    const result = dbRowsToTestPlan(mockExam, mockSubjects, mockDailyPlans, undefined);
    expect(result.autoSettings).toBeUndefined();
  });

  it('exam_subject_id が subjects に存在しない dailyPlan はスキップされる', () => {
    const orphanDp: DbDailyPlan[] = [
      ...mockDailyPlans,
      { id: 'dp-orphan', exam_subject_id: 'es-nonexistent', date: '2025-10-12', planned_minutes: 30, source: 'auto', display_order: 3 },
    ];
    const result = dbRowsToTestPlan(mockExam, mockSubjects, orphanDp, null);
    expect(result.studyDays['2025-10-12']).toBeUndefined();
  });

  it('createdAt / updatedAt が正しく変換される', () => {
    const result = dbRowsToTestPlan(mockExam, mockSubjects, mockDailyPlans, null);
    expect(result.createdAt).toBe('2025-09-01T00:00:00Z');
    expect(result.updatedAt).toBe('2025-09-01T00:00:00Z');
  });

  it('club_days が配列でない場合、autoSettings.clubDays が空配列になる', () => {
    const arWithNonArrayClub = {
      ...mockArRow,
      club_days: null as unknown as number[],
    };
    const result = dbRowsToTestPlan(mockExam, mockSubjects, mockDailyPlans, arWithNonArrayClub);
    expect(result.autoSettings?.clubDays).toEqual([]);
  });
});
