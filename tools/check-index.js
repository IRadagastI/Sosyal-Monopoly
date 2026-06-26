const s = require('fs').readFileSync(require('path').resolve(__dirname, '..', 'index.html'), 'utf8');
console.log('css link            :', s.includes('href="css/style.css"'));
console.log('questions.js tag    :', s.includes('src="js/questions.js"'));
console.log('inline questionsN   :', (s.match(/const questions[0-9] =/g) || []).length);
console.log('inline finalPools   :', (s.match(/const finalQuestionsPool[0-9]/g) || []).length);
const a = s.indexOf('src="js/questions.js"');
const b = s.indexOf('let baseTeams');
console.log('q.js before main    :', a > -1 && a < b);
console.log('style block left    :', s.includes('<style>') ? 'evet (' + (s.match(/<style>/g) || []).length + ')' : 'hayir');
