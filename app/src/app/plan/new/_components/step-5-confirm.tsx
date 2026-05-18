'use client';
import { useRouter } from 'next/navigation';
import { usePlanDraft } from '@/lib/plan-draft-store';
import { useAppStore } from '@/lib/store';
import { Card, CardSoft } from '@/components/ui/card';
import { SubjectPill } from '@/components/subject-pill';
import { IconWarning } from '@/components/icons';
import { formatMinutes } from '@/lib/utils';
import { StepShell } from './step-shell';

export function Step5Confirm() {
  const router = useRouter();
  const d = usePlanDraft();
  const { upsertPlan, user } = useAppStore();

  const totalMins = Object.values(d.studyDays)
    .flat()
    .reduce((a, b) => a + b.mins, 0);
  const totalDays = Object.keys(d.studyDays).length;
  const testDays = Object.keys(d.testDaySubjects).length;

  const handleSave = () => {
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
    d.reset();
    router.push('/home');
  };

  return (
    <StepShell
      title="計画の内容を確認"
      subtitle="保存するとホームから毎日確認できます。"
      nextLabel="保存してホームへ"
      onNext={handleSave}
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
          {d.subjects.map(id => <SubjectPill key={id} subjId={id}/>)}
        </div>
      </Card>

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
