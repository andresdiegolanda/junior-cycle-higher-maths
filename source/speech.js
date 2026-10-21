/* Short speech segments keep the lesson aligned with its diagram. Pausing
   cancels at the current segment; continuing repeats that segment reliably. */
class BrowserNarrator extends EventTarget {
  constructor(engine=window.speechSynthesis,Utterance=window.SpeechSynthesisUtterance){
    super();this.engine=engine;this.Utterance=Utterance;this.supported=!!(engine&&Utterance);
    this.paused=true;this.ended=true;this.segments=[];this.index=0;this.token=0;
    this._rate=1;this.voiceKey='';this.voices=[];this.error='';this.waiting=false;
    try {const p=JSON.parse(localStorage.getItem('jc-maths-voice')||'{}');this.voiceKey=p.voice||'';this._rate=[.8,1,1.15,1.3].includes(p.rate)?p.rate:1}catch(e){}
    if(this.supported){this.loadVoices();engine.addEventListener?.('voiceschanged',()=>this.loadVoices())}
  }
  emit(type){this.dispatchEvent(new Event(type))}
  loadVoices(){this.voices=this.engine.getVoices().filter(v=>/^en(?:-|_|$)/i.test(v.lang));this.emit('voices')}
  get voice(){return this.voices.find(v=>v.voiceURI===this.voiceKey)||this.voices.find(v=>v.localService&&/^en-(IE|GB)/i.test(v.lang))||this.voices.find(v=>v.localService)||this.voices[0]}
  save(){try{localStorage.setItem('jc-maths-voice',JSON.stringify({voice:this.voiceKey,rate:this._rate}))}catch(e){}}
  setVoice(key){this.voiceKey=key;this.save();if(!this.paused)this.run()}
  get playbackRate(){return this._rate}
  set playbackRate(value){const n=Number(value);if(![.8,1,1.15,1.3].includes(n))return;const changed=n!==this._rate;this._rate=n;this.save();if(changed&&!this.paused)this.run()}
  split(text){
    const sentences=String(text).trim().split(/(?<=[.!?])\s+(?=[A-Z0-9])/).filter(Boolean);
    return sentences.flatMap(s=>{const words=s.split(/\s+/),out=[];let part='';for(const word of words){if(part.length+word.length>190){out.push(part);part=''}part+=(part?' ':'')+word}if(part)out.push(part);return out});
  }
  start(text){this.cancel();this.segments=this.split(text);this.index=0;this.ended=!this.segments.length;this.error='';return this.play(false)}
  play(replace=true){
    if(!this.supported){this.error='Speech is unavailable in this browser. Read the explanation or transcript.';this.emit('error');return Promise.resolve()}
    if(!this.segments.length)return Promise.resolve();
    if(this.ended)this.index=0;this.ended=false;this.paused=false;this.run(replace);return Promise.resolve();
  }
  run(replace=true){
    const token=++this.token;clearTimeout(this.watchdog);if(replace)this.engine.cancel();
    if(this.paused||this.ended)return;
    const u=new this.Utterance(this.segments[this.index]);this.utterance=u;
    const voice=this.voice;if(voice)u.voice=voice;u.lang=voice?.lang||'en-GB';u.rate=this._rate;
    this.waiting=true;this.emit('play');
    u.onstart=()=>{if(token!==this.token)return;this.waiting=false;clearTimeout(this.watchdog);this.emit('play')};
    u.onend=()=>{if(token!==this.token||this.paused)return;clearTimeout(this.watchdog);this.waiting=false;this.index++;if(this.index<this.segments.length)this.run(false);else{this.paused=true;this.ended=true;this.emit('ended')}};
    u.onerror=e=>{if(token!==this.token)return;this.fail(e.error==='not-allowed'?'Press Listen to start speech in this browser.':'The selected voice could not speak. Try another voice in Voice settings.')};
    this.watchdog=setTimeout(()=>{if(token===this.token&&this.waiting)this.fail('The voice did not start. Try a local voice in Voice settings.')},15000);
    try{this.engine.speak(u)}catch(e){this.fail('Speech could not start. Try another voice or read the transcript.')}
  }
  fail(message){this.cancel();this.error=message;this.emit('error')}
  pause(){if(this.paused)return;++this.token;clearTimeout(this.watchdog);this.engine?.cancel();this.paused=true;this.waiting=false;this.emit('pause')}
  cancel(){const pending=!this.ended;++this.token;clearTimeout(this.watchdog);if(pending)this.engine?.cancel();this.paused=true;this.ended=true;this.waiting=false;this.emit('pause')}
  repeat(){if(!this.segments.length)return;this.index=Math.min(this.index,this.segments.length-1);this.ended=false;this.paused=false;this.run()}
  restart(){this.index=0;this.ended=false;this.play()}
  get position(){return this.segments.length?'Part '+Math.min(this.index+1,this.segments.length)+' of '+this.segments.length:''}
}
