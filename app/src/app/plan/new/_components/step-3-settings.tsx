'use client';
import { usePlanDraft } from '@/lib/plan-draft-store';
import { Card, CardSoft } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import type { AutoSettings } from '@/lib/types';
import { StepShell } from './step-shell';

const WEEKDAYS = [
  { k: 1, l: '月' }, { k: 2, l: '火' }, { k: 3, l: '水' },
  { k: 4, l: '木' }, { k: 5, l: '金' }, { k: 6, l: '土' }, { k: 0, l: '日' },
];

export function Step3Settings() {
  const { settings, patch } = usePlanDraft();

  const update = <K extends keyof AutoSettings>(k: K, v: AutoSettings[K]) =>
    patch({ settings: { ...settings, [k]: v } });

  const toggleClubDay = (k: number) =>
    update('clubDays', settings.clubDays.includes(k)
      ? settings.clubDays.filter(x => x !== k)
      : [...settings.clubDays, k]);

  return (
    <StepShell
      title="自動の設定を決めよう"
      subtitle="毎日どのくらい勉強するか教えてください。"
    >
      <Card className="mb-3 divide-y divide-divider">
        <SettingRow label="平日の勉強時間" value={settings.weekdayMins} onChange={v => update('weekdayMins', v)}/>
        <SettingRow label="平日（部活ありの日）" value={settings.weekdayClubMins} onChange={v => update('weekdayClubMins', v)}/>
        <SettingRow label="休日の勉強時間" value={settings.weekendMins} onChange={v => update('weekendMins', v)}/>
      </Card>

      <Card className="mb-3">
        <div className="text-xs text-text-mid font-semibold mb-2">部活がある曜日</div>
        <div className="flex gap-1.5 flex-wrap">
          {WEEKDAYS.map(w => (
            <Chip
              key={w.k}
              selected={settings.clubDays.includes(w.k)}
              onClick={() => toggleClubDay(w.k)}
            >{w.l}</Chip>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-bold">テスト1週間前は<br/>部活なし扱いにする</div>
            <div className="text-[11px] text-text-mid mt-1">勉強時間が増えます</div>
          </div>
          <Switch
            checked={settings.noClubBeforeTest}
            onCheckedChange={(v) => update('noClubBeforeTest', v)}
          />
        </div>
      </Card>

      <CardSoft className="mt-3 text-[11px] text-text-mid leading-[1.7]">
        <strong className="text-accent-dark">計算のルール</strong>
        <ul className="list-disc ml-3.5 mt-1">
          <li>1教科1回の最小は30分</li>
          <li>テスト前日は、翌日のテスト科目だけを勉強</li>
          <li>テスト日が近い科目から優先的に配分</li>
        </ul>
      </CardSoft>
    </StepShell>
  );
}

function SettingRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="text-[13px] font-semibold">{label}</div>
      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="secondary" className="w-[30px] p-0" onClick={() => onChange(Math.max(0, value - 15))}>−</Button>
        <div className="min-w-[56px] text-center text-sm font-bold">
          {value}<span className="text-[11px] text-text-mid ml-0.5 font-medium">分</span>
        </div>
        <Button size="sm" variant="secondary" className="w-[30px] p-0" onClick={() => onChange(value + 15)}>＋</Button>
      </div>
    </div>
  );
}
