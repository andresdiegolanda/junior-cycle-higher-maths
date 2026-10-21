/* One shared voice, one active teaching box. Whole-lesson transitions are
   driven by speech completion, never by an assumed reading speed. */
let lessonQueue=[],lessonCursor=-1,followNarration=true,lessonFinished=false;
try{followNarration=localStorage.getItem('jc-maths-follow')!=='false'}catch(e){}
const speakerIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8c2 2 2 6 0 8M19 5c4 4 4 10 0 14"/></svg>';
const pauseIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
function boxAttributes(key,text,label){return `data-narration-box="${E(key)}" data-narration-text="${E(text)}" data-narration-label="${E(label)}"`}
function boxAudio(key,label){return `<button class="box-audio" data-read-box="${E(key)}" aria-label="Listen: ${E(label)}" title="Listen to this box">${speakerIcon}<span>Listen</span></button>`}
function boxStatus(){return '<span class="box-reading-status"><i aria-hidden="true"></i><span></span></span>'}
function activeBox(){return clipContext?.box?document.querySelector(`[data-narration-box="${clipContext.box}"]`):null}
function stopAudio(){player.error='';autoLesson=false;lessonFinished=false;lessonQueue=[];lessonCursor=-1;clearTimeout(autoTimer);clipContext=null;player.cancel();updateAudio()}
function playNarration(text,context){
 clearTimeout(autoTimer);
 if(!context.whole){autoLesson=false;lessonQueue=[];lessonCursor=-1;lessonFinished=false}
 clipContext=context;player.start(text);updateAudio();followCurrentBox();
}
function readBox(key,whole=false){
 const el=document.querySelector(`[data-narration-box="${key}"]`);if(!el)return false;
 if(!whole&&clipContext?.box===key&&!player.ended){if(player.paused)player.play();else player.pause();updateAudio();return true}
 playNarration(el.dataset.narrationText,{kind:'box',box:key,label:el.dataset.narrationLabel,lesson:currentLesson?.id,step:currentStep,whole});return true;
}
function bindBoxAudio(root=document){root.querySelectorAll('[data-read-box]').forEach(b=>b.onclick=()=>readBox(b.dataset.readBox));updateAudio()}
function followCurrentBox(){
 const el=activeBox();if(!el||!followNarration)return;
 let parent=el.parentElement;while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement}
 const rect=el.getBoundingClientRect(),top=($('#lesson-player')?.getBoundingClientRect().height||0)+20,bottom=window.innerHeight-Math.max(100,($('#audio-dock')?.getBoundingClientRect().height||0)+28);
 if(rect.top<top||rect.bottom>bottom)el.scrollIntoView({block:rect.height>bottom-top?'start':'nearest',behavior:reducedMotion()?'instant':'smooth'});
}
function setFollowNarration(value){followNarration=!!value;try{localStorage.setItem('jc-maths-follow',String(followNarration))}catch(e){}if(followNarration&&clipContext)followCurrentBox()}
function buildLessonQueue(lesson){
 return [{step:0,box:'lesson-goal'},...lesson.steps.flatMap((s,i)=>[{step:i,box:'step-diagram'},{step:i,box:'step-explanation'},{step:i,box:'step-why'}]),{step:lesson.steps.length-1,box:'lesson-takeaway'},{step:lesson.steps.length-1,box:'lesson-mistake'}];
}
function playQueuedPart(){
 const part=lessonQueue[lessonCursor];if(!part)return;
 if(part.step!==currentStep)setStep(part.step,true);
 if(!readBox(part.box,true)){stopAudio();announce('This explanation is unavailable. Please use the written guide.')}
}
function playLesson(){
 if(autoLesson){if(player.paused)player.play();else player.pause();updateAudio();return}
 stopAudio();autoLesson=true;lessonQueue=buildLessonQueue(currentLesson);lessonCursor=0;playQueuedPart();
}
function updateAudio(){
 const active=clipContext&&!player.ended,playing=active&&!player.paused;
 document.querySelectorAll('[data-narration-box]').forEach(el=>{
  const selected=!!active&&el.dataset.narrationBox===clipContext.box;
  el.classList.toggle('is-reading',selected&&playing);el.classList.toggle('reading-paused',selected&&!playing);
  const status=Array.from(el.querySelectorAll('.box-reading-status')).find(n=>n.closest('[data-narration-box]')===el);
  if(status){status.hidden=!selected;status.querySelector('span').textContent=selected?(playing?(player.waiting?'Starting voice':'Reading now'):'Paused here'):''}
 });
 document.querySelectorAll('[data-read-box]').forEach(b=>{
  const same=active&&b.dataset.readBox===clipContext.box,verb=same?(player.paused?'Continue':'Pause'):'Listen';
  const label=document.querySelector(`[data-narration-box="${b.dataset.readBox}"]`)?.dataset.narrationLabel||'this box';
  b.innerHTML=(same&&!player.paused?pauseIcon:speakerIcon)+'<span>'+verb+'</span>';b.setAttribute('aria-label',verb+': '+label);b.setAttribute('aria-pressed',String(!!same&&!player.paused));
 });
 const all=$('#play-lesson');if(all){all.textContent=autoLesson?(player.paused?'Continue lesson':'Pause lesson'):(lessonFinished?'Replay whole lesson':'Play whole lesson');all.setAttribute('aria-pressed',String(!!autoLesson&&!player.paused))}
 const status=player.error||(!player.supported?'Speech unavailable. The written guide is ready.':active?(playing?(player.waiting?'Starting voice':'Reading now'):'Paused')+' · '+(autoLesson?'Step '+(currentStep+1)+' of '+currentLesson.steps.length+' · ':'')+(clipContext.label||'Narration'):lessonFinished?'Lesson complete. Ready to try it yourself?':'Listen to a box, or follow the whole lesson.');
 if($('#audio-status'))$('#audio-status').textContent=status;
 if($('#lesson-reading-progress')){$('#lesson-reading-progress').hidden=!autoLesson;$('#lesson-reading-progress').max=lessonQueue.length||1;$('#lesson-reading-progress').value=Math.max(0,lessonCursor);$('#lesson-reading-progress').setAttribute('aria-label','Lesson narration: part '+(lessonCursor+1)+' of '+lessonQueue.length)}
 if($('#lesson-stop'))$('#lesson-stop').disabled=!active;
 const dock=$('#audio-dock');if(dock){dock.hidden=!active||clipContext.kind==='preview'||clipContext.kind==='glossary';$('#dock-pause').textContent=player.paused?'Continue':'Pause';$('#dock-time').textContent=player.error||(clipContext?.label||'Narration')+' · '+player.position;dock.classList.toggle('is-speaking',!!playing)}
 document.querySelectorAll('[data-repeat-speech]').forEach(b=>b.disabled=!active);
 for(const id of ['audio-speed','dock-speed','voice-speed']){const el=$('#'+id);if(el)el.value=String(player.playbackRate)}
 const notice=$('#speech-error');if(notice){notice.hidden=!player.error;notice.textContent=player.error}
}
['pause','play','voices'].forEach(event=>player.addEventListener(event,updateAudio));
player.addEventListener('ended',()=>{
 if(autoLesson&&clipContext?.whole&&clipContext.lesson===currentLesson?.id){
  lessonCursor++;
  if(lessonCursor<lessonQueue.length)playQueuedPart();
  else{autoLesson=false;lessonFinished=true;announce('Lesson complete. Try the practice questions when you are ready.')}
 }
 updateAudio();
});
player.addEventListener('error',()=>{autoLesson=false;lessonQueue=[];lessonCursor=-1;const transcript=$('#transcript');if(transcript)transcript.open=true;announce(player.error);updateAudio()});
function setStep(n,continueAudio=false){
 if(n<0||n>=currentLesson.steps.length)return;
 const old=sceneSnapshot(),focusId=document.activeElement?.id;
 if(!continueAudio)stopAudio();
 currentStep=n;renderLesson(old);
 if(!continueAudio&&focusId&&document.getElementById(focusId))document.getElementById(focusId).focus({preventScroll:true});
 if(!continueAudio)announce('Step '+(n+1)+': '+currentLesson.steps[n].title);
}
