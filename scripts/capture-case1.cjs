// 截取 case-nis2100 页面关键区域
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const os = require('node:os');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: [
      '--no-first-run',
      '--disable-gpu',
      '--user-data-dir=' + os.tmpdir().replace(/\\/g, '/') + '/lily-capture-profile-b',
      '--no-sandbox',
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://192.168.1.21:5173/case-nis2100.html', {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });
  await new Promise((r) => setTimeout(r, 3000));
  fs.mkdirSync('shots', { recursive: true });
  await page.screenshot({ path: 'shots/c1-hero.png' });

  await page.evaluate(() => {
    document.querySelector('#explorer').scrollIntoView({ block: 'center' });
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: 'shots/c1-explorer.png' });

  // 切换到 Video 类型验证交互
  await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('.explorer__tab')];
    tabs.find((t) => t.textContent.includes('Video')).click();
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: 'shots/c1-explorer-video.png' });

  await page.evaluate(() => {
    document.querySelector('.case-stats').scrollIntoView({ block: 'center' });
  });
  await new Promise((r) => setTimeout(r, 2200));
  await page.screenshot({ path: 'shots/c1-stats.png' });

  await browser.close();
  console.log('done');
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
