import Link from 'next/link';
import { AppBar } from '@/components/app-bar';
import { Button } from '@/components/ui/button';
import { Card, CardSoft } from '@/components/ui/card';
import { IconBulb, IconPlus } from '@/components/icons';

export function HomeEmpty() {
  return (
    <>
      <AppBar
        title="ホーム"
        showBack={false}
      />
      <main className="flex-1 overflow-y-auto p-[18px] pb-6">
        <Card className="text-center">
          <img src="/study-capybara.png" alt="" className="w-full rounded-[14px] my-1.5 mb-4 object-contain bg-bg-card-soft" style={{ height: 140 }}/>
          <h2 className="text-lg font-extrabold mb-2">
            さあ、最初の<br/>テスト計画を作ろう
          </h2>
          <p className="text-xs text-text-mid leading-[1.7] mb-4">
            テスト日と科目を入れるだけで、<br/>
            毎日やるべきことが見えてきます。
          </p>
          <Button asChild size="lg" block>
            <Link href="/plan/new"><IconPlus/> テスト計画を作成する</Link>
          </Button>
        </Card>

        <CardSoft className="mt-4">
          <div className="flex items-center gap-2 mb-2 text-accent-dark">
            <IconBulb size={16}/>
            <div className="text-xs font-bold">はじめての方へ</div>
          </div>
          <div className="text-xs text-text-mid leading-[1.7]">
            5教科＋副教科を選んで、テスト日に何の科目があるか入れるだけ。
            あとは自動で毎日の計画を組み立てます。
          </div>
        </CardSoft>
      </main>
    </>
  );
}
