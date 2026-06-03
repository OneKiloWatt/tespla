'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePlanDraft } from '@/lib/plan-draft-store';
import { useAppStore } from '@/lib/store';
import { finishAndCreateNew, getActivePlanId, getActivePlan } from '@/actions/plan';
import type { TestPlan } from '@/lib/types';
import { AppBar } from '@/components/app-bar';
import { StepperBar } from '@/components/stepper-bar';
import { Button } from '@/components/ui/button';
import { Step1Info } from './_components/step-1-info';
import { Step2Mode } from './_components/step-2-mode';
import { Step3Settings } from './_components/step-3-settings';
import { Step4Allocate } from './_components/step-4-allocate';
import { Step5Confirm } from './_components/step-5-confirm';
import { IconSpinner } from '@/components/icons';

function NewPlanPageContent() {
  const searchParams = useSearchParams();
  const editParam = searchParams.get('edit'); // 'info' | 'auto' | null
  const { step, prev, reset, patch } = usePlanDraft();
  const { user, activePlanId, plans, setActivePlan } = useAppStore();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [existingExamId, setExistingExamId] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (editParam === 'info' || editParam === 'auto') {
        // Edit mode: load active plan into draft, skip modal
        let plan: TestPlan | null = null;
        if (user) {
          plan = await getActivePlan();
        } else if (activePlanId) {
          plan = plans.find(p => p.id === activePlanId) ?? null;
        }
        if (cancelled || !plan) return;

        reset();
        patch({
          testName: plan.testName,
          startDate: plan.startDate,
          endDate: plan.endDate,
          subjects: plan.subjects,
          testDaySubjects: plan.testDaySubjects,
          studyDays: plan.studyDays,
          mode: editParam === 'auto' ? 'auto' : (plan.autoSettings ? 'auto' : 'manual'),
          ...(plan.autoSettings ? { settings: plan.autoSettings } : {}),
          customSubjects: plan.customSubjects ?? [],
          step: editParam === 'auto' ? 1 : 0,
        });
        return;
      }

      // Normal mode: check for existing active plan
      if (user) {
        const activeId = await getActivePlanId();
        if (!cancelled && activeId) {
          setExistingExamId(activeId);
          setShowModal(true);
        }
      } else {
        if (activePlanId !== null) {
          setExistingExamId(activePlanId);
          setShowModal(true);
        }
      }
    }

    init();
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
        await finishAndCreateNew(existingExamId);
      } else {
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

export default function NewPlanPage() {
  return (
    <Suspense fallback={null}>
      <NewPlanPageContent/>
    </Suspense>
  );
}
