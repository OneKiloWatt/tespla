'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlanDraft } from '@/lib/plan-draft-store';
import { useAppStore } from '@/lib/store';
import { savePlan, getActivePlanId, finishAndCreateNew } from '@/actions/plan';
import { Card, CardSoft } from '@/components/ui/card';
import { SubjectPill } from '@/components/subject-pill';
import { IconWarning } from '@/components/icons';
import { formatMinutes } from '@/lib/utils';
import { StepShell } from './step-shell';

export function Step5Confirm() {
  const router = useRouter();
  const d = usePlanDraft();
  const { upsertPlan, user } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasActivePlan, setHasActivePlan] = useState(false);

  useEffect(() => {
    if (!user) return;
    getActivePlanId().then(id => { if (id) setHasActivePlan(true); });
  }, [user]);

  const totalMins = Object.values(d.studyDays)
    .flat()
    .reduce((a, b) => a + b.mins, 0);
  const totalDays = Object.keys(d.studyDays).length;
  const testDays = Object.keys(d.testDaySubjects).length;

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSaveError(null);

    try {
      if (user) {
        // edit flow ではモーダルをスキップするため、アクティブ計画が残っていれば先に終了させる
        const activeId = await getActivePlanId();
        if (activeId) await finishAndCreateNew(activeId);
        // ログイン時: Server Action で DB に保存
        await savePlan({
          testName: d.testName,
          startDate: d.startDate,
          endDate: d.endDate,
          subjects: d.subjects,
          testDaySubjects: d.testDaySubjects,
          mode: d.mode,
          settings: d.settings,
          studyDays: d.studyDays,
          customSubjects: d.customSubjects,
        });
      } else {
        // 未ログイン: Zustand（localStorage）に保存
        const id = crypto.randomUUID();
        upsertPlan({
          id,
          testName: d.testName,
          startDate: d.startDate,
          endDate: d.endDate,
          subjects: d.subjects,
          testDaySubjects: d.testDaySubjects,
          studyDays: d.studyDays,
          autoSettings: d.mode === 'auto' ? d.settings : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      d.reset();
      router.push('/home');
    } catch {
      setSaveError('保存できませんでした。もう一度試してください');
      setIsSubmitting(false);
    }
  };

  return (
    <StepShell
      title="計画の内容を確認"
      subtitle="保存するとホームから毎日確認できます。"
      nextLabel={isSubmitting ? '保存中...' : '保存してホームへ'}
      onNext={handleSave}
      nextDisabled={isSubmitting}
    >
      <Card>
        <div className="text-xs text-text-mid mb-1">テスト名</div>
        <div className="text-[17px] font-extrabold mb-3.5">{d.testName}</div>
        <div className="border-t border-divider"/>

        <Row label="テスト期間" value={`${formatShort(d.startDate)} 〜 ${formatShort(d.endDate)}（${testDays}日間）`}/>
        <Row label="勉強日数" value={`${totalDays}日間`}/>
        <Row label="合計勉強時間" value={formatMinutes(totalMins)}/>

        <div className="border-t border-divider mt-2"/>

        <div className="text-xs text-text-mid mb-1.5 mt-2">テスト科目</div>
        <div className="flex gap-1.5 flex-wrap">
          {d.subjects.map(id => (
            <SubjectPill
              key={id}
              subjId={id}
              label={d.customSubjects.find(c => c.id === id)?.label}
            />
          ))}
        </div>
      </Card>

      {hasActivePlan && user && (
        <CardSoft className="mt-3 text-xs text-text-mid leading-[1.6] flex gap-2 items-start">
          <span className="text-accent-dark shrink-0 mt-px"><IconWarning size={14}/></span>
          <span>保存すると現在の計画は「終了済み」になります。削除はされません。</span>
        </CardSoft>
      )}

      {saveError && (
        <div className="mt-3 text-xs text-danger font-medium px-1">
          {saveError}
        </div>
      )}

      {!user && (
        <CardSoft className="mt-3 text-xs text-text-mid leading-[1.6] flex gap-2 items-start">
          <span className="text-accent-dark shrink-0 mt-px"><IconWarning size={14}/></span>
          <span>
            お試しモードでは1つの計画しか保存できません。
            続けて使うなら<a className="text-accent underline" href="/signup">アカウント登録</a>がおすすめです。
          </span>
        </CardSoft>
      )}
    </StepShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 text-[13px]">
      <span className="text-text-mid">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
function formatShort(d: string) {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}
