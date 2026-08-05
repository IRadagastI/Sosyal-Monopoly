const assert = require("assert");
/* global activeQuestions, applyGrade, boardData, renderBoard */
const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
};

function server() {
  return http.createServer((request, response) => {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    const relative =
      pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const file = path.resolve(ROOT, relative);
    if (
      !file.startsWith(`${ROOT}${path.sep}`) ||
      !fs.existsSync(file) ||
      !fs.statSync(file).isFile()
    ) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": MIME[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    fs.createReadStream(file).pipe(response);
  });
}

async function closeSwal(page) {
  await page.evaluate(() => {
    if (window.Swal && Swal.isVisible()) Swal.close();
  });
}

async function startTwoTeamGame(page, aiTeamOne = false) {
  for (let id = 0; id < 4; id++) {
    await page.locator(`#chk-team-${id}`).setChecked(id < 2);
    await page.locator(`#ai-team-${id}`).setChecked(aiTeamOne && id === 1);
  }
  await page.locator('[data-action="start-game"]').click();
  await page.waitForFunction(
    () =>
      teams.length === 2 &&
      getComputedStyle(document.getElementById("smartboard-frame")).display !==
        "none",
  );
}

async function finishActiveTurn(page, targetTurn = 1) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const state = await page.evaluate(() => ({
      turn: currentTurn,
      swal: !!(window.Swal && Swal.isVisible()),
      overlay:
        getComputedStyle(document.getElementById("game-overlay")).display !==
        "none",
    }));
    if (state.turn === targetTurn) return;
    if (state.swal) {
      await page.evaluate(() => Swal.clickConfirm());
    } else if (state.overlay) {
      const option = page
        .locator("#game-modal-content .opt-btn:not([disabled])")
        .first();
      if (await option.count()) await option.click();
      else {
        const advance = page
          .locator("#game-modal-content .primary-btn:not([disabled])")
          .first();
        if (await advance.count()) await advance.click();
      }
    }
    await page.waitForTimeout(250);
  }
  throw new Error("İnsan turu zamanında tamamlanmadı.");
}

async function finishHumanTurn(page) {
  await page.locator('[data-action="roll-dice"]').click();
  await finishActiveTurn(page);
}

(async () => {
  const localServer = server();
  await new Promise((resolve) => localServer.listen(0, "127.0.0.1", resolve));
  const address = localServer.address();
  const url = `http://127.0.0.1:${address.port}/index.html`;
  const browser = await chromium.launch();
  const browserErrors = [];

  try {
    const page = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));
    await page.goto(url, { waitUntil: "load" });
    const curriculumState = await page.evaluate(() => {
      const result = {};
      for (const grade of ["5", "6", "7", "8"]) {
        applyGrade(grade);
        renderBoard();
        result[grade] = {
          units: Object.keys(activeQuestions).length,
          questions: Object.values(activeQuestions).reduce(
            (sum, values) => sum + values.length,
            0,
          ),
          firstOutcome: activeQuestions[1][0].outcome,
          firstTitle: boardData.find((square) => square.type === "unit").title,
        };
      }
      applyGrade("6");
      return result;
    });
    for (const grade of ["5", "6", "7"]) {
      assert.deepStrictEqual(curriculumState[grade], {
        units: 6,
        questions: 48,
        firstOutcome: `SB.${grade}.1.1`,
        firstTitle: "Birlikte Yaşamak",
      });
    }
    assert.deepStrictEqual(curriculumState["8"], {
      units: 6,
      questions: 48,
      firstOutcome: "İTA.8.1.1",
      firstTitle: "Bir Kahraman Doğuyor",
    });
    await startTwoTeamGame(page, true);
    await finishHumanTurn(page);
    await page.waitForFunction(
      () => currentTurn === 0 && teams[1].pos > 0,
      null,
      { timeout: 20000 },
    );
    const aiState = await page.evaluate(() => ({
      active: aiActive,
      ids: [...AI_TEAM_IDS],
      positions: teams.map((team) => team.pos),
    }));
    assert.deepStrictEqual(aiState.ids, [1]);
    assert.strictEqual(aiState.active, true);
    assert(
      aiState.positions[0] > 0 && aiState.positions[1] > 0,
      "İnsan ve AI piyonları ilerlemeli.",
    );
    await page.close();

    const finalPage = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
    });
    finalPage.on("pageerror", (error) => browserErrors.push(error.message));
    await finalPage.goto(url, { waitUntil: "load" });
    await startTwoTeamGame(finalPage, false);
    await finalPage.evaluate(() => {
      timeLeft = FINAL_WINDOW_SECONDS + 10;
      renderTimer();
    });
    await finalPage
      .locator('[data-action="open-final"]')
      .dispatchEvent("click");
    await finalPage.waitForFunction(
      () =>
        Swal.isVisible() &&
        Swal.getTitle().textContent.includes("henüz kilitli"),
    );
    await closeSwal(finalPage);
    await finalPage.evaluate(() => {
      timeLeft = FINAL_WINDOW_SECONDS;
      renderTimer();
    });
    await finalPage.locator('[data-action="open-final"]').click();
    await finalPage.waitForFunction(
      () =>
        teams[0].finalUsed === true &&
        getComputedStyle(document.getElementById("game-overlay")).display !==
          "none",
    );
    await finalPage.locator('[data-action="close-final"]').click();
    await finalPage
      .locator('[data-action="open-final"]')
      .dispatchEvent("click");
    await finalPage.waitForFunction(
      () =>
        Swal.isVisible() &&
        Swal.getTitle().textContent.includes("hakkı kullanıldı"),
    );
    await closeSwal(finalPage);
    await finalPage.close();

    const powerPage = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
    });
    powerPage.on("pageerror", (error) => browserErrors.push(error.message));
    await powerPage.goto(url, { waitUntil: "load" });
    await startTwoTeamGame(powerPage, false);
    await powerPage
      .locator('[data-action="team-power"][data-team-id="0"]')
      .click();
    await powerPage.locator(".swal2-select").selectOption("2");
    await powerPage.locator(".swal2-confirm").click();
    await powerPage.waitForFunction(
      () => isRolling && document.getElementById("btn-roll").disabled,
    );
    await powerPage.evaluate(() => window.rollDice());
    await finishActiveTurn(powerPage);
    const powerState = await powerPage.evaluate(() => ({
      position: teams[0].pos,
      powerReady: teams[0].powerReady,
      turn: currentTurn,
    }));
    assert.deepStrictEqual(powerState, {
      position: 2,
      powerReady: false,
      turn: 1,
    });
    await powerPage.close();

    const lifecyclePage = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
    });
    lifecyclePage.on("pageerror", (error) => browserErrors.push(error.message));
    await lifecyclePage.goto(url, { waitUntil: "load" });
    await startTwoTeamGame(lifecyclePage, false);
    await lifecyclePage.locator('[data-action="roll-dice"]').click();
    lifecyclePage.once("dialog", (dialog) => dialog.accept());
    await lifecyclePage.locator('[data-action="go-menu"]').click();
    await lifecyclePage.waitForTimeout(2500);
    const lifecycle = await lifecyclePage.evaluate(() => ({
      teams: teams.length,
      rolling: isRolling,
      landing: getComputedStyle(document.getElementById("landing-screen"))
        .display,
    }));
    assert.strictEqual(lifecycle.teams, 0);
    assert.strictEqual(lifecycle.rolling, false);
    assert.notStrictEqual(lifecycle.landing, "none");

    assert.deepStrictEqual(
      browserErrors,
      [],
      `Tarayıcı hataları: ${browserErrors.join("; ")}`,
    );
    console.log(
      "E2E başarılı: sıra devri, final sınırı, süper güç kilidi ve oturum iptali doğrulandı.",
    );
  } finally {
    await browser.close();
    await new Promise((resolve) => localServer.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
