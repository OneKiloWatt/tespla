'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Checkbox from '@radix-ui/react-checkbox';
import { AppBar } from '@/components/app-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { IconCheck } from '@/components/icons';
import { signupSchema, type SignupInput } from '@/lib/schemas';
import { createClient } from '@/lib/supabase/client';
import { savePlan } from '@/actions/plan';
import { testPlanToPlanDraftData } from '@/lib/db-converters';
import { useAppStore } from '@/lib/store';

export default function SignupPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [migrateError, setMigrateError] = useState<string | null>(null);
  const { plans, activePlanId, reset } = useAppStore();
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } =
    useForm<SignupInput>({
      resolver: zodResolver(signupSchema),
      defaultValues: { email: '', password: '', agreed: false as unknown as true },
    });

  const onSubmit = async (values: SignupInput) => {
    setAuthError(null);
    setMigrateError(null);
    const supabase = createClient();

    // 移行対象のプランを特定（signUp 前に取得しておく）
    const planToMigrate = plans.find(p => p.id === activePlanId) ?? plans[0] ?? null;

    // 1. アカウント作成
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setAuthError('登録に失敗しました。しばらく経ってから再度お試しください');
      return;
    }

    // 2. プラン移行
    if (planToMigrate) {
      try {
        await savePlan(testPlanToPlanDraftData(planToMigrate));
      } catch {
        console.error('plan migration failed');
        setMigrateError('登録は完了しましたが、計画の移行に失敗しました。お試し中のテスト計画は保存できませんでした。ホーム画面から新しく作成してください。');
        return;
      }
    }

    // 3. localStorage クリア
    reset();

    // 4. ホームへ
    router.push('/home');
  };

  return (
    <>
      <AppBar title="新規アカウント登録"/>
      <main className="flex-1 overflow-y-auto p-[18px] pb-6">
        <div className="bg-accent-bg rounded-xl p-3.5 text-[13px] text-accent-dark leading-[1.5] mb-4">
          <strong className="font-bold">お試しデータは引き継がれます。</strong><br/>
          いま作った計画はそのままアカウントに保存されます。
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="flex flex-col gap-3">
            <Field label="メールアドレス" error={errors.email?.message}>
              <Input type="email" placeholder="you@example.com" {...register('email')}/>
            </Field>
            <Field
              label="パスワード（8文字以上）"
              hint="英数字を組み合わせると安全です"
              error={errors.password?.message}
            >
              <Input type="password" placeholder="••••••••" {...register('password')}/>
            </Field>

            <Controller
              control={control}
              name="agreed"
              render={({ field }) => (
                <label className="flex gap-2 text-xs text-text-mid items-start mt-1 cursor-pointer">
                  <Checkbox.Root
                    checked={field.value === true}
                    onCheckedChange={(v) => field.onChange(v === true ? true : false)}
                    className="mt-0.5 w-4 h-4 border border-divider-strong rounded bg-white flex items-center justify-center data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                  >
                    <Checkbox.Indicator className="text-white"><IconCheck size={12}/></Checkbox.Indicator>
                  </Checkbox.Root>
                  <span>
                    <Link href="/terms" className="text-accent underline">利用規約</Link>
                    {' と '}
                    <Link href="/terms" className="text-accent underline">プライバシーポリシー</Link>
                    に同意します
                  </span>
                </label>
              )}
            />
            {errors.agreed?.message && (
              <div className="text-xs text-danger">{errors.agreed.message}</div>
            )}

            <Button size="lg" block type="submit" disabled={isSubmitting}>
              登録して始める
            </Button>
            {authError && (
              <div className="text-xs text-danger">{authError}</div>
            )}
            {migrateError && (
              <div className="text-xs text-danger">{migrateError}</div>
            )}
          </Card>
        </form>

        <div className="text-center text-xs text-text-mid mt-4">
          既にアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-accent">ログイン</Link>
        </div>
      </main>
    </>
  );
}
