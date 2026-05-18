'use client';
import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { IconArrowRight } from '@/components/icons';
import { usePlanDraft } from '@/lib/plan-draft-store';

interface StepShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** 次ボタンのラベル変更 */
  nextLabel?: string;
  nextDisabled?: boolean;
  /** デフォルトは next()。保存ステップなどで上書き */
  onNext?: () => void;
}

/**
 * 各ステップ共通のレイアウト：ヘッダ + スクロール領域 + フッタの「戻る/次へ」
 */
export function StepShell({ title, subtitle, children, nextLabel = '次へ', nextDisabled, onNext }: StepShellProps) {
  const { step, next, prev } = usePlanDraft();

  return (
    <>
      <div className="px-[18px] pt-4 pb-1">
        <h2 className="text-[19px] font-extrabold leading-snug">{title}</h2>
        {subtitle && <p className="text-xs text-text-mid mt-1 leading-[1.6]">{subtitle}</p>}
      </div>
      <main className="flex-1 overflow-y-auto px-[18px] pb-4">
        {children}
      </main>
      <div className="px-4 py-3 border-t border-divider bg-bg-base flex gap-2 shrink-0">
        {step > 0 && (
          <Button variant="secondary" className="flex-1" onClick={prev}>戻る</Button>
        )}
        <Button
          className={step > 0 ? 'flex-[1.5]' : 'flex-1'}
          disabled={nextDisabled}
          onClick={onNext ?? next}
        >
          {nextLabel} <IconArrowRight/>
        </Button>
      </div>
    </>
  );
}
