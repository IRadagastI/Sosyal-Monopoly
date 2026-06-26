// AI rakip modunu uctan uca test eder: tum takimlari AI yapar, oyunu baslatir,
// 18 saniye izler ve tur ilerlemesi + konsol hatalarini raporlar.
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  const logs = [];
  page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

  await page.goto('http://localhost:8765/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(800);

  // Ilk acilis "Nasil Oynanir" modalini kapat
  await page.evaluate(() => { try { if (window.Swal && Swal.isVisible()) Swal.close(); } catch (e) {} });
  await page.waitForTimeout(400);

  // Tum takimlari oyna + AI yap
  for (let i = 0; i < 4; i++) {
    const play = await page.$('#chk-team-' + i);
    if (play) { const c = await play.isChecked(); if (!c) await play.check(); }
    const ai = await page.$('#ai-team-' + i);
    if (ai) await ai.check();
  }

  const snap = async () => page.evaluate(() => ({
    aiActive: typeof aiActive !== 'undefined' ? aiActive : null,
    aiIds: typeof AI_TEAM_IDS !== 'undefined' ? [...AI_TEAM_IDS] : null,
    currentTurn: typeof currentTurn !== 'undefined' ? currentTurn : null,
    isRolling: typeof isRolling !== 'undefined' ? isRolling : null,
    teams: typeof teams !== 'undefined' ? teams.map(t => ({ id: t.id, pos: t.pos, sbp: t.sbp })) : null,
    overlay: (document.getElementById('game-overlay') || {}).style ? document.getElementById('game-overlay').style.display : 'n/a'
  }));

  await page.click('button.btn-start:has-text("OYUNU BAŞLAT")');
  await page.waitForTimeout(800);
  console.log('=== Baslangic ===');
  console.log(JSON.stringify(await snap(), null, 2));

  // 18 saniye boyunca 3 saniyede bir durum al
  for (let s = 1; s <= 6; s++) {
    await page.waitForTimeout(3000);
    const st = await snap();
    console.log(`\n=== ${s * 3}s ===`);
    console.log(`currentTurn=${st.currentTurn} isRolling=${st.isRolling} overlay=${st.overlay}`);
    console.log('teams pos/sbp:', st.teams.map(t => `#${t.id}:p${t.pos}/${t.sbp}`).join('  '));
  }

  console.log('\n=== KONSOL HATALARI ===');
  console.log(errors.length ? errors.join('\n') : '(yok)');
  console.log('\n=== SON 15 KONSOL LOG ===');
  console.log(logs.slice(-15).join('\n') || '(yok)');

  await browser.close();
})();
