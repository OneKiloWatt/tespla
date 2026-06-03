import { test, expect } from '@playwright/test';

test('利用規約ページ: タブ切り替えで URL が変わる', async ({ page }) => {
  await page.goto('/terms');

  // 「利用規約」タブが表示されていることを確認
  const termsTab = page.getByRole('button', { name: '利用規約' });
  await expect(termsTab).toBeVisible();

  // 「プライバシーポリシー」タブをクリック
  const privacyTab = page.getByRole('button', { name: 'プライバシーポリシー' });
  await expect(privacyTab).toBeVisible();
  await privacyTab.click();

  // URL に ?tab=privacy が含まれることを確認
  await expect(page).toHaveURL(/[?&]tab=privacy/);

  await page.screenshot({ path: 'test-results/03-terms-privacy.png', fullPage: true });
});
