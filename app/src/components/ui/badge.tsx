import * as React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'neutral';

const styles: Record<BadgeVariant, string> = {
  default: 'bg-accent-bg text-accent-dark',
  success: 'bg-[#d8e8de] text-[#2f6b40]',
  warning: 'bg-[#f6e6c8] text-[#8a662a]',
  neutral: 'bg-black/[0.06] text-text-mid',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-[2px] rounded-[10px]',
        'text-[10px] font-bold whitespace-nowrap shrink-0',
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
