'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TestPlan } from '@/lib/types';
import { subjectById } from '@/lib/subjects';
import { testResultSchema, type TestResultInput } from '@/lib/schemas';
import { saveResult } from '@/actions/plan';
import { AppBar } from '@/components/app-bar';
import { Card, CardSoft } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/input';

interface Props {
  exam: TestPlan;
}

/**
 * テスト結果記入フォーム（Client Component）
 */
export function ResultEntryForm({ exam }: Props) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, control, handleSubmit, formState: { isSubmitting } } =
    useForm<TestResultInput>({
      resolver: zodResolver(testResultSchema),
      defaultValues: { scores: {}, memo: '' },
    });

  const onSubmit = async (values: TestResultInput) => {
    setErrorMessage(null);
    try {
      await saveResult(exam.id, values.scores as Record<string, number>, values.memo);
      router.push('/history/' + exam.id);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : '保存に失敗しました');
    }
  };

  return (
    <>
      <AppBar title="テスト結果を記録"/>
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-[18px] pb-4">
          <div className="text-[11px] text-text-mid">{exam.testName}</div>
          <h2 className="text-[17px] font-extrabold mt-0.5 mb-3.5">各教科の点数を入れよう</h2>

          <Card>
            <div className="flex flex-col gap-3">
              {exam.subjects.map(id => {
                const s = subjectById(id);
                return (
                  <div key={id} className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full" style={{ background: s.color }}/>
                    <div className="flex-1 text-sm font-semibold">{s.label}</div>
                    <Controller
                      control={control}
                      name={`scores.${id}`}
                      render={({ field }) => (
                        <Input
                          type="number" min={0} max={100} placeholder="0"
                          className="w-[78px] text-center text-base font-bold"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      )}
                    />
                    <span className="text-xs text-text-mid">点</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="mt-3">
            <Field label="ふりかえりメモ（任意）">
              <Textarea rows={4} placeholder="うまくいったこと・次に活かせること" {...register('memo')}/>
            </Field>
          </Card>

          <CardSoft className="mt-3 text-[11px] text-text-mid leading-[1.6]">
            点数は何度でも編集できます。<br/>
            数学が苦手なら理由をメモしておくと、次のテストで役立ちます。
          </CardSoft>

          {errorMessage && (
            <div className="mt-3 p-3 rounded-lg bg-red-50 text-red-600 text-xs">
              {errorMessage}
            </div>
          )}
        </main>

        <div className="px-4 py-3 border-t border-divider bg-bg-base flex gap-2 shrink-0">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            disabled={isSubmitting}
            onClick={() => router.push('/home')}
          >
            あとで
          </Button>
          <Button type="submit" className="flex-[1.5]" disabled={isSubmitting}>
            保存する
          </Button>
        </div>
      </form>
    </>
  );
}
