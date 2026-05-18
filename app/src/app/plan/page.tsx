'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { SAMPLE_PLAN, SAMPLE_TODAY } from '@/lib/sample-data';
import { useAppStore } from '@/lib/store';
import { AppBar } from '@/components/app-bar';
import { BottomNav } from '@/components/bottom-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroPlaceholder } from '@/components/hero-placeholder';
import { SubjectPill } from '@/components/subject-pill';
import { DayCard } from '@/components/day-card';
import { DayEditDialog } from '@/components/day-edit-dialog';
import { IconPlus } from '@/components/icons';

/**
 * 勉強計画の修正（/plan）
 *
 * 計画があれば日ごとの予定を一覧 + 編集できる。
 * 計画がなければ「テスト計画を作ろう」誘導。
 */
export default function PlanPage() {
  // const { activePlanId, plans, upsertPlan } = useAppStore();
  // const plan = plans.find(p => p.id === activePlanId);
  const plan = SAMPLE_PLAN; // 開発用
  const today = SAMPLE_TODAY;

  const [editing, setEditing] = useState<string | null>(null);

  if (!plan) {
    return (
      <>
        <AppBar title="勉強計画の作成" showBack={false}/>
        <main className="flex-1 overflow-y-auto p-[18px]">
          <Card className="text-center">
            <HeroPlaceholder label="画像: 計画を作っていない状態 / 真っ白なノートなど" height={120}/>
            <h2 className="text-lg font-extrabold mb-2">まだ計画がありません</h2>
            <p className="text-xs text-text-mid leading-[1.7] mb-4">
              テスト計画を作ると、ここから内容を変えられます。
            </p>
            <Button asChild size="lg" block>
              <Link href="/plan/new"><IconPlus/> 計画を作る</Link>
            </Button>
          </Card>
        </main>
        <BottomNav/>
      </>
    );
  }

  const days = useMemo(() => Object.keys(plan.studyDays).sort(), [plan.studyDays]);

  return (
    <>
      <AppBar title="勉強計画の修正" showBack={false}/>
      <main className="flex-1 overflow-y-auto p-4 pb-4">
        <Card className="mb-3">
          <div className="text-[11px] text-text-mid">計画中のテスト</div>
          <div className="text-base font-extrabold mt-0.5 mb-2">{plan.testName}</div>
          <div className="flex gap-1.5 flex-wrap">
            {plan.subjects.map(id => <SubjectPill key={id} subjId={id}/>)}
          </div>
          <div className="flex gap-2 mt-3">
            <Button asChild size="sm" variant="secondary" className="flex-1">
              <Link href="/plan/new?edit=info">テスト情報を編集</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="flex-1">
              <Link href="/plan/new?edit=auto">自動設定を再計算</Link>
            </Button>
          </div>
        </Card>

        <div className="text-[13px] font-bold mb-2 px-1">日ごとの予定</div>

        {days.map(date => (
          <DayCard
            key={date}
            date={date}
            items={plan.studyDays[date]}
            today={date === today}
            past={date < today}
            onClick={() => setEditing(date)}
          />
        ))}
      </main>
      <BottomNav/>

      {editing && (
        <DayEditDialog
          open
          onOpenChange={(o) => { if (!o) setEditing(null); }}
          date={editing}
          items={plan.studyDays[editing]}
          onSave={(items) => {
            // TODO: upsertPlan で更新
            console.log('save', editing, items);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
