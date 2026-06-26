// XSS sertlestirme: escapeHtml yardimcisi ekler ve dinamik ad/baslik alanlarini
// (innerHTML ve Swal html: baglamlarinda) kacislar. Soru icerigine DOKUNMAZ.
// CRLF guvenli: dosyadaki gercek baytlar uzerinde string replace yapar.
const fs = require('fs');
const path = require('path');
const idx = path.resolve(__dirname, '..', 'index.html');
let html = fs.readFileSync(idx, 'utf8');

const report = [];
function replaceOnce(find, repl, expected) {
  const count = html.split(find).length - 1;
  report.push(`${expected === count ? 'OK ' : '!! '}[${count}/${expected}] ${find.slice(0, 50)}`);
  if (count > 0) html = html.split(find).join(repl);
}

// 1) escapeHtml yardimcisini ekle (let teams = []; satirindan sonra)
const helperAnchor = '        let teams = [];';
if (!html.includes('function escapeHtml(')) {
  const helper = helperAnchor +
    '\r\n\r\n' +
    "        // Guvenlik: dinamik metinleri (takim adi, kare basligi vb.) innerHTML'e\r\n" +
    '        // basmadan once HTML olarak kacislar. Soru icerigi <br> gibi kasitli HTML\r\n' +
    '        // icerdigi icin bilerek kacislanmaz.\r\n' +
    '        function escapeHtml(value) {\r\n' +
    "            if (value === null || value === undefined) return '';\r\n" +
    '            return String(value)\r\n' +
    "                .replace(/&/g, '&amp;')\r\n" +
    "                .replace(/</g, '&lt;')\r\n" +
    "                .replace(/>/g, '&gt;')\r\n" +
    '                .replace(/"/g, \'&quot;\')\r\n' +
    "                .replace(/'/g, '&#39;');\r\n" +
    '        }';
  replaceOnce(helperAnchor, helper, 1);
} else {
  report.push('escapeHtml zaten mevcut, eklenmedi');
}

// 2) Tahta karesi innerHTML sink'leri
replaceOnce('<div class="sq-title">${sq.title}</div>', '<div class="sq-title">${escapeHtml(sq.title)}</div>', 2);
replaceOnce('<div class="sq-title">${name}</div>', '<div class="sq-title">${escapeHtml(name)}</div>', 1);
replaceOnce('<div class="sq-sub">${sq.sub}</div>', '<div class="sq-sub">${escapeHtml(sq.sub)}</div>', 1);

// 3) Swal html: baglamlarinda takim/mulk adlari
replaceOnce('${t.name} bu ünitenin', '${escapeHtml(t.name)} bu ünitenin', 1);
replaceOnce('`${t.name} → ${owner.name}:', '`${escapeHtml(t.name)} → ${escapeHtml(owner.name)}:', 1);
replaceOnce('<b>${sq.title}</b> mülküne geldin', '<b>${escapeHtml(sq.title)}</b> mülküne geldin', 1);

fs.writeFileSync(idx, html, 'utf8');
console.log(report.join('\n'));
