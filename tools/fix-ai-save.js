// AI yapilandirmasini kayda ekler ve devam ederken geri yukler.
// Bug: saveGame AI ayarlarini kaydetmiyordu; loadGame geri yuklemiyor ve
// maybeAITurn cagirmiyordu -> "DEVAM ET" ile acilan oyunda AI oynamiyordu.
const fs = require('fs');
const path = require('path');
const idx = path.resolve(__dirname, '..', 'index.html');
let html = fs.readFileSync(idx, 'utf8');
const report = [];

function replaceOnce(find, repl, expected) {
  const count = html.split(find).length - 1;
  report.push(`${count === expected ? 'OK ' : '!! '}[${count}/${expected}] ${JSON.stringify(find.slice(0, 40))}`);
  if (count > 0) html = html.split(find).join(repl);
}
function replaceRe(re, repl, label) {
  const m = html.match(re);
  report.push(`${m ? 'OK ' : '!! '}[regex] ${label}`);
  if (m) html = html.replace(re, repl);
}

// 1) saveGame: AI alanlarini state'e ekle
replaceOnce(
  'grade: currentGrade,',
  'grade: currentGrade,\r\n                    aiTeamIds: [...AI_TEAM_IDS],\r\n                    aiActive,\r\n                    aiAccuracy,',
  1
);

// 2) loadGame: AI yapilandirmasini geri yukle
replaceOnce(
  "applyGrade(state.grade || '6');",
  "applyGrade(state.grade || '6');\r\n\r\n            // AI yapilandirmasini geri yukle (devam et)\r\n            AI_TEAM_IDS = new Set(Array.isArray(state.aiTeamIds) ? state.aiTeamIds : []);\r\n            aiActive = (typeof state.aiActive === 'boolean') ? state.aiActive : (AI_TEAM_IDS.size > 0);\r\n            if (typeof state.aiAccuracy === 'number') aiAccuracy = state.aiAccuracy;",
  1
);

// 3) loadGame sonunda: devam edilen sirada bot varsa otomatik oyna
replaceRe(
  /(setInterval\(triggerNewFlashEvent, 3 \* 60 \* 1000\);\r?\n)(\s*\}\r?\n\r?\n\s*\/\/ ============ TAM OTOMAT)/,
  '$1            maybeAITurn(); // devam edilen turda bot varsa otomatik oyna\r\n$2',
  'loadGame sonu maybeAITurn'
);

fs.writeFileSync(idx, html, 'utf8');
console.log(report.join('\n'));
