import { subjectById } from '@/lib/subjects';
import type { StudyBlock, SubjectId } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SubjectPillProps {
  subjId: SubjectId | string;
  label?: string;
  mins?: number | null;
  className?: string;
}

export function SubjectPill({ subjId, label, mins, className }: SubjectPillProps) {
  const s = subjectById(subjId);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl',
        'text-xs font-semibold',
        className,
      )}
      style={{
        background: `color-mix(in srgb, ${s.color} 12%, transparent)`,
        color: s.color,
      }}
    >
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }}/>
      {label ?? s.label}
      {mins != null && <span className="ml-0.5 font-medium">{mins}分</span>}
    </span>
  );
}

interface SubjectStackBarProps {
  items: StudyBlock[];
  className?: string;
}

export function SubjectStackBar({ items, className }: SubjectStackBarProps) {
  const total = items.reduce((a, b) => a + b.mins, 0) || 1;
  return (
    <div className={cn('flex h-2 rounded overflow-hidden bg-divider', className)}>
      {items.map((it, i) => {
        const s = subjectById(it.id);
        return (
          <span
            key={i}
            className="block h-full"
            style={{ width: `${(it.mins / total) * 100}%`, background: s.color }}
            aria-label={`${s.label} ${it.mins}分`}
          />
        );
      })}
    </div>
  );
}
