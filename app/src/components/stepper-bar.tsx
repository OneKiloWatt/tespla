import { cn } from '@/lib/utils';

export function StepperBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1 px-4 py-3 bg-bg-base border-b border-divider">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex-1 h-1 rounded-sm',
            i <= step ? 'bg-accent' : 'bg-divider',
          )}
        />
      ))}
    </div>
  );
}
