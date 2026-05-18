/**
 * HeroPlaceholder
 *
 * エンプティ状態の主役ビジュアル枠。実装者はここに本物のイラストを差し替える。
 * 推奨サイズ: 横幅100% × 高さ120-140px
 */
interface HeroPlaceholderProps {
  label: string;
  height?: number;
}

export function HeroPlaceholder({ label, height = 120 }: HeroPlaceholderProps) {
  return (
    <div
      style={{
        height,
        background: 'repeating-linear-gradient(45deg, var(--color-accent-bg) 0 12px, #f5d8b8 12px 24px)',
      }}
      className="relative w-full rounded-[14px] flex items-center justify-center overflow-hidden border border-dashed border-accent/30 my-1.5 mb-4"
    >
      <div className="bg-white/85 px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold text-accent-dark tracking-wide">
        {label}
      </div>
    </div>
  );
}
