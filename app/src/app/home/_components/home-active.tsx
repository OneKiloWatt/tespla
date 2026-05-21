'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TestPlan, StudyBlock } from '@/lib/types';
import { subjectById } from '@/lib/subjects';
import { formatMinutes, formatMdFull } from '@/lib/utils';
import { pickAdvice } from '@/lib/sample-data';
import { useAppStore } from '@/lib/store';
import { updateDailyPlan } from '@/actions/plan';
import { AppBar } from '@/components/app-bar';
import { Card, CardSoft } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Calendar } from '@/components/calendar';
import { SubjectPill } from '@/components/subject-pill';
import { IconBulb, IconChevronLeft, IconChevronRight, IconMenu, IconPlus } from '@/components/icons';

interface HomeActiveProps {
  plan: TestPlan;
  today: string;
}

export function HomeActive({ plan, today }: HomeActiveProps) {
  const { user, upsertPlan } = useAppStore();
  const [advice] = useState(() => pickAdvice());
  const [todayItems, setTodayItems] = useState<StudyBlock[]>(plan.studyDays[today] ?? []);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(today);

  const todayItemsRef = useRef(todayItems);
  todayItemsRef.current = todayItems;
  const prevEditingIdxRef = useRef<number | null>(null);

  const saveCurrentItems = useCallback((items: StudyBlock[]) => {
    if (!user) {
      upsertPlan({ ...plan, studyDays: { ...plan.studyDays, [today]: items }, updatedAt: new Date().toISOString() });
    } else {
      const originalIds = new Set((plan.studyDays[today] ?? []).map(b => b.id));
      for (const it of items) {
        if (originalIds.has(it.id) && it.mins >= 10) {
          void updateDailyPlan(plan.id, today, it.id, it.mins).catch(e => console.error('updateDailyPlan failed', e));
        }
      }
    }
  }, [user, upsertPlan, plan, today]);

  const saveCurrentItemsRef = useRef(saveCurrentItems);
  saveCurrentItemsRef.current = saveCurrentItems;

  useEffect(() => {
    const prev = prevEditingIdxRef.current;
    prevEditingIdxRef.current = editingIdx;
    if (prev === null || editingIdx !== null) return;
    saveCurrentItemsRef.current(todayItemsRef.current);
  }, [editingIdx]);

  // 進捗: 今日まで（含む）に予定された分 / 全予定分
  const { doneAll, totalAll, pct } = useMemo(() => {
    const days = Object.keys(plan.studyDays);
    const total = days.reduce((a, d) => a + (plan.studyDays[d]?.reduce((aa, b) => aa + b.mins, 0) ?? 0), 0);
    const done = days
      .filter(d => d <= today)
      .reduce((a, d) => a + (plan.studyDays[d]?.reduce((aa, b) => aa + b.mins, 0) ?? 0), 0);
    return { doneAll: done, totalAll: total, pct: Math.round((done / Math.max(total, 1)) * 100) };
  }, [plan, today]);

  // テスト日までの残り日数
  const daysUntil = useMemo(() => {
    const ms = +new Date(plan.startDate) - +new Date(today);
    return Math.max(0, Math.ceil(ms / 86_400_000));
  }, [plan, today]);

  const adjustMins = (idx: number, delta: number) => {
    setTodayItems(prev => prev.map((it, i) =>
      i === idx ? { ...it, mins: Math.max(10, it.mins + delta) } : it
    ));
  };

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
        <div className="flex justify-between items-baseline mb-2.5">
          <div>
            <div className="text-[11px] text-text-mid">{formatMdFull(today)}</div>
            <div className="text-lg font-extrabold mt-0.5">{plan.testName}</div>
          </div>
          <Badge>テストまで <strong className="ml-0.5">{daysUntil}日</strong></Badge>
        </div>

        {/* 今日やること */}
        <Card>
          <div className="flex justify-between items-center mb-2.5">
            <div className="text-[13px] font-bold">今日やること</div>
            <button
              onClick={() => setTodayItems(p => [...p, { id: 'jp', mins: 30 }])}
              className="text-xs text-accent font-semibold inline-flex items-center gap-1"
            >
              <IconPlus/> 科目追加
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {todayItems.map((it, i) => {
              const s = subjectById(it.id);
              const editing = editingIdx === i;
              return (
                <div
                  key={i}
                  className={`bg-white rounded-[10px] overflow-hidden ${
                    editing ? 'border-[1.5px] border-accent' : 'border border-divider'
                  }`}
                >
                  <div
                    className="flex items-center gap-2.5 px-3 py-2.5"
                    onClick={() => setEditingIdx(editing ? null : i)}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }}/>
                    <div className="flex-1 text-sm font-semibold">{s.label}</div>
                    <div className="text-[13px] font-bold">
                      {it.mins}<span className="text-[10px] text-text-mid ml-0.5 font-medium">分</span>
                    </div>
                  </div>
                  {editing && (
                    <div className="flex items-center gap-2 px-3 pt-2 pb-3 bg-bg-card-soft border-t border-divider">
                      <div className="text-[11px] text-text-mid flex-1">時間を調整</div>
                      <Button size="sm" variant="secondary" className="w-9 p-0 text-base" onClick={(e) => { e.stopPropagation(); adjustMins(i, -15); }}>−</Button>
                      <div className="min-w-[60px] text-center text-base font-extrabold text-accent">
                        {it.mins}<span className="text-[11px] text-text-mid ml-0.5 font-medium">分</span>
                      </div>
                      <Button size="sm" variant="secondary" className="w-9 p-0 text-base" onClick={(e) => { e.stopPropagation(); adjustMins(i, 15); }}>＋</Button>
                      <Button size="sm" variant="ghost" className="text-danger px-2"
                        onClick={(e) => { e.stopPropagation(); setTodayItems(p => p.filter((_,j)=>j!==i)); setEditingIdx(null); }}>
                        削除
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2.5 text-xs text-text-mid">
            <span>合計</span>
            <span><strong className="text-text-dark">{todayItems.reduce((a,b)=>a+b.mins,0)}分</strong></span>
          </div>
        </Card>

        {/* 進捗 */}
        <CardSoft className="mt-3">
          <div className="flex justify-between items-baseline mb-2">
            <div className="text-xs font-bold">プランの進み具合</div>
            <div className="text-[11px] text-text-mid whitespace-nowrap">
              {formatMinutes(doneAll)} / {formatMinutes(totalAll)}
            </div>
          </div>
          <ProgressBar value={pct / 100}/>
          <div className="flex justify-between text-[11px] text-text-mid mt-1">
            <span>今日までに{pct}%の予定が組まれています</span>
            <span className="font-bold text-accent-dark">{pct}%</span>
          </div>
        </CardSoft>

        {/* カレンダー */}
        <Card className="mt-3">
          <div className="flex justify-between items-center mb-2.5">
            <div className="text-[13px] font-bold">5月のカレンダー</div>
            <div className="flex gap-1.5 items-center">
              <CalNavBtn label="前の月"><IconChevronLeft/></CalNavBtn>
              <CalNavBtn label="次の月"><IconChevronRight/></CalNavBtn>
            </div>
          </div>
          <Calendar
            yearMonth="2026-05"
            studyDays={plan.studyDays}
            today={today}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <div className="flex gap-2.5 mt-2.5 flex-wrap text-[10px] text-text-mid">
            <Legend color="var(--color-accent-bg)" label="勉強日"/>
            <Legend color="var(--color-accent)" label="テスト"/>
          </div>
          <SelectedDayDetail date={selectedDate} items={plan.studyDays[selectedDate]} today={today}/>
        </Card>

        {/* アドバイス */}
        <CardSoft className="mt-3 bg-accent-bg">
          <div className="flex items-center gap-1.5 text-accent-dark mb-1">
            <IconBulb size={14}/>
            <div className="text-[11px] font-bold">今日のひとこと</div>
          </div>
          <div className="text-[13px] text-accent-dark leading-[1.6]">
            {advice}
          </div>
        </CardSoft>
      </main>
    </>
  );
}

function CalNavBtn({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      aria-label={label}
      className="w-9 h-9 rounded-[10px] inline-flex items-center justify-center bg-black/[0.04] text-text-dark hover:bg-black/[0.08] active:scale-95 transition-transform"
    >
      {children}
    </button>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-2 h-2 rounded-sm" style={{ background: color }}/>
      {label}
    </span>
  );
}

function SelectedDayDetail({ date, items, today }: { date: string; items?: StudyBlock[]; today: string }) {
  if (!items || !items.length) {
    return (
      <div className="mt-3.5 pt-3 border-t border-divider text-xs text-text-mid text-center">
        {formatMdFull(date)}は予定がありません
      </div>
    );
  }
  return (
    <div className="mt-3.5 pt-3 border-t border-divider">
      <div className="flex justify-between items-baseline mb-2">
        <div className="text-xs font-bold">
          {formatMdFull(date)}の予定
          {date < today && <Badge variant="neutral" className="ml-1.5">過去</Badge>}
        </div>
        <div className="text-[11px] text-text-mid">{items.reduce((a,b)=>a+b.mins,0)}分</div>
      </div>
      <div className="flex gap-1 flex-wrap">
        {items.map((it, i) => <SubjectPill key={i} subjId={it.id} mins={it.mins}/>)}
      </div>
    </div>
  );
}
