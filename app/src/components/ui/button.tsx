import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variantStyles: Record<Variant, string> = {
  primary:   'bg-accent text-white hover:bg-accent-dark',
  secondary: 'bg-white text-text-dark border border-divider-strong hover:bg-bg-card-soft',
  ghost:     'bg-transparent text-text-mid hover:bg-black/[0.04]',
  danger:    'bg-danger text-white hover:opacity-90',
};
const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px] rounded-lg',
  md: 'h-11 px-[18px] text-[15px] rounded-[10px]',
  lg: 'h-[52px] px-5 text-base rounded-[10px]',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', block, className, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 font-bold',
          'transition-[transform,opacity,background] active:scale-[0.98]',
          'disabled:opacity-50 disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          block && 'w-full',
          className,
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
