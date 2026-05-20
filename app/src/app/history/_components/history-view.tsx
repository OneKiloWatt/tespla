'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { FinishedPlanSummary } from '@/lib/db-converters';
import { AppBar } from '@/components/app-bar';
import { BottomNav } from '@/components/bottom-nav';
import { Card, CardSoft } from '@/components/ui/card';

const ScoreLineChart = dynamic(
  () => import('./score-line-chart').then(m => m.ScoreLineChart),
  { ssr: false }
);

interface Props {
  plans: FinishedPlanSummary[];
}

/**
 * 振り返り一覧 Client Component
 */
export function HistoryView({ plans }: Props) {
  const chartData = plans
    .filter(p => p.avgScore !== null)
    .map(p => ({ date: p.endDate, score: p.avgScore as number }));

  return (
    <>
      <AppBar title="過去の振り返り" showBack={false}/>
      <main className="flex-1 overflow-y-auto p-4">
        {plans.length > 0 && (
          <Card className="mb-3.5">
            <div className="text-[13px] font-bold mb-1">5教科平均の推移</div>
            <div className="text-[11px] text-text-mid mb-3.5">過去のテスト結果</div>
            {chartData.length > 0 ? (
              <ScoreLineChart data={chartData} />
            ) : (
              <div className="h-20 bg-bg-card-soft rounded-lg flex items-center justify-center text-xs text-text-soft">
                結果が記入されるとグラフが表示されます
              </div>
            )}
          </Card>
        )}

        <div className="text-[13px] font-bold mb-2 px-1">テスト一覧</div>

        {plans.length === 0 ? (
          <Card className="text-center text-xs text-text-mid">
            まだ記録がありません。
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {plans.map(plan => (
              <Link key={plan.id} href={'/history/' + plan.id}>
                <Card className="hover:bg-bg-card-soft transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold truncate">{plan.testName}</div>
                      <div className="text-[11px] text-text-mid mt-0.5">{plan.endDate}</div>
                    </div>
                    <div className="ml-3 text-right shrink-0">
                      {plan.hasResult && plan.avgScore !== null ? (
                        <div className="text-[22px] font-extrabold text-accent leading-tight">
                          {plan.avgScore}<span className="text-xs text-text-mid">点</span>
                        </div>
                      ) : (
                        <div className="text-xs text-text-soft">結果未記入</div>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <BottomNav/>
    </>
  );
}
