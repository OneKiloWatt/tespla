'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppBar } from '@/components/app-bar';
import { Chip } from '@/components/ui/chip';

type Tab = 'terms' | 'privacy';

function TermsInner() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(
    searchParams.get('tab') === 'privacy' ? 'privacy' : 'terms'
  );

  return (
    <>
      <AppBar title="利用規約・プライバシー"/>
      <main className="flex-1 overflow-y-auto p-[18px] pb-7">
        <div className="flex gap-1.5 mb-3.5">
          <Chip selected={tab === 'terms'} onClick={() => setTab('terms')}>利用規約</Chip>
          <Chip selected={tab === 'privacy'} onClick={() => setTab('privacy')}>プライバシーポリシー</Chip>
        </div>

        {tab === 'terms' ? <TermsContent/> : <PrivacyContent/>}

        <div className="text-text-soft text-xs mt-5 text-center">
          最終更新日：2026年5月1日
        </div>
      </main>
    </>
  );
}

export default function TermsPage() {
  return (
    <Suspense>
      <TermsInner/>
    </Suspense>
  );
}

function TermsContent() {
  return (
    <div className="text-[13px] leading-[1.7]">
      <h2 className="text-sm font-bold mb-1.5">第1条（適用）</h2>
      <p className="text-text-mid mb-3.5">
        本規約は、テスプラ（以下「本サービス」）の提供条件および本サービスの利用に関する一切の関係に適用されます。
      </p>
      <h2 className="text-sm font-bold mb-1.5">第2条（利用登録）</h2>
      <p className="text-text-mid mb-3.5">
        登録希望者が当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
      </p>
      <h2 className="text-sm font-bold mb-1.5">第3条（禁止事項）</h2>
      <p className="text-text-mid mb-3.5">
        ユーザーは、本サービスの利用にあたり、法令違反・公序良俗違反・他者の権利侵害となる行為を行ってはなりません。
      </p>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="text-[13px] leading-[1.7]">
      <h2 className="text-sm font-bold mb-1.5">取得する情報</h2>
      <p className="text-text-mid mb-3.5">
        メールアドレス、勉強記録、テスト結果等、利用に必要な情報を取得します。
      </p>
      <h2 className="text-sm font-bold mb-1.5">利用目的</h2>
      <p className="text-text-mid mb-3.5">
        サービス提供・改善・お知らせ通知のために利用します。第三者への提供は行いません。
      </p>
    </div>
  );
}
