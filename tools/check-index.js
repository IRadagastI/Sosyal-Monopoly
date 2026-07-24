const s = require('fs').readFileSync(require('path').resolve(__dirname, '..', 'index.html'), 'utf8');
console.log('css link            :', s.includes('href="css/style.css"'));
console.log('questions bundle tag :', s.includes('src="js/questions.bundle.js"'));
console.log('plain questions.js   :', s.includes('src="js/questions.js"'));
console.log('style block left    :', s.includes('<style>') ? 'evet (' + (s.match(/<style>/g) || []).length + ')' : 'hayir');
