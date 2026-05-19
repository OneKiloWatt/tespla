-- Phase 2: 追加制約
-- 1ユーザーにつき active/planning の計画は1件のみ
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_exam_per_user
  ON exams(user_id)
  WHERE status IN ('planning', 'active');
