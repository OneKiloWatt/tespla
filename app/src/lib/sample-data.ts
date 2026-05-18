import type { TestPlan } from './types';

/** 開発時に使うサンプル計画。本番ではDBから取得 */
export const SAMPLE_PLAN: TestPlan = {
  id: 'sample-1',
  testName: '2学期 中間テスト',
  startDate: '2026-06-08',
  endDate: '2026-06-10',
  subjects: ['jp', 'math', 'en', 'sci', 'soc'],
  testDaySubjects: {
    '2026-06-08': ['jp', 'math'],
    '2026-06-09': ['en', 'sci'],
    '2026-06-10': ['soc'],
  },
  studyDays: {
    '2026-05-18': [{ id: 'math', mins: 40 }, { id: 'en', mins: 50 }],
    '2026-05-19': [{ id: 'jp', mins: 30 }, { id: 'math', mins: 60 }],
    '2026-05-20': [{ id: 'en', mins: 45 }, { id: 'sci', mins: 45 }],
    '2026-05-21': [{ id: 'soc', mins: 60 }, { id: 'jp', mins: 30 }],
    '2026-05-22': [{ id: 'math', mins: 60 }, { id: 'sci', mins: 30 }],
    '2026-05-23': [{ id: 'jp', mins: 60 }, { id: 'en', mins: 60 }],
    '2026-05-24': [{ id: 'math', mins: 60 }, { id: 'soc', mins: 60 }],
    '2026-05-25': [{ id: 'sci', mins: 45 }, { id: 'soc', mins: 45 }],
    '2026-05-26': [{ id: 'jp', mins: 30 }, { id: 'en', mins: 60 }],
    '2026-05-27': [{ id: 'math', mins: 60 }, { id: 'sci', mins: 30 }],
    '2026-05-28': [{ id: 'jp', mins: 30 }, { id: 'soc', mins: 60 }],
    '2026-05-29': [{ id: 'en', mins: 60 }, { id: 'math', mins: 30 }],
    '2026-05-30': [{ id: 'jp', mins: 60 }, { id: 'sci', mins: 60 }],
    '2026-05-31': [{ id: 'soc', mins: 60 }, { id: 'en', mins: 60 }],
    '2026-06-01': [{ id: 'jp', mins: 60 }, { id: 'math', mins: 30 }],
    '2026-06-02': [{ id: 'en', mins: 60 }, { id: 'sci', mins: 30 }],
    '2026-06-03': [{ id: 'soc', mins: 90 }],
    '2026-06-04': [{ id: 'jp', mins: 90 }],
    '2026-06-05': [{ id: 'math', mins: 60 }, { id: 'en', mins: 30 }],
    '2026-06-06': [{ id: 'sci', mins: 60 }, { id: 'soc', mins: 60 }],
    '2026-06-07': [{ id: 'jp', mins: 60 }, { id: 'math', mins: 30 }],
  },
  autoSettings: {
    weekdayMins: 90,
    weekdayClubMins: 60,
    weekendMins: 120,
    clubDays: [1, 2, 3, 4, 5],
    noClubBeforeTest: true,
  },
  createdAt: '2026-05-15T09:00:00Z',
  updatedAt: '2026-05-18T07:00:00Z',
};

/** 開発時の振り返り一覧サンプル */
export const SAMPLE_HISTORY: TestPlan[] = [
  // ... 実装時にAPIから取得する想定。開発UI確認用にはここに差し込む
];

/** UIの今日（実装時は new Date() を使う） */
export const SAMPLE_TODAY = '2026-05-18';

/** ホーム画面のアドバイス。実装時はDBから取得 or 配列で持つ */
export const ADVICES = [
  '夜は新しい単元より復習が頭に残りやすいよ。',
  'スマホは別の部屋。集中スイッチを入れよう。',
  '間違えた問題に印を付けておくと、テスト直前に効く。',
  '30分やったら5分休憩。タイマーを使うと長続きする。',
  '理解できないところは翌日もう一度。寝かせると分かる。',
];

export function pickAdvice(seed?: number): string {
  const i = seed == null ? Math.floor(Math.random() * ADVICES.length) : seed % ADVICES.length;
  return ADVICES[i];
}
