import type { AutoSettings, StudyBlock, TestPlan } from './types';
import { datesBetween } from './utils';

/**
 * 自動で勉強計画を組み立てる。
 *
 * 仕様（dev.md より抜粋）：
 *   - 平日 / 平日(部活時) / 休日 で1日の勉強時間を決める
 *   - テスト前日は、翌日のテスト科目だけを勉強する
 *   - 各教科の1回の勉強の最小単位は30分（ユーザー設定が30未満ならその設定を尊重）
 *   - テストに近い方から計算し、最終的に勉強時間が均等になるようにする
 */

interface PlanInput {
  startDate: string;     // ISO YYYY-MM-DD (計画開始 = 作成日)
  testStart: string;     // テスト開始日
  testEnd: string;       // テスト終了日
  subjects: string[];
  /** key: テスト日, value: その日に行う科目 */
  testDaySubjects: Record<string, string[]>;
  settings: AutoSettings;
}

/** 1日に何分勉強するかを返す */
export function dailyMins(date: string, testStart: string, settings: AutoSettings): number {
  const d = new Date(date);
  const wd = d.getDay();
  const isClubDay = settings.clubDays.includes(wd);
  const isWeekend = wd === 0 || wd === 6;
  const oneWeekBeforeTest =
    Math.floor((+new Date(testStart) - +d) / 86_400_000) <= 7;

  if (isWeekend) return settings.weekendMins;
  if (isClubDay && !(settings.noClubBeforeTest && oneWeekBeforeTest)) {
    return settings.weekdayClubMins;
  }
  return settings.weekdayMins;
}

/**
 * 計画自動生成。
 *
 * @return studyDays（日付 → ブロック配列）
 */
export function generateAutoPlan(input: PlanInput): TestPlan['studyDays'] {
  const studyDays: Record<string, StudyBlock[]> = {};

  // 1. effectiveMinBlock の計算
  const settingMins = [input.settings.weekdayMins, input.settings.weekdayClubMins, input.settings.weekendMins]
    .filter(m => m > 0);
  const minSetting = settingMins.length > 0 ? Math.min(...settingMins) : 30;
  const effectiveMinBlock = minSetting < 30 ? minSetting : 30;

  // 2. 全学習日の取得（テスト開始日の前日まで）
  const allStudyDates = datesBetween(input.startDate, prevDay(input.testStart));

  // 3. preTestDayMap の構築（決定論的順序）
  const preTestDayMap: Record<string, string[]> = {};
  const studyDateSet = new Set(allStudyDates);
  for (const testDay of Object.keys(input.testDaySubjects).sort()) {
    const prevD = prevDay(testDay);
    const subjs = input.testDaySubjects[testDay];
    if (studyDateSet.has(prevD) && subjs.length > 0) {
      preTestDayMap[prevD] = subjs;
    }
  }

  // 4. 通常日への均等配分
  const regularDates = allStudyDates.filter(d => !(d in preTestDayMap));

  // 総スロット数（dailyMins = 0 の日は除外）
  let totalSlots = 0;
  for (const d of regularDates) {
    const mins = dailyMins(d, input.testStart, input.settings);
    if (mins > 0) totalSlots += Math.floor(mins / effectiveMinBlock);
  }

  const slotsPerSubject = input.subjects.length > 0
    ? Math.floor(totalSlots / input.subjects.length)
    : 0;

  // 逆順（テスト近順）でラウンドロビン割り当て
  const remaining: Record<string, number> = {};
  for (const s of input.subjects) remaining[s] = slotsPerSubject;

  const reverseDates = [...regularDates].reverse();
  let circularIdx = 0;

  for (const day of reverseDates) {
    const mins = dailyMins(day, input.testStart, input.settings);
    if (mins === 0) { studyDays[day] = []; continue; }
    const availableSlots = Math.floor(mins / effectiveMinBlock);
    const blocks: StudyBlock[] = [];
    for (let i = 0; i < availableSlots; i++) {
      let found = false;
      for (let attempt = 0; attempt < input.subjects.length; attempt++) {
        const s = input.subjects[(circularIdx + attempt) % input.subjects.length];
        if (remaining[s] > 0) {
          blocks.push({ id: s, mins: effectiveMinBlock, source: 'auto' });
          remaining[s]--;
          circularIdx = (circularIdx + attempt + 1) % input.subjects.length;
          found = true;
          break;
        }
      }
      if (!found) break;
    }
    studyDays[day] = blocks;
  }

  // 5. テスト前日への割り当て
  for (const [preDay, subjs] of Object.entries(preTestDayMap)) {
    const mins = dailyMins(preDay, input.testStart, input.settings);
    if (mins === 0) { studyDays[preDay] = []; continue; }
    const each = Math.max(
      effectiveMinBlock,
      Math.floor(mins / subjs.length / effectiveMinBlock) * effectiveMinBlock
    );
    studyDays[preDay] = subjs.map(s => ({ id: s, mins: each, source: 'auto' }));
  }

  return studyDays;
}

function prevDay(d: string): string {
  const dt = new Date(d + 'T00:00:00Z');
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}
