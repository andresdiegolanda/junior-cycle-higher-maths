export class HttpError extends Error{constructor(status,message){super(message);this.status=status}}
export const fail=(status,message)=>{throw new HttpError(status,message)};
export function identifier(v){return typeof v==='string'&&/^[a-zA-Z0-9_-]{1,90}$/.test(v)}
export function emailAddress(v){return typeof v==='string'&&v.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
export function monthsAgo(now,months=6){const d=new Date(now),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()-months);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d.toISOString()}
export function unionSeconds(intervals){let total=0,end=-Infinity;for(const i of [...intervals].sort((a,b)=>a.start_ms-b.start_ms)){total+=Math.max(0,i.end_ms-Math.max(end,i.start_ms));end=Math.max(end,i.end_ms)}return Math.round(total/1000)}
const integer=(x,min,max)=>Number.isInteger(x)&&x>=min&&x<=max;
export function validateEvent(e,catalog,now){
 if(!e||!identifier(e.id)||!identifier(e.sessionId)||!e.payload||typeof e.payload!=='object'||Array.isArray(e.payload))fail(400,'Invalid activity event.');
 if(e.version!==catalog.version)fail(409,'The guide has changed. Reload before continuing.');
 const at=Date.parse(e.at),time=Date.parse(now);
 if(!Number.isFinite(at)||at>time+60000||at<time-7*86400000)fail(400,'Activity must be from the last seven days.');
 const l=e.lessonId&&Object.hasOwn(catalog.lessons,e.lessonId)?catalog.lessons[e.lessonId]:null,q=e.exerciseId&&Object.hasOwn(catalog.exercises,e.exerciseId)?catalog.exercises[e.exerciseId]:null;
 if(e.lessonId&&!l||e.exerciseId&&!q||q&&e.lessonId&&q.lessonId!==e.lessonId)fail(400,'Unknown lesson or exercise.');
 const p=e.payload;let clean={},scope=null,item=null;
 switch(e.kind){
  case 'lesson_opened':if(!l||!['learn','practice','challenge','reference'].includes(p.mode))fail(400,'Invalid lesson.');clean={mode:p.mode};scope='position';item='last';break;
  case 'teaching_step_viewed':if(!l||!integer(p.step,0,l.steps-1))fail(400,'Invalid step.');clean={step:p.step};scope='lesson';item=e.lessonId;break;
  case 'confidence_changed':if(!l||typeof p.confident!=='boolean')fail(400,'Invalid confidence.');clean={confident:p.confident};scope='lesson';item=e.lessonId;break;
  case 'exercise_started':if(!q||!identifier(e.attemptId))fail(400,'Invalid attempt.');scope='exercise';item=e.exerciseId;break;
  case 'choice_submitted':if(q?.type!=='choice'||!integer(p.option,0,q.options-1))fail(400,'Invalid answer choice.');clean={option:p.option,correct:p.option===q.answer};scope='exercise';item=e.exerciseId;break;
  case 'clue_revealed':if(!q||!integer(p.index,0,q.hints-1))fail(400,'Invalid clue.');clean={index:p.index};scope='exercise';item=e.exerciseId;break;
  case 'solution_step_revealed':if(!q||!integer(p.index,0,q.steps-1))fail(400,'Invalid solution step.');clean={index:p.index};scope='exercise';item=e.exerciseId;break;
  case 'self_assessment_changed':if(!q||q.type==='choice'||!['independent','supported','revisit'].includes(p.review))fail(400,'Invalid self-assessment.');clean={review:p.review};scope='exercise';item=e.exerciseId;break;
  case 'drill_answered':case 'drill_round_finished':{
   const skill=typeof p.skill==='string'&&Object.hasOwn(catalog.skills||{},p.skill)?catalog.skills[p.skill]:null;
   if(!skill||!l||skill.lesson!==e.lessonId||!integer(p.level,0,2))fail(400,'Invalid skill drill.');
   if(e.kind==='drill_answered'){if(!['first','helped','missed'].includes(p.outcome))fail(400,'Invalid drill answer.');clean={skill:p.skill,level:p.level,outcome:p.outcome}}
   else{if(!integer(p.stars,0,3))fail(400,'Invalid drill round.');clean={skill:p.skill,level:p.level,stars:p.stars}}
   scope='skill';item=p.skill;break;
  }
  case 'drill_day_logged':
   // The student's own calendar day; it must be within a day and a half of the event.
   if(!l||typeof p.day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(p.day)||!(Math.abs(Date.parse(p.day+'T12:00:00Z')-at)<=129600000))fail(400,'Invalid practice day.');
   clean={day:p.day};scope='drills';item='days';break;
  case 'active_interval':{
   const start=Number(p.start),end=Number(p.end);
   if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||end<=start||end-start>35000||end>time+60000||start<time-7*86400000)fail(400,'Invalid active-time interval.');
   clean={start,end};break;
  }
  default:fail(400,'Unknown activity type.');
 }
 if(q&&!identifier(e.attemptId))fail(400,'An exercise needs an attempt.');
 if(scope&&!integer(e.baseRevision,0,10000000))fail(400,'Missing progress revision.');
 return {id:e.id,sessionId:e.sessionId,kind:e.kind,lessonId:e.lessonId||null,exerciseId:e.exerciseId||null,attemptId:e.attemptId||null,at:new Date(at).toISOString(),version:e.version,payload:clean,scope,item,baseRevision:e.baseRevision};
}
export function project(row,e){
 const s=row?JSON.parse(row.state):{};
 switch(e.kind){
 case 'exercise_started':return {attemptId:e.attemptId};
 case 'lesson_opened':return {chapter:Number(e.lessonId.slice(0,2)),lesson:e.lessonId,mode:e.payload.mode};
 case 'teaching_step_viewed':return {...s,seen:[...new Set([...(s.seen||[]),e.payload.step])],lastStep:e.payload.step};
 case 'confidence_changed':return {...s,done:e.payload.confident};
 case 'choice_submitted':return {...s,option:e.payload.option,correct:e.payload.correct,attemptId:e.attemptId};
 case 'clue_revealed':return {...s,usedClue:true};
 case 'solution_step_revealed':return {...s,viewedSolution:true};
 case 'self_assessment_changed':return {...s,review:e.payload.review,done:e.payload.review==='independent'};
 case 'drill_answered':return {...s,asked:(s.asked||0)+1,right:(s.right||0)+(e.payload.outcome==='first'?1:0)};
 case 'drill_round_finished':{const stars=[0,1,2].map(i=>Number.isInteger(s.stars?.[i])?s.stars[i]:0);stars[e.payload.level]=Math.max(stars[e.payload.level],e.payload.stars);return {...s,stars,rounds:(s.rounds||0)+1}}
 case 'drill_day_logged':{const days={...(s.days||{})};days[e.payload.day]=(days[e.payload.day]||0)+1;return {days:Object.fromEntries(Object.keys(days).sort().slice(-120).map(k=>[k,days[k]]))}}
 default:return s;
 }
}
