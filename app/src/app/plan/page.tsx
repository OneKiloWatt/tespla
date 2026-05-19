import { createClient } from '@/lib/supabase/server';
import { fetchActivePlan } from '@/lib/db-converters';
import type { TestPlan } from '@/lib/types';
import { PlanView } from './_components/plan-view';

/**
 * 勉強計画の修正（/plan）— Server Component
 *
 * ログイン済みの場合: DB からアクティブな計画を取得して PlanView に渡す
 * 未ログイン: initialPlan={null} を渡す（Zustand ストアから取得）
 */
export default async function PlanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const initialPlan: TestPlan | null = user
    ? await fetchActivePlan(supabase, user.id)
    : null;

  return <PlanView initialPlan={initialPlan}/>;
}
