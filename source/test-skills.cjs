/* Skill drills: every generator is run many times. Each question must be well formed,
   pass its own answer check, reject its own wrong answers and offer enough variety.
   With --export <file>, samples are written for the independent symbolic check. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=__dirname,context={console};vm.createContext(context);
const files=['skills-core.js',...fs.readdirSync(dir).filter(f=>/^skills-(?!core)[a-z0-9-]+\.js$/.test(f)).sort()];
for(const f of files)vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8')+(f==='skills-core.js'?'\nglobalThis.SkillKit=SkillKit;':''),context,{filename:f});
const K=context.SkillKit,SEEDS=150,exportAt=process.argv.indexOf('--export'),samples=[];
assert.ok(K.skills.length>0,'No skills are defined');
const lessons=new Set(JSON.parse(fs.readFileSync(path.join(dir,'data/chapters.json'),'utf8')).flatMap(c=>c.lessons.map(l=>l.id)));
let questions=0;const report=[];
for(const skill of K.skills){
 assert.ok(lessons.has(skill.lesson),`${skill.id}: unknown lesson ${skill.lesson}`);
 skill.levels.forEach((level,index)=>{
  assert.equal(typeof level.name,'string',`${skill.id}: level ${index+1} needs a name`);
  const seen=new Set(),types=new Set();let droppedMistakes=0,listedMistakes=0;
  for(let seed=1;seed<=SEEDS;seed++){
   const q=K.build(skill.id,index,seed);questions++;
   const again=K.build(skill.id,index,seed);
   assert.deepEqual(JSON.parse(JSON.stringify(q)),JSON.parse(JSON.stringify(again)),`${skill.id} level ${index+1}: the same seed must give the same question`);
   const where=`${skill.id} level ${index+1} seed ${seed}`,a=q.answer;types.add(a.type);
   seen.add(q.prompt+'|'+(q.math||'')+'|'+JSON.stringify(q.table||'')+'|'+(q.figure?.alt||''));
   if(q.figure){assert.ok(q.figure.svg.startsWith('<svg')&&q.figure.alt.length>20,`${where}: a figure needs a drawing and a description`);assert.ok(!/NaN|undefined|Infinity/.test(q.figure.svg+q.figure.alt),`${where}: broken figure`)}
   /* Every text must render and be speakable without leftover notation. */
   for(const text of [q.prompt,q.hint,...q.steps.map(s=>s.note||''),...(q.mistakes||[]).map(m=>m.why),...(a.options||[]).map(o=>(o.why||'')+' '+(o.text||''))]){
    assert.equal((String(text).match(/`/g)||[]).length%2,0,`${where}: unbalanced backticks in "${text}"`);
    assert.ok(!/undefined|NaN|\[object|Infinity/.test(K.richHTML(text)),`${where}: broken text "${text}"`);
    assert.ok(!/[—–]/.test(text),`${where}: no dashes in "${text}"`);
   }
   for(const m of [q.math,...q.steps.map(s=>s.math),...(a.options||[]).map(o=>o.math)].filter(Boolean)){
    assert.ok(!/undefined|NaN|\[object|Infinity|\+ -|- -|\+ \+|-\s*\+|(^|[^\d.])[01][a-z](?![a-z])/.test(m.replace(/frac|sqrt/g,'')),`${where}: untidy maths "${m}"`);
    assert.ok(K.mathSpeech(m).length>0,`${where}: maths cannot be read "${m}"`);
   }
   if(a.type==='choice'){
    assert.ok(K.check(q,a.correctIndex).correct,`${where}: the keyed option is not accepted`);
    a.options.forEach((o,i)=>{if(i!==a.correctIndex)assert.ok(!K.check(q,i).correct,`${where}: a wrong option is accepted`)});
   }
   listedMistakes+=(q.mistakes||[]).length;
   for(const m of q.mistakes||[]){
    const input=a.type==='inequality'?{op:m.op||a.op,value:String(m.value)}:a.type==='fields'?[].concat(m.value).map(String):String(m.value);
    const result=K.check(q,input);
    assert.ok(!result.correct,`${where}: the listed mistake ${JSON.stringify(m.value)} is marked correct`);
   }
   if(seed<=40)samples.push({skill:skill.id,level:index,seed,prompt:q.prompt,math:q.math||null,answer:a,answerText:K.answerText(q),verify:[].concat(q.verify),
    factorCount:a.type==='expr'&&a.form==='factorised'?K.factorList(K.parseExpr(a.value)).factors.length:null,steps:q.steps});
  }
  assert.ok(seen.size>=25,`${skill.id} level ${index+1}: only ${seen.size} different questions in ${SEEDS} seeds; add variety`);
  report.push(`${skill.id} L${index+1}: ${seen.size} variants, ${[...types].join('/')}`);
 });
}
/* The answer checker itself. */
const ex=(value,form,input)=>K.check({answer:{type:'expr',value,form}},input),num=(a,input)=>K.check({answer:{type:'number',...a}},input);
assert.ok(ex('3x + 9','simplified','9 + 3x').correct);assert.ok(ex('3x + 9','simplified','3(x+3)').close);assert.ok(ex('3x + 9','simplified','8x − 5x + 9').close);
assert.ok(!ex('3x + 9','simplified','3x + 8').correct);assert.ok(ex('x^2 - 9','simplified','x2-9').correct);assert.ok(ex('x^2','simplified','x*x').close);
assert.ok(ex('(x+2)(x+3)','factorised','(x+3)(x+2)').correct);assert.ok(ex('(x+2)(x+3)','factorised','x²+5x+6').close);assert.ok(ex('2(x+2)(x-1)','factorised','(2x+4)(x-1)').close);
assert.ok(ex('-(x-3)(x+2)','factorised','(3-x)(x+2)').correct);assert.match(ex('2y(5y+4)','factorised','2(5y^2+4y)').feedback,/not fully factorised/);assert.match(ex('2y(5y+4)','factorised','10y^2+8y').feedback,/asks you to factorise/);assert.ok(ex('3x(x+2)','factorised','x(3x+6)').close);assert.ok(ex('(x+3)^2','factorised','(x+3)(x+3)').correct);
assert.ok(ex('frac(5x + 3, 6)','any','5x/6 + 1/2').correct);assert.ok(ex('3x + 9','simplified','3x +').invalid);
assert.ok(num({value:'7/2'},'3.5').correct);assert.ok(num({value:'-3'},'x = −3').correct);assert.ok(num({value:'3/4',simplest:true},'6/8').close);assert.ok(num({value:'1.5'},'1 1/2').correct);
assert.ok(num({value:'12.5',unit:'km'},'12.5 km').correct);assert.ok(num({value:'4.666666',round:1},'4.7').correct);assert.ok(num({value:'4.666666',round:1},'4.67').close);
assert.ok(num({value:'1250'},'€1,250').correct);assert.ok(K.check({answer:{type:'number',value:'2'},mistakes:[{value:'frac(7, 2)',why:'slip'}]},'3.5').feedback==='slip');assert.ok(!K.sameValue('sqrt(frac(A, 4))','frac(sqrt(A), 4)'));assert.ok(num({value:'45',unit:'min'},'45 minutes').correct);assert.ok(num({value:'60',unit:'km/h'},'60 km per hour').correct);assert.ok(num({value:'3'},'3x').invalid);assert.ok(num({value:'5'},'five').invalid);assert.ok(!num({value:'5'},'6').correct);
assert.ok(K.check({answer:{type:'fields',fields:[{value:'2'},{value:'-3'}],unordered:true}},['-3','2']).correct);
/* A single fraction is one top over one bottom, tidied and in lowest terms. */
assert.ok(ex('frac(2x + 5, 6)','fraction','(5+2x)/6').correct);assert.match(ex('frac(2x + 5, 6)','fraction','x/3 + 5/6').feedback,/not one fraction/);
assert.match(ex('frac(2x + 5, 6)','fraction','(4x+10)/12').feedback,/divide the top and the bottom by 2/);assert.match(ex('frac(2x + 5, 6)','fraction','(2(x+1)+3)/6').feedback,/tidy the top/);
assert.ok(ex('frac(5x, 6)','fraction','5x/6').correct);assert.ok(!ex('frac(2x + 5, 6)','fraction','2x + 5/6').correct);
/* Capitals, a power typed as )2, units after a number, and slips recognised from a rounded value. */
assert.ok(ex('9p + 9','simplified','9P + 9').correct);assert.match(ex('(a + 9)^2','factorised','(a + 9)2').feedback,/power on a bracket/);assert.ok(ex('5(4x + 3)','factorised','(4x + 3)5').correct);
assert.ok(num({value:'20'},'20 m').correct);assert.ok(num({value:'-3'},'−3°C').correct);assert.ok(num({value:'217.8'},'217.80 dollars').correct);assert.ok(num({value:'20'},'20x').invalid);
assert.equal(K.check({answer:{type:'number',value:'3850/51',round:2},mistakes:[{value:'3850/53',why:'slip'}]},'72.64').feedback,'slip');
assert.equal(K.check({answer:{type:'number',value:'150'},mistakes:[{value:'448/3',why:'slip'}]},'149.33').feedback,'slip');
assert.equal(K.check({answer:{type:'number',value:'8.08',round:1},mistakes:[{value:'8',why:'slip'}]},'8').feedback,'slip');
assert.ok(K.check({answer:{type:'fields',fields:[{value:'3/2'},{value:'-2'}],unordered:true,simplest:true}},['-2','6/4']).close);
assert.ok(K.check({answer:{type:'inequality',op:'<=',value:'3/2',simplest:true}},{op:'<=',value:'6/4'}).close);assert.ok(K.check({answer:{type:'inequality',op:'<=',value:'3/2',simplest:true}},{op:'<=',value:'1.5'}).correct);
assert.ok(!K.check({answer:{type:'fields',fields:[{value:'3'},{value:'1'}]}},['1','3']).correct);
assert.ok(K.check({answer:{type:'fields',fields:[{value:'3'},{value:'5'}],ratio:true}},['6','10']).close);
assert.ok(K.check({answer:{type:'inequality',op:'<',value:'4'}},{op:'<',value:'4'}).correct);assert.ok(K.check({answer:{type:'inequality',op:'<',value:'4'}},{op:'>',value:'4'}).close);
assert.equal(K.expand('(2x+3)(x-4)'),'2x^2 - 5x - 12');assert.equal(K.terms([[1,'x^2'],[-1,'x'],[0,'y'],['1/2','']]),'x^2 - x + frac(1, 2)');
assert.match(K.mathHTML('frac(x, 2)^2 <= sqrt(9)'),/sk-frac.*<sup>2<\/sup> ≤ .*sk-sqrt/);assert.ok(!K.richHTML('<img> `x<y`').includes('<img>'));
assert.equal(K.mathSpeech('3x^2 - 2(x + 1)'),'3 x squared minus 2 times open bracket x plus 1 close bracket');
/* The account service's list of skills must match the skills that exist. */
const catalogFile=path.join(dir,'../worker/catalog.json');
if(fs.existsSync(catalogFile)){
 const listed=JSON.parse(fs.readFileSync(catalogFile,'utf8')).skills||{};
 assert.equal(Object.keys(listed).sort().join(','),Array.from(K.skills,s=>s.id).sort().join(','),'worker/catalog.json is out of date: run python source/build.py');
 for(const s of K.skills)assert.equal(listed[s.id].lesson,s.lesson,`${s.id}: catalog lesson differs`);
}
if(exportAt>0)fs.writeFileSync(process.argv[exportAt+1],JSON.stringify(samples));
if(process.argv.includes('--report'))console.log(report.join('\n'));
console.log(`Skill checks passed: ${K.skills.length} skills, ${K.skills.length*3} levels, ${questions} generated questions, exact answer checking and safe rendering.`);
