/* Account state never adopts the anonymous browser record automatically. */
const MathsAccount=(()=>{
 let user=null,ready=false,offline=false,busy=null,locked=false,message='',revision={},sessionId=null,lastAction=Date.now(),lastEvent=0,lastRoute='',lastStep='',attempts={},timer=null,tickAt=Date.now(),channel=null;
 const memory=new Map();
 const local=location.protocol==='file:'||['localhost','127.0.0.1','[::1]'].includes(location.hostname);
 const key=id=>'jc-event:'+user.id+':'+id;
 function queue(){if(!user)return [];const all=new Map(memory);try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('jc-event:'+user.id+':')){const e=JSON.parse(localStorage.getItem(k));all.set(e.id,e)}}}catch{}return [...all.values()].sort((a,b)=>a.at.localeCompare(b.at)||a.order-b.order)}
 function put(e){memory.set(e.id,e);try{localStorage.setItem(key(e.id),JSON.stringify(e))}catch{message='Keep this tab open: browser storage is unavailable.'}}
 function drop(id){memory.delete(id);try{localStorage.removeItem(key(id))}catch{}}
 async function request(url,options={}){
  const response=await fetch(url,{credentials:'same-origin',cache:'no-store',...options,headers:{'X-Maths-Request':'1','X-Requested-With':'XMLHttpRequest',...(user?{'X-Maths-Account':user.id}:{}),...(options.body?{'Content-Type':'application/json'}:{}),...options.headers}});
  if(!response.headers.get('Content-Type')?.includes('application/json'))throw Object.assign(new Error('Sign in again to save your work.'),{status:response.status===404?404:401});
  const data=await response.json();if(!response.ok)throw Object.assign(new Error(data.error||'Unable to save. Please try again.'),{status:response.status});return data;
 }
 function status(text){if(text!==undefined)message=text;const n=document.getElementById('account-sync');if(n)n.textContent=message||(queue().length?'Waiting to sync':'Saved');}
 function apply(rows,initial=false){
  if(initial){const notes={};try{Object.assign(notes,JSON.parse(localStorage.getItem(storeKey)||'{}'))}catch{}progress={lessons:{},answers:{},practice:{},challenges:{},last:null};for(const scope of ['practice','challenges'])for(const [id,v]of Object.entries(notes[scope]||{}))if(typeof v.notes==='string')progress[scope][id]={notes:v.notes};}
  for(const row of rows){const k=row.scope+':'+row.item_id;revision[k]=row.revision;if(!initial&&queue().some(e=>scopeOf(e)===k))continue;const s=JSON.parse(row.state);
   if(row.scope==='lesson')progress.lessons[row.item_id]={seen:[],done:false,...s};
   if(row.scope==='position')progress.last=s;
   if(row.scope==='exercise'){if(Number.isInteger(s.option))progress.answers[row.item_id]=s.option;else delete progress.answers[row.item_id];const target=row.item_id.includes('-c')?progress.challenges:progress.practice;target[row.item_id]={notes:target[row.item_id]?.notes,...s}}
  }
  save();
 }
 function scopeOf(e){return e.kind==='lesson_opened'?'position:last':['teaching_step_viewed','confidence_changed'].includes(e.kind)?'lesson:'+e.lessonId:['exercise_started','choice_submitted','clue_revealed','solution_step_revealed','self_assessment_changed'].includes(e.kind)?'exercise:'+e.exerciseId:null}
 function session(){if(!sessionId||Date.now()-lastEvent>1800000){sessionId=crypto.randomUUID();attempts={}}lastEvent=Date.now();return sessionId}
 let order=0;
 function emit(kind,payload={},context={}){
  if(!ready||offline||locked||!user)return;
  if(queue().length>=2000){status('Pending activity is full. Reconnect before continuing.');return}
  const e={id:crypto.randomUUID(),sessionId:session(),kind,payload,at:new Date().toISOString(),version:DATA.contentVersion,order:++order,...context};
  const scope=scopeOf(e);if(scope)e.baseRevision=(revision[scope]||0)+queue().filter(x=>scopeOf(x)===scope).length;
  put(e);status();clearTimeout(timer);timer=setTimeout(flush,800);
 }
 function exercise(q,kind,payload={}){
  if(!ready||offline||locked)return;
  session();let a=attempts[q.id];if(!a){a=attempts[q.id]=crypto.randomUUID();emit('exercise_started',{}, {exerciseId:q.id,attemptId:a,lessonId:q.id.includes('-c')?undefined:currentLesson.id})}
  if(kind)emit(kind,payload,{exerciseId:q.id,attemptId:a,lessonId:q.id.includes('-c')?undefined:currentLesson.id});
 }
 function retry(q){delete attempts[q.id];delete progress.answers[q.id];const p=(q.id.includes('-c')?progress.challenges:progress.practice)?.[q.id];if(p){delete p.review;delete p.done}save();exercise(q);status('New attempt started.');}
 function viewed(){if(!ready||offline||locked||!currentLesson||!currentChapter)return;const path=currentLesson.id+':'+currentMode;if(path!==lastRoute){lastRoute=path;lastStep='';emit('lesson_opened',{mode:currentMode},{lessonId:currentLesson.id})}if(currentMode==='learn'){const step=currentLesson.id+':'+currentStep;if(step!==lastStep){lastStep=step;emit('teaching_step_viewed',{step:currentStep},{lessonId:currentLesson.id})}}}
 async function flush(){
  if(busy)return busy;if(offline||locked||!user)return;
  busy=drain();try{await busy}finally{busy=null}return;
 }
 async function drain(){
  const pending=queue();if(!pending.length){status();return}status('Saving…');
  try{
   // Drain acknowledged batches in order; keep everything on a network failure.
   let batches=0;
   while(queue().length&&!locked&&batches++<25){const batch=queue().slice(0,4);
   for(const id of new Set(batch.map(e=>e.sessionId)))await request('/api/study-sessions',{method:'POST',body:JSON.stringify({id,at:batch.find(e=>e.sessionId===id).at})});
   const result=await request('/api/events',{method:'POST',body:JSON.stringify({events:batch})});
   for(const a of result.accepted)drop(a.id);
   apply(result.progress);
   if(result.accepted.some(a=>!a.applied))status('A newer update was kept. Reload to review your saved progress.');else status('');
   }
  }catch(e){status(e.message);if(e.status===401||e.status===403){locked=true;showLock(e.message)}else if(e.status===400||e.status===409){locked=true;showLock(e.message+' Your pending activity is kept on this device.',true)}}
  finally{if(queue().length&&!locked)timer=setTimeout(flush,5000)}
 }
 function showLock(text,canDiscard=false){stopAudio();document.getElementById('app').innerHTML=`<section class="account-gate"><p class="eyebrow">Your account</p><h1>Reconnect to continue</h1><p>${E(text)}</p><button id="account-reconnect" class="primary">Reconnect</button>${canDiscard?'<p>If these pending records are outdated, you can discard them and reload. Saved server progress and local notes are kept.</p><button id="account-discard">Discard pending records</button>':''}<p>Your saved work stays with your account.</p></section>`;document.getElementById('account-reconnect').onclick=()=>location.reload();if(canDiscard)document.getElementById('account-discard').onclick=()=>{if(!confirm('Discard only this account’s unsaved activity on this device?'))return;for(const e of queue())drop(e.id);location.reload()};}
 function clearLocal(){if(!user)return;try{for(const k of Object.keys(localStorage))if(k===storeKey||k.startsWith('jc-event:'+user.id+':'))localStorage.removeItem(k)}catch{}memory.clear();progress={lessons:{},answers:{},last:null};}
 async function logout(){await flush();if(queue().length&&!confirm('Some activity has not synced. Sign out and discard the pending activity and local notes on this device?'))return;locked=true;stopAudio();channel?.postMessage({type:'logout',user:user.id});clearLocal();location.assign('/cdn-cgi/access/logout')}
 async function start(){
  if(location.protocol==='file:'){startOffline();return}
  document.getElementById('app').innerHTML='<section class="account-gate"><p>Opening your private learning space…</p></section>';
  try{
   const result=await request('/api/me');if(result.contentVersion!==DATA.contentVersion)throw new Error('This guide has been updated. Reload the page.');user=result.user;storeKey='jc-progress:'+user.id;apply(result.progress,true);ready=true;
   renderAccountBar();route();viewed();
   try{channel=new BroadcastChannel('jc-accounts');channel.onmessage=e=>{if(e.data.type==='logout'&&e.data.user===user.id){locked=true;clearLocal();showLock('You signed out in another tab.')}}}catch{}
   document.addEventListener('pointerdown',()=>{lastAction=Date.now()},{passive:true});document.addEventListener('keydown',()=>{lastAction=Date.now()});
   setInterval(()=>{
    const end=Date.now(),active=ready&&!locked&&document.visibilityState==='visible'&&document.hasFocus()&&(end-lastAction<120000||(!player.paused&&!player.ended));
    if(active&&end-tickAt<=35000&&currentChapter)emit('active_interval',{start:tickAt,end});tickAt=end;
   },30000);
   window.addEventListener('online',flush);document.addEventListener('visibilitychange',()=>{tickAt=Date.now();if(document.visibilityState==='hidden')flush()});flush();
  }catch(e){if(local&&e.status===404){startOffline();return}locked=true;showLock(e.message)}
 }
 function startOffline(){offline=true;ready=true;try{const saved=JSON.parse(localStorage.getItem(storeKey)||'null');if(saved?.lessons&&saved?.answers)progress=saved}catch{}renderAccountBar();route()}
 return {start,emit,exercise,retry,viewed,flush,request,logout,apply,queue,status,navigation(){lastRoute='';lastStep=''},get user(){return user},get ready(){return ready&&!locked},get offline(){return offline}};
})();
function trackActivity(kind,payload,context){MathsAccount.emit(kind,payload,context)}
