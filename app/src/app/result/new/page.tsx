import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fetchExamDetail } from '@/lib/db-converters';
import { ResultEntryForm } from './_components/result-entry-form';

/**
 * テスト結果記入 (/result/new?examId=xxx)
 *
 * Server Component: DB から exam を取得して ResultEntryForm に渡す。
 */
export default async function ResultEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ examId?: string }>;
}) {
  const { examId } = await searchParams;
  if (!examId || !z.string().uuid().safeParse(examId).success) redirect('/home');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/home');
  const exam = await fetchExamDetail(supabase, examId, user.id);
  if (!exam) redirect('/home');
  return <ResultEntryForm exam={exam} />;
}
