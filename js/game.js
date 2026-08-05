const GAME_DURATION_SECONDS = 25 * 60;
const FINAL_WINDOW_SECONDS = 3 * 60;
const SAVE_SCHEMA_VERSION = 2;

let baseTeams = [
  {
    id: 0,
    name: "Kaşifler",
    color: "var(--t1)",
    sbp: 1500,
    badges: 0,
    pos: 0,
    powerReady: true,
    icon: "fa-compass",
    usedJokers: {},
    finalUsed: false,
  },
  {
    id: 1,
    name: "Girişimciler",
    color: "var(--t2)",
    sbp: 1500,
    badges: 0,
    pos: 0,
    powerReady: true,
    icon: "fa-coins",
    usedJokers: {},
    finalUsed: false,
  },
  {
    id: 2,
    name: "Araştırmacılar",
    color: "var(--t3)",
    sbp: 1500,
    badges: 0,
    pos: 0,
    powerReady: true,
    icon: "fa-microscope",
    usedJokers: {},
    finalUsed: false,
  },
  {
    id: 3,
    name: "Diplomatlar",
    color: "var(--t4)",
    sbp: 1500,
    badges: 0,
    pos: 0,
    powerReady: true,
    icon: "fa-handshake",
    usedJokers: {},
    finalUsed: false,
  },
];
let teams = [];

function resetBaseTeams() {
  baseTeams.forEach((team) => {
    team.sbp = 1500;
    team.badges = 0;
    team.pos = 0;
    team.powerReady = true;
    team.usedJokers = {};
    team.diplomaticImmunity = false;
    team.finalUsed = false;
  });
}

// Dinamik metinleri innerHTML'e basmadan önce HTML olarak kaçışla.
function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Soru içeriğinde yalnız satır sonu amaçlı <br> etiketine izin verilir.
// Diğer bütün HTML ve olay öznitelikleri metne dönüştürülür.
function safeQuestionHtml(value) {
  return escapeHtml(value).replace(/&lt;br\s*\/?&gt;/gi, "<br>");
}

let currentTurn = 0;
let activeQuestionMode = false;
let currentCorrectAns = -1;

// Flash events
let activeFlashEvent = null;
const flashEvents = [
  {
    id: "heyelan",
    title: "SON DAKİKA: İpek Yolu Heyelanı",
    text: "Turuncu (Ortak Miras) karelerine gelen takımlar mülk almak/geçmek için 200 SBP yol çalışması vergisi ödemek zorunda kalır.",
    bg: "#fef08a",
    border: "#ca8a04",
  },
  {
    id: "kriz",
    title: "SON DAKİKA: Küresel Enflasyon",
    text: "Sarı (Ekonomi) karelerine ayak basan her takım anında 100 SBP ceza öder!",
    bg: "#fee2e2",
    border: "#b91c1c",
  },
  {
    id: "bilim",
    title: "SON DAKİKA: TÜBİTAK Bilim Şenliği",
    text: "Mor (Teknoloji) karelerine gelen takımlara, destek amaçlı fazladan 150 SBP hibe ediliyor!",
    bg: "#f3e8ff",
    border: "#6d28d9",
  },
  {
    id: "iklim",
    title: "SON DAKİKA: Küresel İklim Zirvesi",
    text: "Yeşil (Evimiz Dünya) karelerine gelenler fazladan 1 Doğa Dostu Rozeti kazanır!",
    bg: "#dcfce7",
    border: "#15803d",
  },
  {
    id: "baris",
    title: "SON DAKİKA: Uluslararası Barış Günü",
    text: "Kırmızı (Demokrasi) karelerine gelen her takım kasadan hediye 200 SBP kazanır!",
    bg: "#ffe4e6",
    border: "#e11d48",
  },
];

let activeJoker5050 = false; // now stores { teamId: X } or false
const boardData = [];

// 11x7 Layout -> 32 Squares. Start Bottom Right (0).
// Custom naming as requested: Tarih Kalesi, Atatürk Evi, Ders Kitabı Bürosu, TEMA İstasyonu vb.
const customNames = {
  1: ["Birlikte Yaşam", "Ders Kitabı Bürosu"],
  2: ["Evimiz Dünya", "Coğrafya Kulübü"],
  3: ["Ortak Miras", "Tarih Kalesi"],
  4: ["Yaşayan Demokrasi", "Atatürk Evi"],
  5: ["Ekonomik Hayat", "Girişimci Ofisi"],
  6: ["Teknoloji ve Toplum", "Uzay Üssü"],
};

// Bina kademeleri: 0 = arsa, 1 Kütüphane, 2 Müze, 3 Üniversite
const buildingNames = ["Arsa", "Kütüphane", "Müze", "Üniversite"];
const buildingIcons = ["", "fa-book", "fa-landmark", "fa-university"];

function unitPrice(u) {
  return 100 + u * 50;
} // 150,200,...,400
function baseRentOf(price) {
  return Math.round(price * 0.2);
}
function buildCostOf(price) {
  return Math.round(price * 0.5);
}

function setupBoardData() {
  boardData.length = 0; // her oyunda sıfırla (tekrar başlatmada çift veriyi önler)
  let unitIdx = 0;
  // Sabit tahta: her ünite karesi için belirli isimler (rastgele değil)
  let nameCounters = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (let i = 0; i < 32; i++) {
    if (i === 0)
      boardData.push({
        type: "corner",
        title: "BAŞLA",
        sub: "Maaş: 200",
        icon: "fa-arrow-left",
        id: i,
        go: true,
      });
    else if (i === 10)
      boardData.push({
        type: "corner",
        title: "DİSİPLİN KURULU",
        sub: "Hapis",
        icon: "fa-gavel",
        id: i,
      });
    else if (i === 16)
      boardData.push({
        type: "corner",
        title: "BEDAVA PARK",
        sub: "Dinlen",
        icon: "fa-car",
        id: i,
      });
    else if (i === 26)
      boardData.push({
        type: "corner",
        title: "OKUL BAHÇESİ",
        sub: "Etkinlik",
        icon: "fa-tree",
        id: i,
      });
    else {
      if (i % 7 === 0) {
        boardData.push({
          type: "chance",
          title: "ŞANS",
          sub: "Aktivite",
          color: "#475569",
          icon: "fa-question",
          id: i,
        });
      } else if (i === 5 || i === 15 || i === 25) {
        boardData.push({
          type: "chance",
          title: "EKONOMİ",
          sub: "Kâfi",
          color: "#0f766e",
          icon: "fa-train",
          customName: "TEMA İstasyonu",
          id: i,
        });
      } else {
        let u = (unitIdx % 6) + 1;
        let colors = [
          "var(--u1)",
          "var(--u2)",
          "var(--u3)",
          "var(--u4)",
          "var(--u5)",
          "var(--u6)",
        ];
        let titles = customNames[u];
        // Sabit/deterministik isim seçimi
        let title = titles[nameCounters[u] % titles.length];
        nameCounters[u]++;
        let price = unitPrice(u);
        boardData.push({
          type: "unit",
          unit: u,
          title: title,
          color: colors[u - 1],
          id: i,
          price: price,
          baseRent: baseRentOf(price),
          buildCost: buildCostOf(price),
          owner: null,
          buildLevel: 0,
        });
        unitIdx++;
      }
    }
  }
}

function getGridStyle(idx) {
  if (idx === 0)
    return { gridColumn: "11", gridRow: "7", class: "bottom-row corner go-sq" };
  if (idx >= 1 && idx <= 9)
    return { gridColumn: `${11 - idx}`, gridRow: "7", class: "bottom-row" };
  if (idx === 10)
    return { gridColumn: "1", gridRow: "7", class: "bottom-row corner" };
  if (idx >= 11 && idx <= 15)
    return { gridColumn: "1", gridRow: `${7 - (idx - 10)}`, class: "left-col" };
  if (idx === 16)
    return { gridColumn: "1", gridRow: "1", class: "top-row corner" };
  if (idx >= 17 && idx <= 25)
    return { gridColumn: `${1 + (idx - 16)}`, gridRow: "1", class: "top-row" };
  if (idx === 26)
    return { gridColumn: "11", gridRow: "1", class: "top-row corner" };
  if (idx >= 27 && idx <= 31)
    return {
      gridColumn: "11",
      gridRow: `${1 + (idx - 26)}`,
      class: "right-col",
    };
}

// ---- MÜLK / KİRA / BİNA SİSTEMİ ----
const TEAM_COLORS = ["var(--t1)", "var(--t2)", "var(--t3)", "var(--t4)"];
function teamColorById(id) {
  return TEAM_COLORS[id] || "#888";
}
function teamById(id) {
  return teams.find((t) => t.id === id) || baseTeams[id];
}

function unitSquareHTML(sq) {
  let ownerBar = "";
  let buildBadge = "";
  let info = `<div class="sq-sub">${sq.price} SBP</div>`;
  if (sq.owner !== null && sq.owner !== undefined) {
    ownerBar = `<div class="owner-bar" style="background:${teamColorById(sq.owner)}"></div>`;
    if (sq.buildLevel > 0) {
      buildBadge = `<div class="build-badge"><i class="fas ${buildingIcons[sq.buildLevel]}"></i></div>`;
    }
    info = `<div class="sq-sub">${buildingNames[sq.buildLevel]}</div>`;
  }
  return `
          <div class="sq-header" style="background:${sq.color}"></div>
          ${ownerBar}${buildBadge}
          <div class="sq-body">
            <div class="sq-title">${escapeHtml(sq.title)}</div>
            ${info}
          </div>
        `;
}

function refreshSquareVisual(pos) {
  const sq = boardData[pos];
  const el = document.getElementById(`sq-${pos}`);
  if (sq && el && sq.type === "unit") el.innerHTML = unitSquareHTML(sq);
}

// Bir takım, belirtilen ünitenin TÜM karelerine sahip mi? (Ünite tekeli)
function ownsFullSet(teamId, unit) {
  const unitSquares = boardData.filter(
    (s) => s.type === "unit" && s.unit === unit,
  );
  return unitSquares.length > 0 && unitSquares.every((s) => s.owner === teamId);
}

// Kira hesabı: temel kira * (bina kademesi + 1) * (tekel ise 2)
function calcRent(sq) {
  let multiplier = ownsFullSet(sq.owner, sq.unit) ? 2 : 1;
  return Math.round(sq.baseRent * (sq.buildLevel + 1) * multiplier);
}

function teamPropCount(t) {
  return boardData.filter((s) => s.type === "unit" && s.owner === t.id).length;
}

// Toplam servet: nakit SBP + mülk fiyatları + inşa edilen bina maliyetleri + rozet bonusu
function teamNetWorth(t) {
  let propVal = 0;
  boardData.forEach((s) => {
    if (s.type === "unit" && s.owner === t.id) {
      propVal += s.price;
      for (let lv = 1; lv <= s.buildLevel; lv++) propVal += s.buildCost * lv;
    }
  });
  return t.sbp + propVal + t.badges * 100;
}

function renderBoard() {
  setupBoardData();
  const board = document.getElementById("board");
  // tekrar başlatmada yalnızca eski kare ve piyonları temizle (board-center/zar/deste kalsın)
  board
    .querySelectorAll(".square, .pawn-indicator")
    .forEach((el) => el.remove());
  boardData.forEach((sq) => {
    const el = document.createElement("div");
    const styleInfo = getGridStyle(sq.id);
    el.className = `square ${styleInfo.class}`;
    el.id = `sq-${sq.id}`;
    el.style.gridColumn = styleInfo.gridColumn;
    el.style.gridRow = styleInfo.gridRow;

    if (sq.type === "unit") {
      el.innerHTML = unitSquareHTML(sq);
    } else if (sq.type === "chance") {
      let name = sq.customName || sq.title;
      el.innerHTML = `
          <div class="sq-header" style="background:${sq.color}"></div>
          <div class="sq-body">
            <i class="fas ${sq.icon} sq-icon"></i>
            <div class="sq-title">${escapeHtml(name)}</div>
          </div>
        `;
    } else {
      el.innerHTML = `
          <div class="sq-body">
            <i class="fas ${sq.icon} sq-icon" style="${sq.go ? "color:#ef4444; font-size:6vmin;" : ""}"></i>
            <div class="sq-title">${escapeHtml(sq.title)}</div>
            <div class="sq-sub">${escapeHtml(sq.sub)}</div>
          </div>
        `;
    }
    board.appendChild(el);
  });

  // Create logic pawns — Social Studies themed icons
  const pawnColors = { 0: "#10b981", 1: "#eab308", 2: "#a855f7", 3: "#3b82f6" };
  teams.forEach((t) => {
    const p = document.createElement("div");
    p.className = "pawn-indicator";
    p.innerHTML = `<i class="fas ${t.icon}" style="color:white; font-size:2vmin;"></i>`;
    p.style.background = pawnColors[t.id] || t.color;
    p.style.boxShadow = `0 0 1.2vmin ${pawnColors[t.id]}, 0 0.3vmin 0.8vmin rgba(0,0,0,0.5)`;
    p.setAttribute("data-tooltip", `${t.name} (${t.sbp} SBP)`);
    p.id = `logic-pawn-${t.id}`;
    document.getElementById("board").appendChild(p);
  });

  updateActiveUI();
  updatePawnPositions();
}

function updateActiveUI() {
  // İlk olarak tüm kartlardan active class'ını temizle
  for (let i = 0; i < 4; i++) {
    let card = document.getElementById(`tc-${i}`);
    if (card) card.classList.remove("active");
  }

  teams.forEach((t, i) => {
    let scoreEl = document.getElementById(`score-${t.id}`);
    if (scoreEl) scoreEl.innerText = t.sbp;
    let badgeEl = document.getElementById(`badge-${t.id}`);
    if (badgeEl) badgeEl.innerText = `Doğa Dostu Rozeti: ${t.badges}`;

    let card = document.getElementById(`tc-${t.id}`);
    if (card && i === currentTurn) card.classList.add("active");
  });

  if (!teams[currentTurn]) {
    updateFinalAvailability();
    return;
  }
  document.getElementById("current-turn-display").innerText =
    teams[currentTurn].name;
  document.getElementById("current-turn-display").style.color =
    teams[currentTurn].color;
  updateFinalAvailability();
}

function updatePawnPositions() {
  teams.forEach((t, i) => {
    const p = document.getElementById(`logic-pawn-${t.id}`);
    if (!p) return;
    p.setAttribute("data-tooltip", `${t.name} (${t.sbp} SBP)`);

    // Sırası gelen takımın piyonuna active sınıfı ekle
    if (teams[currentTurn].id === t.id) {
      p.classList.add("active");
    } else {
      p.classList.remove("active");
    }

    const sq = document.getElementById(`sq-${t.pos}`);
    if (!sq) return;
    const rect = sq.getBoundingClientRect();
    const boardRect = document.getElementById("board").getBoundingClientRect();
    let ox = (rect.width / 4) * (i % 2 === 0 ? -0.5 : 0.5);
    let oy = (rect.height / 4) * (i < 2 ? -0.5 : 0.5);
    p.style.left = `${rect.left - boardRect.left + rect.width / 2 + ox}px`;
    p.style.top = `${rect.top - boardRect.top + rect.height / 2 + oy}px`;
  });
}

let isRolling = false;
let gameSessionId = 0;
const pendingGameTimeouts = new Set();
const pendingGameIntervals = new Set();

function gameTimeout(callback, delay) {
  const sessionId = gameSessionId;
  const id = window.setTimeout(() => {
    pendingGameTimeouts.delete(id);
    if (sessionId === gameSessionId) callback();
  }, delay);
  pendingGameTimeouts.add(id);
  return id;
}

function gameInterval(callback, delay) {
  const sessionId = gameSessionId;
  const id = window.setInterval(() => {
    if (sessionId === gameSessionId) callback();
  }, delay);
  pendingGameIntervals.add(id);
  return id;
}

function clearGameInterval(id) {
  if (id === null || id === undefined) return;
  window.clearInterval(id);
  pendingGameIntervals.delete(id);
}

function beginGameSession() {
  gameSessionId++;
  pendingGameTimeouts.forEach((id) => window.clearTimeout(id));
  pendingGameIntervals.forEach((id) => window.clearInterval(id));
  pendingGameTimeouts.clear();
  pendingGameIntervals.clear();
  timerInterval = null;
  flashInterval = null;
  isRolling = false;
  activeQuestionMode = false;
  isTemaQuestion = false;
  pendingUnitSq = null;
  if (window.Swal && Swal.isVisible()) Swal.close();
  const overlay = document.getElementById("game-overlay");
  if (overlay) overlay.style.display = "none";
}

// Oyuncunun dokunmasini bekleyen bir pencere ekranda mi?
function turnUiBusy() {
  const ov = document.getElementById("game-overlay");
  const overlayOpen = ov && getComputedStyle(ov).display !== "none";
  const swalOpen = !!(window.Swal && Swal.isVisible());
  return overlayOpen || swalOpen;
}

function markTurnInProgress() {
  isRolling = true;
  const rollButton = document.getElementById("btn-roll");
  rollButton.style.opacity = "0.5";
  rollButton.disabled = true;

  const recoverStalledTurn = () => {
    if (!isRolling) return;
    if (turnUiBusy()) {
      gameTimeout(recoverStalledTurn, 5000);
      return;
    }
    console.warn("Tur zinciri takıldı; sıra güvenli biçimde devrediliyor.");
    nextTurn();
  };
  gameTimeout(recoverStalledTurn, 20000);
}

function rollDice() {
  if (
    !teams.length ||
    !teams[currentTurn] ||
    activeQuestionMode ||
    turnUiBusy()
  )
    return;
  if (isRolling) {
    return;
  }
  markTurnInProgress();

  let rollTotal = 0;
  let ticks = 0;
  const icons = ["one", "two", "three", "four", "five", "six"];

  // Initial fixed visual to 9 (5 and 4) as requested before animating
  document.getElementById("dice1").innerHTML =
    `<i class="fas fa-dice-five"></i>`;
  document.getElementById("dice2").innerHTML =
    `<i class="fas fa-dice-four"></i>`;

  const intv = gameInterval(() => {
    let d1 = Math.floor(Math.random() * 6) + 1;
    let d2 = Math.floor(Math.random() * 6) + 1;
    document.getElementById("dice1").innerHTML =
      `<i class="fas fa-dice-${icons[d1 - 1]}"></i>`;
    document.getElementById("dice2").innerHTML =
      `<i class="fas fa-dice-${icons[d2 - 1]}"></i>`;
    ticks++;
    if (ticks > 15) {
      clearGameInterval(intv);
      rollTotal = d1 + d2;
      gameTimeout(() => movePlayer(rollTotal), 500);
    }
  }, 50);
}

function movePlayer(steps) {
  let t = teams[currentTurn];
  if (!t) return;
  t.pos += steps;
  let passedStart = false;

  if (t.pos >= 32) {
    t.pos = t.pos % 32;
    passedStart = true;
    t.sbp += 200;
  }

  updateActiveUI();
  updatePawnPositions();

  gameTimeout(() => {
    // handleSquare async; icinde bir hata olusursa tur zinciri sessizce
    // kopuyor ve isRolling true kaliyordu. Hatada sirayi devret.
    Promise.resolve()
      .then(() => handleSquare(t.pos, passedStart))
      .catch((err) => {
        console.error("Kare islenirken hata:", err);
        nextTurn();
      });
  }, 600);
}

// =============== 8. SINIF LGS KALİTESİ SORU HAVUZU (200+ soru) ===============

// =============== 5. SINIF SORU HAVUZU ===============

// =============== 7. SINIF SORU HAVUZU ===============

// Mevcut 6. sınıflar havuzunu questions6 olarak bırakıyoruz

function getRandomQuestion(unit) {
  const unitQuestions = activeQuestions[unit];
  if (usedQuestions[unit].length >= unitQuestions.length) {
    // If all questions are used, reset the array
    usedQuestions[unit] = [];
  }

  let availableIndices = [];
  for (let i = 0; i < unitQuestions.length; i++) {
    if (!usedQuestions[unit].includes(i)) {
      availableIndices.push(i);
    }
  }

  const randomIdx =
    availableIndices[Math.floor(Math.random() * availableIndices.length)];
  usedQuestions[unit].push(randomIdx);
  return unitQuestions[randomIdx];
}

const chances = [
  {
    text: "TÜBİTAK Bilim Fuarı'nda projen birinci oldu. Büyük Ödül!",
    val: 400,
  },
  {
    text: "Tarihi eserlere zarar verildiğini fark etmedin. Çevre cezası.",
    val: -150,
  },
  { text: "Geri dönüşüm projen okuldaki en iyi proje seçildi!", val: 200 },
  { text: "Müze gezisinde kurallara uymadığın için ceza aldın.", val: -100 },
  { text: "Kültürel mirasımızı tanıtan harika bir sunum yaptın.", val: 250 },
  { text: "Fabrika atıklarını doğaya karıştırdığın tespit edildi.", val: -300 },
  { text: "Sıfır Atık kampanyasına katıldın, tebrikler!", val: 150 },
  { text: "Yanlış haber (Dezenformasyon) yaydığın anlaşıldı.", val: -200 },
  { text: "Uluslararası turnuvada ülkemizi temsil ettin!", val: 500 },
  {
    text: "Siber zorbalık yaptığın için hesabın askıya alındı, ceza.",
    val: -250,
  },
  { text: "Tohum takas şenliği düzenledin, doğa sana minnettar.", val: 200 },
  {
    text: "Su kaynaklarını israf ettiğin için fatura kabarık geldi.",
    val: -150,
  },
  { text: "Patent başvurun kabul edildi! Yeni bir mucitsin.", val: 600 },
  {
    text: "Telif hakkı ihlali yaptığın için ceza ödemek zorundasın.",
    val: -400,
  },
  { text: "E-Devlet üzerinden hızla işlemlerini hallettin!", val: 100 },
];

// Disiplin Kurulu Events (Square 10)
const disiplinEvents = [
  { text: "Koridorda çok hızlı koştuğun için 100 SBP ceza aldın.", val: -100 },
  {
    text: "Öğretmenine karşı saygılı davrandığın için kurul seni affetti.",
    val: 0,
  },
  {
    text: "Okul eşyalarına zarar verdiğin tespit edildi. 150 SBP ceza ödemelisin.",
    val: -150,
  },
  { text: "Ödevlerini yapmadığın için 50 SBP ceza.", val: -50 },
  {
    text: "Kütüphanede sesli konuşup başkalarını rahatsız ettin. 1 Doğa Dostu Rozeti silindi! (Eğer rozetin yoksa 100 SBP ceza)",
    val: 0,
    penaltyType: "badge",
  },
];

// Okul Bahçesi Events (Square 26)
const bahceEvents = [
  { text: "Okul bahçesinde dolaşırken yerde 100 SBP buldun!", val: 100 },
  {
    text: "Ağaç dikme etkinliğine katıldın. Harikasın! +1 Doğa Dostu Rozeti!",
    val: 0,
    rewardType: "badge",
  },
  { text: "Arkadaşlarınla basketbol maçı yaptın, çok eğlendin.", val: 0 },
  {
    text: "Okul kermesinde kendi yaptığın bileklikleri sattın, kasanıza 200 SBP eklendi!",
    val: 200,
  },
  {
    text: "Gönüllü çevre temizliği yaptın, okul müdürü seni 150 SBP ile ödüllendirdi.",
    val: 150,
  },
];

async function handleSquare(pos, passedStart) {
  const sq = boardData[pos];
  const t = teams[currentTurn];
  let preamble =
    passedStart && pos !== 0
      ? `<div style="color:#16a34a; font-size:2vmin; font-weight:800; margin-bottom:1vmin;">+ BAŞLANGIÇ MAAŞI (200 SBP) ALINDI!</div>`
      : "";

  if (pos === 5 || pos === 15 || pos === 25) {
    // TEMA
    let randomUnit = Math.floor(Math.random() * 6) + 1;
    const q = getRandomQuestion(randomUnit);
    activeQuestionMode = true;
    currentCorrectAns = q.ans;
    isTemaQuestion = true;
    showMsgModal(`
                ${preamble}
                <div class="modal-header theme-header" style="background:var(--card-green);color:white;padding:2vmin;border-radius:10px 10px 0 0;text-align:center;">
                    <h2><i class="fas fa-tree"></i> TEMA İSTASYONU ZORLUĞU</h2>
                    <p style="font-size:2vmin; margin-top:0.5vmin;">Doğru cevaplayıp <span style="font-weight:900;">+1 Doğa Dostu Rozeti</span> kazan!</p>
                </div>
                <p style="font-size:2.5vmin; font-weight:700; padding:2vmin; text-align:center;">${safeQuestionHtml(q.q)}</p>
                <div style="display:flex; flex-direction:column; gap:0.5vmin; margin-top:2vmin; align-items:center;">
                    <button class="opt-btn" id="q-opt-0" data-action="answer-question" data-selected="0" data-correct="${q.ans}">${safeQuestionHtml(q.opts[0])}</button>
                    <button class="opt-btn" id="q-opt-1" data-action="answer-question" data-selected="1" data-correct="${q.ans}">${safeQuestionHtml(q.opts[1])}</button>
                    <button class="opt-btn" id="q-opt-2" data-action="answer-question" data-selected="2" data-correct="${q.ans}">${safeQuestionHtml(q.opts[2])}</button>
                    <button class="opt-btn" id="q-opt-3" data-action="answer-question" data-selected="3" data-correct="${q.ans}">${safeQuestionHtml(q.opts[3])}</button>
                </div>
                <div id="q-result" style="text-align:center; font-size:3vmin; font-weight:bold; height:4vmin; margin-top:1vmin;"></div>
                `);
    if (activeJoker5050 && activeJoker5050.teamId === teams[currentTurn].id) {
      gameTimeout(() => {
        apply5050Joker();
        activeJoker5050 = false;
      }, 100);
    }
  } else if (sq.type === "corner") {
    if (pos === 10) {
      // Disiplin Kurulu
      let event = {
        ...disiplinEvents[Math.floor(Math.random() * disiplinEvents.length)],
      };
      let clr = "#ef4444"; // Red
      if (event.penaltyType === "badge") {
        if (t.badges > 0) {
          t.badges -= 1;
        } else {
          t.sbp -= 100;
          event.text += " (Rozetin olmadığı için SBP kesildi)";
        }
      } else {
        t.sbp += event.val;
      }
      if (event.val === 0 && event.penaltyType !== "badge") clr = "#475569"; // Neutral color

      showMsgModal(
        `${preamble}<h2 style="color:${clr}"><i class="fas fa-gavel"></i> DİSİPLİN KURULU</h2><p style="font-size:2.5vmin; font-weight:700">"${escapeHtml(event.text)}"</p><button class="primary-btn" data-action="next-turn">Sırayı Sal</button>`,
      );
      updateActiveUI();
    } else if (pos === 26) {
      // Okul Bahçesi
      let event = bahceEvents[Math.floor(Math.random() * bahceEvents.length)];
      let clr = "#10b981"; // Green
      if (event.rewardType === "badge") {
        t.badges += 1;
      } else {
        t.sbp += event.val;
      }
      if (event.val > 0 || event.rewardType === "badge") confetti();
      if (event.val === 0 && event.rewardType !== "badge") clr = "#475569"; // Neutral color

      showMsgModal(
        `${preamble}<h2 style="color:${clr}"><i class="fas fa-tree"></i> OKUL BAHÇESİ</h2><p style="font-size:2.5vmin; font-weight:700">"${escapeHtml(event.text)}"</p><button class="primary-btn" data-action="next-turn">Sırayı Sal</button>`,
      );
      updateActiveUI();
    } else {
      showMsgModal(
        `${preamble}<h2>${escapeHtml(sq.title)}</h2><i class="fas ${sq.icon}" style="font-size:6vmin; margin:2vmin 0; color:#475569"></i><p>(Bu karede işlem yok)</p><button class="primary-btn" data-action="next-turn">Sırayı Sal</button>`,
      );
      if (pos === 0 && !passedStart) {
        t.sbp += 200;
        confetti();
        updateActiveUI();
      }
    }
  } else if (sq.type === "chance") {
    let card = chances[Math.floor(Math.random() * chances.length)];
    t.sbp += card.val;
    let clr = card.val > 0 ? "#16a34a" : "#ef4444";
    showMsgModal(
      `${preamble}<h2 style="color:#eab308">ŞANS & EKONOMİ</h2><p style="font-size:2.5vmin; font-weight:700">"${escapeHtml(card.text)}"</p><h1 style="color:${clr}">${card.val > 0 ? "+" : ""}${card.val} SBP</h1><button class="primary-btn" data-action="next-turn">Sırayı Sal</button>`,
    );
    if (card.val > 0) confetti();
    updateActiveUI();
  } else if (sq.type === "unit") {
    let t = teams[currentTurn];

    // FLASH CARD EFFECTS
    if (activeFlashEvent) {
      if (activeFlashEvent.id === "heyelan" && sq.unit === 3) {
        aiAuto(true);
        await Swal.fire({
          title: "Flash Haber: İpek Yolu Heyelanı!",
          text: "Turuncu karedesiniz. Zarar bedeli olarak 200 SBP ödemek zorundasınız. Onaylıyor musunuz? (İptal ederseniz -200 SBP zorla kesilir.)",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Evet, Öde",
          cancelButtonText: "İptal",
          confirmButtonColor: "#ca8a04",
          cancelButtonColor: "#ef4444",
        });
        t.sbp -= 200;
      } else if (activeFlashEvent.id === "kriz" && sq.unit === 5) {
        aiAuto(true);
        await Swal.fire({
          title: "Flash Haber Çarpması!",
          text: "Ekonomik dalgalanma! Sarı kareye bastığınız için 100 SBP ceza ödediniz.",
          icon: "error",
          confirmButtonColor: "#b91c1c",
        });
        t.sbp -= 100;
      } else if (activeFlashEvent.id === "bilim" && sq.unit === 6) {
        aiAuto(true);
        await Swal.fire({
          title: "Flash Haber Bonusu!",
          text: "Bilim Şenliği! Mor kareye bastığınız için +150 SBP kazandınız.",
          icon: "success",
          confirmButtonColor: "#6d28d9",
        });
        t.sbp += 150;
      } else if (activeFlashEvent.id === "iklim" && sq.unit === 2) {
        aiAuto(true);
        await Swal.fire({
          title: "Flash Haber Bonusu!",
          text: "İklim Zirvesi! Yeşil kareye bastığınız için fazladan +1 Doğa Dostu Rozeti kazandınız.",
          icon: "success",
          confirmButtonColor: "#15803d",
        });
        t.badges += 1;
      } else if (activeFlashEvent.id === "baris" && sq.unit === 4) {
        aiAuto(true);
        await Swal.fire({
          title: "Flash Haber Bonusu!",
          text: "Barış Günü! Kırmızı kareye bastığınız için fazladan +200 SBP kazandınız.",
          icon: "success",
          confirmButtonColor: "#e11d48",
        });
        t.sbp += 200;
      }
      updateActiveUI();
    }

    // ---- MÜLK SİSTEMİ ----
    if (sq.owner === null || sq.owner === undefined) {
      // SAHİPSİZ MÜLK: doğru cevaplayan takım satın alma hakkı kazanır
      const q = getRandomQuestion(sq.unit);
      activeQuestionMode = true;
      currentCorrectAns = q.ans;
      pendingUnitSq = sq;

      let html = `${preamble}<div style="background:${sq.color}; color:white; padding:1vmin; font-size:2vmin; font-weight:800; border-radius:1vmin; margin-bottom:1vmin;"><i class="fas fa-map-marker-alt"></i> SAHİPSİZ MÜLK: ${sq.title}</div>`;
      html += `<div style="font-size:1.7vmin; color:#cbd5e1; margin-bottom:1.5vmin;">Fiyat: <b style="color:#fbbf24;">${sq.price} SBP</b> &nbsp;•&nbsp; Doğru cevapla, satın alma hakkı kazan!</div>`;
      html += `<p style="font-size:2.5vmin; font-weight:700; margin-bottom:2vmin;">${safeQuestionHtml(q.q)}</p>`;
      q.opts.forEach((opt, idx) => {
        html += `<button class="opt-btn" id="q-opt-${idx}" data-action="answer-unit" data-selected="${idx}" data-correct="${q.ans}">${safeQuestionHtml(opt)}</button>`;
      });
      if (teams[currentTurn].id === 2 && teams[currentTurn].powerReady) {
        html += `<br><button id="btn-ara-power" data-action="team-power" data-team-id="2" style="margin-top:2vmin; background:#a855f7; color:white; border:none; padding:1vmin 2vmin; font-size:1.8vmin; border-radius:1vmin; font-weight:bold; cursor:pointer; box-shadow:0 0.5vmin 1vmin rgba(0,0,0,0.3);"><i class="fas fa-search"></i> Araştırmacılar Süper Gücünü (İpucu) Kullan!</button>`;
      }
      html += `<div id="q-result" style="margin-top:2vmin; height:3vmin; font-size:2.5vmin; font-weight:800;"></div>`;
      showMsgModal(html);

      if (activeJoker5050 && activeJoker5050.teamId === teams[currentTurn].id) {
        apply5050Joker();
        activeJoker5050 = false;
      }
    } else if (sq.owner === t.id) {
      // KENDİ MÜLKÜN: bina geliştir
      showOwnPropertyModal(sq, preamble);
    } else {
      // BAŞKASININ MÜLKÜ: Diplomatik Muafiyet kontrolü
      if (t.diplomaticImmunity) {
        t.diplomaticImmunity = false;
        aiAuto(true);
        Swal.fire({
          title: "Diplomatik Muafiyet 🤝",
          text: `${t.name} takımı diplomatik ayrıcalığını kullanarak bu mülkte kira ödemekten muaf tutuldu!`,
          icon: "success",
        }).then(() => {
          nextTurn();
        });
      } else {
        showRentModal(sq, preamble);
      }
    }
  }
}

// ---- MÜLK İŞLEM FONKSİYONLARI ----
let pendingUnitSq = null;

function answerUnitQ(btn, selected, correct) {
  activeQuestionMode = false;
  const btns = document.querySelectorAll(".opt-btn");
  btns.forEach((b) => (b.disabled = true));
  let btnAra = document.getElementById("btn-ara-power");
  if (btnAra) btnAra.style.display = "none";

  let t = teams[currentTurn];
  let res = document.getElementById("q-result");
  let sq = pendingUnitSq;

  if (selected === correct) {
    btn.classList.add("correct");
    t.sbp += 50; // bilgi bonusu
    confetti({ particleCount: 120 });
    if (res)
      res.innerHTML = `<span style="color:#16a34a"><i class="fas fa-check"></i> Doğru! +50 SBP — Satın alma hakkı!</span>`;
    updateActiveUI();
    gameTimeout(() => offerBuy(sq), 1400);
  } else {
    btn.classList.add("wrong");
    let cBtn = document.getElementById(`q-opt-${correct}`);
    if (cBtn) cBtn.classList.add("correct");
    t.sbp -= 50;
    if (res)
      res.innerHTML = `<span style="color:#ef4444"><i class="fas fa-times"></i> Yanlış! -50 SBP. Mülk sahipsiz kaldı.</span>`;
    updateActiveUI();
    pendingUnitSq = null;
    gameTimeout(nextTurn, 2200);
  }
}

async function offerBuy(sq) {
  let t = teams[currentTurn];
  pendingUnitSq = null;
  if (t.sbp < sq.price) {
    aiAuto(true);
    await Swal.fire({
      title: "Yetersiz SBP",
      text: `${sq.title} mülkünü almak için ${sq.price} SBP gerekiyor ama yeterli puanın yok.`,
      icon: "warning",
    });
    nextTurn();
    return;
  }
  // AI stratejisi: en az 150 SBP rezerv kalıyorsa satın al
  aiAuto(t.sbp - sq.price >= 150);
  const r = await Swal.fire({
    title: `${sq.title}`,
    html: `Bu mülkü <b>${sq.price} SBP</b> karşılığında satın almak ister misin?<br><small style="color:#64748b">Temel kira: ${sq.baseRent} SBP</small>`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Satın Al",
    cancelButtonText: "Vazgeç",
    confirmButtonColor: "#16a34a",
  });
  if (r.isConfirmed) {
    t.sbp -= sq.price;
    sq.owner = t.id;
    refreshSquareVisual(sq.id);
    updateActiveUI();
    confetti({ particleCount: 150, colors: ["#16a34a", "#fbbf24"] });
    if (ownsFullSet(t.id, sq.unit)) {
      aiAuto(true);
      await Swal.fire({
        title: "ÜNİTE TEKELİ!",
        html: `${escapeHtml(t.name)} bu ünitenin tüm mülklerine sahip oldu! Kiralar artık <b>2 katı</b> ve bina inşa edebilirsin.`,
        icon: "success",
        confirmButtonColor: "#fbbf24",
      });
    } else {
      aiAuto(true);
      await Swal.fire({
        title: "Satın Alındı",
        text: `${sq.title} artık ${t.name} takımının!`,
        icon: "success",
        confirmButtonColor: "#16a34a",
      });
    }
  }
  nextTurn();
}

async function showOwnPropertyModal(sq, preamble) {
  let t = teams[currentTurn];
  let canBuild = ownsFullSet(t.id, sq.unit) && sq.buildLevel < 3;
  let cost = sq.buildCost * (sq.buildLevel + 1);
  let infoLine = `Mevcut yapı: <b>${buildingNames[sq.buildLevel]}</b> • Şu anki kira: <b>${calcRent(sq)} SBP</b>`;
  let body;
  if (sq.buildLevel >= 3) {
    body = `${infoLine}<br><br>Bu mülk en üst seviyede (Üniversite). Daha fazla geliştirilemez.`;
  } else if (!ownsFullSet(t.id, sq.unit)) {
    body = `${infoLine}<br><br>Bina inşa etmek için bu ünitenin <b>tüm mülklerine</b> sahip olmalısın (ünite tekeli).`;
  } else {
    body = `${infoLine}<br><br><b>${buildingNames[sq.buildLevel + 1]}</b> inşa et: <b style="color:#fbbf24">${cost} SBP</b><br>Yeni kira tahmini: <b>${Math.round(sq.baseRent * (sq.buildLevel + 2) * 2)} SBP</b>`;
  }
  // AI: tekel varsa ve rezerv kalıyorsa bina kur, değilse 'Tamam'ı onayla
  aiAuto(canBuild ? t.sbp - cost >= 150 : true);
  const r = await Swal.fire({
    title: `Mülkün: ${sq.title}`,
    html: body,
    icon: "info",
    showCancelButton: canBuild,
    confirmButtonText: canBuild ? "İnşa Et" : "Tamam",
    cancelButtonText: "Vazgeç",
    confirmButtonColor: "#7c3aed",
  });
  if (canBuild && r.isConfirmed) {
    if (t.sbp < cost) {
      aiAuto(true);
      await Swal.fire({
        title: "Yetersiz SBP",
        text: `İnşaat için ${cost} SBP gerekiyor.`,
        icon: "warning",
      });
    } else {
      t.sbp -= cost;
      sq.buildLevel++;
      refreshSquareVisual(sq.id);
      updateActiveUI();
      confetti({ particleCount: 150, colors: ["#7c3aed", "#fbbf24"] });
      aiAuto(true);
      await Swal.fire({
        title: "İnşa Edildi!",
        html: `${sq.title} üzerinde <b>${buildingNames[sq.buildLevel]}</b> kuruldu! Yeni kira: <b>${calcRent(sq)} SBP</b>`,
        icon: "success",
        confirmButtonColor: "#7c3aed",
      });
    }
  }
  nextTurn();
}

async function showRentModal(sq, preamble) {
  let t = teams[currentTurn];
  let owner = teamById(sq.owner);
  let rent = calcRent(sq);
  let setNote = ownsFullSet(sq.owner, sq.unit)
    ? " (Ünite Tekeli: 2x kira!)"
    : "";
  aiAuto(true);
  await Swal.fire({
    title: `${owner.name} Mülkü`,
    html: `<b>${escapeHtml(sq.title)}</b> mülküne geldin.<br>Yapı: ${buildingNames[sq.buildLevel]}${setNote}<br><br>Ödenecek kira: <b style="color:#ef4444">${rent} SBP</b>`,
    icon: "warning",
    confirmButtonText: "Kirayı Öde",
    confirmButtonColor: "#ef4444",
  });
  payRent(sq, rent);
}

async function payRent(sq, rent) {
  let t = teams[currentTurn];
  let owner = teamById(sq.owner);
  t.sbp -= rent;
  owner.sbp += rent;
  updateActiveUI();
  await Swal.fire({
    title: "Kira Ödendi",
    html: `${escapeHtml(t.name)} → ${escapeHtml(owner.name)}: <b>${rent} SBP</b>`,
    icon: "info",
    timer: 1600,
    showConfirmButton: false,
  });
  nextTurn();
}

function showMsgModal(html) {
  document.getElementById("game-modal-content").innerHTML = `
      <i class="fas fa-volume-up" aria-hidden="true" style="position:absolute; top:2vmin; left:2vmin; font-size:2vmin; color:#475569; cursor:pointer;"></i>
      ${html}
    `;
  document.getElementById("game-overlay").style.display = "flex";
  // Erişilebilirlik: insan sırasıysa odağı ilk şıkka/modala taşı
  if (!isAITurn()) {
    const firstOpt = document.querySelector("#game-modal-content .opt-btn");
    (firstOpt || document.getElementById("game-modal-content")).focus();
  }
  aiHandleOverlay(); // bot sırasıysa soruyu/butonu otomatik işle
}

let isTemaQuestion = false;

function answerQ(btn, selected, correct) {
  activeQuestionMode = false;
  const btns = document.querySelectorAll(".opt-btn");
  btns.forEach((b) => (b.disabled = true));
  let btnAra = document.getElementById("btn-ara-power");
  if (btnAra) btnAra.style.display = "none";

  let t = teams[currentTurn];
  let res = document.getElementById("q-result");

  if (selected === correct) {
    btn.classList.add("correct");
    if (isTemaQuestion) {
      t.badges += 1;
      if (res)
        res.innerHTML = `<span style="color:#10b981"><i class="fas fa-check"></i> Doğru! +1 Doğa Dostu Rozeti!</span>`;
    } else {
      t.sbp += 100;
      if (res)
        res.innerHTML = `<span style="color:#16a34a"><i class="fas fa-check"></i> Doğru! +100 SBP</span>`;
    }
    confetti({ particleCount: 150 });
  } else {
    btn.classList.add("wrong");
    let cBtn = document.getElementById(`q-opt-${correct}`);
    if (cBtn) cBtn.classList.add("correct");
    if (isTemaQuestion) {
      if (res)
        res.innerHTML = `<span style="color:#ef4444"><i class="fas fa-times"></i> Yanlış! Rozet kazanılamadı.</span>`;
    } else {
      t.sbp -= 50;
      if (res)
        res.innerHTML = `<span style="color:#ef4444"><i class="fas fa-times"></i> Yanlış! -50 SBP</span>`;
    }
  }
  updateActiveUI();
  isTemaQuestion = false;
  gameTimeout(nextTurn, 2500);
}

function nextTurn() {
  document.getElementById("game-overlay").style.display = "none";

  if (!teams.length) return;

  currentTurn = (currentTurn + 1) % teams.length;

  updateActiveUI();
  document.getElementById("btn-roll").style.opacity = "1";
  document.getElementById("btn-roll").disabled = false;
  isRolling = false;
  saveGame(); // her tur sonunda otomatik kaydet
  maybeAITurn(); // yeni sıra bir bot takımındaysa otomatik oyna
}

function useTeamPower(teamId) {
  let t = teams.find((x) => x.id === teamId);
  if (!t) return;

  if (!t.powerReady) {
    Swal.fire({
      title: "Uyarı",
      text: `${t.name} takımı süper gücünü yarışmada sadece 1 kez kullanabilir ve bu hak önceden kullanıldı!`,
      icon: "warning",
    });
    return;
  }
  if (teams[currentTurn].id !== teamId) {
    Swal.fire({
      title: "Uyarı",
      text: "Sadece kendi sıranızda süper gücünüzü kullanabilirsiniz!",
      icon: "warning",
    });
    return;
  }
  if (teamId !== 2 && (isRolling || activeQuestionMode || turnUiBusy())) {
    Swal.fire({
      title: "Önce sıranı tamamla",
      text: "Bu süper güç yalnızca devam eden bir hamle veya soru yokken kullanılabilir.",
      icon: "warning",
    });
    return;
  }

  if (teamId === 0) {
    // Kaşifler
    Swal.fire({
      title: "Pusulanı Ayarla 🧭",
      text: "Kaşifler süper gücü ile 1-6 kare arasında gitmek istediğin tam adımı seç:",
      icon: "question",
      showCancelButton: true,
      cancelButtonText: "İptal",
      confirmButtonText: "İlerle",
      input: "select",
      inputOptions: {
        1: "1 Kare İleri",
        2: "2 Kare İleri",
        3: "3 Kare İleri",
        4: "4 Kare İleri",
        5: "5 Kare İleri",
        6: "6 Kare İleri",
      },
      inputValue: "3",
    }).then((result) => {
      if (result.isConfirmed) {
        const steps = parseInt(result.value);
        t.powerReady = false;
        markTurnInProgress();

        // dim superpower box
        let cards = document.querySelectorAll(".team-card");
        cards.forEach((card) => {
          if (parseInt(card.getAttribute("data-team")) === 1) {
            card.querySelector(".super-power-box").style.opacity = "0.5";
          }
        });

        Swal.fire({
          title: "Keşif Başladı!",
          text: `${steps} kare ileri keşfe çıkıyorsunuz!`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        saveGame();
        movePlayer(steps);
      }
    });
    return;
  } else if (teamId === 1) {
    // Girişimciler
    t.sbp += 250;
    Swal.fire({
      title: "Girişimci Teşviki 🪙",
      text: "Girişimciler süper gücü aktif! Kasadan anında +250 SBP yatırım desteği eklendi.",
      icon: "success",
    });
    confetti({
      particleCount: 100,
      spread: 80,
      colors: ["#eab308", "#ffffff"],
    });
  } else if (teamId === 2) {
    // Araştırmacılar
    if (!activeQuestionMode) {
      Swal.fire({
        title: "Uyarı",
        text: "Araştırmacılar süper gücünü (Akademik Çözüm) SADECE ekranda takımınıza ait bir soru açıkken (cevaplamadan önce) kullanabilirsiniz!",
        icon: "warning",
      });
      return;
    }

    const btns = document.querySelectorAll(".opt-btn");
    const correctBtn = document.getElementById("q-opt-" + currentCorrectAns);
    if (btns.length > 0 && btns[0].disabled) {
      Swal.fire({
        title: "Uyarı",
        text: "Soruyu zaten cevapladınız! Akademik Çözüm yeteneği kullanılamaz.",
        icon: "warning",
      });
      return;
    }
    if (!correctBtn) {
      Swal.fire({
        title: "Uyarı",
        text: "Akademik Çözüm yalnızca normal ders sorularında kullanılabilir.",
        icon: "warning",
      });
      return;
    }

    t.powerReady = false;
    // Dim superpower box
    let cards = document.querySelectorAll(".team-card");
    cards.forEach((card) => {
      if (parseInt(card.getAttribute("data-team")) === 3) {
        card.querySelector(".super-power-box").style.opacity = "0.5";
      }
    });

    t.sbp += 100; // Akademik Hibe
    saveGame();

    Swal.fire({
      title: "Akademik Çözüm 🔬",
      text: "Araştırmacılar süper gücü aktif! Doğru cevap otomatik işaretlendi ve +100 SBP akademik araştırma desteği kazandınız!",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });

    correctBtn.click();

    let btnAra = document.getElementById("btn-ara-power");
    if (btnAra) btnAra.style.display = "none";
    updateActiveUI();
    return;
  } else if (teamId === 3) {
    // Diplomatlar
    t.diplomaticImmunity = true;
    Swal.fire({
      title: "Diplomatik Muafiyet 🤝",
      text: "Diplomatlar süper gücü aktif! Diplomatik dokunulmazlık kazandınız. Rakip mülklerine geldiğinizde ödeyeceğiniz ilk kira muaf sayılacaktır!",
      icon: "success",
    });
  }

  t.powerReady = false;
  // Dim the superpower box
  let cards = document.querySelectorAll(".team-card");
  cards.forEach((card) => {
    if (parseInt(card.getAttribute("data-team")) === teamId + 1) {
      card.querySelector(".super-power-box").style.opacity = "0.5";
    }
  });
  updateActiveUI();
  saveGame();
}

function goBackToMenu() {
  if (
    !confirm(
      "Oyundan çıkıp ana menüye dönmek istediğinize emin misiniz? Oyun sıfırlanacaktır.",
    )
  )
    return;
  beginGameSession();
  clearSave();

  timeLeft = GAME_DURATION_SECONDS;
  document.getElementById("display-time").innerText = "25:00";
  document.getElementById("display-time").style.color = "";

  // Takımları sıfırla
  resetBaseTeams();
  teams = [];
  currentTurn = 0;
  activeQuestionMode = false;
  activeJoker5050 = false;
  activeFlashEvent = null;

  // Tüm ünitelerin kullanılmış soru listelerini sıfırla
  for (let k in usedQuestions) usedQuestions[k] = [];
  usedFinalQuestions = [];

  // Overlay kapat
  document.getElementById("game-overlay").style.display = "none";

  // Tüm kartları ve piyonları tekrar görünür yap
  for (let i = 0; i < 4; i++) {
    let card = document.getElementById("tc-" + i);
    if (card) {
      card.style.display = "flex";
      card.classList.remove("active");
    }
    let sp = card ? card.querySelector(".super-power-box") : null;
    if (sp) sp.style.opacity = "1";
    let scoreEl = document.getElementById("score-" + i);
    if (scoreEl) scoreEl.innerText = "1500";
    let badgeEl = document.getElementById("badge-" + i);
    if (badgeEl) badgeEl.innerText = "Doğa Dostu Rozeti: 0";
  }

  // Ekranları değiştir
  document.getElementById("smartboard-frame").style.display = "none";
  document.getElementById("landing-screen").style.display = "flex";
  updateFinalAvailability();
}

// Timer logic
let timerInterval;
let flashInterval;
let timeLeft = GAME_DURATION_SECONDS;

function renderTimer() {
  const display = document.getElementById("display-time");
  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");
  display.innerText = `${minutes}:${seconds}`;
  display.style.color =
    timeLeft <= 60 ? (timeLeft % 2 === 0 ? "#ef4444" : "#fbbf24") : "";
  updateFinalAvailability();
}

function toggleTimer() {
  if (timerInterval) {
    clearGameInterval(timerInterval);
    timerInterval = null;
    saveGame();
  } else {
    if (timeLeft <= 0) return;
    timerInterval = gameInterval(() => {
      timeLeft--;
      renderTimer();
      if (timeLeft <= 0) {
        clearGameInterval(timerInterval);
        timerInterval = null;
        endGame();
      }
    }, 1000);
    saveGame();
  }
}

function endGame() {
  beginGameSession();
  clearSave(); // oyun bitti: kaydı sil
  timeLeft = 0;
  renderTimer();

  // Servet = SBP + mülk değeri + bina değeri + rozet bonusu
  teams.forEach((t) => {
    t.netWorth = teamNetWorth(t);
    t.propCount = teamPropCount(t);
  });
  // Takımları toplam servete göre sırala (eşitlikte SBP)
  let sorted = [...teams].sort((a, b) => {
    if (b.netWorth !== a.netWorth) return b.netWorth - a.netWorth;
    return b.sbp - a.sbp;
  });

  const pawnColors = { 0: "#10b981", 1: "#eab308", 2: "#a855f7", 3: "#3b82f6" };
  const medals = ["🏆", "🥈", "🥉", "4️⃣"];

  let html = `
                <div style="text-align:center; padding:3vmin;">
                    <div style="font-size:8vmin; margin-bottom:1vmin;">🏆</div>
                    <div style="font-size:4vmin; font-weight:900; color:#fbbf24; text-shadow:0 0.3vmin 0.8vmin rgba(251,191,36,0.5); margin-bottom:0.5vmin;">SÜRE DOLDU!</div>
                    <div style="font-size:2vmin; color:#94a3b8; margin-bottom:2vmin;">Oyun sona erdi. İşte sonuçlar:</div>

                    <div style="font-size:5vmin; font-weight:900; color:${pawnColors[sorted[0].id]}; text-shadow:0 0.3vmin 1vmin rgba(0,0,0,0.3); margin-bottom:0.5vmin;">
                        ${sorted[0].name}
                    </div>
                    <div style="font-size:2.2vmin; font-weight:700; color:#fde047; margin-bottom:2vmin;">🎉 ŞAMPİYON! 🎉</div>

                    <div style="display:flex; flex-direction:column; gap:1vmin; max-width:50vmin; margin:0 auto;">
                        `;

  sorted.forEach((t, i) => {
    let bg = i === 0 ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.05)";
    let border =
      i === 0
        ? "0.3vmin solid #fbbf24"
        : "0.15vmin solid rgba(255,255,255,0.1)";
    html += `
                        <div style="display:flex; align-items:center; gap:1.5vmin; background:${bg}; border:${border}; border-radius:1vmin; padding:1vmin 2vmin;">
                            <span style="font-size:3vmin;">${medals[i]}</span>
                            <div style="width:3.5vmin; height:3.5vmin; border-radius:50%; background:${pawnColors[t.id]}; display:flex; align-items:center; justify-content:center; border:0.2vmin solid white; box-shadow:0 0 0.8vmin ${pawnColors[t.id]};">
                                <i class="fas ${t.icon}" style="color:white; font-size:1.6vmin;"></i>
                            </div>
                            <div style="flex:1; text-align:left;">
                                <div style="font-weight:800; font-size:2vmin; color:white;">${t.name}</div>
                            </div>
                            <div style="text-align:right;">
                                <div style="font-weight:900; font-size:2.2vmin; color:#fbbf24;">${t.netWorth} <span style="font-size:1.3vmin;">Servet</span></div>
                                <div style="font-size:1.2vmin; color:#cbd5e1;">${t.sbp} SBP • <i class="fas fa-building"></i> ${t.propCount} mülk • <i class="fas fa-leaf"></i> ${t.badges}</div>
                            </div>
                        </div>
                        `;
  });

  html += `
                    </div>
                    <button data-action="go-menu" style="margin-top:3vmin; background:linear-gradient(135deg, #f59e0b, #d97706); color:white; border:none; padding:1.5vmin 4vmin; font-size:2.2vmin; font-weight:900; border-radius:1vmin; cursor:pointer; box-shadow:0 0.5vmin 1.5vmin rgba(0,0,0,0.3); text-transform:uppercase; letter-spacing:1px;">
                        <i class="fas fa-home" style="margin-right:0.5vmin;"></i> Ana Menüye Dön
                    </button>
                </div>
                `;

  showMsgModal(html);
  // Şampiyon konfetisi
  confetti({
    particleCount: 200,
    spread: 160,
    origin: { y: 0.6 },
    colors: [pawnColors[sorted[0].id], "#fbbf24", "#ffffff"],
  });
  gameTimeout(
    () =>
      confetti({ particleCount: 100, spread: 120, origin: { x: 0.2, y: 0.5 } }),
    500,
  );
  gameTimeout(
    () =>
      confetti({ particleCount: 100, spread: 120, origin: { x: 0.8, y: 0.5 } }),
    1000,
  );
}

let usedFinalQuestions = [];

function getRandomFinalQuestion() {
  if (usedFinalQuestions.length >= activeFinalPool.length) {
    // Reset if all are asked
    usedFinalQuestions = [];
  }

  let availableIndices = [];
  for (let i = 0; i < activeFinalPool.length; i++) {
    if (!usedFinalQuestions.includes(i)) {
      availableIndices.push(i);
    }
  }

  const randomIdx =
    availableIndices[Math.floor(Math.random() * availableIndices.length)];
  usedFinalQuestions.push(randomIdx);
  return activeFinalPool[randomIdx];
}

function checkFinal(btn, selected, correct) {
  const finalTeam = teams[currentTurn];
  if (!finalTeam) return;
  const btns = document.querySelectorAll("#game-modal-content .opt-btn");
  btns.forEach((b) => (b.disabled = true));
  if (selected === correct) {
    btn.style.background = "#10b981";
    btn.style.color = "white";
    confetti({
      particleCount: 500,
      spread: 200,
      colors: ["#fbbf24", "#f59e0b", "#10b981", "#3b82f6"],
    });
    gameTimeout(() => {
      Swal.fire({
        title: "MUHTEŞEM!",
        text: "Büyük Finali Kazandın! Takımına +1000 SBP ve 2 Rozet eklendi!",
        icon: "success",
      });
      finalTeam.sbp += 1000;
      finalTeam.badges += 2;
      updateActiveUI();
      closeFinal();
      saveGame();
    }, 1500);
  } else {
    btn.style.background = "#ef4444";
    btn.style.color = "white";
    gameTimeout(() => {
      Swal.fire({
        title: "Başarısız",
        text: "Maalesef yanlış cevap! Final kaybedildi.",
        icon: "error",
      });
      closeFinal();
      saveGame();
    }, 1500);
  }
}

function closeFinal() {
  activeQuestionMode = false;
  const overlay = document.getElementById("game-overlay");
  if (overlay) overlay.style.display = "none";
  updateFinalAvailability();
}

function updateFinalAvailability() {
  const finalCard = document.getElementById("final-challenge");
  if (!finalCard) return;
  const team = teams[currentTurn];
  const isAvailable =
    !!team &&
    timeLeft > 0 &&
    timeLeft <= FINAL_WINDOW_SECONDS &&
    !team.finalUsed &&
    !isRolling;
  finalCard.classList.toggle("locked", !isAvailable);
  finalCard.setAttribute("aria-disabled", isAvailable ? "false" : "true");
  if (!team) finalCard.title = "Oyun başladıktan sonra kullanılabilir.";
  else if (timeLeft > FINAL_WINDOW_SECONDS)
    finalCard.title = "Büyük Final son 3 dakikada açılır.";
  else if (team.finalUsed)
    finalCard.title = `${team.name} Büyük Final hakkını kullandı.`;
  else finalCard.title = `${team.name} Büyük Final hakkını kullanabilir.`;
}

function openFinal() {
  if (isRolling || activeQuestionMode) {
    Swal.fire({
      title: "Önce sıranı tamamla",
      text: "Büyük Final Kapışması sadece sıra beklerken açılabilir. Devam eden hamleni bitirdikten sonra tekrar dene.",
      icon: "warning",
      confirmButtonColor: "#fbbf24",
    });
    return;
  }
  const team = teams[currentTurn];
  if (!team) return;
  if (timeLeft <= 0 || timeLeft > FINAL_WINDOW_SECONDS) {
    Swal.fire({
      title: "Final henüz kilitli",
      text: "Büyük Final Kapışması oyunun yalnızca son 3 dakikasında açılır.",
      icon: "info",
      confirmButtonColor: "#fbbf24",
    });
    return;
  }
  if (team.finalUsed) {
    Swal.fire({
      title: "Final hakkı kullanıldı",
      text: `${team.name} takımı Büyük Final hakkını bu oyunda zaten kullandı.`,
      icon: "info",
      confirmButtonColor: "#fbbf24",
    });
    return;
  }
  let fq = getRandomFinalQuestion();
  team.finalUsed = true;
  activeQuestionMode = true;
  currentCorrectAns = fq.ans;
  saveGame();
  updateFinalAvailability();

  showMsgModal(`
                <h1 style="color:#fbbf24; text-transform:uppercase; text-shadow: 0 2px 4px rgba(0,0,0,0.5); margin-bottom: 2vmin;"><i class="fas fa-crown"></i> BÜYÜK FİNAL KAPIŞMASI</h1>
                <p style="font-size:2.5vmin; font-weight:700;">${safeQuestionHtml(fq.q)}</p>
                <div style="display:flex; flex-direction:column; gap:0.5vmin; margin-top:2vmin; align-items:center;">
                    <button class="opt-btn" data-action="answer-final" data-selected="0" data-correct="${fq.ans}">${safeQuestionHtml(fq.opts[0])}</button>
                    <button class="opt-btn" data-action="answer-final" data-selected="1" data-correct="${fq.ans}">${safeQuestionHtml(fq.opts[1])}</button>
                    <button class="opt-btn" data-action="answer-final" data-selected="2" data-correct="${fq.ans}">${safeQuestionHtml(fq.opts[2])}</button>
                    <button class="opt-btn" data-action="answer-final" data-selected="3" data-correct="${fq.ans}">${safeQuestionHtml(fq.opts[3])}</button>
                </div>
                <button class="primary-btn" style="margin-top:2vmin;" data-action="close-final">Vazgeç (hak kullanılır)</button>
                `);
}

function apply5050Joker() {
  const wrongIndices = [0, 1, 2, 3].filter((i) => i !== currentCorrectAns);
  wrongIndices.sort(() => Math.random() - 0.5); // shuffle
  const toRemove = wrongIndices.slice(0, 2);
  toRemove.forEach((idx) => {
    const btn = document.getElementById(`q-opt-${idx}`);
    if (btn) btn.style.visibility = "hidden";
  });
  confetti({ particleCount: 50, spread: 60, colors: ["#ca8a04", "#eab308"] });
}

function triggerNewFlashEvent() {
  activeFlashEvent =
    flashEvents[Math.floor(Math.random() * flashEvents.length)];
  const fc = document.getElementById("flash-card");
  fc.style.display = "block";
  fc.style.background = activeFlashEvent.bg;
  fc.style.borderColor = activeFlashEvent.border;
  document.getElementById("fc-title").style.background =
    activeFlashEvent.border;
  document.getElementById("fc-title").innerText = activeFlashEvent.title;
  document.getElementById("fc-text").innerText = activeFlashEvent.text;
  confetti({
    particleCount: 100,
    spread: 120,
    colors: [activeFlashEvent.border, "#ffffff"],
  });
}

function useJoker(type) {
  let t = teams[currentTurn];
  if (type === "5050") {
    t.usedJokers["5050"] = t.usedJokers["5050"] || 0;
    if (t.usedJokers["5050"] >= 2) {
      Swal.fire({
        title: "Uyarı",
        text: `${t.name} takımı %50 Joker haklarını bitirdi! (Maksimum 2 kullanım)`,
        icon: "warning",
      });
      return;
    }
    if (activeJoker5050 && activeJoker5050.teamId === t.id) {
      Swal.fire({
        title: "Bilgi",
        text: "Bu joker zaten aktif edildi! Karşınıza çıkacak ilk soruda otomatik kullanılacak.",
        icon: "info",
      });
      return;
    }
    activeJoker5050 = { teamId: t.id };
    t.usedJokers["5050"]++;
    Swal.fire({
      title: "Joker Aktif",
      text: `✓ ${t.name} için %50 Joker yeteneği HAZIRLANDI! Kalan Hak: ${2 - t.usedJokers["5050"]}`,
      icon: "success",
    });
  } else if (type === "hediye") {
    t.usedJokers["hediye"] = t.usedJokers["hediye"] || 0;
    if (t.usedJokers["hediye"] >= 2) {
      Swal.fire({
        title: "Uyarı",
        text: `${t.name} takımı Hediye SBP Joker haklarını bitirdi! (Maksimum 2 kullanım)`,
        icon: "warning",
      });
      return;
    }
    t.usedJokers["hediye"]++;
    t.sbp += 100;
    updateActiveUI();
    confetti({
      particleCount: 100,
      spread: 80,
      colors: ["#3b82f6", "#1e40af"],
    });
    Swal.fire({
      title: "Hediye SBP Jokeri",
      text: `${t.name} takımına 100 SBP hediye edildi! Kalan Hak: ${2 - t.usedJokers["hediye"]}`,
      icon: "success",
    });
  } else if (type === "diplomasi") {
    t.usedJokers["diplomasi"] = t.usedJokers["diplomasi"] || 0;
    if (t.usedJokers["diplomasi"] >= 2) {
      Swal.fire({
        title: "Uyarı",
        text: `${t.name} takımı Diplomasi Joker haklarını bitirdi! (Maksimum 2 kullanım)`,
        icon: "warning",
      });
      return;
    }
    t.usedJokers["diplomasi"]++;
    teams.forEach((team) => (team.sbp += 50));
    updateActiveUI();
    confetti({
      particleCount: 100,
      spread: 80,
      colors: ["#10b981", "#059669"],
    });
    Swal.fire({
      title: "Diplomasi Jokeri",
      text: `Tüm okul idaresi adına her takıma 50 SBP dağıtıldı! Kalan Hak: ${2 - t.usedJokers["diplomasi"]}`,
      icon: "success",
    });
  }
}

let activeQuestions = questions6;
let activeFinalPool = finalQuestionsPool6;
let usedQuestions = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
let currentGrade = "6";

function applyGrade(gradeVal) {
  currentGrade = gradeVal;
  if (gradeVal === "5") {
    activeQuestions = questions5;
    activeFinalPool = finalQuestionsPool5;
  } else if (gradeVal === "7") {
    activeQuestions = questions7;
    activeFinalPool = finalQuestionsPool7;
  } else if (gradeVal === "8") {
    activeQuestions = questions8;
    activeFinalPool = finalQuestionsPool8;
  } else {
    activeQuestions = questions6;
    activeFinalPool = finalQuestionsPool6;
  }
}

// ============ KAYDET / DEVAM ET (localStorage) ============
const SAVE_KEY = "sm_savegame_v1";
let saveWarningShown = false;

function integerInRange(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}

function validateSaveState(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  if (
    raw.schemaVersion !== undefined &&
    !integerInRange(raw.schemaVersion, 1, SAVE_SCHEMA_VERSION)
  )
    return null;
  const grade = String(raw.grade || "6");
  if (!["5", "6", "7", "8"].includes(grade)) return null;
  if (
    !Array.isArray(raw.teamIds) ||
    raw.teamIds.length < 2 ||
    raw.teamIds.length > 4
  )
    return null;
  const teamIds = raw.teamIds.slice();
  if (
    !teamIds.every((id) => integerInRange(id, 0, 3)) ||
    new Set(teamIds).size !== teamIds.length
  )
    return null;
  if (!Array.isArray(raw.teams) || raw.teams.length !== teamIds.length)
    return null;

  const normalizedTeams = [];
  for (const id of teamIds) {
    const saved = raw.teams.find((team) => team && team.id === id);
    if (!saved) return null;
    if (!integerInRange(saved.sbp, -100000, 10000000)) return null;
    if (!integerInRange(saved.badges, 0, 100000)) return null;
    if (!integerInRange(saved.pos, 0, 31)) return null;
    if (typeof saved.powerReady !== "boolean") return null;
    const jokers =
      saved.usedJokers && typeof saved.usedJokers === "object"
        ? saved.usedJokers
        : {};
    const usedJokers = {};
    for (const type of ["5050", "hediye", "diplomasi"]) {
      const count = jokers[type] ?? 0;
      if (!integerInRange(count, 0, 2)) return null;
      if (count > 0) usedJokers[type] = count;
    }
    normalizedTeams.push({
      id,
      sbp: saved.sbp,
      badges: saved.badges,
      pos: saved.pos,
      powerReady: saved.powerReady,
      usedJokers,
      diplomaticImmunity: saved.diplomaticImmunity === true,
      finalUsed: saved.finalUsed === true,
    });
  }

  if (!integerInRange(raw.currentTurn, 0, teamIds.length - 1)) return null;
  if (!integerInRange(raw.timeLeft, 0, GAME_DURATION_SECONDS)) return null;
  const aiTeamIds = Array.isArray(raw.aiTeamIds)
    ? [...new Set(raw.aiTeamIds.filter((id) => teamIds.includes(id)))]
    : [];
  const aiAccuracy =
    typeof raw.aiAccuracy === "number" &&
    raw.aiAccuracy >= 0 &&
    raw.aiAccuracy <= 1
      ? raw.aiAccuracy
      : 0.6;

  const board = {};
  if (
    raw.board !== undefined &&
    (!raw.board || typeof raw.board !== "object" || Array.isArray(raw.board))
  )
    return null;
  for (const [idText, savedSquare] of Object.entries(raw.board || {})) {
    const id = Number(idText);
    if (
      !integerInRange(id, 0, 31) ||
      [0, 5, 7, 10, 14, 15, 16, 21, 25, 26, 28].includes(id) ||
      !savedSquare ||
      typeof savedSquare !== "object"
    )
      return null;
    const owner = savedSquare.owner === null ? null : savedSquare.owner;
    if (owner !== null && !teamIds.includes(owner)) return null;
    if (!integerInRange(savedSquare.buildLevel, 0, 3)) return null;
    if (savedSquare.buildLevel > 0 && owner === null) return null;
    board[id] = { owner, buildLevel: savedSquare.buildLevel };
  }

  const normalizedUsedQuestions = {};
  for (let unit = 1; unit <= 6; unit++) {
    const values =
      raw.usedQuestions && Array.isArray(raw.usedQuestions[unit])
        ? raw.usedQuestions[unit]
        : [];
    normalizedUsedQuestions[unit] = [
      ...new Set(
        values.filter((value) => Number.isInteger(value) && value >= 0),
      ),
    ];
  }
  const normalizedFinalQuestions = Array.isArray(raw.usedFinalQuestions)
    ? [
        ...new Set(
          raw.usedFinalQuestions.filter(
            (value) => Number.isInteger(value) && value >= 0,
          ),
        ),
      ]
    : [];
  const pendingJokerTeamId = raw.activeJoker5050 && raw.activeJoker5050.teamId;

  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    grade,
    aiTeamIds,
    aiAccuracy,
    teamIds,
    currentTurn: raw.currentTurn,
    timeLeft: raw.timeLeft,
    timerRunning: raw.timerRunning !== false,
    teams: normalizedTeams,
    board,
    usedQuestions: normalizedUsedQuestions,
    usedFinalQuestions: normalizedFinalQuestions,
    activeJoker5050: teamIds.includes(pendingJokerTeamId)
      ? { teamId: pendingJokerTeamId }
      : false,
  };
}

function saveGame() {
  try {
    if (!teams || teams.length === 0) return;
    const board = {};
    boardData.forEach((sq) => {
      if (
        sq.type === "unit" &&
        ((sq.owner !== null && sq.owner !== undefined) || sq.buildLevel > 0)
      ) {
        board[sq.id] = {
          owner: sq.owner ?? null,
          buildLevel: sq.buildLevel || 0,
        };
      }
    });
    const state = {
      schemaVersion: SAVE_SCHEMA_VERSION,
      grade: currentGrade,
      aiTeamIds: [...AI_TEAM_IDS],
      aiAccuracy,
      teamIds: teams.map((t) => t.id),
      currentTurn,
      timeLeft,
      timerRunning: !!timerInterval,
      activeJoker5050: activeJoker5050 || false,
      usedQuestions: Object.fromEntries(
        Object.entries(usedQuestions).map(([unit, values]) => [
          unit,
          [...values],
        ]),
      ),
      usedFinalQuestions: [...usedFinalQuestions],
      teams: teams.map((t) => ({
        id: t.id,
        sbp: t.sbp,
        badges: t.badges,
        pos: t.pos,
        powerReady: t.powerReady,
        usedJokers: t.usedJokers || {},
        diplomaticImmunity: t.diplomaticImmunity || false,
        finalUsed: t.finalUsed || false,
      })),
      board,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    saveWarningShown = false;
  } catch (error) {
    console.error("Oyun kaydedilemedi:", error);
    if (!saveWarningShown && window.Swal) {
      saveWarningShown = true;
      Swal.fire({
        toast: true,
        position: "top-end",
        title: "Oyun kaydedilemedi",
        text: "Cihaz depolaması kullanılamıyor. Bu oturumda ilerleme korunmayabilir.",
        icon: "warning",
        timer: 4500,
        showConfirmButton: false,
      });
    }
  }
}

function hasSave() {
  try {
    return !!validateSaveState(JSON.parse(localStorage.getItem(SAVE_KEY)));
  } catch (e) {
    return false;
  }
}

function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {}
  const btn = document.getElementById("btn-resume");
  if (btn) btn.style.display = "none";
}

function loadGame() {
  let parsed;
  try {
    parsed = JSON.parse(localStorage.getItem(SAVE_KEY));
  } catch (e) {
    parsed = null;
  }
  if (!parsed) {
    Swal.fire({
      title: "Kayıt yok",
      text: "Devam edilecek kayıtlı oyun bulunamadı.",
      icon: "info",
    });
    return;
  }
  const state = validateSaveState(parsed);
  if (!state) {
    Swal.fire({
      title: "Kayıt açılamadı",
      text: "Kayıt dosyası eksik, bozuk veya desteklenmeyen değerler içeriyor. Yeni oyun başlatabilirsiniz.",
      icon: "error",
    });
    return;
  }

  beginGameSession();

  applyGrade(state.grade);

  // AI yapilandirmasini geri yukle (devam et)
  AI_TEAM_IDS = new Set(state.aiTeamIds);
  aiActive = AI_TEAM_IDS.size > 0;
  aiAccuracy = state.aiAccuracy;
  activeJoker5050 = state.activeJoker5050;
  for (let k in usedQuestions) {
    usedQuestions[k] = state.usedQuestions[k].filter(
      (index) => index < activeQuestions[k].length,
    );
  }
  usedFinalQuestions = state.usedFinalQuestions.filter(
    (index) => index < activeFinalPool.length,
  );

  // Takımları kur
  resetBaseTeams();
  teams = state.teamIds.map((id) => baseTeams[id]);
  state.teams.forEach((s) => {
    const bt = baseTeams[s.id];
    bt.sbp = s.sbp;
    bt.badges = s.badges;
    bt.pos = s.pos;
    bt.powerReady = s.powerReady;
    bt.usedJokers = s.usedJokers || {};
    bt.diplomaticImmunity = s.diplomaticImmunity || false;
    bt.finalUsed = s.finalUsed || false;
  });
  currentTurn = state.currentTurn;
  timeLeft = state.timeLeft;

  // Kullanılmayan kartları gizle
  for (let i = 0; i < 4; i++) {
    let card = document.getElementById(`tc-${i}`);
    if (card) card.style.display = state.teamIds.includes(i) ? "flex" : "none";
  }

  document.getElementById("landing-screen").style.display = "none";
  document.getElementById("smartboard-frame").style.display = "flex";
  renderBoard();

  // Mülk sahipliği ve binaları geri yükle
  Object.keys(state.board || {}).forEach((id) => {
    const sq = boardData.find((s) => s.id == id);
    if (sq) {
      sq.owner = state.board[id].owner;
      sq.buildLevel = state.board[id].buildLevel;
      refreshSquareVisual(sq.id);
    }
  });

  // Süper güç kutularının görünümü
  for (let i = 0; i < 4; i++) {
    let card = document.getElementById("tc-" + i);
    let sp = card ? card.querySelector(".super-power-box") : null;
    if (sp) sp.style.opacity = baseTeams[i].powerReady ? "1" : "0.5";
  }

  let m = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  let s = (timeLeft % 60).toString().padStart(2, "0");
  document.getElementById("display-time").innerText = `${m}:${s}`;

  updateActiveUI();
  updatePawnPositions();
  if (state.timerRunning && timeLeft > 0) toggleTimer();
  triggerNewFlashEvent();
  flashInterval = gameInterval(triggerNewFlashEvent, 3 * 60 * 1000);
  maybeAITurn(); // devam edilen turda bot varsa otomatik oyna
}

// ============ TAM OTOMATİK AI RAKİP MOTORU ============
let AI_TEAM_IDS = new Set();
let aiActive = false;
let aiAccuracy = 0.6; // soruyu doğru cevaplama olasılığı
const AI_DELAY = 950; // hamleler arası gecikme (ms) - izlenebilir olsun

function isAITurn() {
  return (
    aiActive && teams[currentTurn] && AI_TEAM_IDS.has(teams[currentTurn].id)
  );
}

// Açık bir SweetAlert için otomatik onay/iptal zamanla
function aiAuto(confirmIt) {
  if (!isAITurn()) return;
  gameTimeout(() => {
    try {
      if (Swal.isVisible()) {
        confirmIt ? Swal.clickConfirm() : Swal.clickCancel();
      }
    } catch (e) {
      /* yoksay */
    }
  }, AI_DELAY);
}

// Overlay sorusunu veya "Sırayı Sal" butonunu otomatik işle
function aiHandleOverlay() {
  if (!isAITurn()) return;
  gameTimeout(() => {
    if (!isAITurn()) return;
    const content = document.getElementById("game-modal-content");
    const overlay = document.getElementById("game-overlay");
    if (!content || !overlay || overlay.style.display === "none") return;
    const opts = content.querySelectorAll(".opt-btn");
    if (opts.length && activeQuestionMode) {
      if (opts[0].disabled) return; // zaten cevaplandı
      let idx;
      if (Math.random() < aiAccuracy) {
        idx = currentCorrectAns;
      } else {
        do {
          idx = Math.floor(Math.random() * opts.length);
        } while (idx === currentCorrectAns && opts.length > 1);
      }
      if (opts[idx]) opts[idx].click();
    } else {
      const adv = content.querySelector(".primary-btn");
      if (adv) adv.click();
    }
  }, AI_DELAY + 400);
}

// Sıra bir AI takımındaysa otomatik zar at
function maybeAITurn() {
  if (!isAITurn()) return;
  gameTimeout(() => {
    if (isAITurn() && !isRolling) rollDice();
  }, AI_DELAY);
}

function startGame() {
  let gradeRadio = document.querySelector('input[name="grade-radio"]:checked');
  let gradeVal = gradeRadio ? gradeRadio.value : "6";

  // AI takımlarını ve zorluğu oku
  AI_TEAM_IDS = new Set();
  [0, 1, 2, 3].forEach((i) => {
    const cb = document.getElementById("ai-team-" + i);
    if (cb && cb.checked) AI_TEAM_IDS.add(i);
  });
  let diffEl = document.querySelector('input[name="ai-diff"]:checked');
  let diff = diffEl ? diffEl.value : "normal";
  aiAccuracy = diff === "easy" ? 0.4 : diff === "hard" ? 0.8 : 0.6;
  aiActive = AI_TEAM_IDS.size > 0;

  let selectedIds = [];
  if (document.getElementById("chk-team-0").checked) selectedIds.push(0);
  if (document.getElementById("chk-team-1").checked) selectedIds.push(1);
  if (document.getElementById("chk-team-2").checked) selectedIds.push(2);
  if (document.getElementById("chk-team-3").checked) selectedIds.push(3);

  if (selectedIds.length < 2) {
    Swal.fire({
      title: "Hata",
      text: "Oyuna başlamak için en az 2 takım seçmelisiniz!",
      icon: "error",
    });
    return;
  }

  beginGameSession();
  clearSave(); // doğrulama geçtikten sonra eski kaydı sil
  resetBaseTeams();
  applyGrade(gradeVal);
  currentTurn = 0;
  timeLeft = GAME_DURATION_SECONDS;
  activeJoker5050 = false;
  activeFlashEvent = null;
  usedFinalQuestions = [];
  for (let unit in usedQuestions) usedQuestions[unit] = [];

  // AI sadece oyuna katılan takımlar için geçerli
  AI_TEAM_IDS = new Set(
    [...AI_TEAM_IDS].filter((id) => selectedIds.includes(id)),
  );
  aiActive = AI_TEAM_IDS.size > 0;

  teams = selectedIds.map((id) => baseTeams[id]);
  renderTimer();

  // Hide unused team cards based on slice
  for (let i = 0; i < 4; i++) {
    let card = document.getElementById(`tc-${i}`);
    if (card) {
      if (selectedIds.includes(i)) {
        card.style.display = "flex"; // normal view
      } else {
        card.style.display = "none"; // hide
        // Also hide pawn indicator starting on square 0 if they're not playing
        let p = document.getElementById(`logic-pawn-${i}`);
        if (p) p.style.display = "none";
      }
    }
  }

  document.getElementById("landing-screen").style.display = "none";
  document.getElementById("smartboard-frame").style.display = "flex";
  renderBoard();
  toggleTimer(); // Start the timer when the game starts

  // start flash events every 3 mins
  triggerNewFlashEvent();
  if (flashInterval) {
    clearGameInterval(flashInterval);
  }
  flashInterval = gameInterval(triggerNewFlashEvent, 3 * 60 * 1000);

  saveGame();
  maybeAITurn(); // ilk sıra bir bot takımındaysa otomatik başlat
}

function showHowTo() {
  Swal.fire({
    title: "Nasıl Oynanır?",
    width: "46em",
    html: `
                <div style="text-align:left; font-size:1.05em; line-height:1.6;">
                    <p><b>Amaç:</b> Süre dolduğunda en yüksek toplam servete (SBP + mülk + bina + rozet) sahip takım kazanır.</p>
                    <ol style="padding-left:1.2em; margin:0.5em 0;">
                        <li><b>Sıra sende:</b> "ZAR AT" butonuna bas, piyonun ilerlesin.</li>
                        <li><b>Boş mülk:</b> Soruyu doğru cevapla (+50 SBP) ve mülkü satın alabilirsin.</li>
                        <li><b>Senin mülkün:</b> Bir ünitenin tüm karelerine sahipsen (tekel) bina inşa edip kirayı artırırsın.</li>
                        <li><b>Rakip mülkü:</b> Üzerine gelince kirayı ödersin.</li>
                        <li><b>TEMA İstasyonu:</b> Doğru cevap = +1 Doğa Dostu Rozeti.</li>
                        <li><b>Şans / Disiplin / Okul Bahçesi:</b> SBP veya rozet kazanır ya da kaybedersin.</li>
                        <li><b>Süper Güç:</b> Her takımın oyunda 1 kez kullanabileceği özel bir yeteneği vardır.</li>
                    </ol>
                    <p style="margin-top:0.5em;"><b>İpucu:</b> Aynı renk ünitenin tüm mülklerini topla — kira <b>2 katına</b> çıkar!</p>
                </div>`,
    confirmButtonText: "Anladım, Hadi Başlayalım!",
    confirmButtonColor: "#16a34a",
  });
}

function handleAction(control) {
  const action = control.dataset.action;
  const number = (name) => Number(control.dataset[name]);
  switch (action) {
    case "start-game":
      startGame();
      break;
    case "show-how-to":
      showHowTo();
      break;
    case "load-game":
      loadGame();
      break;
    case "use-joker":
      useJoker(control.dataset.joker);
      break;
    case "team-power":
      useTeamPower(number("teamId"));
      break;
    case "toggle-timer":
      toggleTimer();
      break;
    case "roll-dice":
      rollDice();
      break;
    case "go-menu":
      goBackToMenu();
      break;
    case "close-flash":
      document.getElementById("flash-card").style.display = "none";
      break;
    case "open-final":
      openFinal();
      break;
    case "next-turn":
      if ("disabled" in control) control.disabled = true;
      nextTurn();
      break;
    case "answer-question":
      answerQ(control, number("selected"), number("correct"));
      break;
    case "answer-unit":
      answerUnitQ(control, number("selected"), number("correct"));
      break;
    case "answer-final":
      checkFinal(control, number("selected"), number("correct"));
      break;
    case "close-final":
      closeFinal();
      saveGame();
      break;
    default:
      break;
  }
}

document.addEventListener("click", (event) => {
  const control = event.target.closest("[data-action]");
  if (control) handleAction(control);
});

document.addEventListener("keydown", (event) => {
  const control = event.target.closest('[role="button"][data-action]');
  if (!control || (event.key !== "Enter" && event.key !== " ")) return;
  event.preventDefault();
  handleAction(control);
});

window.onload = () => {
  // Kayıtlı oyun varsa "Devam Et" butonunu göster
  if (hasSave()) {
    const btn = document.getElementById("btn-resume");
    if (btn) btn.style.display = "inline-flex";
  }
  updateFinalAvailability();
  // Not: İlk açılışta "Nasıl Oynanır" otomatik gösterilmiyor;
  // kullanıcı dilerse "Nasıl Oynanır?" butonundan açabilir.
};
window.addEventListener("resize", updatePawnPositions);

// PWA: Service Worker kaydı (offline destek)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .catch((error) => console.warn("Service Worker kaydedilemedi:", error));
  });
}
