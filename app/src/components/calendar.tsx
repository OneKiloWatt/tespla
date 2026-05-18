'use client';
import { useMemo } from 'react';
import { subjectById } from '@/lib/subjects';
import type { StudyBlock } from '@/lib/types';
import { cn } from '@/lib/utils';

type CalendarCell =
  | { empty: true }
  | {
      empty: false;
      day: number;
      dateStr: string;
      study?: StudyBlock[];
      past: boolean;
      today: boolean;
      selected: boolean;
    };

interface CalendarProps {
  /** 表示する年月 YYYY-MM */
  yearMonth: string;
  /** 各日の勉強配分 */
  studyDays: Record<string, StudyBlock[]>;
  /** 今日のISO日付 */
  today: string;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
}

function buildCells({
  yearMonth, studyDays, today, selectedDate,
}: Pick<CalendarProps, 'yearMonth' | 'studyDays' | 'today' | 'selectedDate'>): CalendarCell[] {
  const [y, m] = yearMonth.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);
  const cells: CalendarCell[] = [];
  for (let i = 0; i < first.getDay(); i++) cells.push({ empty: true });
  for (let d = 1; d <= last.getDate(); d++) {
    const ds = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cells.push({
      empty: false,
      day: d,
      dateStr: ds,
      study: studyDays[ds],
      past: ds < today,
      today: ds === today,
      selected: ds === selectedDate,
    });
  }
  while (cells.length % 7 !== 0) cells.push({ empty: true });
  return cells;
}

export function Calendar(props: CalendarProps) {
  const cells = useMemo(() => buildCells(props), [props]);

  return (
    <div className="grid grid-cols-7 gap-1">
      {['日','月','火','水','木','金','土'].map((w, i) => (
        <div key={i} className={cn(
          'text-[10px] text-center font-semibold py-1',
          i === 0 ? 'text-[#c25f5f]' : i === 6 ? 'text-[#5570a6]' : 'text-text-soft',
        )}>{w}</div>
      ))}
      {cells.map((c, i) => {
        if (c.empty) {
          return <div key={i} className="h-[52px] rounded-lg bg-transparent border border-transparent"/>;
        }
        const total = (c.study ?? []).reduce((a, b) => a + b.mins, 0);
        const subjects = (c.study ?? []).slice(0, 3);

        let bg = 'bg-white';
        let border = 'border-divider';
        let opacity = '';
        if (c.study) bg = 'bg-accent-bg';
        if (c.past)  opacity = 'opacity-[0.55]';
        if (c.today) border = 'border-accent border-[1.5px]';
        if (c.selected) {
          border = 'border-accent border-[1.5px]';
          bg = 'bg-[#f6cca5]';
          opacity = '';
        }

        return (
          <button
            key={i}
            type="button"
            onClick={() => props.onSelectDate?.(c.dateStr)}
            className={cn(
              'h-[52px] rounded-lg px-[3px] py-1 border flex flex-col items-stretch justify-start',
              'cursor-pointer transition-transform active:scale-95',
              bg, border, opacity,
            )}
            data-testid={`cal-cell-${c.dateStr}`}
          >
            <div className="text-[11px] font-bold text-left">{c.day}</div>
            {total > 0 && (
              <>
                <div className="flex gap-[1.5px] justify-center mt-auto">
                  {subjects.map((it, j) => {
                    const s = subjectById(it.id);
                    return <span key={j} className="w-[5px] h-[5px] rounded-full" style={{ background: s.color }}/>;
                  })}
                </div>
                <div className="text-[8.5px] font-semibold text-accent-dark mt-px text-center">
                  {total}分
                </div>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
