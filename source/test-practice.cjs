const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const chapters=JSON.parse(fs.readFileSync(__dirname+'/compiled-data.json','utf8'));
const c={currentLesson:chapters[0].lessons[0],progress:{lessons:{},answers:{}},nodes:{},html:'',focused:'',stops:0,saves:0,messages:[],wentBack:0};
c.E=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function parse(markup){
 c.html=markup;c.nodes={};
 for(const tag of markup.matchAll(/<([a-z][a-z0-9]*)\b([^>]*)>/g)){
  const attrs={};for(const a of tag[2].matchAll(/([\w-]+)="([^"]*)"/g))attrs[a[1]]=a[2];
  const id=attrs.id||'node-'+Object.keys(c.nodes).length;
  const dataset={};for(const [k,v] of Object.entries(attrs))if(k.startsWith('data-'))dataset[k.slice(5).replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase())]=v;
  c.nodes[id]={id,dataset,attrs,disabled:/\bdisabled(?:\s|$)/.test(tag[2]),open:/\bopen(?:\s|$)/.test(tag[2]),focus(){c.focused=id},scrollIntoView(){}};
 }
}
const host={set innerHTML(v){parse(v)},get innerHTML(){return c.html}};
c.$=s=>s==='#lesson-content'?host:s==='#mode-learn'?{click(){c.wentBack++}}:c.nodes[s.slice(1)];
c.document={getElementById:id=>c.nodes[id],querySelectorAll(selector){const a=selector.slice(1,-1);return Object.values(c.nodes).filter(n=>a in n.attrs)}};
c.save=()=>c.saves++;c.announce=s=>c.messages.push(s);c.stopAudio=()=>c.stops++;
c.reducedMotion=()=>true;
c.boxAttributes=(key,text)=>'data-narration-box="'+c.E(key)+'" data-narration-text="'+c.E(text)+'"';
c.boxStatus=()=>'';c.boxAudio=()=>'';c.bindBoxAudio=()=>{};
c.DATA=JSON.parse(fs.readFileSync(__dirname+'/../site/index.html','utf8').match(/<script>const DATA=(.*?);<\/script>/s)[1]);
vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/rule-help-view.js','utf8'),c);vm.runInContext(fs.readFileSync(__dirname+'/learning-view.js','utf8'),c);vm.runInContext(fs.readFileSync(__dirname+'/practice.js','utf8'),c);
// Render every content path; written results must stay hidden until requested.
for(const chapter of chapters)for(const lesson of chapter.lessons){
 c.currentLesson=lesson;
 for(let i=0;i<6;i++){
  c.movePractice(i);const q=lesson.exercises[i];
  if(q.type==='written'){
   assert.doesNotMatch(c.html,/class="practice-result"/,q.id);
   assert.doesNotMatch(c.html,/data-step-rule=/,q.id+' must not expose a rule before the solution');
   c.nodes['practice-hint'].onclick();c.nodes['practice-hint'].onclick();
   assert.ok(c.nodes['practice-hint'].disabled);
   c.nodes['practice-notes'].oninput({target:{value:'Paper notes for '+q.id}});
   c.nodes['practice-all'].onclick();
   assert.equal((c.html.match(/data-step-rule=/g)||[]).length,q.solution.length,q.id);
   assert.match(c.html,/class="practice-result"/,q.id);
   c.nodes['practice-review-supported'].onclick();c.nodes['practice-cover'].onclick();
   assert.doesNotMatch(c.html,/class="practice-result"/,q.id);
   assert.doesNotMatch(c.html,/data-step-rule=/,q.id+' must cover rule help with the solution');
   assert.equal(c.practiceSaved(q).notes,'Paper notes for '+q.id);
   assert.equal(c.practiceSaved(q).review,'supported');
  }else{
   c.nodes['practice-hint'].onclick();c.nodes['practice-answer-'+q.answer].onclick();
   assert.match(c.html,/Clue 1/);assert.match(c.html,/Correct — here is why/);
   assert.equal(c.progress.answers[q.id],q.answer);
  }
 }
}
assert.equal(Object.keys(c.progress.answers).length,316);
assert.equal(Object.values(c.progress.practice).filter(s=>s.review).length,632);
// Wrong answer, clue and correction retain focus and the revealed clue.
c.currentLesson=chapters[0].lessons[0];
c.movePractice(c.currentLesson.exercises.findIndex(q=>q.type==='choice'));
const q=c.currentLesson.exercises[c.practiceIndex(c.currentLesson)];
c.nodes['practice-answer-'+((q.answer+1)%4)].onclick();assert.match(c.html,/Not yet/);
c.nodes['practice-answer-'+q.answer].onclick();
assert.equal(c.focused,'practice-answer-'+q.answer);assert.match(c.html,/Clue 1/);
// A fresh UI session retains answers and position but covers revealed help.
vm.runInContext('for(const k of Object.keys(practiceMemory))delete practiceMemory[k]',c);
c.renderPractice();assert.equal(c.exerciseStatus(q),'Correct');assert.equal(c.practiceState(q).hints,0);
c.movePractice(5);c.nodes['practice-next'].onclick();assert.equal(c.wentBack,1);
assert.equal(Object.keys(c.progress.lessons).length,0,'Self-review must not mark lessons confident');
const written=c.currentLesson.exercises.find(q=>q.type==='written');
c.savePractice(written,{notes:'<img src=x onerror=alert(1)>'});
c.movePractice(c.currentLesson.exercises.indexOf(written));
assert.match(c.html,/&lt;img src=x onerror=alert\(1\)&gt;/);assert.doesNotMatch(c.html,/<img src=x/);
console.log('Practice UI checks passed for all 948 exercises: navigation, hidden answers, hints, working, saved notes, self-reviews, legacy answers, focus and escaped text.');
