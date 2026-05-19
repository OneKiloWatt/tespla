'use client';

import type { TestPlan } from '@/lib/types';
import { useAppStore, deriveHomeState } from '@/lib/store';
import { BottomNav } from '@/components/bottom-nav';
import { HomeEmpty } from './home-empty';
import { HomeActive } from './home-active';
import { HomeEnded } from './home-ended';
import { HomeDone } from './home-done';

interface HomeViewProps {
  initialPlan: TestPlan | null;
}

export function HomeView({ initialPlan }: HomeViewProps) {
  const { activePlanId, plans, user } = useAppStore();
  const today = new Date().toISOString().slice(0, 10);

  // ログイン時は Server から渡された initialPlan を使用
  // 未ログイン時は Zustand ストアからアクティブな計画を取得
  const plan: TestPlan | undefined = user
    ? (initialPlan ?? undefined)
    : plans.find(p => p.id === activePlanId) ?? undefined;

  const state = deriveHomeState(plan, today);

  return (
    <>
      {state === 'empty'  && <HomeEmpty/>}
      {state === 'active' && <HomeActive plan={plan!} today={today}/>}
      {state === 'ended'  && <HomeEnded plan={plan!}/>}
      {state === 'done'   && <HomeDone plan={plan!}/>}
      <BottomNav/>
    </>
  );
}
