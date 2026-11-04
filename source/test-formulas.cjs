const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const DATA=JSON.parse(fs.readFileSync(__dirname+'/../site/index.html','utf8').match(/<script>const DATA=(.*?);<\/script>/s)[1]);
const E=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const ctx={DATA,E};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/formula-view.js','utf8'),ctx);
const search=(q,g='All')=>Array.from(ctx.findFormulas(q,g),x=>x.id);
for(const [query,id] of [['quadratic formula','quadratic'],['ax2+bx+c','quadratic'],['ax^2 + bx + c','quadratic'],['(a+b)^2','square-sum'],['(a-b)^2','square-difference'],['SOHCAHTOA','trig'],['slope','slope'],['factorization','factor-quadratic'],['standard form','standard-form'],['sphere','sphere'],['midpoint','midpoint']])assert.ok(search(query).includes(id),query);
assert.ok(!search('(a+b)^2').includes('square-difference'));
assert.ok(!search('(a-b)^2').includes('square-sum'));
assert.equal(search('').length,64);assert.equal(search('  ').length,64);
assert.equal(search('qzxvw').length,0);assert.equal(search('???').length,0);
assert.equal(search('quadratic','Number').length,0);
for(const f of DATA.formulas){
 assert.ok(search(f.title).includes(f.id),f.id+' title searchable');
 assert.ok(search('',f.group).includes(f.id));
 const html=ctx.formulaDetailHTML(f);
 assert.ok(html.includes('What the symbols mean')&&html.includes('Try it with numbers')&&html.includes('Remember'),f.id);
 assert.ok(!html.includes('NaN')&&!html.includes('="undefined"'),f.id);
 if(f.visual)assert.match(html,/<svg[^>]+aria-label=/,f.id);
 assert.match(ctx.formulaToolkitLink(f),new RegExp('#chapter='+f.chapter+'&lesson='+f.lesson+'&mode=reference&method='+f.method+'$'));
}
const evil={...DATA.formulas[0],title:'<img src=x onerror=alert(1)>',example:{question:'<script>bad</script>',steps:['<b>not markup</b>']}};
assert.ok(!ctx.formulaDetailHTML(evil).includes('<img'));assert.ok(ctx.formulaDetailHTML(evil).includes('&lt;script&gt;'));
assert.equal(ctx.formulaMathNode('<script>x</script>'),'<mtext>&lt;script&gt;x&lt;/script&gt;</mtext>');
assert.throws(()=>ctx.formulaMathNode(['script','bad']));
assert.match(ctx.formulaEquation(DATA.formulas[0].math[1]),/<mfrac>.*<msqrt>/);
DATA.standalone=true;DATA.initialChapter=19;
assert.ok(ctx.formulaToolkitLink(DATA.formulas[0]).startsWith('index.html#chapter=15'));
assert.ok(ctx.formulaToolkitLink(DATA.formulas.find(f=>f.id==='function')).startsWith('#chapter=19'));
console.log('Formula search, all 64 card renderings, notation, escaping and cross-chapter links passed.');
