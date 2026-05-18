'use client';
import { useEffect, useMemo, useState } from 'react';
import { usePlanDraft } from '@/lib/plan-draft-store';
import { generateAutoPlan } from '@/lib/auto-plan';
import { CardSoft } from '@/components/ui/card';
import { DayCard } from '@/components/day-card';
import { DayEditDialog } from '@/components/day-edit-dialog';
import { StepShell } from './step-shell';

export function Step4Allocate() {
  const d = usePlanDraft();
  const [editing, setEditing] = useState<string | null>(null);

  // 入った時点で自動配分を生成（既に手動編集済みなら触らない）
  useEffect(() => {
    if (Object.keys(d.studyDays).length === 0) {
      const studyDays = generateAutoPlan({
        startDate: new Date().toISOString().slice(0, 10),
        testStart: d.startDate,
        testEnd: d.endDate,
        subjects: d.subjects,
        testDaySubjects: d.testDaySubjects,
        settings: d.settings,
      });
      d.patch({ studyDays });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const days = useMemo(() => Object.keys(d.studyDays).sort(), [d.studyDays]);

  return (
    <StepShell
      title="勉強の配分を確認"
      subtitle="気になる日はタップして調整できます。"
    >
      <CardSoft className="mb-3 text-xs text-text-mid leading-[1.6]">
        自動で組まれた予定が入っています。<br/>科目バーが時間配分を表しています。
      </CardSoft>

      <div>
        {days.map(date => (
          <DayCard
            key={date}
            date={date}
            items={d.studyDays[date]}
            onClick={() => setEditing(date)}
          />
        ))}
      </div>

      {editing && (
        <DayEditDialog
          open
          onOpenChange={(o) => { if (!o) setEditing(null); }}
          date={editing}
          items={d.studyDays[editing]}
          onSave={(items) => {
            d.patch({ studyDays: { ...d.studyDays, [editing]: items } });
            setEditing(null);
          }}
        />
      )}
    </StepShell>
  );
}
