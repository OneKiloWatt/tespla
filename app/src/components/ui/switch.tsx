'use client';
import * as React from 'react';
import * as RSwitch from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export const Switch = React.forwardRef<
  React.ElementRef<typeof RSwitch.Root>,
  React.ComponentPropsWithoutRef<typeof RSwitch.Root>
>(({ className, ...props }, ref) => (
  <RSwitch.Root
    ref={ref}
    className={cn(
      'relative w-[42px] h-6 rounded-xl cursor-pointer outline-none transition-colors',
      'bg-divider-strong data-[state=checked]:bg-accent',
      className,
    )}
    {...props}
  >
    <RSwitch.Thumb className={cn(
      'block w-5 h-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]',
      'translate-x-0.5 transition-transform',
      'data-[state=checked]:translate-x-[20px]',
    )}/>
  </RSwitch.Root>
));
Switch.displayName = 'Switch';
