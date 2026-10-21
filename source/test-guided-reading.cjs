const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Engine extends EventTarget {getVoices(){return [{lang:'en-GB',voiceURI:'local',localService:true}]}cancel(){this.cancellations=(this.cancellations||0)+1}speak(u){this.current=u;this.spoken.push(u.text);u.onstart?.()}finish(){this.current.onend()}constructor(){super();this.spoken=[];this.cancellations=0}}
class Utterance{constructor(text){this.text=text}}
const engine=new Engine(),context={EventTarget,Event,clearTimeout,setTimeout,window:{speechSynthesis:engine,SpeechSynthesisUtterance:Utterance,innerHeight:800},localStorage:{getItem(){return null},setItem(){}},console};vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname+'/speech.js','utf8')+`
const player=new BrowserNarrator();let autoLesson=false,autoTimer=null,clipContext=null,currentStep=0;
let currentLesson={id:'test',steps:[{},{}]},currentChapter={id:1};const E=s=>s;
let nodes={},scrolled=0,renders=0,messages=[];const reducedMotion=()=>true;
const $=selector=>nodes[selector]||null;
function createNode(key,text){return {dataset:{narrationBox:key,narrationText:text,narrationLabel:key},classList:{toggle(){}},querySelectorAll(){return []},getBoundingClientRect(){return {top:900,bottom:1100,height:200}},scrollIntoView(){scrolled++},parentElement:null}}
function renderLesson(){renders++;nodes={};['lesson-goal','step-explanation','step-diagram','step-why','lesson-takeaway','lesson-mistake'].forEach(key=>nodes['[data-narration-box="'+key+'"]']=createNode(key,key+' step '+currentStep))}
function sceneSnapshot(){return null}function announce(s){messages.push(s)}
const document={querySelector:$,querySelectorAll(selector){return selector==='[data-narration-box]'?Object.values(nodes):[]},activeElement:null,getElementById(){return null}};
renderLesson();
`+fs.readFileSync(__dirname+'/reading.js','utf8'),context);
const run=s=>vm.runInContext(s,context),read=s=>run(s);
run('playLesson()');assert.equal(read('autoLesson'),true);assert.equal(read('lessonQueue.length'),9);assert.equal(engine.current.text,'lesson-goal step 0');assert.equal(read('scrolled'),1);
engine.finish();assert.equal(engine.current.text,'step-diagram step 0');assert.equal(engine.cancellations,0,'Do not cancel a completed utterance between boxes');
const stale=engine.current;run('playLesson()');assert.equal(read('player.paused'),true);stale.onend();assert.equal(read('lessonCursor'),1,'Cancelled completion must not advance');
run('playLesson()');assert.equal(read('player.paused'),false);assert.equal(engine.current.text,'step-diagram step 0');
engine.finish();engine.finish();engine.finish();assert.equal(read('currentStep'),1);assert.equal(engine.current.text,'step-diagram step 1');
const scrolled=read('scrolled');run('setFollowNarration(false)');engine.finish();assert.equal(read('scrolled'),scrolled,'Follow off keeps scroll position');
run('readBox("step-why")');assert.equal(read('autoLesson'),false,'Choosing another box ends whole-lesson playback');assert.equal(read('clipContext.box'),'step-why');
engine.finish();assert.equal(read('currentStep'),1);assert.equal(read('player.ended'),true);
run('playLesson()');assert.equal(read('currentStep'),0,'Whole lesson starts at its beginning');
for(let i=0;i<9;i++)engine.finish();assert.equal(read('autoLesson'),false);assert.equal(read('lessonFinished'),true);assert.equal(read('currentStep'),1);assert.match(read('messages.at(-1)'),/Lesson complete/);
run('playLesson();setStep(1)');assert.equal(read('autoLesson'),false);assert.equal(read('clipContext'),null);assert.equal(read('player.ended'),true,'Manual navigation stops narration');
run('playLesson()');engine.current.onerror({error:'synthesis-failed'});assert.equal(read('autoLesson'),false);assert.equal(read('lessonQueue.length'),0);assert.ok(read('player.error'));
console.log('Guided-reading checks passed: box order, end-driven step changes, pause/resume, stale completions, follow toggle, manual selection, completion, restart and failure.');
