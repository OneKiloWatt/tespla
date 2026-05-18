# DATA_STRUCTURES

Supabase（PostgreSQL）のテーブル定義。ソースは `docker/supabase/init/` 配下の SQL ファイル。

全テーブルで Row Level Security（RLS）を有効にしている。

## テーブル一覧

```
exams               テスト計画
exam_subjects       テスト計画に紐づく教科
study_plans         教科ごとの合計勉強配分
daily_plans         日付×教科ごとの勉強配分
progress_logs       勉強実績ログ
exam_results        テスト結果（点数）
availability_rules  自動配分設定（勉強可能時間・部活設定）
```

## exams

テスト計画の親エンティティ。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | NOT NULL | `auth.users.id` に対応（RLS で使用） |
| version | integer | NOT NULL, DEFAULT 1 | |
| name | text | NOT NULL | テスト名 |
| start_date | date | NOT NULL | テスト開始日 |
| end_date | date | NOT NULL, `>= start_date` | テスト終了日 |
| status | text | NOT NULL | `planning` / `active` / `finished` |
| planning_mode | text | NOT NULL | `auto` / `manual` |
| schedule_days | jsonb | | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

## exam_subjects

テスト計画に紐づく教科。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| exam_id | uuid | NOT NULL, FK → exams.id ON DELETE CASCADE | |
| subject_id | text | NOT NULL | 教科 ID（`jp`, `math` 等） |
| subject_name | text | NOT NULL | 表示名 |
| normalized_name | text | NOT NULL | |
| previous_score | integer | 0–100 または NULL | 前回点数 |
| previous_study_minutes | integer | >= 0 または NULL | 前回勉強時間（分） |
| target_score | integer | NOT NULL, 0–100 | 目標点数 |
| display_order | integer | NOT NULL | 表示順 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

UNIQUE: `(exam_id, subject_id)`

## study_plans

教科ごとの合計勉強配分（1 教科 1 レコード）。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| exam_subject_id | uuid | NOT NULL, UNIQUE, FK → exam_subjects.id ON DELETE CASCADE | |
| planned_minutes | integer | NOT NULL, >= 10 | 合計予定分数 |
| planned_ratio | numeric(5,4) | NOT NULL, 0–1 | 教科の配分割合 |
| reason | text | | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

## daily_plans

日付×教科ごとの勉強配分。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| exam_id | uuid | NOT NULL, FK → exams.id ON DELETE CASCADE | |
| exam_subject_id | uuid | NOT NULL, FK → exam_subjects.id ON DELETE CASCADE | |
| date | date | NOT NULL | 勉強日 |
| planned_minutes | integer | NOT NULL, >= 10 | 予定分数 |
| source | text | NOT NULL | `auto` / `manual` |
| display_order | integer | NOT NULL | 表示順 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

UNIQUE: `(exam_id, exam_subject_id, date)`

## progress_logs

勉強実績ログ。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| exam_id | uuid | NOT NULL, FK → exams.id ON DELETE CASCADE | |
| exam_subject_id | uuid | NOT NULL, FK → exam_subjects.id ON DELETE CASCADE | |
| logged_minutes | integer | NOT NULL, >= 0 | 実績分数 |
| memo | text | | |
| logged_date | date | NOT NULL | 実績日 |
| logged_at | timestamptz | NOT NULL, DEFAULT now() | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

## exam_results

テスト結果（点数）。1 教科 1 レコード。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| exam_subject_id | uuid | NOT NULL, UNIQUE, FK → exam_subjects.id ON DELETE CASCADE | |
| actual_score | integer | NOT NULL, 0–100 | 実際の点数 |
| actual_study_minutes | integer | >= 0 または NULL | 実際の勉強時間（分） |
| note | text | | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

## availability_rules

自動配分設定。1 テスト計画につき 1 レコード。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| exam_id | uuid | NOT NULL, UNIQUE, FK → exams.id ON DELETE CASCADE | |
| weekday_club_minutes | integer | NOT NULL, >= 0 | 平日（部活あり）の勉強時間（分） |
| weekday_no_club_minutes | integer | NOT NULL, >= 0 | 平日（部活なし）の勉強時間（分） |
| weekend_minutes | integer | NOT NULL, >= 0 | 休日の勉強時間（分） |
| club_days | jsonb | NOT NULL | 部活がある曜日の配列 |
| study_start_date | date | NOT NULL | 勉強開始日 |
| pre_exam_rest_mode | boolean | NOT NULL | テスト直前の部活なし設定 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

## インデックス

| インデックス名 | テーブル | カラム |
|---|---|---|
| exams_user_id_idx | exams | user_id |
| exams_user_id_status_idx | exams | (user_id, status) |
| exam_subjects_exam_id_idx | exam_subjects | exam_id |
| daily_plans_exam_id_date_idx | daily_plans | (exam_id, date) |
| progress_logs_exam_id_logged_date_idx | progress_logs | (exam_id, logged_date) |
| progress_logs_exam_subject_id_idx | progress_logs | exam_subject_id |

## RLS ポリシー

全テーブルに RLS を有効化。アクセス制御の基本ルール：

- **exams**: `user_id = auth.uid()` で SELECT / INSERT / UPDATE / DELETE を制限
- **exam_subjects 以下のテーブル**: `exam_id` が自分の `exams` に属するレコードのみ操作可
- **progress_logs の UPDATE**: 不可（`WITH CHECK (false)`）
