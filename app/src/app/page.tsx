import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardOutline } from '@/components/ui/card';
import { IconArrowRight } from '@/components/icons';

const STEPS = [
  ['1', 'テストを作る',     '日程と科目を入れるだけ'],
  ['2', '学習プランを作る', '自動で組む・手動で組むを選べる'],
  ['3', '記録して次に活かす', 'やったことが次のテストで使える'],
] as const;

/**
 * トップ（未ログイン入口）
 *
 * ルート: `/`
 *
 * - 「すぐ試す」→ `/plan/new` （お試しでlocalStorage保存）
 * - 「ログインする」→ `/login`
 */
export default function TopPage() {
  return (
    <main className="flex-1 overflow-y-auto p-[18px] pb-8">
      <div className="mb-5"><Logo/></div>

      <Card>
        <h1 className="text-[26px] font-extrabold leading-[1.35] tracking-tight">
          テスト勉強、<br/>何から始めるか<br/>
          <span className="text-accent">迷わなくなる。</span>
        </h1>
        <p className="text-[13px] text-text-mid mt-4 leading-[1.7]">
          科目と日数を入れるだけで、<br/>
          何をどれだけやればいいか見えてくる。
        </p>

        <CardOutline className="mt-5 bg-white/40">
          <div className="text-xs text-text-mid mb-3 font-semibold">3ステップで始まります</div>
          {STEPS.map(([n, t, d]) => (
            <div key={n} className="flex items-start gap-3 py-2.5 border-b border-divider last:border-0">
              <div className="w-6 h-6 rounded-full bg-accent-bg text-accent-dark inline-flex items-center justify-center text-xs font-bold shrink-0">
                {n}
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-bold">{t}</div>
                <div className="text-[11px] text-text-mid mt-0.5">{d}</div>
              </div>
            </div>
          ))}
        </CardOutline>

        <div className="flex gap-2.5 mt-5">
          <Button asChild className="flex-[1.4]">
            <Link href="/plan/new">すぐ試す <IconArrowRight/></Link>
          </Button>
          <Button asChild variant="secondary" className="flex-1">
            <Link href="/login">ログインする</Link>
          </Button>
        </div>
        <div className="text-center text-[11px] text-text-mid mt-3">
          登録なしで、今すぐ使えます。（ログインは後でもOK）
        </div>
      </Card>

      <div className="text-center text-[11px] text-text-soft mt-4 leading-[1.8]">
        <Link href="/terms" className="text-text-mid underline">利用規約</Link>
        {' ・ '}
        <Link href="/terms" className="text-text-mid underline">プライバシーポリシー</Link>
      </div>
    </main>
  );
}
