'use client';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { StudyBlock } from '@/lib/types';
import { subjectById } from '@/lib/subjects';
import { formatMdFull } from '@/lib/utils';
import { Button } from './ui/button';
import { IconPlus } from './icons';

interface DayEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  items: StudyBlock[];
  onSave: (items: StudyBlock[]) => void;
}

export function DayEditDialog({ open, onOpenChange, date, items, onSave }: DayEditDialogProps) {
  const [draft, setDraft] = useState<StudyBlock[]>(items);
  const total = draft.reduce((a, b) => a + b.mins, 0);

  const update = (i: number, delta: number) => {
    setDraft(prev => prev.map((it, j) =>
      i === j ? { ...it, mins: Math.max(0, it.mins + delta) } : it
    ));
  };
  const remove = (i: number) => {
    setDraft(prev => prev.filter((_, j) => j !== i));
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50"/>
        <Dialog.Content className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-bg-card rounded-t-[18px] p-5 max-h-[80%] overflow-y-auto z-50">
          <div className="w-9 h-1 rounded bg-divider-strong mx-auto mb-3.5"/>
          <Dialog.Title className="text-base font-bold mb-1">
            {formatMdFull(date)} の予定
          </Dialog.Title>
          <Dialog.Description className="text-[11px] text-text-mid mb-3.5">
            合計 {total}分
          </Dialog.Description>

          <div className="flex flex-col gap-2">
            {draft.map((it, i) => {
              const s = subjectById(it.id);
              return (
                <div key={i} className="flex items-center gap-2.5 bg-white px-3 py-2.5 rounded-[10px] border border-divider">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }}/>
                  <div className="flex-1 text-sm font-semibold">{s.label}</div>
                  <Button size="sm" variant="secondary" className="w-7 p-0" onClick={() => update(i, -15)}>−</Button>
                  <div className="min-w-[44px] text-center text-[13px] font-bold">
                    {it.mins}<span className="text-[10px] text-text-mid ml-0.5">分</span>
                  </div>
                  <Button size="sm" variant="secondary" className="w-7 p-0" onClick={() => update(i, 15)}>＋</Button>
                  <Button size="sm" variant="ghost" className="text-danger px-2" onClick={() => remove(i)}>削除</Button>
                </div>
              );
            })}
          </div>

          <Button variant="secondary" block className="mt-3">
            <IconPlus/> 科目を追加
          </Button>

          <div className="flex gap-2 mt-4">
            <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>キャンセル</Button>
            <Button className="flex-[1.5]" onClick={() => { onSave(draft); onOpenChange(false); }}>保存</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
