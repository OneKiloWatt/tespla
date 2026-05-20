import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fetchExamDetail } from '@/lib/db-converters';
import { subjectById } from '@/lib/subjects';
import { AppBar } from '@/components/app-bar';
import { Card, CardSoft } from '@/components/ui/card';
import { SubjectPill } from '@/components/subject-pill';
import { IconPencil } from '@/components/icons';

/**
 * テストの記録 詳細 (/history/[id])
 *
 * Server Component: DB から詳細を取得して表示する。
 */
export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/history');

  const plan = await fetchExamDetail(supabase, id, user.id);

  if (!plan) notFound();

  const hasResult = plan.result !== undefined;
  const scores = plan.result?.scores ?? {};
  const memo = plan.result?.memo;
  const allDays = Object.keys(plan.studyDays);
  const totalMins = allDays.reduce(
    (a, d) => a + (plan.studyDays[d]?.reduce((aa, b) => aa + b.mins, 0) ?? 0),
    0
  );
  const subjectsList = plan.subjects.map(id => ({ id, score: scores[id] ?? 0 }));
  const avg = subjectsList.length
    ? Math.round(subjectsList.reduce((a, b) => a + b.score, 0) / subjectsList.length)
    : 0;
  const totalHours = Math.round(totalMins / 60);

  return (
    <>
      <AppBar title="テストの記録"/>
      <main className="flex-1 overflow-y-auto p-4 pb-4">
        <div className="text-[11px] text-text-mid">
          {plan.startDate} 〜 {plan.endDate}
        </div>
        <div className="text-lg font-extrabold mt-0.5 mb-3.5">{plan.testName}</div>

        <Card>
          <div className="flex items-center">
            {hasResult && (
              <>
                <div className="flex-1 text-center">
                  <div className="text-[11px] text-text-mid">5教科平均</div>
                  <div className="text-[30px] font-extrabold text-accent leading-tight mt-0.5">
                    {avg}<span className="text-sm text-text-mid">点</span>
                  </div>
                </div>
                <div className="w-px self-stretch bg-divider"/>
              </>
            )}
            <div className="flex-1 text-center">
              <div className="text-[11px] text-text-mid">勉強時間</div>
              <div className="text-[30px] font-extrabold leading-tight mt-0.5">
                {totalHours}<span className="text-sm text-text-mid">h</span>
              </div>
            </div>
          </div>

          <div className="border-t border-divider my-3"/>

          {hasResult ? (
            <>
              <div className="text-xs font-bold mb-2">科目別の結果</div>
              <div className="flex flex-col gap-2">
                {subjectsList.map(r => (
                  <div key={r.id} className="flex items-center gap-2.5">
                    <SubjectPill subjId={r.id}/>
                    <div className="flex-1 h-1.5 bg-divider rounded overflow-hidden">
                      <div className="h-full" style={{ width: `${r.score}%`, background: subjectById(r.id).color }}/>
                    </div>
                    <div className="min-w-[38px] text-right text-[13px] font-bold">{r.score}点</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-sm text-text-mid text-center py-4">
              まだ結果が記入されていません
            </div>
          )}
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
      </main>
    </>
  );
}
