# DESIGN

## デザイントークン

`app/src/styles/globals.css` の `@theme` ブロックで定義。Tailwind 4 の CSS-first 方式で、`bg-accent` / `text-text-mid` 等のユーティリティとして直接使える。

### ブランドカラー

| トークン | 値 | 用途 |
|---|---|---|
| `--color-bg-base` | `#f9f0e0` | 全体背景（クリーム） |
| `--color-bg-card` | `#fef8ed` | カード背景 |
| `--color-bg-card-soft` | `#fdf4e3` | サブカード背景 |
| `--color-text-dark` | `#2d2825` | 本文 |
| `--color-text-mid` | `#6b5b50` | 補助テキスト |
| `--color-text-soft` | `#998678` | より薄い補助テキスト |
| `--color-accent` | `#c95720` | アクセント（CTA・強調） |
| `--color-accent-dark` | `#a94516` | アクセント（暗め） |
| `--color-accent-soft` | `#f0d4ba` | アクセント（淡め） |
| `--color-accent-bg` | `#fae6cf` | アクセント背景（バッジ等） |
| `--color-divider` | `rgba(45,40,37,0.08)` | 区切り線 |
| `--color-divider-strong` | `rgba(45,40,37,0.14)` | 区切り線（強） |
| `--color-success` | `#4a8a5c` | 成功・完了 |
| `--color-warning` | `#d49a3a` | 警告 |
| `--color-danger` | `#b54530` | エラー・危険 |

### 教科カラー

| トークン | 値 | 教科 |
|---|---|---|
| `--color-subj-jp` | `#c95720` | 国語 |
| `--color-subj-math` | `#4a7ba6` | 数学 |
| `--color-subj-en` | `#6b8a4a` | 英語 |
| `--color-subj-sci` | `#8a5dab` | 理科 |
| `--color-subj-soc` | `#b58a3a` | 社会 |
| `--color-subj-music` | `#c25f8a` | 音楽 |
| `--color-subj-art` | `#5a9e9c` | 美術 |
| `--color-subj-pe` | `#6b8aab` | 保健体育 |
| `--color-subj-tech` | `#8a6b4a` | 技術 |
| `--color-subj-home` | `#b07090` | 家庭 |

### タイポグラフィ

| トークン | 値 |
|---|---|
| `--font-sans` | `'Noto Sans JP', -apple-system, system-ui, sans-serif` |

### 角丸

| トークン | 値 | 用途 |
|---|---|---|
| `--radius-card` | `16px` | カード |
| `--radius-card-sm` | `12px` | 小カード |
| `--radius-btn` | `10px` | ボタン |
| `--radius-chip` | `16px` | チップ |

## ベーススタイル

- `font-feature-settings: "palt"` を全体に適用
- `-webkit-font-smoothing: antialiased` を全体に適用
- フォーカスリング: `2px solid var(--color-accent)`、`outline-offset: 2px`
- スクロールバー非表示クラス: `.no-scrollbar`
