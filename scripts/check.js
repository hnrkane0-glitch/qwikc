const fs = require('fs');
const vm = require('vm');
const files = ['index.html','landing.html','admin.html','page-editor.html','payment.html','store.html','pos.html'];
let failed = false;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script\s*>/gi)];
  scripts.forEach((match, index) => {
    try { new vm.Script(match[1], { filename: `${file}#script-${index+1}` }); }
    catch (error) { failed = true; console.error(`FAIL ${file} script ${index+1}: ${error.message}`); }
  });
  console.log(`${failed ? 'CHECK' : 'PASS'} ${file}: ${scripts.length} inline script(s)`);
}
try { new vm.Script(fs.readFileSync('qc-db.js','utf8'), { filename:'qc-db.js' }); console.log('PASS qc-db.js'); }
catch(error){failed=true;console.error('FAIL qc-db.js:',error.message);}
if(failed)process.exit(1);
