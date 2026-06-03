import { z } from 'zod';

/** メール + パスワードのログインフォーム */
export const loginSchema = z.object({
  email: z.string().email('メールアドレスの形式が正しくありません'),
  password: z.string().min(8, 'パスワードは8文字以上にしてください'),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** 新規登録フォーム */
export const signupSchema = z.object({
  email: z.string().email('メールアドレスの形式が正しくありません'),
  password: z.string().min(8, 'パスワードは8文字以上にしてください'),
  agreed: z.boolean().refine(val => val === true, '利用規約に同意してください'),
});
export type SignupInput = z.infer<typeof signupSchema>;

/**
 * Server Action バリデーション用: 日次の勉強分数のみを保持する最小スキーマ。
 * 科目情報を持たない単純な分数入力に使う。
 * studyDayBlockSchema（id・source 付き）と混同しないこと。
 * @deprecated 現時点で直接使用箇所なし。studyDayBlockSchema を優先する。
 */
export const studyDayMinsSchema = z.object({ mins: z.number().int().min(10).max(600) });

/** Step 1: テスト情報 */
export const testInfoSchema = z.object({
  testName: z.string().min(1, 'テスト名を入力してください').max(100, 'テスト名は100文字以内にしてください'),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  subjects: z.array(z.string()).min(1, '少なくとも1教科は選んでください'),
  testDaySubjects: z.record(z.string(), z.array(z.string())),
}).refine(
  d => d.startDate <= d.endDate,
  { path: ['endDate'], message: '終了日は開始日以降にしてください' }
);
export type TestInfoInput = z.infer<typeof testInfoSchema>;

/** Step 3: 自動設定 */
export const autoSettingsSchema = z.object({
  weekdayMins: z.number().int().min(0).max(600),
  weekdayClubMins: z.number().int().min(0).max(600),
  weekendMins: z.number().int().min(0).max(600),
  clubDays: z.array(z.number().int().min(0).max(6)),
  noClubBeforeTest: z.boolean(),
});
export type AutoSettingsInput = z.infer<typeof autoSettingsSchema>;

/** テスト結果記入 */
export const testResultSchema = z.object({
  scores: z.record(z.string(), z.number().int().min(0).max(100)),
  actualStudyMinutes: z.record(z.string(), z.number().int().min(0).max(10000)).optional(),
  memo: z.string().optional(),
});
export type TestResultInput = z.infer<typeof testResultSchema>;

// --- Server Action バリデーション用スキーマ ---

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** savePlan: 1 勉強ブロック */
export const studyDayBlockSchema = z.object({
  id: z.string(),
  mins: z.number().int().min(10).max(600),
  source: z.enum(['auto', 'manual']).optional(),
});

/** savePlan: 計画保存フォーム全体 */
export const savePlanSchema = z.object({
  testName: z.string().min(1).max(100, 'テスト名は100文字以内にしてください'),
  startDate: z.string().regex(ISO_DATE, 'startDate は YYYY-MM-DD 形式にしてください'),
  endDate: z.string().regex(ISO_DATE, 'endDate は YYYY-MM-DD 形式にしてください'),
  subjects: z.array(z.string()).min(1).max(30),
  testDaySubjects: z.record(z.string(), z.array(z.string())).refine(
    v => Object.keys(v).length <= 60,
    'テスト期間は60日以内にしてください'
  ),
  mode: z.enum(['auto', 'manual']),
  settings: z.object({
    weekdayMins: z.number().int().min(0).max(600),
    weekdayClubMins: z.number().int().min(0).max(600),
    weekendMins: z.number().int().min(0).max(600),
    clubDays: z.array(z.number().int().min(0).max(6)),
    noClubBeforeTest: z.boolean(),
  }),
  studyDays: z.record(z.string(), z.array(studyDayBlockSchema)).refine(
    v => Object.keys(v).length <= 365,
    '勉強日は365日以内にしてください'
  ),
  customSubjects: z.array(z.object({
    id: z.string().min(1).max(200),
    label: z.string().min(1).max(100),
  })).optional().default([]),
}).refine(
  d => d.startDate <= d.endDate,
  { path: ['endDate'], message: '終了日は開始日以降にしてください' }
);
export type SavePlanInput = z.infer<typeof savePlanSchema>;

/** updateDailyPlan: 日次計画更新 */
export const updateDailyPlanSchema = z.object({
  examId: z.string().uuid(),
  date: z.string().regex(ISO_DATE, 'date は YYYY-MM-DD 形式にしてください'),
  subjectId: z.string().min(1).max(100),
  mins: z.number().int().min(10).max(600),
});

/** saveResult: テスト結果保存 */
export const saveResultSchema = z.object({
  examId: z.string().uuid(),
  scores: z.record(
    z.string().min(1).max(100),
    z.number().int().min(0).max(100),
  ).refine(v => Object.keys(v).length <= 20, '科目数は20以内にしてください'),
  actualStudyMinutes: z.record(
    z.string().min(1).max(100),
    z.number().int().min(0).max(10000),
  ).refine(v => Object.keys(v).length <= 20, '科目数は20以内にしてください').optional(),
  memo: z.string().max(1000).optional(),
});
export type SaveResultInput = z.infer<typeof saveResultSchema>;
