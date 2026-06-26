// Karisik senaryo: 2 takim (0=insan, 1=AI). Insan turunu otomatik surup
// AI'nin sirayi devralip devralmadigini ve kontrolun insana donup donmedigini test eder.
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

  await page.goto('http://localhost:8765/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(800);
  await page.evaluate(() => { try { if (window.Swal && Swal.isVisible()) Swal.close(); } catch (e) {} });
  await page.waitForTimeout(300);

  // Sadece takim 0 ve 1 oynasin; takim 1 AI olsun
  for (let i = 0; i < 4; i++) {
    const play = await page.$('#chk-team-' + i);
    if (play) { const want = (i === 0 || i === 1); const c = await play.isChecked(); if (c !== want) await play.setChecked(want); }
  }
  await (await page.$('#ai-team-1')).check();

  await page.click('button.btn-start:has-text("OYUNU BAŞLAT")');
  await page.waitForTimeout(600);
  await page.evaluate(() => { try { if (window.Swal && Swal.isVisible()) Swal.close(); } catch (e) {} });

  const snap = async () => page.evaluate(() => ({
    ct: currentTurn, rolling: isRolling, ai: [...AI_TEAM_IDS], active: aiActive,
    teams: teams.map(t => ({ id: t.id, pos: t.pos })), overlay: document.getElementById('game-overlay').style.display
  }));
  console.log('start:', JSON.stringify(await snap()));

  // Insan (takim 0) turunu sur: zar at, sonra cikan modali/dialogu cevapla
  async function humanTurn() {
    await page.evaluate(() => { if (typeof isAITurn === 'function' && !isAITurn() && !isRolling) rollDice(); });
    // 6 saniye boyunca acilan modallari/dialoglari otomatik cevapla
    for (let k = 0; k < 12; k++) {
      await page.waitForTimeout(500);
      await page.evaluate(() => {
        // SweetAlert aciksa onayla
        try { if (window.Swal && Swal.isVisible()) { Swal.clickConfirm(); return; } } catch (e) {}
        // Soru overlay'i acik ve cevaplanmamissa ilk siki sec
        const ov = document.getElementById('game-overlay');
        if (ov && ov.style.display !== 'none') {
          const opts = ov.querySelectorAll('.opt-btn');
          if (opts.length && !opts[0].disabled) { opts[0].click(); return; }
          const adv = ov.querySelector('.primary-btn');
          if (adv) { adv.click(); return; }
        }
      });
    }
  }

  await humanTurn();
  console.log('insan turu sonrasi:', JSON.stringify(await snap()));

  // AI'nin oynamasi icin bekle
  await page.waitForTimeout(8000);
  console.log('AI bekleme sonrasi:', JSON.stringify(await snap()));

  console.log('\nKONSOL HATALARI:', errors.length ? '\n' + errors.join('\n') : '(yok)');
  await browser.close();
})();
