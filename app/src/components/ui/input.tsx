import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 px-3 w-full bg-white text-text-dark text-[15px]',
        'border border-divider-strong rounded-[10px]',
        'focus:outline-none focus:border-accent',
        className,
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-[88px] px-3 py-2.5 w-full bg-white text-text-dark text-[15px] leading-relaxed',
        'border border-divider-strong rounded-[10px]',
        'focus:outline-none focus:border-accent resize-vertical',
        className,
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}
export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-xs font-semibold text-text-mid">{label}</span>}
      {children}
      {error
        ? <span className="text-xs text-danger">{error}</span>
        : hint && <span className="text-[11px] text-text-soft">{hint}</span>}
    </label>
  );
}
