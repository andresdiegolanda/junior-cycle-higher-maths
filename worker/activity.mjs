import {fail,monthsAgo} from './domain.mjs';

const DAY=86400000;
export function dayKey(value,timeZone){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value));
 const field=name=>parts.find(p=>p.type===name).value;
 return `${field('year')}-${field('month')}-${field('day')}`;
}
function addDay(date,n){return new Date(Date.parse(date+'T12:00:00Z')+n*DAY).toISOString().slice(0,10)}
function midnight(date,timeZone,formatter){
 const wall=Date.parse(date+'T00:00:00Z');
 let guess=wall;
 for(let i=0;i<4;i++){
  const p=Object.fromEntries(formatter.formatToParts(new Date(guess)).map(x=>[x.type,x.value]));
  const represented=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);
  const next=guess+wall-represented;if(next===guess)return guess;guess=next;
 }
 // Some zones skip midnight. Find the first instant belonging to this date.
 let low=wall-36*3600000,high=wall+36*3600000;
 while(high-low>1){const middle=Math.floor((low+high)/2);if(dayKey(middle,timeZone)<date)low=middle;else high=middle}
 return high;
}
export function activityWindow(url,now){
 let timeZone=url.searchParams.get('timeZone')||'Europe/Dublin';
 try{timeZone=new Intl.DateTimeFormat('en',{timeZone}).resolvedOptions().timeZone}catch{fail(400,'Choose a valid time zone.')}
 const formatter=new Intl.DateTimeFormat('en-GB',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 const boundaryFor=date=>midnight(date,timeZone,formatter);
 const today=dayKey(now,timeZone),requestedDays=url.searchParams.get('days');
 if(requestedDays!==null&&!['7','30','183'].includes(requestedDays))fail(400,'Choose 7 days, 30 days or six months.');
 const retention=Date.parse(monthsAgo(now));
 let start=requestedDays&&requestedDays!=='183'?boundaryFor(addDay(today,1-Number(requestedDays))):Date.parse(url.searchParams.get('since')||monthsAgo(now));
 if(!Number.isFinite(start)||start>Date.parse(now))fail(400,'Invalid date filter.');
 start=Math.max(start,retention);
 const from=dayKey(start,timeZone),days=[];let boundary=boundaryFor(from);
 for(let date=from;date<=today;date=addDay(date,1)){
  const next=boundaryFor(addDay(date,1));
  days.push({date,start:new Date(Math.max(start,boundary)).toISOString(),end:new Date(next).toISOString(),startMs:Math.max(start,boundary),endMs:next});boundary=next;
 }
 const selected=url.searchParams.get('day');
 if(selected&&!days.some(d=>d.date===selected))fail(400,'Choose a day within this period.');
 return {timeZone,from,to:today,days,start:new Date(start).toISOString(),selectedDay:selected||null};
}
export async function dailyActivity(db,id,window,now){
 // One bound calendar parameter keeps six-month reports below D1's parameter limit.
 // Aggregation covers the whole period, independently of the paginated timeline.
 const {results}=await db.prepare(`WITH calendar AS (
  SELECT json_extract(value,'$.date') date,json_extract(value,'$.start') start_at,json_extract(value,'$.end') end_at,
  json_extract(value,'$.startMs') start_ms,json_extract(value,'$.endMs') end_ms FROM json_each(?)
 ), event_totals AS (SELECT c.date,
  COUNT(DISTINCT CASE WHEN e.kind IN ('choice_submitted','self_assessment_changed') THEN e.exercise_id END) questions,
  COUNT(DISTINCT e.lesson_id) sections,
  COALESCE(SUM(e.kind='clue_revealed'),0) clues
 FROM calendar c LEFT JOIN events e ON e.user_id=? AND e.occurred_at>=c.start_at AND e.occurred_at<c.end_at AND e.occurred_at<=? AND e.kind!='active_interval'
 GROUP BY c.date), pieces AS (
  SELECT c.date,MAX(i.start_ms,c.start_ms) start_ms,MIN(i.end_ms,c.end_ms,?) end_ms
  FROM calendar c JOIN active_intervals i ON i.user_id=? AND i.end_ms>c.start_ms AND i.start_ms<c.end_ms AND i.start_ms<?
 ), covered AS (
  SELECT *,MAX(end_ms) OVER(PARTITION BY date ORDER BY start_ms,end_ms ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) previous_end FROM pieces
 ), times AS (
  SELECT date,SUM(MAX(0,end_ms-MAX(start_ms,COALESCE(previous_end,start_ms))))/1000.0 seconds FROM covered GROUP BY date
 ) SELECT e.*,COALESCE(t.seconds,0) activeSeconds FROM event_totals e LEFT JOIN times t ON t.date=e.date ORDER BY e.date`).bind(JSON.stringify(window.days),id,now,Date.parse(now),id,Date.parse(now)).all();
 return results;
}
