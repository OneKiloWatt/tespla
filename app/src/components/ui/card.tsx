import * as React from 'react';
import { cn } from '@/lib/utils';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('bg-bg-card rounded-2xl p-[18px] border border-divider', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const CardSoft = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('bg-bg-card-soft rounded-[14px] p-[14px] border border-divider', className)}
      {...props}
    />
  )
);
CardSoft.displayName = 'CardSoft';

export const CardOutline = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('bg-transparent rounded-[14px] p-[14px] border border-divider-strong', className)}
      {...props}
    />
  )
);
CardOutline.displayName = 'CardOutline';
