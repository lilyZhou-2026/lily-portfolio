// 实测素材浏览器箭头切换
const puppeteer = require('puppeteer-core');
const os = require('node:os');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: [
      '--no-first-run',
      '--disable-gpu',
      '--user-data-dir=' + os.tmpdir().replace(/\\/g, '/') + '/lily-cap-c1nav',
      '--no-sandbox',
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://192.168.1.21:5173/case-nis2100.html', {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });
  await page.evaluate(() => {
    document.querySelector('#explorer').scrollIntoView({ block: 'start' });
  });
  await new Promise((r) => setTimeout(r, 1500));

  await page.click('.explorer__nav--next');
  await new Promise((r) => setTimeout(r, 900));
  const meta = await page.evaluate(() => ({
    name: document.querySelector('.explorer__name').textContent,
    count: document.querySelector('.explorer__count').textContent,
    prevHidden: document.querySelector('.explorer__nav--prev').classList.contains('is-hidden'),
  }));
  console.log('点击下一个后:', JSON.stringify(meta));
  await page.screenshot({ path: 'shots/c1-explorer-next.png' });

  // 切到单素材类型（Website），箭头应隐藏
  await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('.explorer__tab')];
    tabs.find((t) => t.textContent.includes('Website')).click();
  });
  await new Promise((r) => setTimeout(r, 600));
  const single = await page.evaluate(() => ({
    nextHidden: document.querySelector('.explorer__nav--next').classList.contains('is-hidden'),
  }));
  console.log('单素材类型时箭头隐藏:', JSON.stringify(single));

  await browser.close();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
