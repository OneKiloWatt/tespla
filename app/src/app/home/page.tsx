'use client';
import { useAppStore, deriveHomeState } from '@/lib/store';
import { SAMPLE_PLAN, SAMPLE_TODAY } from '@/lib/sample-data';
import { BottomNav } from '@/components/bottom-nav';
import { HomeEmpty } from './_components/home-empty';
import { HomeActive } from './_components/home-active';
import { HomeEnded } from './_components/home-ended';
import { HomeDone } from './_components/home-done';

/**
 * ホーム画面
 *
 * 仕様（dev.md）：
 *   計画がないとき     → empty:  「テスト計画を作成しよう」の誘導
 *   計画があるとき     → active: 今日の勉強内容/カレンダー/進捗
 *   テスト日終了       → ended:  「お疲れさま」＋結果記入を促す
 *   テスト結果記入済み → done:   結果サマリ＋次の計画を促す
 *
 * NOTE: 現在はサンプルデータでステートを切り替え可能。実装時は
 *       store からアクティブな計画を取得し、deriveHomeState で判定する。
 */
export default function HomePage() {
  // const { activePlanId, plans } = useAppStore();
  // const plan = plans.find(p => p.id === activePlanId);
  // const state = deriveHomeState(plan, new Date().toISOString().slice(0,10));

  // --- 開発用: サンプル計画で 'active' 状態を表示 ---
  const plan = SAMPLE_PLAN;
  const today = SAMPLE_TODAY;
  const state = deriveHomeState(plan, today);

  return (
    <>
      {state === 'empty'  && <HomeEmpty/>}
      {state === 'active' && <HomeActive plan={plan} today={today}/>}
      {state === 'ended'  && <HomeEnded plan={plan}/>}
      {state === 'done'   && <HomeDone plan={plan}/>}
      <BottomNav/>
    </>
  );
}
