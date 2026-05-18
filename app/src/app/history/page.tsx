'use client';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { AppBar } from '@/components/app-bar';
import { BottomNav } from '@/components/bottom-nav';
import { Card, CardSoft } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubjectPill } from '@/components/subject-pill';
import { IconLock } from '@/components/icons';

/**
 * 過去の振り返り（/history）
 *
 * - ログインしてない場合: ログインを促す
 * - ログイン済み: 過去のテスト計画＋結果の一覧
 */
export default function HistoryPage() {
  const { user } = useAppStore();

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

  return (
    <>
      <AppBar title="過去の振り返り" showBack={false}/>
      <main className="flex-1 overflow-y-auto p-4">
        <Card className="mb-3.5">
          <div className="text-[13px] font-bold mb-1">5教科平均の推移</div>
          <div className="text-[11px] text-text-mid mb-3.5">過去のテスト結果</div>
          {/* TODO: 折れ線グラフコンポーネント */}
          <div className="h-20 bg-bg-card-soft rounded-lg flex items-center justify-center text-xs text-text-soft">
            折れ線グラフ（実装時に追加）
          </div>
        </Card>

        <div className="text-[13px] font-bold mb-2 px-1">テスト一覧</div>
        {/* TODO: DBから取得した過去計画一覧 */}
        <Card className="text-center text-xs text-text-mid">
          まだ記録がありません。
        </Card>
      </main>
      <BottomNav/>
    </>
  );
}
