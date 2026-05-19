'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { updateDailyPlan } from '@/actions/plan';
import type { TestPlan, StudyBlock } from '@/lib/types';
import { AppBar } from '@/components/app-bar';
import { BottomNav } from '@/components/bottom-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroPlaceholder } from '@/components/hero-placeholder';
import { SubjectPill } from '@/components/subject-pill';
import { DayCard } from '@/components/day-card';
import { DayEditDialog } from '@/components/day-edit-dialog';
import { IconPlus } from '@/components/icons';

interface PlanViewProps {
  /** Server Component から渡される確定済み計画（ログイン時）。未ログイン時は null */
  initialPlan: TestPlan | null;
}

/**
 * 勉強計画の修正 UI（/plan）
 *
 * ログイン時: Server Component が取得した initialPlan を使用し、編集後はローカル state に反映する
 * 未ログイン時: Zustand ストアからアクティブな計画を取得
 */
export function PlanView({ initialPlan }: PlanViewProps) {
  const { activePlanId, plans, upsertPlan, user } = useAppStore();
  const today = new Date().toISOString().slice(0, 10);

  // ログイン時: Server から渡された初期値をローカル state で保持（編集後の反映のため）
  const [localPlan, setLocalPlan] = useState<TestPlan | null>(initialPlan);

  const [editing, setEditing] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ログイン時は localPlan（Server 初期値 + 編集差分）を使用
  // 未ログイン時は Zustand ストアから取得
  const plan: TestPlan | null = user
    ? localPlan
    : (plans.find(p => p.id === activePlanId) ?? null);

  const handleDialogSave = async (items: StudyBlock[]) => {
    if (!plan || !editing) return;
    setIsSaving(true);
    setDialogError(null);

    try {
      if (user) {
        // ログイン時: Server Action で更新してローカル state にも反映
        for (const item of items) {
          await updateDailyPlan(plan.id, editing, item.id, item.mins);
        }
        setLocalPlan(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            studyDays: { ...prev.studyDays, [editing]: items },
            updatedAt: new Date().toISOString(),
          };
        });
      } else {
        // 未ログイン: Zustand で更新
        const updated: TestPlan = {
          ...plan,
          studyDays: { ...plan.studyDays, [editing]: items },
          updatedAt: new Date().toISOString(),
        };
        upsertPlan(updated);
      }
      setEditing(null);
    } catch {
      setDialogError('保存できませんでした。もう一度試してください');
    } finally {
      setIsSaving(false);
    }
  };

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
            onClick={() => { setEditing(date); setDialogError(null); }}
          />
        ))}
      </main>
      <BottomNav/>

      {editing && (
        <DayEditDialog
          open
          onOpenChange={(o) => {
            if (!o) {
              setEditing(null);
              setDialogError(null);
            }
          }}
          date={editing}
          items={plan.studyDays[editing]}
          onSave={handleDialogSave}
          isSaving={isSaving}
          error={dialogError}
        />
      )}
    </>
  );
}
