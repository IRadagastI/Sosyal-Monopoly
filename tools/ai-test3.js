// "DEVAM ET" (resume) sonrasi AI'nin oynamaya devam ettigini dogrular.
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

  const closeSwal = () => page.evaluate(() => { try { if (window.Swal && Swal.isVisible()) Swal.close(); } catch (e) {} });
  const sumPos = () => page.evaluate(() => (typeof teams !== 'undefined' && teams) ? teams.reduce((a, t) => a + t.pos, 0) : -1);
  const aiState = () => page.evaluate(() => ({ active: aiActive, ids: [...AI_TEAM_IDS] }));

  await page.goto('http://localhost:8888/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(800); await closeSwal(); await page.waitForTimeout(300);

  // 4 takimi da AI yap, baslat
  for (let i = 0; i < 4; i++) { const ai = await page.$('#ai-team-' + i); if (ai) await ai.check(); }
  await page.click('button.btn-start:has-text("OYUNU BAŞLAT")');
  await page.waitForTimeout(15000); // AI oynar + her tur otomatik kaydeder
  await closeSwal();
  console.log('Ilk oyun AI:', JSON.stringify(await aiState()), 'sumPos=', await sumPos());

  // SAYFAYI YENILE (aiActive/AI_TEAM_IDS sifirlanir) -> DEVAM ET
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(800); await closeSwal(); await page.waitForTimeout(300);
  console.log('Yenileme sonrasi (resume ONCESI):', JSON.stringify(await page.evaluate(() => ({ active: aiActive, ids: [...AI_TEAM_IDS] }))));

  // Resume
  await page.evaluate(() => loadGame());
  await page.waitForTimeout(1200); await closeSwal();
  const after = await aiState();
  const posB = await sumPos();
  console.log('DEVAM ET sonrasi:', JSON.stringify(after), 'sumPos=', posB);

  // AI oynamaya devam ediyor mu?
  await page.waitForTimeout(8000); await closeSwal();
  const posC = await sumPos();
  console.log('8s sonra sumPos=', posC, ' (artarsa AI calisiyor)');

  console.log('\nSONUC:', (after.active && after.ids.length === 4 && posC > posB) ? 'BASARILI - AI resume sonrasi oynuyor' : 'BASARISIZ');
  console.log('KONSOL HATALARI:', errors.length ? '\n' + errors.join('\n') : '(yok)');
  await browser.close();
})();
