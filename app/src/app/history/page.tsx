import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fetchFinishedPlans } from '@/lib/db-converters';
import { HistoryView } from './_components/history-view';
import { AppBar } from '@/components/app-bar';
import { BottomNav } from '@/components/bottom-nav';
import { Card, CardSoft } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconLock } from '@/components/icons';

/**
 * 過去の振り返り（/history）
 *
 * - ログインしていない場合: ログインを促す UI
 * - ログイン済み: HistoryView で finished な計画一覧を表示
 */
export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <AppBar title="過去の振り返り" showBack={false}/>
        <main className="flex-1 overflow-y-auto p-[18px]">
          <Card className="text-center">
            <div className="flex justify-center mb-3 text-accent"><IconLock size={48}/></div>
            <h2 className="text-lg font-extrabold mb-2">
              ログインで<br/>過去の記録が見れます
            </h2>
            <p className="text-xs text-text-mid leading-[1.7] mb-4">
              アカウントを作ると、毎回のテスト結果や<br/>勉強時間が振り返れるようになります。
            </p>
            <Button asChild size="lg" block>
              <Link href="/login">ログインする</Link>
            </Button>
            <Button asChild variant="ghost" block className="mt-1">
              <Link href="/signup">新規登録はこちら →</Link>
            </Button>
          </Card>

          <CardSoft className="mt-3.5">
            <div className="text-xs font-bold mb-1.5">ログインでできること</div>
            <ul className="text-xs text-text-mid pl-4 leading-[1.7] list-disc">
              <li>複数のテスト計画を保存</li>
              <li>過去の点数の推移を確認</li>
              <li>勉強記録の蓄積</li>
            </ul>
          </CardSoft>
        </main>
        <BottomNav/>
      </>
    );
  }

  const plans = await fetchFinishedPlans(supabase, user.id);
  return <HistoryView plans={plans} />;
}
