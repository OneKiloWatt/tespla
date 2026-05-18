'use client';
import { usePlanDraft } from '@/lib/plan-draft-store';
import { Card, CardOutline } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconPencil, IconRobot } from '@/components/icons';
import { StepShell } from './step-shell';

/**
 * Step 2: 自動 / 手動 の選択
 * - auto を選ぶと次は step 3（自動設定）
 * - manual を選ぶと step 3 をスキップして step 4 へ
 */
export function Step2Mode() {
  const { mode, patch, goTo } = usePlanDraft();

  const handleNext = () => {
    // manual の場合は step 3 をスキップ
    goTo(mode === 'auto' ? 2 : 3);
  };

  return (
    <StepShell
      title="計画はどう作る？"
      subtitle="自動なら設定だけで毎日の量を組んでくれます。"
      onNext={handleNext}
    >
      <button
        type="button"
        onClick={() => patch({ mode: 'auto' })}
        className={`block w-full text-left mb-3 rounded-2xl p-[18px] transition-[border-color] ${
          mode === 'auto'
            ? 'bg-bg-card border-2 border-accent'
            : 'border border-divider-strong'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="text-accent mt-0.5"><IconRobot size={26}/></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-bold">自動で組む</div>
              {mode === 'auto' && <Badge>おすすめ</Badge>}
            </div>
            <div className="text-xs text-text-mid mt-1 leading-[1.6]">
              平日・休日の勉強時間を決めるだけで、テストまでの計画を自動で配分します。
            </div>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => patch({ mode: 'manual' })}
        className={`block w-full text-left rounded-2xl p-[18px] transition-[border-color] ${
          mode === 'manual'
            ? 'bg-bg-card border-2 border-accent'
            : 'border border-divider-strong'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="text-accent mt-0.5"><IconPencil size={24}/></div>
          <div className="flex-1">
            <div className="text-[15px] font-bold">手動で組む</div>
            <div className="text-xs text-text-mid mt-1 leading-[1.6]">
              日ごとの勉強科目と時間を自分で組み立てます。あとで自動と混ぜることもできます。
            </div>
          </div>
        </div>
      </button>
    </StepShell>
  );
}
