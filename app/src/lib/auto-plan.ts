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
 *
 * このファイルはアルゴリズムの輪郭。実装時に仕様詰めしてテストを書くこと。
 */

const MIN_BLOCK = 30;

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
 * 計画自動生成のスタブ。
 *
 * @return studyDays（日付 → ブロック配列）
 *
 * NOTE: 現在は単純な均等割り。仕様にある「テストに近い方から計算」「均等配分」を満たすため
 *       実装時は次のように書き直す：
 *
 *   1. テスト前日に翌日のテスト科目を割り当て
 *   2. 残り日数 × 1日の勉強時間 から各科目への総時間を均等配分
 *   3. 1日内では30分単位で区切り、複数科目を混ぜる
 *   4. 端数は最終日（テストに最も近い日）に寄せる
 */
export function generateAutoPlan(input: PlanInput): TestPlan['studyDays'] {
  const dates = datesBetween(input.startDate, prevDay(input.testStart));
  const subj = input.subjects;
  const studyDays: Record<string, StudyBlock[]> = {};

  // 仮実装: 各日 N教科を最低30分ずつ均等配分する素朴版
  for (const d of dates) {
    const total = dailyMins(d, input.testStart, input.settings);
    const each = Math.max(MIN_BLOCK, Math.floor(total / subj.length / MIN_BLOCK) * MIN_BLOCK);
    const fit = Math.floor(total / each);
    const blocks: StudyBlock[] = subj.slice(0, fit).map(id => ({
      id, mins: each, source: 'auto',
    }));
    studyDays[d] = blocks;
  }

  // テスト前日は翌日のテスト科目のみ
  for (const testDay of Object.keys(input.testDaySubjects)) {
    const prev = prevDay(testDay);
    const total = dailyMins(prev, input.testStart, input.settings);
    const subjs = input.testDaySubjects[testDay];
    if (!subjs?.length) continue;
    const each = Math.max(MIN_BLOCK, Math.floor(total / subjs.length / MIN_BLOCK) * MIN_BLOCK);
    studyDays[prev] = subjs.map(id => ({ id, mins: each, source: 'auto' }));
  }

  return studyDays;
}

function prevDay(d: string): string {
  const dt = new Date(d);
  dt.setDate(dt.getDate() - 1);
  return dt.toISOString().slice(0, 10);
}
