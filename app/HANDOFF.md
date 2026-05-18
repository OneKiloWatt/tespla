# 実装者向けハンドオフ資料

## このドキュメントの位置づけ

- `dev.md`: PdM/設計が確定済みのプロダクト仕様
- `テスプラ モック.html`: クリッカブルUIモック（見た目・遷移の参照用）
- **`HANDOFF.md`（このファイル）: 開発時に必ず読む実装メモ・未確定事項・TODO**

## 全体アーキテクチャ

```
[クライアント (Next.js)]
  ├ Zustand: クライアント状態 + localStorage（お試し用）
  ├ React Hook Form + Zod: フォーム入力・バリデーション
  └ Supabase JS Client: 認証 + DB / Storage
                      │
                      ▼
[Supabase]
  ├ Auth (GoTrue)
  ├ Postgres (RLS で user_id スコープ)
  └ Storage（将来の添付ファイル用 / 現時点では未使用）
```

## 画面 → ルート 対応

| 画面 | ルート | ファイル |
|---|---|---|
| トップ | `/` | `app/page.tsx` |
| 規約・PP | `/terms` | `app/terms/page.tsx` |
| ログイン | `/login` | `app/login/page.tsx` |
| 新規登録 | `/signup` | `app/signup/page.tsx` |
| ホーム | `/home` | `app/home/page.tsx` |
| 計画修正 | `/plan` | `app/plan/page.tsx` |
| 計画作成 | `/plan/new` | `app/plan/new/page.tsx` |
| 振り返り一覧 | `/history` | `app/history/page.tsx` |
| 振り返り詳細 | `/history/[id]` | `app/history/[id]/page.tsx` |
| 結果記入 | `/result/new` | `app/result/new/page.tsx` |

## ホーム画面の状態分岐

```ts
// lib/store.ts
export type HomeState = 'empty' | 'active' | 'ended' | 'done';

deriveHomeState(plan, today):
  - plan なし     → 'empty'
  - plan.result   → 'done'
  - today > endDate → 'ended'
  - それ以外      → 'active'
```

`app/home/page.tsx` は単一エントリで、4つのサブコンポーネントを切り替える。
状態ごとのUIは `app/home/_components/home-{empty,active,ended,done}.tsx` を参照。

## 計画作成ウィザード（/plan/new）

```
Step 1: テスト情報   ┐
Step 2: 自動/手動    ├ usePlanDraft (Zustand) で一時状態を保持
Step 3: 自動設定     │  保存（Step5）でメインストアへコミット → reset
Step 4: 勉強配分     │
Step 5: 確認・保存   ┘
```

- `mode === 'manual'` の場合は Step 3 をスキップ（`goTo(3)` で Step 4 へ）
- Step 4 を開いた瞬間に `generateAutoPlan()` で配分を生成（既に編集済みなら触らない）
- Step 5 の「保存」で `useAppStore.upsertPlan()` を呼んだ後、`usePlanDraft.reset()` する

## お試し → アカウント 移行フロー

仕様書より：

> お試しの場合は localStorage に保存
> お試しの場合はテストは1つしか作れない
> お試しからアカウント作成に進むときは localStorage の内容を DB に入れて、そのまま引き継ぐ（ローカルストレージ削除）

実装方針：

1. `useAppStore` は persist で `tesupura-store` キーに localStorage 保存
2. `partialize` で **ログインユーザーがいる場合は計画を localStorage に書き出さない**（store.ts 参照）
3. signup 完了時に：
   ```ts
   // 1. 現在の localStorage の計画を取得
   const draft = localStorage.getItem('tesupura-store');
   // 2. Supabase でアカウント作成
   await supabase.auth.signUp({ email, password });
   // 3. plan をDBに挿入
   await supabase.from('plans').insert(parsed.plans);
   // 4. localStorage クリア
   localStorage.removeItem('tesupura-store');
   ```
4. 並行作成防止：`upsertPlan()` で activePlanId を上書きしているが、お試し時は **新規作成画面に入る前に既存計画があれば確認モーダル** を出すのを推奨

## Supabase スキーマ案

```sql
-- 各ユーザーの計画
create table plans (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  test_name   text not null,
  start_date  date not null,
  end_date    date not null,
  subjects    text[] not null,                       -- ['jp','math',...]
  test_day_subjects jsonb not null default '{}',     -- {date: [subject_id,...]}
  study_days  jsonb not null default '{}',           -- {date: [{id, mins, source}]}
  auto_settings jsonb,                               -- AutoSettings | null
  result      jsonb,                                 -- TestResult | null
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index plans_user_id_idx on plans(user_id);
alter table plans enable row level security;
create policy "users can rw own plans" on plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

## 自動配分アルゴリズム

仕様書要件：

- 平日 / 平日(部活時) / 休日 で1日の勉強時間を決める
- テスト前日は翌日のテスト科目だけを勉強
- 各教科 1回の最小単位 = 30分（ユーザー設定が30未満ならその設定を尊重）
- テスト日が近い方から計算し、最終的に勉強時間が均等になるようにする

現在 `lib/auto-plan.ts` は素朴な均等割り。実装時は以下を検討：

1. 科目ごとの「必要時間」を均等にする目標値 T_subj を出す
2. テスト前日に翌日のテスト科目を割り当て → 残り時間を控除
3. 残り日数を テスト日昇順で走査し、各日 30分単位でラウンドロビン的に科目を割当
4. 端数（30分未満の余り）は最終日（テスト直前）にまとめる

ユニットテスト推奨（`auto-plan.test.ts`）：

- 7日間 / 5教科 / 平日90分 → 各日 5教科 × 30分 = 150分超過にならないこと
- テスト前日 = 翌日テスト科目のみが入っていること
- 部活設定の noClubBeforeTest が ON のときテスト1週間前の平日が weekdayMins になっていること

## デザイントークン

`src/styles/globals.css` の `@theme` ブロック参照。Tailwind 4 から CSS-first の設定方式。

| トークン | 値 | 使う場面 |
|---|---|---|
| `--color-bg-base` | `#f9f0e0` | 全体背景（クリーム） |
| `--color-bg-card` | `#fef8ed` | カード背景 |
| `--color-bg-card-soft` | `#fdf4e3` | サブカード |
| `--color-text-dark` | `#2d2825` | 本文 |
| `--color-text-mid` | `#6b5b50` | 補助テキスト |
| `--color-accent` | `#c95720` | アクセント（CTA・強調） |
| `--color-accent-bg` | `#fae6cf` | アクセント弱（バッジ等） |
| `--color-subj-*` | 教科別 | 教科ピル・カレンダードット |

これらは Tailwind の `bg-accent` / `text-text-mid` 等として直接使える。

## エンプティ状態のイラスト差し替え

`HeroPlaceholder` コンポーネントが配置されている3箇所に、実画像を入れる：

| 場所 | 想定内容 |
|---|---|
| `home/_components/home-empty.tsx` | 計画を立てる中高生・机に向かう学生 |
| `home/_components/home-ended.tsx` | テスト達成感・ペンを置く学生 |
| `plan/page.tsx` 計画なし状態 | 真っ白なノート・空の机 |

推奨：`<Image>` に置き換え、`public/illustrations/` 配下にWebP配置。

## アクセシビリティ / E2E テスト

仕様書「セレニウム等で自動テストをおこなうので、それ前提の画面を組む」を踏まえ、
本スケルトンは下記の手当てを既に入れている：

- 主要なボタン・カードに `data-testid` を付与（例: `day-card-2026-05-18`、`cal-cell-2026-05-18`）
- フォームは `<label>` + `<input>` で関連付け
- アイコンボタンには `aria-label` を必ず付与

実装時に追加で：

- ページごとに `<h1>` を必ず1つ
- ローディング・エラー状態にも `role="status"` / `role="alert"` を付ける
- Playwright E2E は `playwright.config.ts` で baseURL と locale=ja-JP 指定

## TODO 一覧（実装着手前にチェック）

- [ ] Supabase クライアント・スキーマ作成 (`lib/supabase.ts`)
- [ ] 認証ガード（middleware.ts で未ログイン時のリダイレクト）
- [ ] お試し → アカウント 移行ロジック実装
- [ ] 並行作成防止の UI（既存計画がある状態で /plan/new に来たら確認モーダル）
- [ ] `auto-plan.ts` の本実装 + ユニットテスト
- [ ] 振り返り一覧の折れ線グラフ（recharts or 自前SVG）
- [ ] 結果記入 → ホーム遷移時にホーム状態が `'done'` になることの確認
- [ ] 教科のカスタム追加（仕様: 「ない場合は自分で選択肢を増やせるように」）
- [ ] アドバイス文言の管理（DB or static）
- [ ] エンプティ状態のイラスト差し替え
- [ ] `<TODO:`コメント箇所をすべて潰す（`grep -r "TODO" src/`）

## 設計上の判断・確認事項

ここはモック作成時に未確定だった/明文化しておきたい論点：

1. **進捗％の定義**：現在は「今日までに予定された分 / 全予定分」で算出（モックの設計）。
   仕様書には「全教科合計何時間勉強したか、何パーセント勉強終わったか」とあるので、
   実勉強の完了マーキング（チェックボックス）を追加するか PdM と確認。

2. **副教科のテスト日割当**：副教科を選んだ場合のテスト日もユーザーが指定する想定。

3. **テスト名の自動補完**：作成日の「3か月後のテスト日」が学期のどこに当たるかで自動命名。
   現在は単純に開始月から推定（`utils.ts > suggestTestName`）、必要なら校暦設定を追加。

4. **削除確認ダイアログ**：計画削除・点数編集削除の確認は Radix Dialog で実装。

## 連絡先

設計判断に迷ったらモック設計者（テスプラ チーム）にエスカレーション。
