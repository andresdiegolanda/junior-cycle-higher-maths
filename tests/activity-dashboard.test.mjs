import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {activityWindow,dailyActivity} from '../worker/activity.mjs';
import {localDatabase} from '../dev/database.mjs';
const url=q=>new URL('https://maths.example/api/my-activity?'+q);

test('daily windows follow local calendar days, including Dublin DST and half-hour zones',()=>{
 const autumn=activityWindow(url('days=7&timeZone=Europe/Dublin'),'2026-10-27T12:00:00Z');
 assert.equal(autumn.days.length,7);const long=autumn.days.find(d=>d.date==='2026-10-25');assert.equal(long.endMs-long.startMs,25*3600000);
 const spring=activityWindow(url('days=7&timeZone=Europe/Dublin'),'2026-03-31T12:00:00Z');const short=spring.days.find(d=>d.date==='2026-03-29');assert.equal(short.endMs-short.startMs,23*3600000);
 const india=activityWindow(url('days=7&timeZone=Asia/Kolkata'),'2026-11-04T19:00:00Z');assert.equal(india.to,'2026-11-05');assert.equal(india.days.at(-1).start,'2026-11-04T18:30:00.000Z');
 const six=activityWindow(url('days=183'),'2026-08-31T10:00:00.000Z');assert.equal(six.start,'2026-02-28T10:00:00.000Z');
 for(const q of ['days=999','days=0','timeZone=not-a-zone','days=7&day=2026-01-01','since=invalid','since=2027-01-01'])assert.throws(()=>activityWindow(url(q),'2026-11-04T22:00:00Z'));
});

test('daily totals deduplicate questions and sections, include zero days and split overlapping time at midnight',async t=>{
 const db=localDatabase();t.after(()=>db.close());
 const now='2026-11-04T22:00:00.000Z',window=activityWindow(url('days=7'),now),user='administrator';
 db.sqlite.prepare('INSERT INTO sessions(id,user_id,started_at,last_at) VALUES(?,?,?,?)').run('s',user,now,now);
 const insert=db.sqlite.prepare('INSERT INTO events(user_id,id,session_id,kind,lesson_id,exercise_id,occurred_at,received_at,content_version,payload) VALUES(?,?,?,?,?,?,?,?,?,?)');
 let n=0;const event=(kind,at,lesson=null,exercise=null)=>{const id='d'+(++n);insert.run(user,id,'s',kind,lesson,exercise,at,now,'v1','{}');return id};
 event('lesson_opened','2026-11-03T10:00:00Z','01-01');
 event('teaching_step_viewed','2026-11-03T10:00:01Z','01-01');
 event('choice_submitted','2026-11-03T10:05:00Z','01-01','01-01-q1');
 event('choice_submitted','2026-11-03T10:05:01Z','01-01','01-01-q1');
 event('self_assessment_changed','2026-11-03T10:06:00Z','01-02','01-02-w1');
 event('exercise_started','2026-11-03T10:07:00Z','01-02','01-02-w2');
 event('solution_step_revealed','2026-11-03T10:07:01Z','01-02','01-02-w2');
 event('clue_revealed','2026-11-03T10:07:02Z','01-02','01-02-w2');
 event('choice_submitted','2026-11-04T00:00:00Z','01-01','01-01-q1');
 event('choice_submitted','2026-11-04T23:00:00Z','01-03','future');
 event('choice_submitted','2026-10-28T23:59:59Z','01-03','outside');
 for(let i=0;i<120;i++)event('lesson_opened','2026-11-04T10:00:00Z','01-01');
 const interval=(start,end)=>{const id=event('active_interval',end);db.sqlite.prepare('INSERT INTO active_intervals(user_id,event_id,session_id,start_ms,end_ms) VALUES(?,?,?,?,?)').run(user,id,'s',Date.parse(start),Date.parse(end))};
 interval('2026-11-03T23:59:50Z','2026-11-04T00:00:20Z');interval('2026-11-03T23:59:55Z','2026-11-04T00:00:10Z');
 const result=await dailyActivity(db,user,window,now);
 assert.equal(result.length,7);assert.deepEqual({...result[0]},{date:'2026-10-29',questions:0,sections:0,clues:0,activeSeconds:0});
 assert.deepEqual({...result.at(-2)},{date:'2026-11-03',questions:2,sections:2,clues:1,activeSeconds:10});
 assert.deepEqual({...result.at(-1)},{date:'2026-11-04',questions:1,sections:1,clues:0,activeSeconds:20});
 const empty=await dailyActivity(db,'another-user',window,now);assert.ok(empty.every(d=>d.questions===0&&d.sections===0&&d.activeSeconds===0));
 const partial=activityWindow(url('since=2026-11-04T00:00:05Z'),now);assert.equal((await dailyActivity(db,user,partial,now))[0].activeSeconds,15);
});

test('daily chart renders exact values, empty days, accessible selection and readable table',()=>{
 const E=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const ctx={Intl,Date,E};vm.createContext(ctx);vm.runInContext(fs.readFileSync(new URL('../source/activity-view.js',import.meta.url),'utf8'),ctx);
 const daily=Array.from({length:30},(_,i)=>({date:new Date(Date.UTC(2026,9,6+i)).toISOString().slice(0,10),questions:i===29?4:0,sections:i===29?2:0,activeSeconds:0,clues:0}));
 const result={daily,range:{from:daily[0].date,to:daily.at(-1).date},timeZone:'Europe/Dublin',activeSeconds:0,selectedDay:daily.at(-1).date};
 const chart=ctx.activityChartHTML(result);assert.equal((chart.match(/class="activity-day /g)||[]).length,7);assert.match(chart,/4 questions attempted, 2 sections visited/);assert.match(chart,/aria-pressed="true"/);assert.ok(!chart.includes('NaN'));
 assert.match(ctx.activityChartHTML(result,28),/--day-count:2/);
 assert.match(ctx.activityMetricsHTML(result),/Questions attempted/);assert.match(ctx.activityMetricsHTML(result),/Sections visited/);
 const table=ctx.activityDailyTableHTML(result);assert.equal((table.match(/scope="row"/g)||[]).length,30);assert.match(table,/Daily activity in Europe\/Dublin/);
 result.timeZone='<img src=x onerror=alert(1)>';assert.ok(!ctx.activityDailyTableHTML(result).includes('<img'));
 assert.equal(ctx.activityMinutes(20),'<1');assert.equal(ctx.activityMinutes(0),'0');
});
