'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlanDraft } from '@/lib/plan-draft-store';
import { useAppStore } from '@/lib/store';
import { finishAndCreateNew, getActivePlanId } from '@/actions/plan';
import { AppBar } from '@/components/app-bar';
import { StepperBar } from '@/components/stepper-bar';
import { Button } from '@/components/ui/button';
import { Step1Info } from './_components/step-1-info';
import { Step2Mode } from './_components/step-2-mode';
import { Step3Settings } from './_components/step-3-settings';
import { Step4Allocate } from './_components/step-4-allocate';
import { Step5Confirm } from './_components/step-5-confirm';
import { IconSpinner } from '@/components/icons';

/**
 * 計画作成ウィザード（/plan/new）
 *
 *   1 → 2 → ( 3 ) → 4 → 5
 *           ↑ auto選択時のみ
 *
 * 状態は usePlanDraft（Zustand）で管理。
 * mount 時に並行作成防止チェックを行う。
 */
export default function NewPlanPage() {
  const { step, prev } = usePlanDraft();
  const { user, activePlanId, setActivePlan } = useAppStore();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [existingExamId, setExistingExamId] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkActivePlan() {
      if (user) {
        // ログイン時: Server Action で確認
        const activeId = await getActivePlanId();
        if (!cancelled && activeId) {
          setExistingExamId(activeId);
          setShowModal(true);
        }
      } else {
        // 未ログイン: Zustand ストアで確認
        if (activePlanId !== null) {
          setExistingExamId(activePlanId);
          setShowModal(true);
        }
      }
    }

    checkActivePlan();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancelModal = () => {
    router.push('/home');
  };

  const handleCreateNew = async () => {
    if (isFinishing || !existingExamId) return;
    setIsFinishing(true);
    setModalError(null);
    try {
      if (user) {
        // ログイン時: 既存計画を finished に更新
        await finishAndCreateNew(existingExamId);
      } else {
        // 未ログイン: Zustand から削除
        setActivePlan(null);
      }
      setShowModal(false);
    } catch {
      setModalError('更新に失敗しました。もう一度試してください');
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <>
      <AppBar title={`計画作成 (${step + 1}/5)`} onBack={step === 0 ? undefined : prev}/>
      <StepperBar step={step} total={5}/>
      {step === 0 && <Step1Info/>}
      {step === 1 && <Step2Mode/>}
      {step === 2 && <Step3Settings/>}
      {step === 3 && <Step4Allocate/>}
      {step === 4 && <Step5Confirm/>}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="w-full max-w-md bg-bg-card rounded-t-[18px] p-5">
            <div className="w-9 h-1 rounded bg-divider-strong mx-auto mb-4"/>
            <h2 className="text-base font-extrabold mb-2">進行中の計画があります</h2>
            <p className="text-[13px] text-text-mid leading-[1.6] mb-5">
              進行中のテスト計画があります。新しく作ると、今の計画は「終了済み」として残ります。削除はされません。
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleCancelModal}
              >
                キャンセル
              </Button>
              <Button
                className="flex-[1.5] inline-flex items-center justify-center gap-1.5"
                disabled={isFinishing}
                onClick={handleCreateNew}
              >
                {isFinishing && <IconSpinner size={14}/>}
                {isFinishing ? '処理中...' : '新しく作る'}
              </Button>
            </div>
            {modalError && <div className="text-xs text-danger mt-2">{modalError}</div>}
          </div>
        </div>
      )}
    </>
  );
}
