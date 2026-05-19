import { describe, it, expect } from 'vitest';
import { generateAutoPlan, dailyMins } from '@/lib/auto-plan';
import type { AutoSettings } from '@/lib/types';

// ---------------------------------------------------------------------------
// 共通ヘルパー
// ---------------------------------------------------------------------------

function makeSettings(overrides: Partial<AutoSettings> = {}): AutoSettings {
  return {
    weekdayMins: 90,
    weekdayClubMins: 60,
    weekendMins: 120,
    clubDays: [],
    noClubBeforeTest: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// T1: 基本均等配分
// ---------------------------------------------------------------------------
// 週: 2025-06-02(Mon)〜2025-06-06(Fri) の 5 平日
// testStart = 2025-06-09(Mon), weekdayMins=90, weekendMins=0
// prevDay(testStart) = 2025-06-08(Sun) -> allStudyDates = Jun2..Jun8
// Sat(Jun7)/Sun(Jun8): weekendMins=0 -> スロットなし
// 有効日: Mon〜Fri(5日), 各 90min / 30 = 3 スロット = 計 15 スロット
// subjects=3 -> slotsPerSubject=5, 各科目 5*30=150 分
describe('T1: 基本均等配分', () => {
  it('3 科目の総割り当て時間が等しい', () => {
    const result = generateAutoPlan({
      startDate: '2025-06-02',
      testStart: '2025-06-09',
      testEnd: '2025-06-09',
      subjects: ['jp', 'math', 'en'],
      testDaySubjects: {},
      settings: makeSettings({ weekdayMins: 90, weekendMins: 0, weekdayClubMins: 0, clubDays: [] }),
    });

    const totals: Record<string, number> = { jp: 0, math: 0, en: 0 };
    for (const blocks of Object.values(result)) {
      for (const b of blocks) {
        totals[b.id] = (totals[b.id] ?? 0) + b.mins;
      }
    }
    expect(totals['jp']).toBe(totals['math']);
    expect(totals['math']).toBe(totals['en']);
    expect(totals['jp']).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// T2: テスト前日
// ---------------------------------------------------------------------------
// testStart = 2025-06-09(Mon), testDaySubjects = { Jun9: ['math'] }
// prevDay(Jun9) = Jun8(Sun) -> preTestDay
// subjects = ['jp', 'en'] (通常科目)
// Jun8 には 'math' のみ, 'jp'/'en' は入らない
describe('T2: テスト前日', () => {
  it('テスト前日の studyDays にテスト科目のみが含まれる', () => {
    const result = generateAutoPlan({
      startDate: '2025-06-02',
      testStart: '2025-06-09',
      testEnd: '2025-06-09',
      subjects: ['jp', 'en'],
      testDaySubjects: { '2025-06-09': ['math'] },
      settings: makeSettings({ weekdayMins: 90, weekendMins: 120 }),
    });

    const preDay = '2025-06-08'; // Sun = prevDay(Jun9)
    expect(result[preDay]).toBeDefined();
    const ids = result[preDay].map(b => b.id);
    expect(ids).toContain('math');
    expect(ids).not.toContain('jp');
    expect(ids).not.toContain('en');
  });
});

// ---------------------------------------------------------------------------
// T3: テスト 2 日間
// ---------------------------------------------------------------------------
// testStart=2025-06-09(Mon), testEnd=2025-06-10(Tue)
// testDaySubjects = { Jun9: ['math'], Jun10: ['jp'] }
// prevDay(testStart=Jun9) = Jun8(Sun)
// allStudyDates = Jun2..Jun8 -> Jun9(Mon) は学習日外
// preTestDayMap: Jun8=['math'] (prevDay(Jun9)), prevDay(Jun10)=Jun9 が studyDateSet 外 -> skip
describe('T3: テスト 2 日間', () => {
  it('テスト開始日(Mon)が studyDays に存在しない', () => {
    const result = generateAutoPlan({
      startDate: '2025-06-02',
      testStart: '2025-06-09',
      testEnd: '2025-06-10',
      subjects: ['en', 'sci'],
      testDaySubjects: { '2025-06-09': ['math'], '2025-06-10': ['jp'] },
      settings: makeSettings({ weekdayMins: 90, weekendMins: 120 }),
    });

    expect(result['2025-06-09']).toBeUndefined();
  });

  it('Sun(prevDay(Mon))に math のみが入る', () => {
    const result = generateAutoPlan({
      startDate: '2025-06-02',
      testStart: '2025-06-09',
      testEnd: '2025-06-10',
      subjects: ['en', 'sci'],
      testDaySubjects: { '2025-06-09': ['math'], '2025-06-10': ['jp'] },
      settings: makeSettings({ weekdayMins: 90, weekendMins: 120 }),
    });

    const preDay = '2025-06-08'; // Sun
    expect(result[preDay]).toBeDefined();
    const ids = result[preDay].map(b => b.id);
    expect(ids).toContain('math');
    expect(ids).not.toContain('jp');
  });
});

// ---------------------------------------------------------------------------
// T4: noClubBeforeTest ON
// ---------------------------------------------------------------------------
// testStart = 2025-06-19(Thu), 対象日 = 2025-06-12(Thu) = ちょうど 7 日前
// clubDays=[4(Thu)], noClubBeforeTest=true -> weekdayMins が使われる
describe('T4: noClubBeforeTest ON', () => {
  it('テスト 7 日前の部活日(Thu)で weekdayMins が使われる', () => {
    const settings = makeSettings({
      weekdayMins: 90,
      weekdayClubMins: 45,
      clubDays: [4], // 木曜日
      noClubBeforeTest: true,
    });
    const mins = dailyMins('2025-06-12', '2025-06-19', settings);
    expect(mins).toBe(90); // weekdayMins
  });
});

// ---------------------------------------------------------------------------
// T5: noClubBeforeTest OFF
// ---------------------------------------------------------------------------
describe('T5: noClubBeforeTest OFF', () => {
  it('同じ日(Thu)で weekdayClubMins が使われる', () => {
    const settings = makeSettings({
      weekdayMins: 90,
      weekdayClubMins: 45,
      clubDays: [4], // 木曜日
      noClubBeforeTest: false,
    });
    const mins = dailyMins('2025-06-12', '2025-06-19', settings);
    expect(mins).toBe(45); // weekdayClubMins
  });
});

// ---------------------------------------------------------------------------
// T6: 休日ルール
// ---------------------------------------------------------------------------
describe('T6: 休日ルール', () => {
  it('土曜日の dailyMins が weekendMins を返す', () => {
    const settings = makeSettings({ weekendMins: 180 });
    const mins = dailyMins('2025-06-07', '2025-06-09', settings); // Sat
    expect(mins).toBe(180);
  });
});

// ---------------------------------------------------------------------------
// T7: effectiveMinBlock < 30
// ---------------------------------------------------------------------------
// weekdayMins=20 -> effectiveMinBlock=20 -> blocks の mins が 20
describe('T7: effectiveMinBlock < 30', () => {
  it('weekdayMins=20 のとき blocks の mins が 20', () => {
    const result = generateAutoPlan({
      startDate: '2025-06-02', // Mon
      testStart: '2025-06-03', // Tue
      testEnd: '2025-06-03',
      subjects: ['jp'],
      testDaySubjects: {},
      settings: makeSettings({ weekdayMins: 20, weekdayClubMins: 0, weekendMins: 0, clubDays: [] }),
    });

    // prevDay(Jun3) = Jun2, so allStudyDates = [Jun2]
    const blocks = result['2025-06-02'] ?? [];
    expect(blocks.length).toBeGreaterThan(0);
    for (const b of blocks) {
      expect(b.mins).toBe(20);
    }
  });
});

// ---------------------------------------------------------------------------
// T8: effectiveMinBlock = 30
// ---------------------------------------------------------------------------
// weekdayMins=90 -> effectiveMinBlock=30 -> blocks の mins が 30
describe('T8: effectiveMinBlock = 30', () => {
  it('weekdayMins=90 のとき blocks の mins が 30', () => {
    const result = generateAutoPlan({
      startDate: '2025-06-02', // Mon
      testStart: '2025-06-03', // Tue
      testEnd: '2025-06-03',
      subjects: ['jp'],
      testDaySubjects: {},
      settings: makeSettings({ weekdayMins: 90, weekdayClubMins: 0, weekendMins: 0, clubDays: [] }),
    });

    const blocks = result['2025-06-02'] ?? [];
    expect(blocks.length).toBeGreaterThan(0);
    for (const b of blocks) {
      expect(b.mins).toBe(30);
    }
  });
});

// ---------------------------------------------------------------------------
// T9: subjects が空
// ---------------------------------------------------------------------------
describe('T9: subjects が空', () => {
  it('subjects=[] のとき studyDays の全エントリが空配列', () => {
    const result = generateAutoPlan({
      startDate: '2025-06-02',
      testStart: '2025-06-09',
      testEnd: '2025-06-09',
      subjects: [],
      testDaySubjects: {},
      settings: makeSettings({ weekdayMins: 90, weekendMins: 120 }),
    });

    for (const blocks of Object.values(result)) {
      expect(blocks).toEqual([]);
    }
  });
});

// ---------------------------------------------------------------------------
// T10: 1日のみ（preTestDay 兼任）
// ---------------------------------------------------------------------------
// startDate = prevDay(testStart) -> 学習日は 1 日のみでテスト前日
// testStart = 2025-06-09(Mon), prevDay = 2025-06-08(Sun) = startDate
// testDaySubjects = { Jun9: ['math'] }
// subjects = ['jp', 'en']
// テスト前日扱いが優先 -> ['math'] のみ
describe('T10: 1 日のみ（preTestDay 兼任）', () => {
  it('テスト前日扱いが優先され、テスト科目のみが入る', () => {
    const result = generateAutoPlan({
      startDate: '2025-06-08', // Sun = prevDay(Jun9)
      testStart: '2025-06-09', // Mon
      testEnd: '2025-06-09',
      subjects: ['jp', 'en'],
      testDaySubjects: { '2025-06-09': ['math'] },
      settings: makeSettings({ weekdayMins: 90, weekendMins: 120 }),
    });

    const preDay = '2025-06-08';
    expect(result[preDay]).toBeDefined();
    const ids = result[preDay].map(b => b.id);
    expect(ids).toContain('math');
    expect(ids).not.toContain('jp');
    expect(ids).not.toContain('en');
    // 通常科目が混入していない（entries は preDay のみのはず）
    const allIds = Object.values(result).flat().map(b => b.id);
    expect(allIds.every(id => id === 'math')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// T11: テスト方向から割り当て（余りが最初の日に来る）
// ---------------------------------------------------------------------------
// 2 科目, 3 日(Mon/Tue/Wed), 各 90min -> 3 スロット/日, 計 9 スロット
// slotsPerSubject = floor(9/2) = 4 (合計割当可能=8、余り1スロット)
// reverseDates = [Wed, Tue, Mon] (テスト近順)
// Wed(day3): jp, math, jp -> 3 blocks
// Tue(day2): math, jp, math -> 3 blocks
// Mon(day1): jp, math -> 2 blocks (remaining 枯渇)
// 余り 1 スロットが最遠日 Mon(day1) に来る
describe('T11: テスト方向から割り当て（余りが最初の日に来る）', () => {
  // testStart = 2025-06-05(Thu) -> prevDay = Jun4(Wed)
  // startDate = 2025-06-02(Mon)
  // allStudyDates = Jun2(Mon), Jun3(Tue), Jun4(Wed)
  // weekdayMins=90 -> 3 slots/day, totalSlots=9, slotsPerSubject=4
  it('余り（未割当スロット）が最遠日(Mon)に来る', () => {
    const result = generateAutoPlan({
      startDate: '2025-06-02', // Mon
      testStart: '2025-06-05', // Thu
      testEnd: '2025-06-05',
      subjects: ['jp', 'math'],
      testDaySubjects: {},
      settings: makeSettings({ weekdayMins: 90, weekdayClubMins: 0, weekendMins: 0, clubDays: [] }),
    });

    const day1 = result['2025-06-02'] ?? []; // Mon (最遠)
    const day2 = result['2025-06-03'] ?? []; // Tue
    const day3 = result['2025-06-04'] ?? []; // Wed (最近)

    // テストに近い日(day3, day2)が最大スロット(3)を持つ
    expect(day3.length).toBe(3);
    expect(day2.length).toBe(3);
    // 余りが最遠日(day1)に来る -> day1 < day3
    expect(day1.length).toBeLessThan(day3.length);
  });

  it('day3(Wed)とday2(Tue)はそれぞれ 3 ブロック持つ', () => {
    const result = generateAutoPlan({
      startDate: '2025-06-02',
      testStart: '2025-06-05',
      testEnd: '2025-06-05',
      subjects: ['jp', 'math'],
      testDaySubjects: {},
      settings: makeSettings({ weekdayMins: 90, weekdayClubMins: 0, weekendMins: 0, clubDays: [] }),
    });

    expect((result['2025-06-04'] ?? []).length).toBe(3);
    expect((result['2025-06-03'] ?? []).length).toBe(3);
    expect((result['2025-06-02'] ?? []).length).toBe(2);
  });
});
