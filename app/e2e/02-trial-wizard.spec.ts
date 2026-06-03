import { test, expect } from '@playwright/test';

test.describe('お試しウィザード: 5ステップを完走して /home にリダイレクト', () => {
  test.beforeEach(async ({ page }) => {
    // localStorage をクリアしてから開始（未ログイン状態をリセット）
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Step 1 〜 Step 5 まで通過して保存', async ({ page }) => {
    // トップページから「すぐ試す」をクリック
    await page.goto('/');
    await page.getByRole('link', { name: /すぐ試す/ }).click();
    await page.waitForURL('/plan/new');

    // Step 1: テストの情報を入れよう
    await expect(page.getByRole('heading', { name: 'テストの情報を入れよう' })).toBeVisible();
    const testNameInput = page.getByLabel('テスト名', { exact: false });
    await testNameInput.fill('中間テスト');
    await page.screenshot({ path: 'test-results/02-step1.png', fullPage: true });
    await page.getByRole('button', { name: /次へ/ }).click();

    // Step 2: 計画はどう作る？
    await expect(page.getByRole('heading', { name: '計画はどう作る？' })).toBeVisible();
    await page.screenshot({ path: 'test-results/02-step2.png', fullPage: true });
    await page.getByRole('button', { name: /次へ/ }).click();

    // Step 3: 自動の設定を決めよう
    await expect(page.getByRole('heading', { name: '自動の設定を決めよう' })).toBeVisible();
    await page.screenshot({ path: 'test-results/02-step3.png', fullPage: true });
    await page.getByRole('button', { name: /次へ/ }).click();

    // Step 4: 勉強の配分を確認
    await expect(page.getByRole('heading', { name: '勉強の配分を確認' })).toBeVisible();
    await page.screenshot({ path: 'test-results/02-step4.png', fullPage: true });
    await page.getByRole('button', { name: /次へ/ }).click();

    // Step 5: 計画の内容を確認
    await expect(page.getByRole('heading', { name: '計画の内容を確認' })).toBeVisible();
    await page.screenshot({ path: 'test-results/02-step5.png', fullPage: true });
    await page.getByRole('button', { name: /保存してホームへ/ }).click();

    // 保存後 /home にリダイレクトされることを確認
    await page.waitForURL('/home');
    expect(page.url()).toContain('/home');
  });
});
