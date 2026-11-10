/* Check all authored model states, their mathematical invariants and the
   reading layer's escaping/preservation, independently of browser cosmetics. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={E:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')};
vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname+'/learning-view.js','utf8')+fs.readFileSync(__dirname+'/concept-explorers.js','utf8'),context);
const specs=vm.runInContext('conceptSpecs',context),scene=context.conceptScene;
assert.equal(Object.keys(specs).length,24);
let checked=0;
for(const [id,s] of Object.entries(specs))for(let n=s[2];n<=s[3];n+=s[4])for(let step=0;step<3;step++){
 for(const variant of Number(id)===12?['share','direct','inverse']:Number(id)===20?['no-fee','fee']:['share']){
  const x=scene(+id,n,step,variant);assert.ok(x.explain.length>40 && x.math.length>5);
  assert.doesNotMatch(x.svg,/NaN|undefined|Infinity|<script|onload=/);
  const ids=[...x.svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`duplicate IDs in ${id}`);
  for(const m of x.svg.matchAll(/(?:width|height|r|rx|ry)="(-?[\d.]+)"/g))assert.ok(+m[1]>=0,`negative dimension ${id}`);
  checked++;
 }
}
// Similar triangles must really scale their drawn lengths by k, not just labels.
for(const k of [1,1.5,2,3]){
 const polygons=[...scene(16,k,2).svg.matchAll(/<polygon[^>]*points="([^"]+)"/g)].map(m=>m[1].split(' ').map(p=>p.split(',').map(Number)));
 const base=p=>Math.abs(p[1][0]-p[0][0]),height=p=>Math.abs(p[2][1]-p[0][1]);
 assert.equal(base(polygons[1])/base(polygons[0]),k);assert.equal(height(polygons[1])/height(polygons[0]),k);
}
// The trig picture uses the same units horizontally/vertically: it agrees with theta.
for(const degrees of [20,45,70]){
 const p=scene(22,degrees,2).svg.match(/points="([^"]+)"/)[1].split(' ').map(v=>v.split(',').map(Number));
 const angle=Math.atan2(p[1][1]-p[2][1],p[1][0]-p[0][0])*180/Math.PI;
 assert.ok(Math.abs(angle-degrees)<1e-9);
}
for(const n of [1,10,20]){
 const result=scene(12,n,2);assert.equal((result.svg.match(/id="part\d"/g)||[]).length,8);
 assert.ok(result.math.includes('€'+3*n)&&result.math.includes('€'+5*n));
}
assert.match(scene(20,3,1,'fee').math,/€11; C\(6\) = €20/);
assert.match(scene(20,3,1,'no-fee').math,/€9; C\(6\) = €18/);
assert.match(scene(23,1,2).math,/15 m; same height at t = 3 s/);
assert.match(scene(23,2,2).math,/20 m; same height at t = 2 s/);
assert.match(scene(23,1.25,2).math,/height ≈ 17.19 m/);
assert.match(scene(12,11,2,'inverse').math,/120 ÷ 11 ≈ 10.91/);
assert.match(context.workingMarkup(['8x + 3 − 5x + 6','8x − 5x + 3 + 6','3x + 9']),/8x \+ 3 − 5x \+ 6/);
assert.doesNotMatch(context.workingMarkup(['<img src=x onerror=alert(1)>']),/<img/);
const chapters=JSON.parse(fs.readFileSync(__dirname+'/compiled-data.json','utf8'));
let topics=0,written=0;
for(const c of chapters){assert.equal(c.explorerLesson,c.lessons[0].id);for(const l of c.lessons){
 assert.ok(l.coach.hook.endsWith('?'),l.id);for(const k of ['idea','start','why','speech','speechPlan'])assert.ok(l.coach[k].length>20,l.id+k);topics++;
 for(const q of l.exercises)if(q.type==='written'){
  assert.equal(q.workedReading.length,q.solution.length,q.id);
  q.workedReading.forEach((item,i)=>assert.equal(item.parts.join('; ').replace(/[;.]/g,'').replace(/\s/g,''),q.solution[i].replace(/[;.]/g,'').replace(/\s/g,''),q.id));written++;
 }
}}
assert.equal(topics,158);assert.equal(written,632);
console.log(`Learning checks passed: ${checked} model states, 158 conceptual bridges, 632 preserved written solutions, scale/angle/proportion checks and safe rendering.`);
