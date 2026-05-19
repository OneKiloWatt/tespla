import { createClient } from '@/lib/supabase/server';
import { fetchActivePlan } from '@/lib/db-converters';
import type { TestPlan } from '@/lib/types';
import { HomeView } from './_components/home-view';

/**
 * ホーム画面（Server Component）
 *
 * ログイン済みの場合: DB からアクティブな計画を取得して HomeView に渡す
 * 未ログイン: initialPlan={null} を渡す（Zustand ストアから取得）
 */
export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const initialPlan: TestPlan | null = user
    ? await fetchActivePlan(supabase, user.id)
    : null;

  return <HomeView initialPlan={initialPlan}/>;
}
