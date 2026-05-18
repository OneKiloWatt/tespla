'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHome, IconEdit, IconHistory } from './icons';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  match: RegExp;
  Icon: typeof IconHome;
}

const ITEMS: NavItem[] = [
  { href: '/home',    label: 'ホーム',         match: /^\/home/,         Icon: IconHome },
  { href: '/plan',    label: '計画作成・修正', match: /^\/plan/,          Icon: IconEdit },
  { href: '/history', label: '振り返り',       match: /^\/history/,       Icon: IconHistory },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="h-[62px] flex justify-around bg-white border-t border-divider pb-[env(safe-area-inset-bottom)] shrink-0">
      {ITEMS.map(it => {
        const active = it.match.test(pathname);
        return (
          <Link key={it.href} href={it.href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5',
              'text-[10px] font-semibold',
              active ? 'text-accent' : 'text-text-mid',
            )}
          >
            <div className="w-[22px] h-[22px] flex items-center justify-center text-[18px]">
              <it.Icon size={20}/>
            </div>
            <div>{it.label}</div>
          </Link>
        );
      })}
    </nav>
  );
}
