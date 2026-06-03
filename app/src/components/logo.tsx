export function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/icon.png" alt="" aria-hidden className="w-9 h-9 rounded-[9px] object-contain"/>
      <div className="leading-none flex flex-col gap-[3px]">
        <div className="text-[17px] font-extrabold tracking-[0.02em]">テスプラ</div>
        {!small && <div className="text-[9px] text-text-mid tracking-[0.06em]">テスト対策プランナー</div>}
        <div className="w-7 h-0.5 bg-accent mt-px rounded-sm"/>
      </div>
    </div>
  );
}
