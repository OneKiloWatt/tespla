import Link from 'next/link';
import { AppBar } from '@/components/app-bar';
import { Button } from '@/components/ui/button';
import { Card, CardSoft } from '@/components/ui/card';
import { HeroPlaceholder } from '@/components/hero-placeholder';
import { IconBulb, IconMenu, IconPlus } from '@/components/icons';

export function HomeEmpty() {
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
      <main className="flex-1 overflow-y-auto p-[18px] pb-6">
        <Card className="text-center">
          <HeroPlaceholder label="画像: 計画を立てる中高生・机に向かう学生など" height={140}/>
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
