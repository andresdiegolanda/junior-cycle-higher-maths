/* Stable question IDs preserve the original two checks and their saved answers.
   Written reviews are self-reports, never automatic marks or mastery scores. */
const practiceMemory = {};
const practiceLevels = ['Warm up', 'Check the idea', 'Apply', 'Build', 'Connect', 'Challenge'];
function practiceState(q) {
 return practiceMemory[q.id] || (practiceMemory[q.id] = {hints:0, steps:0, notesOpen:false});
}
function practiceSaved(q) { return progress.practice?.[q.id] || {}; }
function savePractice(q, changes) {
 progress.practice ||= {};
 progress.practice[q.id] = {...practiceSaved(q), ...changes}; save();
}
function practiceIndex(l) {
 const index=progress.practicePosition?.[l.id];
 return Number.isInteger(index) ? Math.max(0,Math.min(l.exercises.length-1,index)) : 0;
}
function exerciseStatus(q) {
 if(q.type==='choice') {
  const ans=progress.answers[q.id];
  return !Number.isInteger(ans)?'Not answered':ans===q.answer?'Correct':'Try again';
 }
 return {independent:'Solved independently',supported:'Solved with help',revisit:'Try again'}[practiceSaved(q).review] || 'Not reviewed';
}
function practiceAudio(key,text,label,content,classes='') {
 return `<section class="audio-box ${classes}" ${boxAttributes(key,text,label)}><div class="box-heading"><strong>${E(label)}</strong>${boxStatus()}${boxAudio(key,label)}</div>${content}</section>`;
}
function renderPractice(focusId) {
 const l=currentLesson, qs=l.exercises, index=practiceIndex(l), q=qs[index];
 const state=practiceState(q), saved=practiceSaved(q), choice=q.type==='choice';
 const selected=progress.answers[q.id], answered=Number.isInteger(selected), correct=selected===q.answer;
 const complete=!choice && state.steps===q.solution.length;
 const reviewed=qs.filter(t=>t.type==='choice'?progress.answers[t.id]===t.answer:!!practiceSaved(t).review).length;
 $('#lesson-content').innerHTML=`<header class="practice-intro"><p class="eyebrow">Six steps to stronger problem solving</p><h2>Make the method yours</h2><p>${E(l.title)}</p><p class="small-note">Work from easier to harder. Try on paper, take a clue if needed, then compare your reasoning. Written answers are self-checked.</p></header>
 <nav class="exercise-path" aria-label="Exercises, easier to harder">${qs.map((item,i)=>`<button data-exercise="${i}" ${index===i?'aria-current="step"':''} class="${index===i?'active':''}"><span class="screen-reader">Exercise </span><span class="exercise-number">${i+1}</span><span class="screen-reader">: </span><strong>${practiceLevels[i]}</strong><span class="screen-reader">. </span><small>${E(exerciseStatus(item))}</small></button>`).join('')}</nav>
 <button id="practice-new-attempt" class="practice-new-attempt">Start a new attempt</button><p class="practice-progress" role="status">${reviewed} of ${qs.length} checked or reviewed <span>· Written reviews are your own assessment.</span></p>
 <article class="quiz-card exercise-card" id="exercise-${E(q.id)}">
 <div class="exercise-meta"><span>EXERCISE ${index+1} OF ${qs.length} · ${practiceLevels[index]}</span><span>${choice?'Choose an answer':'Work it out on paper'}</span></div>
 <section class="question-box audio-box" ${boxAttributes('practice-question',q.speechQuestion,'Exercise '+(index+1))}><div class="box-heading"><h3 id="practice-title" tabindex="-1">${choice?'Check your understanding':'Your turn'}</h3>${boxStatus()}${boxAudio('practice-question','Exercise '+(index+1))}</div>${readingMarkup(q.questionParts||[q.question],"quiz-question")}
 ${choice?`<div class="options" role="group" aria-label="Answer choices">${q.options.map((o,j)=>`<button id="practice-answer-${j}" class="option ${answered&&j===selected?(correct?'correct':'wrong'):''}" data-practice-answer="${j}" aria-pressed="${answered&&j===selected}"><span class="letter">${String.fromCharCode(65+j)}</span><span>${E(o)}</span></button>`).join('')}</div>`:''}</section>
 ${!choice?`<details class="working-pad" id="practice-notes-panel" ${state.notesOpen?'open':''}><summary>Your working and notes</summary><label for="practice-notes">Use paper or jot notes here. Saved in this browser.</label><textarea id="practice-notes" rows="4" placeholder="What is given? Which method fits?">${E(saved.notes||'')}</textarea></details>`:''}
 <div class="quiz-footer"><button id="practice-hint" ${state.hints>=q.hints.length?'disabled':''}>${state.hints===0?'Give me a clue':state.hints>=q.hints.length?'All clues shown':'Give me the next clue'}</button><button id="practice-method">Revisit the method</button></div>
 <div class="practice-hints">${q.hints.slice(0,state.hints).map((h,i)=>practiceAudio('practice-hint-'+i,q.speechHints[i],'Clue '+(i+1),`<p>${E(h)}</p>`,'hint')).join('')}</div>
 ${choice&&answered?practiceAudio('practice-feedback',q.speechExplanation,correct?'Correct. Here is why':'Not yet. Compare the reasoning',`${readingMarkup(q.explanationParts||[q.explanation])}${ruleHelpButton(q.explanationHelp)}`,'feedback '+(correct?'':'not-yet')):''}
 ${!choice?`<section class="practice-working"><div class="working-header"><h3>Compare your working</h3><span>${state.steps} / ${q.solution.length} steps revealed</span></div><p class="small-note">Try the problem before uncovering the solution.</p>
 <ol class="practice-solution">${q.solution.slice(0,state.steps).map((s,i)=>`<li>${practiceAudio('practice-step-'+i,q.speechSolution[i],'Step '+(i+1),practiceWorkingMarkup(q,i))}</li>`).join('')}</ol>
 <div class="solution-controls"><button id="practice-next-step" class="primary" ${complete?'disabled':''}>${state.steps?'Reveal next step':'Reveal the first step'}</button><button id="practice-all" ${complete?'disabled':''}>Show full solution</button><button id="practice-cover">Cover clues & solution</button></div>
 ${complete?`${practiceAudio('practice-result',q.speechResult,'Answer and check',`<p class="practice-result">${E(q.answer)}</p><p><b>Check it:</b> ${E(q.check)}</p>`,'challenge-answer')}<fieldset class="practice-review"><legend>How did it go? Your own assessment.</legend>${[['independent','I solved it independently'],['supported','I solved it with help'],['revisit','I want to try again']].map(([value,label])=>`<button id="practice-review-${value}" data-practice-review="${value}" aria-pressed="${saved.review===value}">${label}</button>`).join('')}<p class="small-note">This records your reflection; it does not mark your written work or change lesson confidence.</p></fieldset>`:''}</section>`:''}
 </article><div class="practice-navigation"><button id="practice-previous" ${index===0?'disabled':''}>← Previous exercise</button><button id="practice-next" class="primary">${index===qs.length-1?'Back to the method':'Next exercise →'}</button></div>`;
 document.querySelectorAll('[data-exercise]').forEach(b=>b.onclick=()=>movePractice(Number(b.dataset.exercise)));
 document.querySelectorAll('[data-practice-answer]').forEach(b=>b.onclick=()=>{
  stopAudio();const answer=Number(b.dataset.practiceAnswer);progress.answers[q.id]=answer;save();if(typeof MathsAccount!=='undefined')MathsAccount.exercise(q,'choice_submitted',{option:answer});
  renderPractice(b.id);announce((answer===q.answer?'Correct. ':'Not yet. ')+q.explanation);
 });
 $('#practice-hint').onclick=()=>{
  stopAudio();state.hints=Math.min(state.hints+1,q.hints.length);savePractice(q,{usedClue:true});if(typeof MathsAccount!=='undefined')MathsAccount.exercise(q,'clue_revealed',{index:state.hints-1});
  renderPractice(state.hints<q.hints.length?'practice-hint':'practice-method');
  announce('Clue '+state.hints+'. '+q.hints[state.hints-1]);
 };
 $('#practice-method').onclick=()=>$('#mode-learn').click();
 if(!choice){
  $('#practice-notes-panel').ontoggle=e=>{state.notesOpen=e.target.open};
  $('#practice-notes').oninput=e=>savePractice(q,{notes:e.target.value});
  const reveal=(all=false)=>{
   stopAudio();state.steps=all?q.solution.length:Math.min(state.steps+1,q.solution.length);
   savePractice(q,{viewedSolution:true});if(typeof MathsAccount!=='undefined')MathsAccount.exercise(q,'solution_step_revealed',{index:state.steps-1});renderPractice(state.steps===q.solution.length?'practice-review-independent':'practice-next-step');
   announce(all?'Full worked solution revealed.':'Step '+state.steps+'. '+q.solution[state.steps-1]);
  };
  $('#practice-next-step').onclick=()=>reveal();$('#practice-all').onclick=()=>reveal(true);
  $('#practice-cover').onclick=()=>{stopAudio();state.hints=0;state.steps=0;renderPractice('practice-title');announce('Clues and solution covered. Your notes and review are retained.');};
  document.querySelectorAll('[data-practice-review]').forEach(b=>b.onclick=()=>{savePractice(q,{review:b.dataset.practiceReview});if(typeof MathsAccount!=='undefined')MathsAccount.exercise(q,'self_assessment_changed',{review:b.dataset.practiceReview});renderPractice(b.id);announce(exerciseStatus(q)+'. Your self-assessment has been saved.');});
 }
 $('#practice-previous').onclick=()=>movePractice(index-1);
 $('#practice-next').onclick=()=>index===qs.length-1?$('#mode-learn').click():movePractice(index+1);
 $('#practice-new-attempt').onclick=()=>{state.hints=0;state.steps=0;if(typeof MathsAccount!=='undefined')MathsAccount.retry(q);renderPractice('practice-new-attempt')};
 bindBoxAudio();if(typeof Drills!=='undefined')Drills.lessonLinks();
 if(typeof focusId==='string')document.getElementById(focusId)?.focus({preventScroll:true});
}
function movePractice(index){
 if(!Number.isInteger(index)||index<0||index>=currentLesson.exercises.length)return;
 stopAudio();progress.practicePosition ||= {};progress.practicePosition[currentLesson.id]=index;save();
 renderPractice('practice-title');$('#practice-title').scrollIntoView({block:'nearest',behavior:reducedMotion()?'instant':'smooth'});
}
