import { create } from 'zustand';
import type { AutoSettings, StudyBlock } from './types';
import { suggestTestName } from './utils';

/**
 * 計画作成ウィザード（5ステップ）の一時状態を保持するストア。
 *
 *   1: テスト情報入力
 *   2: 自動 / 手動 選択
 *   3: 自動設定（モードがautoのとき）
 *   4: 勉強配分の確認・調整
 *   5: プレビュー・保存
 *
 * 保存（step5）で本体ストア（store.ts）にコミットしてから reset() する。
 */

const DEFAULT_AUTO_SETTINGS: AutoSettings = {
  weekdayMins: 90,
  weekdayClubMins: 60,
  weekendMins: 120,
  clubDays: [1, 2, 3, 4, 5],
  noClubBeforeTest: true,
};

interface PlanDraftState {
  step: number; // 0..4

  testName: string;
  startDate: string;
  endDate: string;
  subjects: string[];
  testDaySubjects: Record<string, string[]>;

  mode: 'auto' | 'manual';
  settings: AutoSettings;

  studyDays: Record<string, StudyBlock[]>;

  goTo: (step: number) => void;
  next: () => void;
  prev: () => void;
  patch: (p: Partial<PlanDraftState>) => void;
  reset: () => void;
}

function defaults() {
  const today = new Date();
  const inAMonth = new Date(today);
  inAMonth.setMonth(inAMonth.getMonth() + 1);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return {
    step: 0,
    testName: suggestTestName(inAMonth),
    startDate: iso(inAMonth),
    endDate: iso(inAMonth),
    subjects: ['jp','math','en','sci','soc'],
    testDaySubjects: {},
    mode: 'auto' as const,
    settings: DEFAULT_AUTO_SETTINGS,
    studyDays: {},
  };
}

export const usePlanDraft = create<PlanDraftState>()((set) => ({
  ...defaults(),
  goTo: (step) => set({ step }),
  next: () => set((s) => ({ step: Math.min(4, s.step + 1) })),
  prev: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
  patch: (p) => set(p),
  reset: () => set(defaults()),
}));
