import { test, expect } from '@playwright/test';

const viewports = [
  { width: 375, height: 812, name: 'mobile_375' },
  { width: 1280, height: 800, name: 'desktop_1280' }
];

for (const vp of viewports) {
  test(`Verify layout at ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });

    // 1. Student Dashboard
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `/home/jules/verification/dashboard_${vp.name}.png` });

    // 2. Exam Simulator Screen
    await page.goto('http://localhost:5173/exam/test-sbi-clerk-full-01');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `/home/jules/verification/exam_${vp.name}.png` });

    // 3. Admin Questions
    await page.goto('http://localhost:5173/admin/questions');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `/home/jules/verification/admin_${vp.name}.png` });
  });
}
