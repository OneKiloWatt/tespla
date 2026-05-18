'use client';
import { useRouter } from 'next/navigation';
import { IconBack } from './icons';

interface AppBarProps {
  title: string;
  /** 戻るボタンを表示。省略時は router.back() を呼ぶ */
  onBack?: () => void;
  showBack?: boolean;
  right?: React.ReactNode;
}

export function AppBar({ title, onBack, showBack = true, right }: AppBarProps) {
  const router = useRouter();
  const back = onBack ?? (() => router.back());
  return (
    <div className="h-[52px] flex items-center justify-between px-4 bg-bg-base border-b border-divider shrink-0">
      <div className="flex items-center gap-1.5">
        {showBack ? (
          <button
            onClick={back}
            aria-label="戻る"
            className="w-9 h-9 rounded-[10px] inline-flex items-center justify-center text-text-mid hover:bg-black/[0.04]"
          >
            <IconBack/>
          </button>
        ) : <div className="w-9"/>}
        <div className="text-base font-bold">{title}</div>
      </div>
      <div>{right ?? <div className="w-9"/>}</div>
    </div>
  );
}
