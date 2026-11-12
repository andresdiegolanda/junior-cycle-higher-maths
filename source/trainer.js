/* Skill drills: the screens. A round is five generated questions, marked as the
   student goes. Stars record the best round at each level. Records live in
   progress.skills and progress.drills, so they sync with a signed-in account. */
const Drills=(()=>{
'use strict';
const K=SkillKit,ROUND=5,WARMUP=10,DAILY_GOAL=3;
const esc=K.esc,rich=K.richHTML,maths=K.mathHTML;
let session=null,studying=false;
/* The order a student meets the skills: each one leans on the ones before it. */
const ORDER=['like-terms','expand-one-bracket','expand-two-brackets','substitution','common-factor','difference-of-squares','factorise-quadratics','factorise-grouping','algebraic-fractions','linear-equations','equations-with-fractions','words-to-equations','inequalities','simultaneous-equations','quadratics-factorising','quadratic-formula','change-the-subject','nth-term',
 'negative-numbers','order-of-operations','fractions','percentages','index-laws','standard-form','rounding','compound-interest',
 'simplify-ratios','share-in-a-ratio','direct-proportion','inverse-proportion','speed-distance-time','time-calculations','currency-exchange',
 'mean','median-mode-range','frequency-table-mean','choose-the-average','pie-charts','stem-and-leaf','probability'];
const rank=id=>{const i=ORDER.indexOf(id);return i<0?ORDER.length:i};
K.skills.sort((a,b)=>rank(a.id)-rank(b.id));

/* ---------- Records ---------- */
function record(id){progress.skills||={};const r=progress.skills[id]||={};r.asked=r.asked|0;r.right=r.right|0;r.rounds=r.rounds|0;r.stars=[0,1,2].map(i=>Math.max(0,Math.min(3,(r.stars||[])[i]|0)));return r}
function starsOf(id){const s=progress.skills?.[id]?.stars;return [0,1,2].map(i=>Math.max(0,Math.min(3,(s||[])[i]|0)))}
const totalStars=list=>list.reduce((sum,s)=>sum+starsOf(s.id).reduce((a,b)=>a+b,0),0);
function dayKey(date=new Date()){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0')}
function dayLog(){const d=progress.drills?.days;return d&&typeof d==='object'?d:{}}
function roundsToday(){return dayLog()[dayKey()]|0}
function streak(){
 const log=dayLog(),date=new Date();let count=0;
 if(!log[dayKey(date)])date.setDate(date.getDate()-1);
 while(log[dayKey(date)]){count++;date.setDate(date.getDate()-1)}
 return count;
}
function track(kind,payload,skill){if(typeof trackActivity==='function')trackActivity(kind,payload,{lessonId:skill.lesson})}
/* What is on the test, and the last warm-up result, stay on this device. */
const testKey=()=>'jc-drill-test:'+(typeof MathsAccount!=='undefined'&&MathsAccount.user?MathsAccount.user.id:'local');
function testState(){try{const v=JSON.parse(localStorage.getItem(testKey())||'null');if(v&&typeof v==='object')return {picked:Array.isArray(v.picked)?v.picked.filter(id=>K.byId.has(id)):null,last:v.last&&typeof v.last==='object'?v.last:null}}catch(e){}return {picked:null,last:null}}
function saveTestState(state){try{localStorage.setItem(testKey(),JSON.stringify(state))}catch(e){}}
const DEFAULT_TEST_STRANDS=['Algebra','Ratio and proportion','Statistics'];
function pickedSkills(){const p=testState().picked;return p&&p.length?p:K.skills.filter(s=>DEFAULT_TEST_STRANDS.includes(s.strand)).map(s=>s.id)}

/* ---------- Small pieces of markup ---------- */
function starRow(count,label){return `<span class="drill-stars" role="img" aria-label="${esc(label||count+' of 3 stars')}">${[0,1,2].map(i=>`<span class="${i<count?'on':''}" aria-hidden="true">★</span>`).join('')}</span>`}
function lessonHref(skill){const chapter=Number(skill.lesson.slice(0,2));const here=DATA.chapters.some(c=>c.id===chapter);return (here?'':'index.html')+'#chapter='+chapter+'&lesson='+encodeURIComponent(skill.lesson)}
function lessonTitle(skill){for(const c of DATA.chapters){const l=c.lessons.find(x=>x.id===skill.lesson);if(l)return l.title}return 'the lesson'}
const go=params=>{const next='drills='+params;if(location.hash.slice(1)===next)route();else location.hash=next};
function crumbs(...trail){return `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="${homeLink()}">All chapters</a>${trail.map(([label,href])=>`<span aria-hidden="true">›</span>${href?`<a href="${href}">${esc(label)}</a>`:`<span>${esc(label)}</span>`}`).join('')}</nav>`}
function setPage(title,html){studying=true;currentChapter=null;document.title=title+' | Junior Cycle Higher Maths';$('#app').innerHTML=html;$('#print-sheet').innerHTML='';window.scrollTo({top:0,behavior:'instant'})}
/* The next sensible round for a skill: the first level without two stars. */
function nextLevel(id){const s=starsOf(id);const i=s.findIndex(v=>v<2);return i<0?2:i}
function suggestion(){
 const order=[...pickedSkills().map(id=>K.byId.get(id)),...K.skills].filter(Boolean),seen=new Set();
 for(const skill of order){if(seen.has(skill.id))continue;seen.add(skill.id);if(starsOf(skill.id).some(v=>v<2))return skill}
 return K.skills[0];
}

/* ---------- The hub ---------- */
function ring(done,goal){
 const share=Math.min(1,done/goal),r=26,c=2*Math.PI*r;
 return `<svg class="drill-ring" viewBox="0 0 64 64" role="img" aria-label="${done} of ${goal} rounds today"><circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--line)" stroke-width="7"/>${share?`<circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--teal)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(c*share).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 32 32)"/>`:''}<text x="32" y="38" text-anchor="middle" font-size="19" font-weight="700" fill="var(--ink)">${done}</text></svg>`;
}
function todayPanel(){
 const done=roundsToday(),run=streak(),stars=totalStars(K.skills);
 const goalText=done>=DAILY_GOAL?'Daily goal reached':`${done} of ${DAILY_GOAL} rounds today`;
 return `<div class="drill-today">${ring(done,DAILY_GOAL)}<div><strong>${goalText}</strong><span>${run>1?run+' days in a row':run===1?'Practised today or yesterday: keep the run going':'A round takes about three minutes'}</span><span>${stars} ${stars===1?'star':'stars'} earned so far</span></div></div>`;
}
function skillCard(skill){
 const stars=starsOf(skill.id),r=progress.skills?.[skill.id],suggested=nextLevel(skill.id);
 return `<article class="drill-card" id="skill-${esc(skill.id)}"><h3>${esc(skill.title)}</h3><p>${rich(skill.blurb)}</p><div class="drill-levels">${skill.levels.map((level,i)=>`<button data-drill="${esc(skill.id)}" data-level="${i}" class="${i===suggested&&stars[i]<3?'suggested':''}" aria-label="Level ${i+1}: ${esc(level.name)}. ${stars[i]} of 3 stars. Start a round."><span class="drill-level-number">Level ${i+1}</span><span class="drill-level-name">${esc(level.name)}</span>${starRow(stars[i])}</button>`).join('')}</div><p class="drill-card-foot">${r?.asked?`<span>${r.asked} answered · ${r.right} right first time</span>`:'<span>Not started yet</span>'}<a href="${lessonHref(skill)}">Read the lesson</a></p></article>`;
}
function fixList(){
 const last=testState().last;if(!last?.results)return '';
 const missed=Object.entries(last.results).filter(([id,v])=>K.byId.has(id)&&v!=='first').map(([id])=>K.byId.get(id));
 if(!missed.length)return '';
 return `<div class="drill-fix"><strong>From your last warm-up, fix these first:</strong><div>${missed.map(s=>`<button data-drill="${esc(s.id)}" data-level="${nextLevel(s.id)}">${esc(s.title)}</button>`).join('')}</div></div>`;
}
function renderHub(){
 session=null;const next=suggestion(),level=nextLevel(next.id);
 setPage('Skill drills',`${crumbs(['Skill drills'])}
 <header class="drill-head"><div><p class="eyebrow">Skill drills</p><h1>Practise until it sticks.</h1><p class="intro">Rounds of five questions, marked as you go. When you slip, you see where, and how to fix it.</p><div class="hero-actions"><button class="primary" data-drill="${esc(next.id)}" data-level="${level}">${totalStars(K.skills)?'Next up':'Start with'}: ${esc(next.title)} →</button><button id="drill-test">Get ready for a test</button></div></div>${todayPanel()}</header>
 ${fixList()}
 <nav class="drill-jump" aria-label="Jump to a strand">${K.STRANDS.filter(strand=>K.skills.some(s=>s.strand===strand)).map(strand=>`<a href="#strand-${esc(strand.replace(/\W+/g,'-'))}" data-jump="strand-${esc(strand.replace(/\W+/g,'-'))}">${esc(strand)}</a>`).join('')}</nav>
 ${K.STRANDS.map(strand=>{const list=K.skills.filter(s=>s.strand===strand);if(!list.length)return '';const got=totalStars(list),max=list.length*9;return `<section class="drill-strand" aria-labelledby="strand-${esc(strand.replace(/\W+/g,'-'))}"><div class="drill-strand-head"><h2 id="strand-${esc(strand.replace(/\W+/g,'-'))}">${esc(strand)}</h2><span>${got} of ${max} stars</span><progress max="${max}" value="${got}" aria-label="${esc(strand)} stars"></progress></div><div class="drill-grid">${list.map(skillCard).join('')}</div></section>`}).join('')}
 <p class="footnote">Three stars means five right first time. Two stars means four. Your best round at each level is kept.</p>`);
 bindStarts();$('#drill-test').onclick=()=>go('test');
 document.querySelectorAll('[data-jump]').forEach(a=>a.onclick=e=>{e.preventDefault();const target=document.getElementById(a.dataset.jump);target.scrollIntoView({block:'start',behavior:reducedMotion()?'instant':'smooth'});target.setAttribute('tabindex','-1');target.focus({preventScroll:true})});
}
function bindStarts(root=document){root.querySelectorAll('[data-drill]').forEach(b=>b.onclick=()=>go('round&skill='+encodeURIComponent(b.dataset.drill)+'&level='+b.dataset.level))}

/* ---------- A round ---------- */
const newSeed=()=>Math.floor(Math.random()*2147483646)+1;
function startRound(skillId,level){
 const skill=K.byId.get(skillId);if(!skill||!(level>=0&&level<=2)){renderHub();return}
 const seen=new Set(),items=[];
 for(let guard=0;items.length<ROUND&&guard<60;guard++){const q=K.make(skillId,level,newSeed()),key=q.prompt+'|'+(q.math||'')+'|'+JSON.stringify(q.table||'')+'|'+(q.figure?.alt||'');if(seen.has(key)&&guard<50)continue;seen.add(key);items.push(freshItem(q))}
 session={kind:'round',skill:skillId,level,items,index:0};renderQuestion();
}
const freshItem=q=>({q,tries:0,hint:false,outcome:null,struck:[]});
function startWarmup(){
 const picked=pickedSkills().map(id=>K.byId.get(id)).filter(Boolean);if(!picked.length){renderTest();return}
 /* Weakest skills first, then fill up; a skill never practised starts at level 1. */
 const order=[...picked].map(s=>({s,weight:starsOf(s.id).reduce((a,b)=>a+b,0)+Math.random()})).sort((a,b)=>a.weight-b.weight).map(x=>x.s);
 const chosen=[];for(let i=0;chosen.length<Math.min(WARMUP,Math.max(order.length,5));i++)chosen.push(order[i%order.length]);
 const shuffled=K.makeRng(newSeed()).shuffle(chosen.slice(0,WARMUP));
 session={kind:'test',items:shuffled.map(s=>freshItem(K.make(s.id,starsOf(s.id)[0]>=2?1:0,newSeed()))),index:0};renderQuestion();
}
function questionSpeech(q){
 const parts=[K.richSpeech(q.prompt)];
 if(q.math)parts.push(K.mathSpeech(q.math));
 if(q.figure)parts.push(q.figure.alt);
 if(q.table)parts.push(q.table.rows.map(row=>row.map((cell,i)=>`${q.table.head[i]}: ${K.richSpeech(cell)}`).join(', ')).join('. '));
 if(q.answer.type==='choice')parts.push(q.answer.options.map((o,i)=>`Option ${'ABCDE'[i]}. ${o.math?K.mathSpeech(o.math):K.richSpeech(o.text)}`).join('. '));
 return parts.join('. ').replace(/\.\s*\./g,'.');
}
function tableMarkup(table){return `<div class="drill-table-wrap"><table class="drill-table"><thead><tr>${table.head.map(h=>`<th scope="col">${rich(h)}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row=>`<tr>${row.map(cell=>`<td>${rich(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
function keys(list){return `<div class="drill-keys" role="group" aria-label="Maths keys">${list.map(([label,text,name])=>`<button type="button" data-insert="${esc(text)}" aria-label="${esc(name||label)}">${esc(label)}</button>`).join('')}</div>`}
function answerMarkup(q){
 const a=q.answer,box=(i,label,unit,wide)=>`<label class="drill-field">${label?`<span class="drill-field-label">${rich(label)}</span>`:''}<input id="drill-input-${i}" data-drill-input="${i}" type="text" inputmode="decimal" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" class="${wide?'wide':''}" aria-describedby="drill-prompt">${unit?`<span class="drill-unit">${esc(unit)}</span>`:''}</label>`;
 if(a.type==='choice')return `<div class="options drill-options" role="group" aria-label="Answer choices">${a.options.map((o,i)=>`<button type="button" class="option" data-drill-option="${i}"><span class="letter">${'ABCDE'[i]}</span><span>${o.math?maths(o.math):rich(o.text)}</span></button>`).join('')}</div>`;
 const numberKeys=[['−','-','minus'],['/','/','fraction bar'],['.','.','decimal point']];
 if(a.type==='number')return `<div class="drill-inputs">${box(0,a.label||'Answer',a.unit)}</div>${keys(numberKeys)}`;
 if(a.type==='fields')return `<div class="drill-inputs">${a.fields.map((f,i)=>box(i,f.label||(i===0&&!a.ratio?'Answer':''),f.unit)).join('')}</div>${keys(numberKeys)}`;
 if(a.type==='inequality')return `<div class="drill-inputs"><span class="drill-field-label">${maths(a.variable||'x')}</span><label class="screen-reader" for="drill-sign">Inequality sign</label><select id="drill-sign"><option value="">sign</option><option value="<">&lt;</option><option value="<=">≤</option><option value=">">&gt;</option><option value=">=">≥</option></select>${box(0,'','')}</div>${keys(numberKeys)}`;
 const letters=[...new Set(a.value.replace(/frac|sqrt/g,'').match(/[a-z]/gi)||['x'])].slice(0,4);
 return `<div class="drill-inputs">${box(0,a.label||'Answer','',true)}</div>${keys([...letters.map(l=>[l,l,'letter '+l]),['x²','^2','squared'],...(a.value.includes('^3')?[['x³','^3','cubed']]:[]),['(','(','open bracket'],[')',')','close bracket'],['+','+','plus'],['−','-','minus'],['/','/','divided by']])}<p class="small-note drill-tip">${a.value.includes('frac(')?'Type a fraction as (top)/(bottom), for example (5x + 3)/6.':a.form==='factorised'?'Type the factors side by side, for example 2(x + 3)(x − 3).':'Type a power with the x² key, or as x^2.'}</p><p class="drill-preview" id="drill-preview" aria-hidden="true"></p>`;
}
function dots(){
 const names={first:'right first time',helped:'right with help',missed:'missed'};
 return `<ol class="round-dots" aria-label="This round">${session.items.map((item,i)=>`<li class="${item.outcome||(i===session.index?'current':'')}"><span class="screen-reader">Question ${i+1}: ${item.outcome?names[item.outcome]:i===session.index?'current':'to do'}</span></li>`).join('')}</ol>`;
}
function renderQuestion(){
 const item=session.items[session.index],q=item.q,skill=K.byId.get(q.skill),test=session.kind==='test';
 setPage(test?'Test warm-up':skill.title,`${crumbs(['Skill drills','#drills=hub'],[test?'Test warm-up':skill.title])}
 <header class="round-head"><div><p class="eyebrow">${test?'Test warm-up':'Skill drill · Level '+(q.level+1)}</p><h1>${esc(skill.title)}</h1><p class="round-level">${esc(skill.levels[q.level].name)}</p></div>${dots()}</header>
 <article class="quiz-card drill-question audio-box" ${boxAttributes('drill-question',questionSpeech(q),'Question '+(session.index+1))}>
  <div class="exercise-meta"><span>QUESTION ${session.index+1} OF ${session.items.length}</span>${boxStatus()}${boxAudio('drill-question','Question '+(session.index+1))}</div>
  <div class="drill-prompt" id="drill-prompt" tabindex="-1">${rich(q.prompt)}</div>
  ${q.math?`<div class="drill-maths">${maths(q.math,true)}</div>`:''}${q.figure?`<figure class="drill-figure" role="img" aria-label="${esc(q.figure.alt)}">${q.figure.svg}</figure>`:''}${q.table?tableMarkup(q.table):''}
  <form id="drill-form" novalidate>${answerMarkup(q)}
   <div class="drill-actions">${q.answer.type==='choice'?'':'<button class="primary" type="submit" id="drill-check">Check</button>'}<button type="button" id="drill-hint">Give me a hint</button><button type="button" id="drill-reveal">Show me how</button></div>
  </form>
  <div id="drill-hint-box"></div>
  <div id="drill-feedback" role="status" aria-live="polite"></div>
  <div id="drill-solution"></div>
  <div id="drill-next"></div>
 </article>
 <p class="drill-leave"><a href="#drills=hub">Leave this round</a></p>`);
 bindQuestion(item);
}
function insertAt(input,text){const start=input.selectionStart??input.value.length,end=input.selectionEnd??input.value.length;input.value=input.value.slice(0,start)+text+input.value.slice(end);const at=start+text.length;input.focus();try{input.setSelectionRange(at,at)}catch(e){}input.dispatchEvent(new Event('input'))}
function bindQuestion(item){
 const q=item.q,form=$('#drill-form');let lastInput=document.querySelector('[data-drill-input]');
 document.querySelectorAll('[data-drill-input]').forEach(input=>{input.onfocus=()=>{lastInput=input}});
 document.querySelectorAll('[data-insert]').forEach(b=>b.onclick=()=>{if(lastInput&&!lastInput.disabled)insertAt(lastInput,b.dataset.insert)});
 const preview=$('#drill-preview');
 if(preview)lastInput.oninput=()=>{const typed=lastInput.value.trim();preview.innerHTML=typed?'You typed: '+maths(typed.replace(/([a-zA-Z])([2-9])(?!\d)/g,'$1^$2')):''};
 form.onsubmit=e=>{e.preventDefault();if(item.outcome)return;submit(item,collect(q))};
 document.querySelectorAll('[data-drill-option]').forEach(b=>b.onclick=()=>{if(!item.outcome)submit(item,Number(b.dataset.drillOption))});
 $('#drill-hint').onclick=()=>{item.hint=true;$('#drill-hint-box').innerHTML=`<div class="hint drill-hint"><strong>Hint</strong><p>${rich(q.hint)}</p></div>`;$('#drill-hint').disabled=true;announce('Hint: '+K.richSpeech(q.hint))};
 $('#drill-reveal').onclick=()=>{if(!item.outcome)finish(item,'missed','Here is one way to do it. Read each line, then try the next question.')};
 bindBoxAudio($('#app'));
 if(window.matchMedia('(pointer:fine)').matches&&lastInput)lastInput.focus({preventScroll:true});else $('#drill-prompt').focus({preventScroll:true});
}
function collect(q){
 const values=[...document.querySelectorAll('[data-drill-input]')].map(i=>i.value.trim()),a=q.answer;
 if(a.type==='fields')return values;
 if(a.type==='inequality')return {op:$('#drill-sign').value,value:values[0]};
 return values[0];
}
const PRAISE=['Correct.','Yes, that is right.','Right first time.','Spot on.','Correct. Nicely done.'];
function submit(item,input){
 const q=item.q,result=K.check(q,input),feedback=$('#drill-feedback');
 if(result.invalid){feedback.innerHTML=`<div class="feedback not-yet"><p>${rich(result.feedback)}</p></div>`;return}
 if(result.correct){finish(item,item.tries===0&&!item.hint?'first':'helped',item.tries===0&&!item.hint?PRAISE[q.seed%PRAISE.length]:'Correct. You got there.');return}
 if(result.close){feedback.innerHTML=`<div class="feedback not-yet"><strong>Nearly there</strong><p>${rich(result.feedback)}</p></div>`;return}
 item.tries++;
 if(q.answer.type==='choice'){item.struck.push(input);const b=document.querySelector(`[data-drill-option="${input}"]`);b.classList.add('wrong');b.disabled=true;b.setAttribute('aria-label',b.textContent+' (not this one)')}
 const reason=result.feedback||'That is not it yet. Check each step, or take the hint.';
 if(item.tries>=2||q.answer.type==='choice'&&q.answer.options.length<=2){finish(item,'missed',null,reason);return}
 feedback.innerHTML=`<div class="feedback not-yet"><strong>Not yet</strong><p>${rich(reason)}</p><p class="small-note">Have one more go.</p></div>`;
 if(q.answer.type!=='choice')document.querySelector('[data-drill-input]')?.select?.();
}
function solutionMarkup(q,open){
 const a=q.answer,answer=a.type==='choice'?(a.options[a.correctIndex].math?maths(a.options[a.correctIndex].math):rich(a.options[a.correctIndex].text)):a.type==='fields'?a.fields.map((f,i)=>`${i&&!/^[:×]/.test(f.label||'')&&!a.ratio&&!f.unit?', ':' '}${f.label?rich(f.label)+' ':''}${maths(K.fmt(String(f.value)))}${f.unit?' '+esc(f.unit):''}`).join('').trim():a.type==='inequality'?maths(`${a.variable||'x'} ${a.op} ${K.fmt(String(a.value))}`):a.type==='number'?`${a.label?rich(a.label)+' ':''}${maths(Number.isInteger(a.round)?K.roundTo(K.qNum(K.parseNumber(String(a.value)).q),a.round).toFixed(a.round):K.fmt(String(a.value)))}${a.unit?' '+esc(a.unit):''}`:maths(a.value);
 return `<details class="drill-working" ${open?'open':''}><summary>${open?'Worked solution':'See the working'}</summary><ol>${q.steps.map(s=>`<li>${s.math?`<div class="drill-step-maths">${maths(s.math)}</div>`:''}${s.note?`<p>${rich(s.note)}</p>`:''}</li>`).join('')}</ol><p class="drill-answer"><strong>Answer:</strong> ${answer}</p></details>`;
}
function finish(item,outcome,message,reason){
 const q=item.q,skill=K.byId.get(q.skill),last=session.index===session.items.length-1;
 item.outcome=outcome;
 const r=record(q.skill);r.asked++;if(outcome==='first')r.right++;save();
 track('drill_answered',{skill:q.skill,level:q.level,outcome},skill);
 document.querySelectorAll('[data-drill-input],#drill-sign,[data-drill-option]').forEach(el=>{el.disabled=true});
 document.querySelectorAll('.drill-keys,.drill-actions,.drill-preview,.drill-tip').forEach(el=>{el.hidden=true});
 if(q.answer.type==='choice')document.querySelector(`[data-drill-option="${q.answer.correctIndex}"]`).classList.add('correct');
 const good=outcome!=='missed';
 $('#drill-feedback').innerHTML=`<div class="feedback ${good?'':'not-yet'} drill-result ${outcome}"><strong>${good?'<span aria-hidden="true">✓</span> '+esc(message):'<span aria-hidden="true">→</span> '+(reason?'Not this time':'Worked solution')}</strong>${reason?`<p>${rich(reason)}</p>`:''}${!good&&message?`<p>${esc(message)}</p>`:''}</div>`;
 $('#drill-solution').innerHTML=solutionMarkup(q,!good);
 $('#drill-next').innerHTML=`<button class="primary" id="drill-continue">${last?'See how the round went →':'Next question →'}</button>`;
 document.querySelector('.round-dots').outerHTML=dots();
 $('#drill-continue').onclick=()=>{stopAudio();if(last)finishRound();else{session.index++;renderQuestion()}};
 $('#drill-continue').focus({preventScroll:true});
}

/* ---------- The end of a round ---------- */
const POINTS={first:1,helped:.5,missed:0};
function scoreOf(items){const points=items.reduce((sum,i)=>sum+POINTS[i.outcome],0);return {points,first:items.filter(i=>i.outcome==='first').length,helped:items.filter(i=>i.outcome==='helped').length,missed:items.filter(i=>i.outcome==='missed').length}}
function logDay(skill){progress.drills||={};const days=progress.drills.days&&typeof progress.drills.days==='object'?progress.drills.days:{},day=dayKey();days[day]=(days[day]|0)+1;const keep=Object.keys(days).sort().slice(-120);progress.drills.days=Object.fromEntries(keep.map(k=>[k,days[k]]));save();track('drill_day_logged',{day},skill)}
function reviewList(items){
 const label={first:'Right first time',helped:'Right with help',missed:'Missed'},mark={first:'✓',helped:'✓',missed:'→'};
 return `<ol class="drill-review">${items.map(item=>`<li class="${item.outcome}"><div class="drill-review-head"><span class="drill-mark" aria-hidden="true">${mark[item.outcome]}</span><span class="drill-review-status">${label[item.outcome]}</span>${session.kind==='test'?`<span class="event-tag">${esc(K.byId.get(item.q.skill).title)}</span>`:''}</div><div class="drill-review-question">${rich(item.q.prompt)} ${item.q.math?maths(item.q.math):''}</div>${solutionMarkup(item.q,false)}</li>`).join('')}</ol>`;
}
function finishRound(){
 if(session.kind==='test'){finishWarmup();return}
 const skill=K.byId.get(session.skill),level=session.level,score=scoreOf(session.items);
 const stars=score.points>=5?3:score.points>=4?2:score.points>=3?1:0,r=record(skill.id),before=r.stars[level];
 r.stars[level]=Math.max(before,stars);r.rounds++;save();
 track('drill_round_finished',{skill:skill.id,level,stars},skill);logDay(skill);
 const headline=['Not there yet, and that is fine.','One star. The method is taking shape.','Two stars. Nearly spotless.','Three stars. This level is yours.'][stars];
 const advice=stars===0?'Read the worked solutions below, then go again. The questions will be new.':stars<3&&score.missed?'Look at the ones you missed below. They show the slip to watch for.':stars===3&&level<2?'Time to step up a level.':stars===3?'You can handle the exam-style questions for this skill.':'One more clean round gets you the third star.';
 const parts=[score.first?`${score.first} right first time`:'',score.helped?`${score.helped} right with help`:'',score.missed?`${score.missed} missed`:''].filter(Boolean).join(', ');
 const stepUp=stars>=2&&level<2,done=roundsToday();
 setPage('Round complete',`${crumbs(['Skill drills','#drills=hub'],[skill.title])}
 <section class="round-summary" aria-labelledby="round-title"><p class="eyebrow">${esc(skill.title)} · Level ${level+1}</p><div class="summary-stars ${stars?'earned':''}">${starRow(stars,stars+' of 3 stars')}</div><h1 id="round-title" tabindex="-1">${headline}</h1><p class="intro">${parts}. ${advice}</p>${stars>before&&before>0?'<p class="drill-best">A new best for this level.</p>':''}
 <div class="hero-actions">${stepUp?`<button class="primary" data-drill="${esc(skill.id)}" data-level="${level+1}">Level ${level+2}: ${esc(skill.levels[level+1].name)} →</button><button data-drill="${esc(skill.id)}" data-level="${level}">Another round at this level</button>`:`<button class="primary" data-drill="${esc(skill.id)}" data-level="${level}">${stars===3?'Another round':'Go again with new questions'} →</button>`}<button id="summary-hub">All skills</button><a class="button-link" href="${lessonHref(skill)}">Read the lesson: ${esc(lessonTitle(skill))}</a></div>
 <p class="small-note">${done>=DAILY_GOAL?'Daily goal reached: '+done+' rounds today.':done+' of '+DAILY_GOAL+' rounds done today.'}</p></section>
 <h2>Your five questions</h2>${reviewList(session.items)}`);
 bindStarts();$('#summary-hub').onclick=()=>go('hub');$('#round-title').focus({preventScroll:true});announce(headline+' '+parts+'.');
}
function finishWarmup(){
 const results={};
 /* A skill asked more than once keeps its weakest result. */
 const rank={missed:0,helped:1,first:2};
 for(const item of session.items){const id=item.q.skill;if(!(id in results)||rank[item.outcome]<rank[results[id]])results[id]=item.outcome}
 const state=testState();state.last={at:dayKey(),results};saveTestState(state);
 const first=K.skills[0];logDay(K.byId.get(session.items[0].q.skill)||first);
 const score=scoreOf(session.items),groups=[['missed','Fix these first','A short round at an easier level will sort these out.'],['helped','Nearly there','You got these with a hint or a second try. One clean round each.'],['first','Solid','Right first time. Keep them warm with a harder level.']];
 setPage('Warm-up result',`${crumbs(['Skill drills','#drills=hub'],['Test warm-up'])}
 <section class="round-summary"><p class="eyebrow">Test warm-up</p><h1 id="round-title" tabindex="-1">${score.first} of ${session.items.length} right first time.</h1><p class="intro">${score.missed?'Now you know what to work on. Start at the top of the list.':'A strong warm-up. Try the exam-style level of each skill next.'}</p></section>
 ${groups.map(([key,title,note])=>{const list=Object.entries(results).filter(([,v])=>v===key).map(([id])=>K.byId.get(id));return list.length?`<section class="warmup-group ${key}"><h2>${title}</h2><p class="small-note">${note}</p><ul>${list.map(s=>`<li><span>${esc(s.title)}</span><span class="warmup-actions"><button data-drill="${esc(s.id)}" data-level="${key==='first'?Math.min(2,nextLevel(s.id)):nextLevel(s.id)}" class="${key==='missed'?'primary':''}">Practise</button><a href="${lessonHref(s)}">Lesson</a></span></li>`).join('')}</ul></section>`:''}).join('')}
 <div class="hero-actions"><button id="warmup-again">Another warm-up</button><button id="summary-hub">All skills</button></div>
 <h2>Your answers</h2>${reviewList(session.items)}`);
 bindStarts();$('#summary-hub').onclick=()=>go('hub');$('#warmup-again').onclick=()=>go('warmup');$('#round-title').focus({preventScroll:true});
}

/* ---------- Getting ready for a test ---------- */
function renderTest(){
 session=null;const picked=new Set(pickedSkills());
 setPage('Get ready for a test',`${crumbs(['Skill drills','#drills=hub'],['Get ready for a test'])}
 <header class="drill-head"><div><p class="eyebrow">Test coming up</p><h1>Find the gaps before the test does.</h1><p class="intro">Tick what is on your test. The warm-up asks ten mixed questions, then tells you which skills to fix first.</p></div></header>
 <form id="test-form" class="test-form">${K.STRANDS.map((strand,n)=>{const list=K.skills.filter(s=>s.strand===strand);return list.length?`<fieldset><legend>${esc(strand)}</legend><p><button type="button" data-all="${n}">Tick all</button><button type="button" data-none="${n}">Clear</button></p><div class="test-skills" data-strand="${n}">${list.map(s=>`<label><input type="checkbox" name="skill" value="${esc(s.id)}" ${picked.has(s.id)?'checked':''}><span>${esc(s.title)}</span>${starRow(Math.max(...starsOf(s.id)),'best: '+Math.max(...starsOf(s.id))+' of 3 stars')}</label>`).join('')}</div></fieldset>`:''}).join('')}
 <p id="test-error" class="account-error" role="alert"></p>
 <div class="hero-actions"><button class="primary" type="submit">Start the warm-up: ten questions →</button><button type="button" id="test-back">Back to all skills</button></div></form>
 <section class="test-after"><h2>After the warm-up</h2><ol><li>Do one round on each skill in your "fix first" list.</li><li>Read the lesson for any skill that still feels shaky.</li><li>Finish with one long question on paper from the chapter's Exam practice.</li></ol></section>`);
 const boxes=()=>[...document.querySelectorAll('#test-form input[name=skill]')];
 const store=()=>{const state=testState();state.picked=boxes().filter(b=>b.checked).map(b=>b.value);saveTestState(state)};
 boxes().forEach(b=>b.onchange=store);
 document.querySelectorAll('[data-all],[data-none]').forEach(b=>b.onclick=()=>{const on='all' in b.dataset;document.querySelectorAll(`[data-strand="${on?b.dataset.all:b.dataset.none}"] input`).forEach(i=>{i.checked=on});store()});
 $('#test-form').onsubmit=e=>{e.preventDefault();if(!boxes().some(b=>b.checked)){$('#test-error').textContent='Tick at least one skill first.';return}store();go('warmup')};
 $('#test-back').onclick=()=>go('hub');
}

/* ---------- Links from the rest of the guide ---------- */
/* Shown under a lesson and its topic practice when a drill exists for it. */
function lessonLinks(){
 const host=$('#lesson-content');if(!host||!currentLesson||!['learn','practice'].includes(currentMode))return;
 const list=K.skills.filter(s=>s.lesson===currentLesson.id);if(!list.length)return;
 host.insertAdjacentHTML('beforeend',`<aside class="drill-callout" aria-label="Skill drills for this lesson"><div><p class="eyebrow">Quick practice, marked as you go</p><p>Drill this skill in rounds of five questions.</p></div><div class="drill-callout-actions">${list.map(s=>`<button data-drill="${esc(s.id)}" data-level="${nextLevel(s.id)}">${esc(s.title)} ${starRow(Math.max(...starsOf(s.id)))}</button>`).join('')}</div></aside>`);
 bindStarts(host.querySelector('.drill-callout'));
}
function homePanel(){
 const next=suggestion(),stars=totalStars(K.skills),done=roundsToday();
 return `<section class="home-drills" aria-labelledby="home-drills-title"><div class="home-drills-text"><p class="eyebrow">New: skill drills</p><h2 id="home-drills-title">Five questions. Marked as you go.</h2><p>Pick a skill, answer five questions, and see at once what went right and where you slipped. Fresh questions every round.</p><div class="hero-actions"><button class="primary" data-drill="${esc(next.id)}" data-level="${nextLevel(next.id)}">${stars?'Next up':'Try one'}: ${esc(next.title)} →</button><button id="home-drills-all">All skills</button><button id="home-drills-test">Get ready for a test</button></div></div><div class="home-drills-status">${ring(done,DAILY_GOAL)}<p><strong>${done>=DAILY_GOAL?'Daily goal reached':done+' of '+DAILY_GOAL+' rounds today'}</strong><span>${stars} ${stars===1?'star':'stars'} so far${streak()>1?' · '+streak()+' days in a row':''}</span></p></div></section>`;
}
function bindHome(){const host=document.querySelector('.home-drills');if(!host)return;bindStarts(host);$('#home-drills-all').onclick=()=>go('hub');$('#home-drills-test').onclick=()=>go('test')}

function render(params){
 if(!K.skills.length){renderHome();return}
 const view=params.get('drills');
 if(view==='round'){startRound(params.get('skill'),Number(params.get('level')));return}
 if(view==='warmup'){startWarmup();return}
 if(view==='test'){renderTest();return}
 renderHub();
}
const topButton=document.getElementById('drills-button');if(topButton)topButton.onclick=()=>go('hub');
return {render,lessonLinks,homePanel,bindHome,leave(){studying=false},get studying(){return studying},starsOf,nextLevel,current(){return session?session.items[session.index].q:null}};
})();
