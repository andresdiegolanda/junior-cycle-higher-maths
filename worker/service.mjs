import {HttpError,fail,identifier,emailAddress,monthsAgo,validateEvent,project} from './domain.mjs';
import {activityWindow,dailyActivity} from './activity.mjs';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'}});
const stmt=(db,sql,...v)=>db.prepare(sql).bind(...v);
const first=(db,sql,...v)=>stmt(db,sql,...v).first();
const rows=async(db,sql,...v)=>(await stmt(db,sql,...v).all()).results;
const profile=u=>({id:u.id,name:u.name,email:u.email,role:u.role,status:u.status});
async function body(request){
 if(!request.headers.get('content-type')?.startsWith('application/json'))fail(415,'Use JSON.');
 if(Number(request.headers.get('content-length'))>65536)fail(413,'Request is too large.');
 const reader=request.body?.getReader(),chunks=[];let size=0;
 if(reader)while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>65536){await reader.cancel();fail(413,'Request is too large.')}chunks.push(value)}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}
 let result;try{result=JSON.parse(new TextDecoder().decode(bytes))}catch{fail(400,'Invalid JSON.')}
 if(!result||typeof result!=='object'||Array.isArray(result))fail(400,'Use a JSON object.');return result;
}
async function account(db,identity,now){
 let u=await first(db,'SELECT * FROM users WHERE issuer=? AND subject=?',identity.issuer,identity.subject);
 if(!u){
  u=await first(db,'SELECT * FROM users WHERE email=?',identity.email);
  if(!u||u.status!=='invited'||u.subject||u.invite_expires&&u.invite_expires<now)fail(403,'This account has not been invited, or its invitation has expired.');
  await stmt(db,"UPDATE users SET issuer=?,subject=?,status='active',joined_at=? WHERE id=? AND subject IS NULL AND status='invited'",identity.issuer,identity.subject,now,u.id).run();
  u=await first(db,'SELECT * FROM users WHERE issuer=? AND subject=?',identity.issuer,identity.subject);
 }
 if(!u||u.status!=='active')fail(403,'This account is suspended. Contact the administrator.');
 return u;
}
async function progressFor(db,id){return rows(db,'SELECT scope,item_id,state,revision FROM progress WHERE user_id=?',id)}
async function exportFor(db,u,url){
 const cursor=Number(url.searchParams.get('cursor')||0),snapshot=Number(url.searchParams.get('snapshot')||(await first(db,'SELECT COALESCE(MAX(rowid),0) AS last FROM events WHERE user_id=?',u.id)).last);
 if(!Number.isSafeInteger(cursor)||cursor<0||!Number.isSafeInteger(snapshot)||snapshot<0)fail(400,'Invalid export cursor.');
 const events=await rows(db,'SELECT rowid AS cursor,* FROM events WHERE user_id=? AND rowid>? AND rowid<=? ORDER BY rowid LIMIT 501',u.id,cursor,snapshot),page=events.slice(0,500);
 return {user:profile(u),progress:cursor===0?await progressFor(db,u.id):[],events:page.map(e=>({...e,payload:JSON.parse(e.payload)})),next:events.length>500?page.at(-1).cursor:null,snapshot};
}
async function importProgress(db,u,b,catalog,time){
 if(b.confirm!==true||!b.progress||typeof b.progress!=='object')fail(400,'Confirm the import first.');
 if(await first(db,'SELECT user_id FROM imports WHERE user_id=?',u.id))fail(409,'This account has already imported browser progress.');
 const token=crypto.randomUUID(),statements=[stmt(db,'INSERT OR IGNORE INTO imports(user_id,at,token) VALUES(?,?,?)',u.id,time,token)],items=[];
 const add=(scope,id,state)=>{items.push([scope,id,state]);};
 for(const [id,l]of Object.entries(b.progress.lessons||{}))if(Object.hasOwn(catalog.lessons,id)&&l&&typeof l==='object')add('lesson',id,{seen:Array.isArray(l.seen)?[...new Set(l.seen.filter(v=>Number.isInteger(v)&&v>=0&&v<catalog.lessons[id].steps))]:[],done:l.done===true,imported:true});
 for(const [id,q]of Object.entries(catalog.exercises)){
  const option=b.progress.answers?.[id],s=(q.type==='challenge'?b.progress.challenges:b.progress.practice)?.[id];
  if(q.type==='choice'&&Number.isInteger(option)&&option>=0&&option<q.options)add('exercise',id,{option,correct:option===q.answer,imported:true});
  else if(s&&typeof s==='object'){const state={imported:true};if(s.usedClue===true)state.usedClue=true;if(s.viewedSolution===true)state.viewedSolution=true;if(['independent','supported','revisit'].includes(s.review))state.review=s.review;if(q.type==='challenge'&&s.done===true){state.done=true;state.review='independent'}add('exercise',id,state)}
 }
 if(items.length>1200)fail(400,'Too many progress items.');
 for(const [scope,id,state]of items)statements.push(stmt(db,'INSERT OR IGNORE INTO progress(user_id,scope,item_id,state,revision,updated_at,event_id) SELECT ?,?,?,?,1,?,? WHERE EXISTS(SELECT 1 FROM imports WHERE user_id=? AND token=?)',u.id,scope,id,JSON.stringify(state),time,'import-'+token,u.id,token));
 // The marker and imported rows commit together. Existing progress is retained.
 await db.batch(statements);return progressFor(db,u.id);
}
async function audit(db,u,action,target,now){await stmt(db,'INSERT INTO admin_audit(id,actor_id,action,target_id,at) VALUES(?,?,?,?,?)',crypto.randomUUID(),u.id,action,target,now).run()}
async function acceptEvent(db,u,e,now){
 const existing=await first(db,'SELECT applied FROM events WHERE user_id=? AND id=?',u.id,e.id);
 if(existing)return {id:e.id,applied:existing.applied===1};
 if(!await first(db,'SELECT id FROM sessions WHERE user_id=? AND id=?',u.id,e.sessionId))fail(400,'Unknown study session.');
 if(e.exerciseId&&e.kind!=='exercise_started'){
  const a=await first(db,'SELECT exercise_id,session_id FROM attempts WHERE user_id=? AND id=?',u.id,e.attemptId);
  if(!a||a.exercise_id!==e.exerciseId||a.session_id!==e.sessionId)fail(400,'Unknown exercise attempt.');
 }
 if(e.kind==='exercise_started'){
  const a=await first(db,'SELECT exercise_id,session_id FROM attempts WHERE user_id=? AND id=?',u.id,e.attemptId);
  if(a&&(a.exercise_id!==e.exerciseId||a.session_id!==e.sessionId))fail(400,'Attempt ID already belongs to another exercise.');
 }
 const current=e.scope?await first(db,'SELECT state,revision FROM progress WHERE user_id=? AND scope=? AND item_id=?',u.id,e.scope,e.item):null;
 const statements=[stmt(db,'INSERT OR IGNORE INTO events(user_id,id,session_id,kind,lesson_id,exercise_id,attempt_id,occurred_at,received_at,content_version,payload,applied) VALUES(?,?,?,?,?,?,?,?,?,?,?,-1)',u.id,e.id,e.sessionId,e.kind,e.lessonId,e.exerciseId,e.attemptId,e.at,now,e.version,JSON.stringify(e.payload))];
 if(e.kind==='exercise_started')statements.push(stmt(db,'INSERT OR IGNORE INTO attempts(user_id,id,exercise_id,session_id,started_at) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM events WHERE user_id=? AND id=? AND applied=-1)',u.id,e.attemptId,e.exerciseId,e.sessionId,e.at,u.id,e.id));
 if(e.scope){
  const state=JSON.stringify(project(current,e));
  // A conditional insert/update plus the event marker makes retries atomic.
  statements.push(stmt(db,`INSERT INTO progress(user_id,scope,item_id,state,revision,updated_at,event_id)
   SELECT ?,?,?,?,1,?,? WHERE ?=0 AND EXISTS(SELECT 1 FROM events WHERE user_id=? AND id=? AND applied=-1)
   ON CONFLICT(user_id,scope,item_id) DO NOTHING`,u.id,e.scope,e.item,state,now,e.id,e.baseRevision,u.id,e.id));
  if((current?.revision||0)===e.baseRevision&&e.baseRevision>0)statements.push(stmt(db,`UPDATE progress SET state=?,revision=revision+1,updated_at=?,event_id=? WHERE user_id=? AND scope=? AND item_id=? AND revision=? AND EXISTS(SELECT 1 FROM events WHERE user_id=? AND id=? AND applied=-1)`,state,now,e.id,u.id,e.scope,e.item,e.baseRevision,u.id,e.id));
  statements.push(stmt(db,`UPDATE events SET applied=CASE WHEN EXISTS(SELECT 1 FROM progress WHERE user_id=? AND scope=? AND item_id=? AND event_id=?) THEN 1 ELSE 0 END WHERE user_id=? AND id=? AND applied=-1`,u.id,e.scope,e.item,e.id,u.id,e.id));
 }else{
  if(e.kind==='active_interval')statements.push(stmt(db,'INSERT OR IGNORE INTO active_intervals(user_id,event_id,session_id,start_ms,end_ms) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM events WHERE user_id=? AND id=? AND applied=-1)',u.id,e.id,e.sessionId,e.payload.start,e.payload.end,u.id,e.id));
  statements.push(stmt(db,'UPDATE events SET applied=1 WHERE user_id=? AND id=? AND applied=-1',u.id,e.id));
 }
 statements.push(stmt(db,'UPDATE sessions SET last_at=MAX(last_at,?) WHERE user_id=? AND id=?',e.at,u.id,e.sessionId));
 statements.push(stmt(db,'UPDATE users SET last_seen=MAX(COALESCE(last_seen,?),?) WHERE id=?',e.at,e.at,u.id));
 await db.batch(statements);
 return {id:e.id,applied:(await first(db,'SELECT applied FROM events WHERE user_id=? AND id=?',u.id,e.id)).applied===1};
}
async function activity(db,id,url,now){
 const window=activityWindow(url,now),before=url.searchParams.get('before')||now;
 if(!Number.isFinite(Date.parse(before)))fail(400,'Invalid date filter.');
 const day=window.days.find(d=>d.date===window.selectedDay),lower=window.start,upper=new Date(Math.min(Date.parse(before),Date.parse(now))).toISOString();
 const detailStart=day?.start||lower,detailEnd=day?.end||window.days.at(-1).end;
 const cursor=Number(url.searchParams.get('cursor')||Number.MAX_SAFE_INTEGER);
 if(!Number.isSafeInteger(cursor)||cursor<1)fail(400,'Invalid activity cursor.');
 const items=await rows(db,"SELECT rowid AS cursor,* FROM events WHERE user_id=? AND occurred_at>=? AND occurred_at<? AND (occurred_at<? OR (occurred_at=? AND rowid<?)) AND kind NOT IN ('active_interval','drill_day_logged') ORDER BY occurred_at DESC,rowid DESC LIMIT 101",id,detailStart,detailEnd,upper,upper,cursor);
 const totals=await first(db,"SELECT COALESCE(SUM(kind='exercise_started'),0) attempts,COALESCE(SUM(kind='clue_revealed'),0) clues FROM events WHERE user_id=? AND occurred_at>=? AND occurred_at<=?",id,lower,now);
 const daily=await dailyActivity(db,id,window,now);
 return {events:items.slice(0,100).map(e=>({...e,payload:JSON.parse(e.payload)})),more:items.length>100,activeSeconds:Math.round(daily.reduce((total,day)=>total+day.activeSeconds,0)),...totals,daily,timeZone:window.timeZone,range:{from:window.from,to:window.to},selectedDay:window.selectedDay,skills:(await rows(db,"SELECT item_id,state,updated_at FROM progress WHERE user_id=? AND scope='skill' ORDER BY item_id",id)).map(r=>({skill:r.item_id,updatedAt:r.updated_at,...JSON.parse(r.state)})),sessions:await rows(db,'SELECT * FROM sessions WHERE user_id=? AND last_at>=? ORDER BY started_at DESC LIMIT 100',id,lower)};
}
export async function retainSixMonths(db,now=new Date().toISOString()){
 const cutoff=monthsAgo(now);
 await db.batch([
  stmt(db,'DELETE FROM events WHERE occurred_at<?',cutoff),
  stmt(db,'DELETE FROM attempts WHERE started_at<?',cutoff),
  stmt(db,'DELETE FROM sessions WHERE last_at<?',cutoff),
  stmt(db,'DELETE FROM progress WHERE updated_at<?',cutoff),
  stmt(db,'DELETE FROM admin_audit WHERE at<?',cutoff),
  stmt(db,'DELETE FROM rate_limits WHERE bucket<?',Math.floor(Date.parse(now)/60000)-60)
 ]);
}
export function createApp({verify,catalog,now=()=>new Date().toISOString()}){
 return async(request,env)=>{
  try{
   const url=new URL(request.url),time=now();
   if(!env.DB)fail(503,'Student accounts are not configured yet.');
   const identity=await verify(request,env);
   if(!identity)fail(401,'Please sign in to continue.');
   const u=await account(env.DB,identity,time),db=env.DB;
   // A changed shared-browser cookie must never attach another account's queue.
   // This header is a consistency check, never the source of authenticated identity.
   if(url.pathname.startsWith('/api/')&&url.pathname!=='/api/me'&&request.headers.get('X-Maths-Account')!==u.id)fail(409,'The signed-in account changed. Reload before continuing.');
   if(!['GET','HEAD'].includes(request.method)){
    if(request.headers.get('origin')!==env.APP_ORIGIN||request.headers.get('X-Maths-Request')!=='1')fail(403,'This request must come from the guide.');
    const bucket=Math.floor(Date.parse(time)/60000);
    const rate=await first(db,'INSERT INTO rate_limits(user_id,bucket,count) VALUES(?,?,1) ON CONFLICT(user_id,bucket) DO UPDATE SET count=count+1 RETURNING count',u.id,bucket);
    if(rate.count>120)fail(429,'Too many requests. Try again shortly.');
   }
   if(url.pathname==='/api/me'&&request.method==='GET')return json({user:profile(u),retentionMonths:6,accountLimit:10,contentVersion:catalog.version,progress:await progressFor(db,u.id)});
   if(url.pathname==='/api/progress'&&request.method==='GET')return json({progress:await progressFor(db,u.id)});
   if(url.pathname==='/api/study-sessions'&&request.method==='POST'){
    const b=await body(request);if(!identifier(b.id))fail(400,'Invalid session ID.');
    const at=Date.parse(b.at);if(!Number.isFinite(at)||at>Date.parse(time)+60000||at<Date.parse(time)-7*86400000)fail(400,'Invalid session start.');
    const started=new Date(at).toISOString();await stmt(db,'INSERT OR IGNORE INTO sessions(user_id,id,started_at,last_at) VALUES(?,?,?,?)',u.id,b.id,started,started).run();return json({id:b.id});
   }
   if(url.pathname==='/api/events'&&request.method==='POST'){
    const b=await body(request);if(!Array.isArray(b.events)||b.events.length<1||b.events.length>4)fail(400,'Send between 1 and 4 events.');
    const events=b.events.map(e=>validateEvent(e,catalog,time)),accepted=[];
    for(const e of events)accepted.push(await acceptEvent(db,u,e,time));
    return json({accepted,progress:await progressFor(db,u.id)});
   }
   if(url.pathname==='/api/my-activity'&&request.method==='GET')return json(await activity(db,u.id,url,time));
   if(url.pathname==='/api/progress/import'&&request.method==='POST')return json({progress:await importProgress(db,u,await body(request),catalog,time)});
   if(url.pathname==='/api/export'&&request.method==='GET')return json(await exportFor(db,u,url));
   if(url.pathname.startsWith('/api/admin/')){
    if(u.role!=='admin')fail(403,'Administrator access is required.');
    if(url.pathname==='/api/admin/users'&&request.method==='GET')return json({users:await rows(db,'SELECT id,email,name,role,status,invited_at,invite_expires,joined_at,last_seen FROM users ORDER BY role,email'),accountLimit:10});
    if(url.pathname==='/api/admin/invitations'&&request.method==='POST'){
     const b=await body(request),email=typeof b.email==='string'?b.email.trim().toLowerCase():'',name=typeof b.name==='string'?b.name.trim():'';
     if(!emailAddress(email)||!name||name.length>80)fail(400,'Enter a name and a valid email address.');
     if(await first(db,'SELECT id FROM users WHERE email=?',email))fail(409,'That email already has an account or invitation.');
     const id=crypto.randomUUID(),expires=new Date(Date.parse(time)+30*86400000).toISOString();
     try{await stmt(db,"INSERT INTO users(id,email,name,role,status,invited_at,invite_expires) VALUES(?,?,?,'student','invited',?,?)",id,email,name,time,expires).run()}catch(e){if(String(e).includes('ACCOUNT_LIMIT'))fail(409,'The ten-account limit has been reached.');throw e}
     await audit(db,u,'invitation_created',id,time);
     return json({id,email,name,expires,loginUrl:env.APP_ORIGIN,delivery:'manual',accessPolicyRequired:true},201);
    }
    const userRoute=url.pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)(?:\/(activity|status|export|delete))?$/);
    if(userRoute){
     const target=await first(db,'SELECT * FROM users WHERE id=?',userRoute[1]);if(!target)fail(404,'Account not found.');
     if(userRoute[2]==='activity'&&request.method==='GET')return json({user:profile(target),...await activity(db,target.id,url,time)});
     if(userRoute[2]==='export'&&request.method==='GET'){if(!url.searchParams.get('cursor'))await audit(db,u,'data_exported',target.id,time);return json(await exportFor(db,target,url))}
     if(userRoute[2]==='status'&&request.method==='POST'){
      const b=await body(request);if(target.role==='admin')fail(400,'The administrator cannot be suspended here.');
      if(!['active','suspended','invited'].includes(b.status)||b.status==='active'&&!target.subject||b.status==='invited'&&target.subject)fail(400,'Invalid account state.');
      await stmt(db,'UPDATE users SET status=? WHERE id=?',b.status,target.id).run();await audit(db,u,'status_'+b.status,target.id,time);return json({ok:true});
     }
     if(userRoute[2]==='delete'&&request.method==='POST'){
      const b=await body(request);if(target.role==='admin'||b.confirmEmail!==target.email)fail(400,'Confirm the student email before deleting.');
      await stmt(db,'DELETE FROM users WHERE id=?',target.id).run();await audit(db,u,'account_deleted',target.id,time);return json({ok:true});
     }
    }
    fail(404,'Unknown administrator operation.');
   }
   if(url.pathname.startsWith('/api/'))fail(404,'Unknown API endpoint.');
   if(request.method!=='GET'&&request.method!=='HEAD')fail(405,'Method not allowed.');
   const asset=await env.ASSETS.fetch(request),response=new Response(asset.body,asset);
   response.headers.set('Cache-Control','private, no-store');response.headers.set('X-Content-Type-Options','nosniff');response.headers.set('Referrer-Policy','same-origin');response.headers.set('Content-Security-Policy',"frame-ancestors 'none'; object-src 'none'; base-uri 'self'");
   return response;
  }catch(e){if(e instanceof HttpError)return json({error:e.message},e.status);console.error('Request failed',e?.message==='AUTH_NOT_CONFIGURED'?'Access configuration missing':e?.name||'Error');return json({error:'The request could not be saved. Please try again.'},503)}
 };
}
