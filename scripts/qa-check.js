const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const failedRequests = [];
  page.on('response', res => {
    if (res.status() >= 400) {
      failedRequests.push(`${res.status()} ${res.url()}`);
    }
  });

  const routes = ['/', '/demo', '/assessment', '/care', '/review', '/evidence', '/evaluation', '/privacy'];
  for (const route of routes) {
    const res = await page.goto('http://localhost:3001' + route, { waitUntil: 'networkidle' });
    console.log(route, '=> status:', res ? res.status() : 'null');
  }

  console.log('Failed requests count:', failedRequests.length);
  console.log('Failed requests details:', failedRequests);
  await browser.close();
})();
