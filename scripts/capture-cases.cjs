// 截取三个新案例页的关键区域
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
      '--user-data-dir=' + os.tmpdir().replace(/\\/g, '/') + '/lily-cap-cases',
      '--no-sandbox',
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  fs.mkdirSync('shots', { recursive: true });

  const shots = [
    ['case-es200.html', 'c2', '#explorer'],
    ['case-workshop.html', 'c3', '.case-points'],
    ['case-channel.html', 'c4', '#explorer'],
  ];

  for (const [file, prefix, sel] of shots) {
    await page.goto(`http://192.168.1.21:5173/${file}`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    await new Promise((r) => setTimeout(r, 2500));
    await page.screenshot({ path: `shots/${prefix}-hero.png` });
    await page.evaluate((s) => {
      document.querySelector(s).scrollIntoView({ block: 'center' });
    }, sel);
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: `shots/${prefix}-body.png` });

    await page.evaluate(() => {
      document.querySelector('.case-stats').scrollIntoView({ block: 'center' });
    });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: `shots/${prefix}-stats.png` });
    console.log(prefix, 'ok');
  }

  await browser.close();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
