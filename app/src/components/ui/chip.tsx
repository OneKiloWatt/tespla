import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  /** ボタンではなく単なるラベル表示として使うとき */
  asTag?: boolean;
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ selected, asTag, className, children, ...props }, ref) => {
    const cls = cn(
      'inline-flex items-center gap-1 h-8 px-3 rounded-2xl',
      'text-[13px] font-medium',
      'border transition-[background,border-color]',
      selected
        ? 'bg-accent border-accent text-white'
        : 'bg-white border-divider-strong text-text-dark hover:bg-bg-card-soft',
      className,
    );
    if (asTag) {
      return <span className={cls}>{children}</span>;
    }
    return (
      <button
        ref={ref}
        type="button"
        className={cls}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Chip.displayName = 'Chip';
