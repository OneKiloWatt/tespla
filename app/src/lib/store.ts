import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TestPlan, User } from './types';

/**
 * テスプラ - グローバルストア
 *
 * 仕様：
 *  - お試し時は localStorage に保存（テスト計画は1つだけ）
 *  - ログインしたら localStorage の内容を DB に移行してから localStorage を削除
 *  - 並行して複数のテスト計画は作らせない（activePlanId が常に1つ）
 *
 * 注意：
 *  - サーバー側DB（Supabase）連携は実装時に追加する。本ストアはクライアント状態の入れ物。
 */

interface AppState {
  user: User | null;
  plans: TestPlan[];
  /** 現在アクティブな計画のID（並行作成を防ぐ） */
  activePlanId: string | null;

  // actions
  setUser: (u: User | null) => void;
  upsertPlan: (plan: TestPlan) => void;
  deletePlan: (id: string) => void;
  setActivePlan: (id: string | null) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  plans: [],
  activePlanId: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user) => set({ user }),
      upsertPlan: (plan) => set((s) => {
        const idx = s.plans.findIndex(p => p.id === plan.id);
        const plans = idx >= 0
          ? s.plans.map(p => p.id === plan.id ? plan : p)
          : [...s.plans, plan];
        return { plans, activePlanId: plan.id };
      }),
      deletePlan: (id) => set((s) => ({
        plans: s.plans.filter(p => p.id !== id),
        activePlanId: s.activePlanId === id ? null : s.activePlanId,
      })),
      setActivePlan: (id) => set({ activePlanId: id }),
      reset: () => set(initialState),
    }),
    {
      name: 'tesupura-store',
      storage: createJSONStorage(() => localStorage),
      // ログイン後はサーバ側に保存するので、ログインユーザーはlocalStorageに残さない
      partialize: (state) => state.user
        ? { user: state.user }
        : state,
    }
  )
);

/**
 * 現在の状態から「ホーム画面のステート」を判定するヘルパー
 *
 *  - 'empty'  : 計画なし（初回 / お試し）
 *  - 'active' : テスト前 / 計画進行中
 *  - 'ended'  : テスト日は終わったが結果未記入
 *  - 'done'   : テスト結果記入済み
 */
export type HomeState = 'empty' | 'active' | 'ended' | 'done';

export function deriveHomeState(plan: TestPlan | undefined, today: string): HomeState {
  if (!plan) return 'empty';
  if (plan.result) return 'done';
  if (today > plan.endDate) return 'ended';
  return 'active';
}
