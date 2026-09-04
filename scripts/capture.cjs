// 开发辅助：用系统 Edge 无头模式给本地页面截图（不影响用户正在使用的浏览器）
const puppeteer = require('puppeteer-core');

const BASE = process.env.CAPTURE_URL || 'http://192.168.1.21:5173';
const OUT = process.env.CAPTURE_OUT || 'shots';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: [
      '--no-first-run',
      '--disable-gpu',
      '--user-data-dir=' + require('node:os').tmpdir().replace(/\\/g, '/') + '/lily-capture-profile-b',
      '--no-sandbox',
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('.nav__inner', { visible: true, timeout: 15000 });
  await page.waitForFunction(
    () => getComputedStyle(document.querySelector('.hero__title')).fontSize !== '',
    { timeout: 15000 },
  );
  await new Promise((r) => setTimeout(r, 4000));

  const fs = require('fs');
  fs.mkdirSync(OUT, { recursive: true });

  await page.screenshot({ path: `${OUT}/1-hero.png` });

  const stops = [
    ['2-projects-a', '#projects'],
    ['3-projects-b', '.card:nth-of-type(3)'],
    ['4-about', '#about'],
    ['5-contact', '#contact'],
  ];
  for (const [name, sel] of stops) {
    await page.evaluate((s) => {
      const el = document.querySelector(s);
      if (el) el.scrollIntoView({ block: 'start' });
    }, sel);
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: `${OUT}/${name}.png` });
    if (name === '4-about') {
      // 钉住叠放是滚动驱动的：多滚几段，捕捉第二张、第三张卡依次叠上的状态
      await page.evaluate(() => window.scrollBy(0, 700));
      await new Promise((r) => setTimeout(r, 1200));
      await page.screenshot({ path: `${OUT}/4b-about-stack2.png` });
      await page.evaluate(() => window.scrollBy(0, 700));
      await new Promise((r) => setTimeout(r, 1200));
      await page.screenshot({ path: `${OUT}/4c-about-stack3.png` });
    }
  }

  await page.screenshot({ path: `${OUT}/0-full.png`, fullPage: true });
  await browser.close();
  console.log('done');
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
