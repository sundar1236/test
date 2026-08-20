import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();

  // Test breakpoints: 375px mobile, 1280px desktop
  const viewports = [
    { width: 375, height: 812, name: 'mobile_375' },
    { width: 1280, height: 800, name: 'desktop_1280' }
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    // 1. Student Dashboard
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `/home/jules/verification/dashboard_${vp.name}.png`, fullPage: false });

    // 2. Exam Simulator Screen
    await page.goto('http://localhost:5173/exam/test-sbi-clerk-full-01');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `/home/jules/verification/exam_${vp.name}.png`, fullPage: false });

    // 3. Admin Question Management
    await page.goto('http://localhost:5173/admin/questions');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `/home/jules/verification/admin_questions_${vp.name}.png`, fullPage: false });

    await context.close();
  }

  await browser.close();
  console.log('Screenshots captured successfully.');
})();
