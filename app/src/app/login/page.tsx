'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppBar } from '@/components/app-bar';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { loginSchema, type LoginInput } from '@/lib/schemas';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginInput) => {
    setAuthError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setAuthError('メールアドレスまたはパスワードが正しくありません');
      return;
    }
    router.push('/home');
  };

  return (
    <>
      <AppBar title="ログイン"/>
      <main className="flex-1 overflow-y-auto p-[18px] pb-6">
        <div className="text-center mb-6"><Logo small/></div>
        <h2 className="text-lg font-bold mb-3.5">おかえりなさい</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="flex flex-col gap-3">
            <Field label="メールアドレス" error={errors.email?.message}>
              <Input type="email" placeholder="you@example.com" {...register('email')}/>
            </Field>
            <Field label="パスワード" error={errors.password?.message}>
              <Input type="password" placeholder="••••••••" {...register('password')}/>
            </Field>
            <Button size="lg" block type="submit" disabled={isSubmitting}>ログイン</Button>
            {authError && (
              <div className="text-xs text-danger">{authError}</div>
            )}
          </Card>
        </form>

        <div className="text-center text-xs text-text-mid mt-5">まだアカウントがない方は</div>
        <Button asChild variant="secondary" block className="mt-2">
          <Link href="/signup">新規登録する</Link>
        </Button>
      </main>
    </>
  );
}
