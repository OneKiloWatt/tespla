import Link from 'next/link';
import type { TestPlan } from '@/lib/types';
import { subjectById } from '@/lib/subjects';
import { AppBar } from '@/components/app-bar';
import { Button } from '@/components/ui/button';
import { Card, CardSoft } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SubjectPill } from '@/components/subject-pill';
import { IconMenu, IconPencil, IconPlus } from '@/components/icons';

export function HomeDone({ plan }: { plan: TestPlan }) {
  // 結果がある前提だが、未記入なら空配列
  const scores = plan.result?.scores ?? {};
  const memo = plan.result?.memo;

  const subjectsList = plan.subjects.map(id => ({
    id, score: scores[id] ?? 0,
  }));
  const avg = subjectsList.length
    ? Math.round(subjectsList.reduce((a, b) => a + b.score, 0) / subjectsList.length)
    : 0;

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
      <main className="flex-1 overflow-y-auto p-4 pb-5">
        <Card>
          <div className="flex justify-between items-baseline mb-1.5">
            <div className="text-xs text-text-mid">記録済み</div>
            <Badge variant="success">完了</Badge>
          </div>
          <div className="text-[17px] font-extrabold mb-3.5">{plan.testName}</div>

          <div className="flex items-center gap-3.5 py-3.5 border-y border-divider">
            <div className="flex-1 text-center">
              <div className="text-[11px] text-text-mid">5教科平均</div>
              <div className="text-[28px] font-extrabold text-accent leading-tight mt-0.5">
                {avg}<span className="text-sm text-text-mid">点</span>
              </div>
            </div>
            <div className="w-px self-stretch bg-divider"/>
            <div className="flex-1 text-center">
              <div className="text-[11px] text-text-mid">前回比</div>
              <div className="text-[28px] font-extrabold text-success leading-tight mt-0.5">
                +3<span className="text-sm text-text-mid">点</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-3.5">
            {subjectsList.map(r => (
              <div key={r.id} className="flex items-center gap-2.5">
                <SubjectPill subjId={r.id}/>
                <div className="flex-1 h-1.5 bg-divider rounded overflow-hidden">
                  <div className="h-full" style={{ width: `${r.score}%`, background: subjectById(r.id).color }}/>
                </div>
                <div className="min-w-[38px] text-right text-[13px] font-bold">{r.score}</div>
              </div>
            ))}
          </div>
        </Card>

        {memo && (
          <CardSoft className="mt-3">
            <div className="flex items-center gap-1.5 text-accent-dark mb-1">
              <IconPencil size={14}/>
              <div className="text-xs font-bold">ふりかえりメモ</div>
            </div>
            <div className="text-[13px] text-text-dark leading-[1.7]">{memo}</div>
          </CardSoft>
        )}

        <Button asChild size="lg" block className="mt-4">
          <Link href="/plan/new"><IconPlus/> 次のテスト計画を作る</Link>
        </Button>
        <Button asChild variant="ghost" block className="mt-1">
          <Link href="/history">過去の振り返りを見る →</Link>
        </Button>
      </main>
    </>
  );
}
