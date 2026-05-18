import Link from 'next/link';
import type { TestPlan } from '@/lib/types';
import { AppBar } from '@/components/app-bar';
import { Button } from '@/components/ui/button';
import { Card, CardOutline } from '@/components/ui/card';
import { HeroPlaceholder } from '@/components/hero-placeholder';
import { IconMenu } from '@/components/icons';

export function HomeEnded({ plan }: { plan: TestPlan }) {
  const allDays = Object.keys(plan.studyDays);
  const totalMins = allDays.reduce(
    (a, d) => a + (plan.studyDays[d]?.reduce((aa, b) => aa + b.mins, 0) ?? 0), 0,
  );
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;

  return (
    <>
      <AppBar
        title="ホーム"
        showBack={false}
        right={
          <button aria-label="メニュー" className="w-9 h-9 rounded-[10px] inline-flex items-center justify-center text-text-mid hover:bg-black/[0.04]">
            <IconMenu/>
          </button>
        }
      />
      <main className="flex-1 overflow-y-auto p-[18px] pb-5">
        <Card className="text-center">
          <HeroPlaceholder label="画像: テストをやり遂げた中高生・取り組んだ余韻など" height={120}/>
          <h2 className="text-xl font-extrabold mb-1.5">お疲れさま！</h2>
          <p className="text-[13px] text-text-mid leading-[1.7] mb-4">
            {plan.testName}<br/>{allDays.length}日間、よく頑張りました。
          </p>

          <CardOutline className="bg-white/50 text-left mb-4">
            <div className="text-xs text-text-mid mb-2 font-semibold">このテストの記録</div>
            <Row label="勉強した日数" value={`${allDays.length}日間`}/>
            <Row label="合計時間" value={`${h}時間${m}分`}/>
          </CardOutline>

          <Button asChild size="lg" block>
            <Link href="/result/new">テスト結果を記録する</Link>
          </Button>
          <div className="text-[11px] text-text-mid mt-2.5 leading-[1.6]">
            次のテストでもっと効率よく勉強するために、<br/>
            点数を記録しておきましょう。
          </div>
        </Card>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 text-[13px]">
      <span>{label}</span><strong>{value}</strong>
    </div>
  );
}
