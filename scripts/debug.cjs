// 诊断：打印页面控制台错误、失败请求与样式表状态
const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: [
      '--no-first-run',
      '--disable-gpu',
      '--user-data-dir=' + require('node:os').tmpdir().replace(/\\/g, '/') + '/lily-capture-profile-c',
      '--no-sandbox',
    ],
  });
  const page = await browser.newPage();
  page.on('console', (m) => console.log('[console]', m.type(), m.text()));
  page.on('requestfailed', (r) => console.log('[failed]', r.url(), r.failure()?.errorText));
  page.on('response', (r) => {
    if (r.status() >= 400) console.log('[http]', r.status(), r.url());
  });
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://192.168.1.21:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 4000));
  const info = await page.evaluate(() => ({
    styleSheets: document.styleSheets.length,
    bodyFont: getComputedStyle(document.body).fontFamily.slice(0, 60),
    bodyBg: getComputedStyle(document.body).backgroundColor,
    mainJs: !!document.querySelector('script[src*="main.js"]'),
    heroTitleDisplay: getComputedStyle(document.querySelector('.hero__title')).display,
    navInnerPos: document.querySelector('.nav__inner')
      ? getComputedStyle(document.querySelector('.nav__inner')).position
      : 'missing',
  }));
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})().catch((e) => {
  console.error('ERR', e.message);
  process.exit(1);
});
