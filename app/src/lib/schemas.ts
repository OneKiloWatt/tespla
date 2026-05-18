import { z } from 'zod';

/** メール + パスワードのログインフォーム */
export const loginSchema = z.object({
  email: z.string().email('メールアドレスの形式が正しくありません'),
  password: z.string().min(1, 'パスワードを入力してください'),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** 新規登録フォーム */
export const signupSchema = z.object({
  email: z.string().email('メールアドレスの形式が正しくありません'),
  password: z.string().min(8, 'パスワードは8文字以上にしてください'),
  agreed: z.literal(true, {
    errorMap: () => ({ message: '利用規約に同意してください' }),
  }),
});
export type SignupInput = z.infer<typeof signupSchema>;

/** Step 1: テスト情報 */
export const testInfoSchema = z.object({
  testName: z.string().min(1, 'テスト名を入力してください'),
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
  scores: z.record(z.string(), z.number().min(0).max(100)),
  memo: z.string().optional(),
});
export type TestResultInput = z.infer<typeof testResultSchema>;
