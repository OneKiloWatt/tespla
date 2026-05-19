/**
 * store.ts のユニットテスト
 *
 * テスト対象:
 *   - deriveHomeState: ホーム画面の状態判定ロジック
 *   - useAppStore の状態管理アクション（upsertPlan, deletePlan, setActivePlan）
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { deriveHomeState } from '@/lib/store';
import type { TestPlan } from '@/lib/types';

// テスト用の TestPlan ファクトリ
function makePlan(overrides: Partial<TestPlan> = {}): TestPlan {
  return {
    id: 'plan-001',
    testName: '2学期 中間テスト',
    startDate: '2025-10-15',
    endDate: '2025-10-17',
    subjects: ['math', 'en'],
    testDaySubjects: { '2025-10-15': ['math'], '2025-10-16': ['en'] },
    studyDays: {
      '2025-10-10': [{ id: 'math', mins: 60 }],
    },
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z',
    ...overrides,
  };
}

describe('deriveHomeState', () => {
  describe('計画なし', () => {
    it('plan が undefined のとき "empty" を返す', () => {
      expect(deriveHomeState(undefined, '2025-10-10')).toBe('empty');
    });
  });

  describe('計画あり・テスト前（active）', () => {
    it('today が endDate より前のとき "active" を返す', () => {
      const plan = makePlan({ startDate: '2025-10-15', endDate: '2025-10-17' });
      expect(deriveHomeState(plan, '2025-10-10')).toBe('active');
    });

    it('today が endDate と同日のとき "active" を返す', () => {
      const plan = makePlan({ startDate: '2025-10-15', endDate: '2025-10-17' });
      expect(deriveHomeState(plan, '2025-10-17')).toBe('active');
    });

    it('today が startDate より前でも "active" を返す（勉強期間中）', () => {
      const plan = makePlan({ startDate: '2025-10-15', endDate: '2025-10-17' });
      expect(deriveHomeState(plan, '2025-09-01')).toBe('active');
    });
  });

  describe('テスト終了・結果未記入（ended）', () => {
    it('today が endDate の翌日のとき "ended" を返す', () => {
      const plan = makePlan({ startDate: '2025-10-15', endDate: '2025-10-17' });
      expect(deriveHomeState(plan, '2025-10-18')).toBe('ended');
    });

    it('today が endDate より大幅に過ぎたとき "ended" を返す', () => {
      const plan = makePlan({ startDate: '2025-10-15', endDate: '2025-10-17' });
      expect(deriveHomeState(plan, '2026-01-01')).toBe('ended');
    });
  });

  describe('テスト結果記入済み（done）', () => {
    it('plan.result が設定されているとき "done" を返す', () => {
      const plan = makePlan({
        result: {
          scores: { math: 85, en: 90 },
          recordedAt: '2025-10-20T10:00:00Z',
        },
      });
      // today がテスト前でも result があれば done
      expect(deriveHomeState(plan, '2025-10-10')).toBe('done');
    });

    it('plan.result があれば today が endDate 前でも "done" を返す', () => {
      const plan = makePlan({
        endDate: '2025-10-17',
        result: {
          scores: { math: 75 },
          recordedAt: '2025-10-16T00:00:00Z',
        },
      });
      expect(deriveHomeState(plan, '2025-10-16')).toBe('done');
    });
  });

  describe('境界値テスト', () => {
    it('endDate の当日は "active"', () => {
      const plan = makePlan({ endDate: '2025-10-17' });
      expect(deriveHomeState(plan, '2025-10-17')).toBe('active');
    });

    it('endDate の翌日は "ended"', () => {
      const plan = makePlan({ endDate: '2025-10-17' });
      expect(deriveHomeState(plan, '2025-10-18')).toBe('ended');
    });
  });
});
