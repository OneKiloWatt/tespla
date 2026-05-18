# テスプラ - テスト対策プランナー

中学生・高校生向けのテスト勉強計画アプリ。

## 技術スタック

| カテゴリ | 採用 |
|---|---|
| フレームワーク | Next.js 16.2.4 (App Router) |
| UI ライブラリ | React 19.2.4 |
| 言語 | TypeScript 5 |
| スタイル | Tailwind CSS 4（CSS-first / `@theme` ディレクティブ） |
| プリミティブ | Radix UI（Dialog / Switch / Checkbox 等） |
| 状態管理 | Zustand 5（persist で localStorage 連携） |
| フォーム | React Hook Form 7 + Zod 4 |
| 日付 | date-fns 4 |
| テスト | Vitest（unit）+ Playwright（E2E） |
| バックエンド | Supabase（Postgres / Auth / Storage） |

## セットアップ

```bash
pnpm install      # or: npm install / bun install
pnpm dev          # http://localhost:3000
```

その他のスクリプト：

```bash
pnpm build         # 本番ビルド
pnpm typecheck     # TypeScript チェック
pnpm test          # Vitest（unit）
pnpm test:e2e      # Playwright（E2E）
pnpm lint          # ESLint
```

## ディレクトリ構成

```
src/
  app/                              # Next.js App Router
    layout.tsx                      # ルートレイアウト（フォント・最大幅）
    page.tsx                        # トップ（/）
    terms/page.tsx                  # 利用規約・PP（/terms）
    login/page.tsx                  # ログイン（/login）
    signup/page.tsx                 # 新規登録（/signup）
    home/
      page.tsx                      # ホーム（/home）— 4状態をdispatch
      _components/
        home-empty.tsx              # 計画なし
        home-active.tsx             # 計画中
        home-ended.tsx              # テスト終了 / 結果未記入
        home-done.tsx               # 結果記入済
    plan/
      page.tsx                      # 計画修正（/plan）
      new/
        page.tsx                    # 計画作成ウィザード（/plan/new）
        _components/
          step-shell.tsx            # 各ステップ共通レイアウト
          step-1-info.tsx           # ① テスト情報
          step-2-mode.tsx           # ② 自動/手動
          step-3-settings.tsx       # ③ 自動設定
          step-4-allocate.tsx       # ④ 勉強配分
          step-5-confirm.tsx        # ⑤ 確認・保存
    history/
      page.tsx                      # 振り返り一覧（/history）
      [id]/page.tsx                 # 個別記録（/history/[id]）
    result/
      new/page.tsx                  # 結果記入（/result/new）
  components/
    ui/                             # 汎用UI部品
      button.tsx, card.tsx, input.tsx, badge.tsx, chip.tsx, switch.tsx, progress-bar.tsx
    icons.tsx                       # SVGアイコン集
    logo.tsx                        # ロゴ
    app-bar.tsx                     # トップバー（戻るボタン）
    bottom-nav.tsx                  # 下メニュー（ホーム/計画/振り返り）
    subject-pill.tsx                # 教科ピル + 時間配分バー
    calendar.tsx                    # 月カレンダー
    day-card.tsx                    # 日付カード（計画一覧用）
    day-edit-dialog.tsx             # 日付編集ダイアログ（Radix Dialog）
    stepper-bar.tsx                 # ウィザードのステッパー
    hero-placeholder.tsx            # エンプティ状態の画像プレースホルダ
  lib/
    types.ts                        # ドメイン型
    subjects.ts                     # 5教科 + 副教科の定義
    schemas.ts                      # Zod スキーマ（フォーム）
    store.ts                        # Zustand グローバルストア
    plan-draft-store.ts             # 計画作成ウィザード一時状態
    auto-plan.ts                    # 自動配分アルゴリズム（要詰め）
    sample-data.ts                  # 開発用サンプル
    utils.ts                        # cn / formatMd / 等
  styles/
    globals.css                     # Tailwind 4 + デザイントークン
```

## 参考

- 仕様書: `dev.md`（リポジトリ直下）
- 手渡し資料: `HANDOFF.md`（実装ポイント・状態遷移・未確定事項）
- デザインモック: `テスプラ モック.html`（クリッカブル参照用）

## 未実装・要対応リスト

実装着手前に必ず `HANDOFF.md` の「TODO 一覧」セクションを確認してください。
