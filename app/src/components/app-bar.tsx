'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { IconBack, IconMenu } from './icons';

interface AppBarProps {
  title: string;
  /** 戻るボタンを表示。省略時は router.back() を呼ぶ */
  onBack?: () => void;
  showBack?: boolean;
  right?: React.ReactNode;
}

export function AppBar({ title, onBack, showBack = true, right }: AppBarProps) {
  const router = useRouter();
  const { user, reset } = useAppStore();
  const back = onBack ?? (() => router.back());

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setMenuOpen(false);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      reset();
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const rightContent = right ?? (
    user ? (
      <button
        onClick={() => setMenuOpen(v => !v)}
        aria-label="メニュー"
        aria-expanded={menuOpen}
        className="w-9 h-9 rounded-[10px] inline-flex items-center justify-center text-text-mid hover:bg-black/[0.04]"
      >
        <IconMenu/>
      </button>
    ) : (
      <div className="w-9"/>
    )
  );

  return (
    <>
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
        <div>{rightContent}</div>
      </div>

      {/* ドロップダウンメニュー */}
      {menuOpen && (
        <>
          {/* 背景クリックで閉じる */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div className="fixed top-[52px] right-4 z-50 bg-bg-card rounded-[12px] shadow-lg border border-divider min-w-[140px] py-1">
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-black/[0.04] disabled:opacity-50"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
            </button>
          </div>
        </>
      )}
    </>
  );
}
