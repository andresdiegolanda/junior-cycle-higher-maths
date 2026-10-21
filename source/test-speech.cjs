const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Engine extends EventTarget{getVoices(){return [{name:'English local',lang:'en-GB',voiceURI:'local',localService:true}]}cancel(){this.cancelled=(this.cancelled||0)+1}speak(u){this.current=u;this.calls=(this.calls||0)+1;u.onstart?.()}finish(){this.current.onend()} }
class Utterance{constructor(text){this.text=text}}
const engine=new Engine();const context={EventTarget,Event,setTimeout,clearTimeout,window:{speechSynthesis:engine,SpeechSynthesisUtterance:Utterance},localStorage:{getItem(){return null},setItem(){}},console};vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname+'/speech.js','utf8')+'\nglobalThis.Narrator=BrowserNarrator;',context);
const n=new context.Narrator(engine,Utterance);let endings=0;n.addEventListener('ended',()=>endings++);
n.start('First sentence. Second sentence.');assert.equal(n.paused,false);assert.equal(engine.current.text,'First sentence.');
const stale=engine.current;n.pause();assert.equal(n.paused,true);stale.onend();assert.equal(n.index,0);assert.equal(endings,0);
n.play();assert.equal(engine.current.text,'First sentence.');engine.finish();assert.equal(n.index,1);assert.equal(engine.current.text,'Second sentence.');
n.repeat();assert.equal(engine.current.text,'Second sentence.');n.playbackRate=.8;assert.equal(engine.current.rate,.8);
engine.finish();assert.equal(n.ended,true);assert.equal(endings,1);
n.start('New narration.');const cancelled=engine.current;n.cancel();cancelled.onend();assert.equal(endings,1);assert.equal(n.ended,true);
n.start('First. Second.');n.restart();assert.equal(engine.current.text,'First.');n.setVoice('local');assert.equal(engine.current.voice.voiceURI,'local');n.cancel();
assert.equal(n.split('The value is 3.14. Check it.').length,2);assert.ok(n.split('word '.repeat(150)).every(s=>s.length<195));
const unavailable=new context.Narrator(null,null);unavailable.start('Read me.');assert.match(unavailable.error,/unavailable/);
const broken=new Engine();broken.speak=()=>{throw Error('test')};const bad=new context.Narrator(broken,Utterance);bad.start('Read me.');assert.ok(bad.error);assert.equal(bad.paused,true);
console.log('Speech checks passed: cancellation races, pause/continue, repeat, rate, voice, finish, unsupported and failure fallback.');
