import { test, expect } from '@playwright/test';

test('トップページ: "すぐ試す" と "ログインする" ボタンが表示されている', async ({ page }) => {
  await page.goto('/');

  const tryBtn = page.getByRole('link', { name: /すぐ試す/ });
  const loginBtn = page.getByRole('link', { name: 'ログインする' });

  await expect(tryBtn).toBeVisible();
  await expect(loginBtn).toBeVisible();

  await expect(tryBtn).toHaveAttribute('href', '/plan/new');
  await expect(loginBtn).toHaveAttribute('href', '/login');

  await page.screenshot({ path: 'test-results/01-top.png', fullPage: true });
});
