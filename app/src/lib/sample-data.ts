/** ホーム画面のアドバイス。実装時はDBから取得 or 配列で持つ */
export const ADVICES = [
  '夜は新しい単元より復習が頭に残りやすいよ。',
  'スマホは別の部屋。集中スイッチを入れよう。',
  '間違えた問題に印を付けておくと、テスト直前に効く。',
  '30分やったら5分休憩。タイマーを使うと長続きする。',
  '理解できないところは翌日もう一度。寝かせると分かる。',
];

export function pickAdvice(seed?: number): string {
  const i = seed == null ? Math.floor(Math.random() * ADVICES.length) : seed % ADVICES.length;
  return ADVICES[i];
}
