'use client';
import { useMemo, useState } from 'react';
import { usePlanDraft } from '@/lib/plan-draft-store';
import { SUBJECTS } from '@/lib/subjects';
import { datesBetween, formatMdFull } from '@/lib/utils';
import { Field, Input } from '@/components/ui/input';
import { CardOutline } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { IconCheck, IconPlus } from '@/components/icons';
import { StepShell } from './step-shell';

export function Step1Info() {
  const d = usePlanDraft();
  const [adding, setAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const toggleSubject = (id: string) =>
    d.patch({
      subjects: d.subjects.includes(id)
        ? d.subjects.filter(s => s !== id)
        : [...d.subjects, id],
    });
  const toggleDaySubject = (date: string, id: string) => {
    const cur = d.testDaySubjects[date] ?? [];
    d.patch({
      testDaySubjects: {
        ...d.testDaySubjects,
        [date]: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id],
      },
    });
  };

  const commitAdd = () => {
    const label = inputValue.trim();
    if (label.length > 0) {
      d.addCustomSubject(label);
    }
    setInputValue('');
    setAdding(false);
  };
  const cancelAdd = () => {
    setInputValue('');
    setAdding(false);
  };

  const dates = useMemo(() => datesBetween(d.startDate, d.endDate), [d.startDate, d.endDate]);
  const canNext = d.testName.length > 0 && d.subjects.length > 0;

  return (
    <StepShell
      title="テストの情報を入れよう"
      subtitle="あとから変えられます。まずはざっくりでOK。"
      nextDisabled={!canNext}
    >
      <Field label="テスト名" hint="自動で「2学期 中間テスト」が入りました">
        <Input value={d.testName} onChange={(e) => d.patch({ testName: e.target.value })}/>
      </Field>

      <div className="flex gap-2.5 mt-3">
        <Field label="テスト開始日">
          <Input type="date" value={d.startDate} onChange={e => d.patch({ startDate: e.target.value })}/>
        </Field>
        <Field label="テスト終了日">
          <Input type="date" value={d.endDate} onChange={e => d.patch({ endDate: e.target.value })}/>
        </Field>
      </div>

      <Field label="テスト科目（複数選択）">
        <div className="flex gap-1.5 flex-wrap mt-1">
          {SUBJECTS.map(s => (
            <Chip
              key={s.id}
              selected={d.subjects.includes(s.id)}
              onClick={() => toggleSubject(s.id)}
            >
              {d.subjects.includes(s.id) && <IconCheck/>}
              {s.label}
            </Chip>
          ))}
          {d.customSubjects.map(c => (
            <div key={c.id} className="flex items-center">
              <Chip selected={d.subjects.includes(c.id)} onClick={() => toggleSubject(c.id)}>
                {d.subjects.includes(c.id) && <IconCheck/>}
                <span className="max-w-[8rem] truncate">{c.label}</span>
              </Chip>
              <button
                type="button"
                className="ml-0.5 p-1 text-text-soft hover:text-danger text-xs"
                onClick={() => d.removeCustomSubject(c.id)}
                aria-label={`${c.label}を削除`}
              >×</button>
            </div>
          ))}
          {adding ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                className="h-8 px-2 text-sm border border-accent rounded-full outline-none"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                maxLength={100}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); commitAdd(); }
                  if (e.key === 'Escape') cancelAdd();
                }}
                placeholder="科目名"
              />
              <button type="button" onClick={commitAdd} className="p-1 text-accent text-sm">✓</button>
              <button type="button" onClick={cancelAdd} className="p-1 text-text-soft text-sm">✕</button>
            </div>
          ) : (
            <Chip className="border-dashed" onClick={() => setAdding(true)}><IconPlus/>追加</Chip>
          )}
        </div>
      </Field>

      <div className="mt-4">
        <div className="text-xs text-text-mid font-semibold mb-1.5">テスト日ごとの科目</div>
        <div className="flex flex-col gap-2">
          {dates.map(date => (
            <CardOutline key={date}>
              <div className="text-[13px] font-bold mb-2">{formatMdFull(date)}</div>
              <div className="flex gap-1.5 flex-wrap">
                {d.subjects.length === 0 ? (
                  <div className="text-text-soft text-xs">先に科目を選んでください</div>
                ) : d.subjects.map(sid => (
                  <Chip
                    key={sid}
                    selected={(d.testDaySubjects[date] ?? []).includes(sid)}
                    onClick={() => toggleDaySubject(date, sid)}
                  >
                    {SUBJECTS.find(s => s.id === sid)?.label ?? d.customSubjects.find(c => c.id === sid)?.label ?? sid}
                  </Chip>
                ))}
              </div>
            </CardOutline>
          ))}
        </div>
      </div>
    </StepShell>
  );
}
