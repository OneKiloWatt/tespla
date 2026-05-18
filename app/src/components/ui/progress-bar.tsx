import { cn } from '@/lib/utils';

interface ProgressBarProps {
  /** 0..1 */
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={cn('h-1.5 bg-divider rounded-full overflow-hidden', className)}>
      <div
        className="h-full bg-accent rounded-full transition-[width] duration-300"
        style={{ width: `${pct}%` }}
        aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} role="progressbar"
      />
    </div>
  );
}
