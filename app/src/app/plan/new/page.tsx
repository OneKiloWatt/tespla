'use client';
import { usePlanDraft } from '@/lib/plan-draft-store';
import { AppBar } from '@/components/app-bar';
import { StepperBar } from '@/components/stepper-bar';
import { Step1Info } from './_components/step-1-info';
import { Step2Mode } from './_components/step-2-mode';
import { Step3Settings } from './_components/step-3-settings';
import { Step4Allocate } from './_components/step-4-allocate';
import { Step5Confirm } from './_components/step-5-confirm';

/**
 * 計画作成ウィザード（/plan/new）
 *
 *   1 → 2 → ( 3 ) → 4 → 5
 *           ↑ auto選択時のみ
 *
 * 状態は usePlanDraft（Zustand）で管理。
 */
export default function NewPlanPage() {
  const { step, prev } = usePlanDraft();

  return (
    <>
      <AppBar title={`計画作成 (${step + 1}/5)`} onBack={step === 0 ? undefined : prev}/>
      <StepperBar step={step} total={5}/>
      {step === 0 && <Step1Info/>}
      {step === 1 && <Step2Mode/>}
      {step === 2 && <Step3Settings/>}
      {step === 3 && <Step4Allocate/>}
      {step === 4 && <Step5Confirm/>}
    </>
  );
}
