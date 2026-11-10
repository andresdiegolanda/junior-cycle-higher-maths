/* Preserve authored mathematics; organise it into short, readable blocks. */
function readingMarkup(parts,classes=''){
 return (Array.isArray(parts)?parts:[parts]).filter(Boolean).map(p=>`<p class="${classes}">${E(p)}</p>`).join('');
}
function workingMarkup(parts){
 if(typeof parts==='string')parts=parts.split(/;\s+(?!with\b|for\b|still\b)/);
 return parts.map(p=>`<div class="working-line">${E(p)}</div>`).join('');
}
function lessonConceptMarkup(l){
 if(!l.coach)return '';
 return `<section class="concept-bridge audio-box" ${boxAttributes('lesson-concept',l.coach.speech,'Get the idea')}><div class="box-heading"><p class="eyebrow">Before the calculation</p>${boxStatus()}${boxAudio('lesson-concept','Get the idea')}</div><h3>${E(l.coach.hook)}</h3><details class="concept-answer"><summary>Show the idea</summary>${readingMarkup(l.coach.idea)}</details></section>`;
}
function lessonPlanMarkup(l){
 if(!l.coach)return '';
 return `<details class="practice-plan"><summary>A starting strategy for this topic</summary><section class="audio-box" ${boxAttributes('lesson-plan',l.coach.speechPlan,'Make a plan')}><div class="box-heading"><strong>First, picture what the method means</strong>${boxStatus()}${boxAudio('lesson-plan','Make a plan')}</div><p>${E(l.coach.start)}</p><p class="plan-reason"><b>Why this helps:</b> ${E(l.coach.why)}</p></section></details>`;
}
function practiceWorkingMarkup(q,i){
 const item=q.workedReading?.[i];
 return `<div class="readable-working">${workingMarkup(item?.parts||[q.solution[i]])}</div>${item?.reason?`<p class="working-reason"><b>Why this move works</b> ${E(item.reason)}</p>`:''}${ruleHelpButton(q.solutionHelp?.[i])}`;
}
