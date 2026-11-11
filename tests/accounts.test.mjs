import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp,retainSixMonths} from '../worker/service.mjs';
import {monthsAgo,unionSeconds,validateEvent} from '../worker/domain.mjs';
import {localDatabase} from '../dev/database.mjs';
import catalog from '../worker/catalog.json' with {type:'json'};
function fixture(t){
 const db=localDatabase();t.after(()=>db.close());let clock='2026-11-04T22:00:00.000Z';
 const identities={admin:{issuer:'test',subject:'admin',email:'andresdiegolanda@gmail.com'},a:{issuer:'test',subject:'a',email:'a@example.test'},b:{issuer:'test',subject:'b',email:'b@example.test'},stranger:{issuer:'test',subject:'stranger',email:'stranger@example.test'}};
 const app=createApp({catalog,now:()=>clock,verify:async r=>identities[r.headers.get('Test-Identity')]||null}),env={DB:db,APP_ORIGIN:'https://maths.example',ASSETS:{fetch:async()=>new Response('guide')}};
 async function call(user,path,body,headers={}){const response=await app(new Request(env.APP_ORIGIN+path,{method:body===undefined?'GET':'POST',headers:{'X-Maths-Account':db.sqlite.prepare('SELECT id FROM users WHERE email=?').get(identities[user]?.email||'')?.id||'','Test-Identity':user,'Origin':env.APP_ORIGIN,'X-Maths-Request':'1','Content-Type':'application/json',...headers},...(body===undefined?{}:{body:JSON.stringify(body)})}),env);const text=await response.text();return {status:response.status,data:response.headers.get('Content-Type')?.includes('json')?JSON.parse(text):text,headers:response.headers}}
 const invite=async(email,name='Student')=>call('admin','/api/admin/invitations',{email,name});
 const session=async(user,id='session1')=>call(user,'/api/study-sessions',{id,at:clock});
 let n=0;const event=(kind,payload={},more={})=>({id:'event'+(++n),sessionId:'session1',kind,payload,at:clock,version:catalog.version,...(kind==='exercise_started'?{baseRevision:0}:{}),...more});
 const events=(user,...es)=>call(user,'/api/events',{events:es});
 return {db,call,invite,session,event,events,setClock:x=>clock=x};
}
test('sign-in, invitation ownership, same-origin writes and administrator isolation',async t=>{
 const f=fixture(t);assert.equal((await f.call('','/')).status,401);assert.equal((await f.call('stranger','/api/me')).status,403);
 assert.equal((await f.invite('a@example.test')).status,201);assert.equal((await f.call('a','/api/me')).data.user.role,'student');
 assert.equal((await f.call('a','/api/admin/users')).status,403);assert.equal((await f.call('a','/api/admin/invitations',{email:'x@example.test',name:'X'})).status,403);
 assert.equal((await f.call('admin','/api/admin/invitations',{email:'x@example.test',name:'X'},{Origin:'https://evil.example'})).status,403);
 assert.equal((await f.call('admin','/api/admin/invitations',{email:'x@example.test',name:'X'},{'X-Maths-Request':''})).status,403);
 assert.equal((await f.call('a','/api/me')).headers.get('Cache-Control'),'private, no-store');
});
test('ten accounts includes the administrator and pending invitations; duplicate emails reserve nothing',async t=>{
 const f=fixture(t);for(let i=0;i<9;i++)assert.equal((await f.invite(`s${i}@example.test`)).status,201);
 assert.equal((await f.invite('s0@example.test')).status,409);assert.equal((await f.invite('extra@example.test')).status,409);
 assert.equal((await f.call('admin','/api/admin/users')).data.users.length,10);
});
test('exercise events deduplicate; notes and forged identities are excluded; results computed server-side',async t=>{
 const f=fixture(t);await f.invite('a@example.test');await f.invite('b@example.test');await f.session('a');
 const q=Object.entries(catalog.exercises).find(([,q])=>q.type==='choice'),[id,question]=q;
 const start=f.event('exercise_started',{}, {exerciseId:id,lessonId:question.lessonId,attemptId:'attempt1'}),answer=f.event('choice_submitted',{option:question.answer,correct:false,notes:'PRIVATE'}, {exerciseId:id,lessonId:question.lessonId,attemptId:'attempt1',baseRevision:1,userId:'administrator'});
 assert.equal((await f.events('a',start,answer)).status,200);assert.equal((await f.events('a',start,answer)).status,200);
 const a=(await f.call('a','/api/my-activity')).data;assert.equal(a.events.length,2);assert.equal(a.events.find(e=>e.kind==='choice_submitted').payload.correct,true);assert.ok(!JSON.stringify(a).includes('PRIVATE'));
 assert.equal((await f.call('b','/api/my-activity?userId=administrator')).data.events.length,0);
 assert.equal((await f.events('b',f.event('exercise_started',{}, {exerciseId:id,attemptId:'other'}))).status,400);
 const progress=(await f.call('a','/api/progress')).data.progress;assert.equal(progress.length,1);assert.equal(progress[0].revision,2);
});
test('stale device changes do not overwrite newer progress, including retrying rejected events',async t=>{
 const f=fixture(t);await f.invite('a@example.test');await f.session('a');
 const first=f.event('confidence_changed',{confident:true},{lessonId:'01-01',baseRevision:0}),stale=f.event('confidence_changed',{confident:false},{lessonId:'01-01',baseRevision:0});
 assert.equal((await f.events('a',first)).data.accepted[0].applied,true);assert.equal((await f.events('a',stale)).data.accepted[0].applied,false);assert.equal((await f.events('a',stale)).data.accepted[0].applied,false);
 assert.equal(JSON.parse((await f.call('a','/api/progress')).data.progress[0].state).done,true);
});
test('bounds, unknown IDs, content version, attempts and malformed events are enforced',async t=>{
 const f=fixture(t);await f.invite('a@example.test');await f.session('a');
 for(const e of [f.event('teaching_step_viewed',{step:999},{lessonId:'01-01',baseRevision:0}),f.event('lesson_opened',{mode:'learn'},{lessonId:'__proto__',baseRevision:0}),f.event('active_interval',{start:0,end:1000000}),f.event('lesson_opened',{mode:'learn'},{lessonId:'01-01',baseRevision:0,at:'2020-01-01'})])assert.equal((await f.events('a',e)).status,400);
 assert.equal((await f.events('a',f.event('lesson_opened',{mode:'learn'},{lessonId:'01-01',baseRevision:0,version:'old'}))).status,409);
 const q=Object.keys(catalog.exercises).find(id=>id.includes('-w'));
 assert.equal((await f.events('a',f.event('clue_revealed',{index:0},{exerciseId:q,attemptId:'missing',baseRevision:0}))).status,400);
});
test('overlapping active intervals are unioned and retries cannot add time',async t=>{
 const f=fixture(t);await f.invite('a@example.test');await f.session('a');const end=Date.parse('2026-11-04T22:00:00Z');
 const a=f.event('active_interval',{start:end-30000,end}),b=f.event('active_interval',{start:end-20000,end:end+10000});
 await f.events('a',a,b);await f.events('a',a,b);
 assert.equal((await f.call('a','/api/my-activity')).data.activeSeconds,30);
 assert.equal(unionSeconds([{start_ms:0,end_ms:1000},{start_ms:500,end_ms:2000}]),2);
});
test('six calendar months are clamped correctly; retention cascades and deletes old progress',async t=>{
 assert.equal(monthsAgo('2026-08-31T10:00:00.000Z'),'2026-02-28T10:00:00.000Z');
 const f=fixture(t);await f.invite('a@example.test');await f.session('a');await f.events('a',f.event('confidence_changed',{confident:true},{lessonId:'01-01',baseRevision:0}));
 await retainSixMonths(f.db,'2027-05-05T22:00:00.000Z');assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) n FROM events').get().n,0);assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) n FROM progress').get().n,0);
 assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) n FROM users').get().n,2);
});
test('suspension blocks all routes and deletion cascades; administrator cannot be deleted',async t=>{
 const f=fixture(t),invite=await f.invite('a@example.test');await f.session('a');await f.events('a',f.event('confidence_changed',{confident:true},{lessonId:'01-01',baseRevision:0}));
 assert.equal((await f.call('admin',`/api/admin/users/${invite.data.id}/status`,{status:'suspended'})).status,200);assert.equal((await f.call('a','/api/me')).status,403);assert.equal((await f.call('a','/')).status,403);
 assert.equal((await f.call('admin',`/api/admin/users/${invite.data.id}/delete`,{confirmEmail:'wrong@example.test'})).status,400);
 assert.equal((await f.call('admin',`/api/admin/users/${invite.data.id}/delete`,{confirmEmail:'a@example.test'})).status,200);assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) n FROM events').get().n,0);
 assert.equal((await f.call('admin','/api/admin/users/administrator/delete',{confirmEmail:'andresdiegolanda@gmail.com'})).status,400);
});
test('legacy import requires confirmation, preserves newer records and never imports notes or historical events',async t=>{
 const f=fixture(t);await f.invite('a@example.test');await f.session('a');await f.events('a',f.event('confidence_changed',{confident:true},{lessonId:'01-01',baseRevision:0}));
 const imported={lessons:{'01-01':{done:false},'01-02':{done:true,seen:[0,1,999],notes:'PRIVATE'}},practice:{'01-01-w1':{review:'supported',notes:'PRIVATE'}}};
 assert.equal((await f.call('a','/api/progress/import',{progress:imported})).status,400);
 const result=await f.call('a','/api/progress/import',{confirm:true,progress:imported});assert.equal(result.status,200);assert.ok(!JSON.stringify(result).includes('PRIVATE'));
 assert.equal(JSON.parse(result.data.progress.find(p=>p.item_id==='01-01').state).done,true);
 assert.equal((await f.call('a','/api/progress/import',{confirm:true,progress:imported})).status,409);
 assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) n FROM events').get().n,1);
});
test('activity paging preserves timestamp ties and export pages are complete',async t=>{
 const f=fixture(t);await f.invite('a@example.test');await f.session('a');const user=(await f.call('a','/api/me')).data.user;
 const insert=f.db.sqlite.prepare('INSERT INTO events(user_id,id,session_id,kind,occurred_at,received_at,content_version,payload) VALUES(?,?,?,?,?,?,?,?)');
 for(let i=0;i<510;i++)insert.run(user.id,'e'+String(i).padStart(4,'0'),'session1','exercise_started','2026-11-04T22:00:00.000Z','2026-11-04T22:00:00.000Z',catalog.version,'{}');
 const page=(await f.call('a','/api/my-activity')).data;assert.equal(page.events.length,100);assert.equal(page.more,true);const last=page.events.at(-1);
 const next=(await f.call('a',`/api/my-activity?before=${encodeURIComponent(last.occurred_at)}&cursor=${last.cursor}`)).data;assert.equal(next.events.length,100);assert.notEqual(next.events[0].id,last.id);
 const ex=(await f.call('a','/api/export')).data;assert.equal(ex.events.length,500);const ex2=(await f.call('a',`/api/export?cursor=${ex.next}&snapshot=${ex.snapshot}`)).data;assert.equal(ex2.events.length,10);assert.equal(ex2.next,null);
});

test('a shared-browser account switch rejects a previous student queue and private reads',async t=>{
 const f=fixture(t);await f.invite('a@example.test');await f.invite('b@example.test');await f.session('a');await f.session('b');
 const a=(await f.call('a','/api/me')).data.user;
 const event=f.event('confidence_changed',{confident:true},{lessonId:'01-01',baseRevision:0});
 assert.equal((await f.call('b','/api/events',{events:[event]},{'X-Maths-Account':a.id})).status,409);
 assert.equal((await f.call('b','/api/my-activity',undefined,{'X-Maths-Account':a.id})).status,409);
 assert.equal((await f.call('b','/api/progress')).data.progress.length,0);
 assert.equal((await f.events('a',event)).status,200);
});

test('new attempts reset answer state, retain past events and malformed JSON is rejected',async t=>{
 const f=fixture(t);await f.invite('a@example.test');await f.session('a');
 const [id,q]=Object.entries(catalog.exercises).find(([,q])=>q.type==='choice');
 await f.events('a',f.event('exercise_started',{}, {exerciseId:id,attemptId:'attempt1',baseRevision:0}),f.event('choice_submitted',{option:q.answer},{exerciseId:id,attemptId:'attempt1',baseRevision:1}));
 const started=await f.events('a',f.event('exercise_started',{}, {exerciseId:id,attemptId:'attempt2',baseRevision:2}));
 assert.equal(started.data.accepted[0].applied,true);assert.equal(JSON.parse(started.data.progress[0].state).option,undefined);
 assert.equal((await f.call('a','/api/my-activity')).data.attempts,2);
 assert.equal((await f.call('a','/api/events',null)).status,400);
 assert.equal((await f.call('a','/api/events',{events:[],notes:'x'.repeat(66000)})).status,413);
});

test('day drill-down and timeline pagination do not change daily totals or leak student records',async t=>{
 const f=fixture(t);await f.invite('a@example.test');await f.invite('b@example.test');await f.session('a');await f.session('b');
 const a=(await f.call('a','/api/me')).data.user,b=(await f.call('b','/api/me')).data.user;
 const insert=f.db.sqlite.prepare('INSERT INTO events(user_id,id,session_id,kind,lesson_id,exercise_id,occurred_at,received_at,content_version,payload) VALUES(?,?,?,?,?,?,?,?,?,?)');
 const add=(user,id,date,kind='choice_submitted')=>insert.run(user,id,'session1',kind,'01-01','01-01-q1',date,date,catalog.version,'{}');
 add(a.id,'old','2026-11-03T10:00:00.000Z');for(let i=0;i<120;i++)add(a.id,'new'+i,'2026-11-04T11:00:00.000Z','lesson_opened');
 add(b.id,'private','2026-11-04T12:00:00.000Z');
 const all=(await f.call('a','/api/my-activity?days=7&timeZone=Europe/Dublin')).data;assert.equal(all.more,true);assert.equal(all.daily.at(-2).questions,1);assert.equal(all.daily.at(-1).questions,0);
 const selected=(await f.call('a','/api/my-activity?days=7&day=2026-11-03')).data;assert.equal(selected.events.length,1);assert.equal(selected.selectedDay,'2026-11-03');assert.deepEqual(selected.daily,all.daily);
 const last=all.events.at(-1),older=(await f.call('a',`/api/my-activity?days=7&before=${last.occurred_at}&cursor=${last.cursor}`)).data;assert.deepEqual(older.daily,all.daily);assert.equal(older.events.length,21);
 const admin=(await f.call('admin',`/api/admin/users/${a.id}/activity?days=7`)).data;assert.deepEqual(admin.daily,all.daily);
 assert.equal((await f.call('b',`/api/admin/users/${a.id}/activity?days=7`)).status,403);
 assert.equal((await f.call('a','/api/my-activity?days=7&day=2026-01-01')).status,400);
});

test('skill drills record answers, best stars and practice days, count as questions, and reject invalid events',async t=>{
 const f=fixture(t);await f.invite('a@example.test');await f.session('a');
 const [skill,info]=Object.entries(catalog.skills)[0],context={lessonId:info.lesson};
 const answered=(outcome,baseRevision,level=0)=>f.event('drill_answered',{skill,level,outcome,extra:'ignored'},{...context,baseRevision});
 assert.equal((await f.events('a',answered('first',0),answered('helped',1),answered('missed',2))).status,200);
 const finished=await f.events('a',f.event('drill_round_finished',{skill,level:0,stars:2},{...context,baseRevision:3}),f.event('drill_round_finished',{skill,level:0,stars:1},{...context,baseRevision:4}),f.event('drill_round_finished',{skill,level:2,stars:3},{...context,baseRevision:5}));
 assert.equal(finished.status,200);assert.ok(finished.data.accepted.every(a=>a.applied));
 const row=finished.data.progress.find(p=>p.scope==='skill'&&p.item_id===skill),state=JSON.parse(row.state);
 assert.deepEqual(state,{asked:3,right:1,stars:[2,0,3],rounds:3});
 const day=await f.events('a',f.event('drill_day_logged',{day:'2026-11-04'},{...context,baseRevision:0}),f.event('drill_day_logged',{day:'2026-11-04'},{...context,baseRevision:1}),f.event('drill_day_logged',{day:'2026-11-05'},{...context,baseRevision:2}));
 assert.equal(day.status,200);assert.deepEqual(JSON.parse(day.data.progress.find(p=>p.scope==='drills').state),{days:{'2026-11-04':2,'2026-11-05':1}});
 const activity=(await f.call('a','/api/my-activity?days=7')).data,today=activity.daily.at(-1);
 assert.equal(today.questions,3);assert.equal(today.sections,1);
 assert.ok(activity.events.every(e=>e.kind!=='drill_day_logged'));assert.equal(activity.events.filter(e=>e.kind==='drill_answered').length,3);
 assert.ok(!JSON.stringify(activity).includes('ignored'));
 for(const bad of [f.event('drill_answered',{skill:'no-such-skill',level:0,outcome:'first'},{...context,baseRevision:9}),
  f.event('drill_answered',{skill:'__proto__',level:0,outcome:'first'},{...context,baseRevision:9}),
  f.event('drill_answered',{skill,level:3,outcome:'first'},{...context,baseRevision:9}),
  f.event('drill_answered',{skill,level:0,outcome:'perfect'},{...context,baseRevision:9}),
  f.event('drill_answered',{skill,level:0,outcome:'first'},{lessonId:Object.keys(catalog.lessons).find(id=>id!==info.lesson),baseRevision:9}),
  f.event('drill_answered',{skill,level:0,outcome:'first'},{baseRevision:9}),
  f.event('drill_answered',{skill,level:0,outcome:'first'},context),
  f.event('drill_round_finished',{skill,level:0,stars:4},{...context,baseRevision:9}),
  f.event('drill_day_logged',{day:'2026-10-01'},{...context,baseRevision:3}),
  f.event('drill_day_logged',{day:'tomorrow'},{...context,baseRevision:3})])assert.equal((await f.events('a',bad)).status,400);
 const stale=await f.events('a',f.event('drill_round_finished',{skill,level:1,stars:3},{...context,baseRevision:1}));
 assert.equal(stale.data.accepted[0].applied,false);
 const mine=(await f.call('a','/api/my-activity?days=7')).data.skills;
 assert.equal(mine.length,1);assert.equal(mine[0].skill,skill);assert.deepEqual(mine[0].stars,[2,0,3]);assert.equal(mine[0].asked,3);assert.equal(mine[0].right,1);
 const a=f.db.sqlite.prepare("SELECT id FROM users WHERE email='a@example.test'").get();
 assert.deepEqual((await f.call('admin',`/api/admin/users/${a.id}/activity?days=7`)).data.skills,mine);
 assert.deepEqual((await f.call('admin','/api/my-activity?days=7')).data.skills,[]);
});
