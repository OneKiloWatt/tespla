/**
 * schemas.ts のユニットテスト
 *
 * テスト対象:
 *   - testInfoSchema: テスト情報バリデーション（Phase 2 で強化）
 *   - autoSettingsSchema: 自動設定バリデーション
 *   - loginSchema / signupSchema: 認証フォームバリデーション
 */

import { describe, it, expect } from 'vitest';
import {
  testInfoSchema,
  autoSettingsSchema,
  loginSchema,
  signupSchema,
} from '@/lib/schemas';

describe('testInfoSchema', () => {
  const validInput = {
    testName: '2学期 中間テスト',
    startDate: '2025-10-15',
    endDate: '2025-10-17',
    subjects: ['math', 'en'],
    testDaySubjects: { '2025-10-15': ['math'] },
  };

  it('有効な入力でバリデーションが通る', () => {
    const result = testInfoSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('testName が空のときエラー', () => {
    const result = testInfoSchema.safeParse({ ...validInput, testName: '' });
    expect(result.success).toBe(false);
  });

  it('testName が 101 文字のときエラー', () => {
    const result = testInfoSchema.safeParse({
      ...validInput,
      testName: 'a'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('testName が 100 文字のときはOK', () => {
    const result = testInfoSchema.safeParse({
      ...validInput,
      testName: 'a'.repeat(100),
    });
    expect(result.success).toBe(true);
  });

  it('subjects が空配列のときエラー', () => {
    const result = testInfoSchema.safeParse({ ...validInput, subjects: [] });
    expect(result.success).toBe(false);
  });

  it('startDate > endDate のときエラー（refine）', () => {
    const result = testInfoSchema.safeParse({
      ...validInput,
      startDate: '2025-10-17',
      endDate: '2025-10-15', // 終了日が開始日より前
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const endDateError = result.error.issues.find(i => i.path.includes('endDate'));
      expect(endDateError).toBeDefined();
    }
  });

  it('startDate === endDate のときは OK', () => {
    const result = testInfoSchema.safeParse({
      ...validInput,
      startDate: '2025-10-15',
      endDate: '2025-10-15',
    });
    expect(result.success).toBe(true);
  });

  it('testDaySubjects が空オブジェクトでも OK', () => {
    const result = testInfoSchema.safeParse({
      ...validInput,
      testDaySubjects: {},
    });
    expect(result.success).toBe(true);
  });
});

describe('autoSettingsSchema', () => {
  const validSettings = {
    weekdayMins: 90,
    weekdayClubMins: 60,
    weekendMins: 120,
    clubDays: [1, 3, 5],
    noClubBeforeTest: true,
  };

  it('有効な入力でバリデーションが通る', () => {
    const result = autoSettingsSchema.safeParse(validSettings);
    expect(result.success).toBe(true);
  });

  it('weekdayMins が 0 でも OK（最小値）', () => {
    const result = autoSettingsSchema.safeParse({ ...validSettings, weekdayMins: 0 });
    expect(result.success).toBe(true);
  });

  it('weekdayMins が 600 でも OK（最大値）', () => {
    const result = autoSettingsSchema.safeParse({ ...validSettings, weekdayMins: 600 });
    expect(result.success).toBe(true);
  });

  it('weekdayMins が 601 のときエラー', () => {
    const result = autoSettingsSchema.safeParse({ ...validSettings, weekdayMins: 601 });
    expect(result.success).toBe(false);
  });

  it('weekdayMins が -1 のときエラー', () => {
    const result = autoSettingsSchema.safeParse({ ...validSettings, weekdayMins: -1 });
    expect(result.success).toBe(false);
  });

  it('clubDays の要素が 7 のときエラー（0-6 の範囲外）', () => {
    const result = autoSettingsSchema.safeParse({ ...validSettings, clubDays: [7] });
    expect(result.success).toBe(false);
  });

  it('clubDays が空配列でも OK', () => {
    const result = autoSettingsSchema.safeParse({ ...validSettings, clubDays: [] });
    expect(result.success).toBe(true);
  });

  it('noClubBeforeTest が boolean でないときエラー', () => {
    const result = autoSettingsSchema.safeParse({ ...validSettings, noClubBeforeTest: 'yes' });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('有効なメールとパスワードでバリデーションが通る', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('不正なメール形式でエラー', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('パスワードが7文字のときエラー', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '1234567', // 7文字
    });
    expect(result.success).toBe(false);
  });

  it('パスワードが8文字のときは OK', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '12345678', // 8文字
    });
    expect(result.success).toBe(true);
  });
});

describe('signupSchema', () => {
  it('有効な入力でバリデーションが通る', () => {
    const result = signupSchema.safeParse({
      email: 'newuser@example.com',
      password: 'securepass',
      agreed: true,
    });
    expect(result.success).toBe(true);
  });

  it('agreed が false のときエラー', () => {
    const result = signupSchema.safeParse({
      email: 'newuser@example.com',
      password: 'securepass',
      agreed: false,
    });
    expect(result.success).toBe(false);
  });

  it('agreed が未指定のときエラー', () => {
    const result = signupSchema.safeParse({
      email: 'newuser@example.com',
      password: 'securepass',
    });
    expect(result.success).toBe(false);
  });
});
