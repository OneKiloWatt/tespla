export function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-[9px] bg-accent-bg border border-accent/[0.18] flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="4" y="6" width="16" height="14" rx="2.5" fill="#c95720" opacity="0.9"/>
          <rect x="7" y="4" width="10" height="3.5" rx="1.5" fill="#a94516"/>
          <circle cx="12" cy="13" r="3" fill="#fef8ed"/>
          <path d="M10 13L11.5 14.5L14 12" stroke="#c95720" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
        </svg>
      </div>
      <div className="leading-none flex flex-col gap-[3px]">
        <div className="text-[17px] font-extrabold tracking-[0.02em]">テスプラ</div>
        {!small && <div className="text-[9px] text-text-mid tracking-[0.06em]">テスト対策プランナー</div>}
        <div className="w-7 h-0.5 bg-accent mt-px rounded-sm"/>
      </div>
    </div>
  );
}
