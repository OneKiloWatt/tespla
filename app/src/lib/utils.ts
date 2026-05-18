import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind class names のマージ + 重複解決 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const WD_JA = ['日', '月', '火', '水', '木', '金', '土'] as const;

/** ISO日付（YYYY-MM-DD）を「6/8 (月)」形式に */
export function formatMd(date: string): string {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}（${WD_JA[d.getDay()]}）`;
}

/** 「6月8日 (月)」形式 */
export function formatMdFull(date: string): string {
  const d = new Date(date);
  return `${d.getMonth() + 1}月${d.getDate()}日（${WD_JA[d.getDay()]}）`;
}

/** 分 → 「1時間30分」「45分」 */
export function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}分`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}時間${m}分` : `${h}時間`;
}

/** ISO 日付の配列（start 〜 end 含む） */
export function datesBetween(start: string, end: string): string[] {
  const out: string[] = [];
  const s = new Date(start);
  const e = new Date(end);
  for (const d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/** テスト日 = 1〜3学期 中間/期末 の自動命名 */
export function suggestTestName(testStart: Date = new Date()): string {
  const m = testStart.getMonth() + 1;
  // 中学校: 1学期(4-7) / 2学期(9-12) / 3学期(1-3) 簡易判定
  if (m >= 4 && m <= 6)  return '1学期 中間テスト';
  if (m === 7)           return '1学期 期末テスト';
  if (m >= 9 && m <= 10) return '2学期 中間テスト';
  if (m === 11 || m === 12) return '2学期 期末テスト';
  return '3学期 期末テスト';
}
