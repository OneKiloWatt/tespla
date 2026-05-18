'use client';
import type { StudyBlock } from '@/lib/types';
import { SubjectPill, SubjectStackBar } from './subject-pill';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface DayCardProps {
  date: string;
  items: StudyBlock[];
  today?: boolean;
  past?: boolean;
  onClick?: () => void;
}

const WD = ['日','月','火','水','木','金','土'];

export function DayCard({ date, items, today, past, onClick }: DayCardProps) {
  const total = items.reduce((a, b) => a + b.mins, 0);
  const dt = new Date(date);
  const wd = WD[dt.getDay()];
  const isWeekend = dt.getDay() === 0 || dt.getDay() === 6;

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`day-card-${date}`}
      className={cn(
        'block w-full text-left bg-white rounded-xl p-3 mb-2 border',
        today ? 'border-accent border-2' : 'border-divider',
        past && 'opacity-60',
      )}
    >
      <div className="flex justify-between items-baseline mb-1.5">
        <div className="text-sm font-bold">
          {dt.getMonth() + 1}/{dt.getDate()}
          <span className={cn(
            'text-[11px] font-medium ml-1.5',
            isWeekend ? 'text-[#5570a6]' : 'text-text-mid',
          )}>({wd})</span>
          {today && <Badge className="ml-1.5">今日</Badge>}
          {past && <Badge variant="neutral" className="ml-1.5">過去</Badge>}
        </div>
        <div className="text-xs text-text-mid">{total}分</div>
      </div>
      <SubjectStackBar items={items}/>
      <div className="flex gap-1 flex-wrap mt-2">
        {items.map((it, i) => <SubjectPill key={i} subjId={it.id} mins={it.mins}/>)}
      </div>
    </button>
  );
}
