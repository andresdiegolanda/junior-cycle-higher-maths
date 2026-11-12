/* Skill drills: patterns and sequences (chapter 18), beside the nth-term drill.
   Quadratic sequences, and finding a distant item in a repeating pattern. */
(()=>{'use strict';
const K=SkillKit,{terms,linear,signed}=K;
const STRAND='Algebra';
const tick=v=>Number(v)<0?'`'+v+'`':String(v);
const list=values=>values.join(', ');

/* ---------- Quadratic sequences ---------- */
function quadratic(a,b,c){
 const T=n=>a*n*n+b*n+c,seq=[1,2,3,4,5].map(T),d1=seq.slice(1).map((v,i)=>v-seq[i]),d2=2*a,rest=seq.map((v,i)=>v-a*(i+1)*(i+1));
 return {T,seq,d1,d2,rest,rule:terms([[a,'n^2'],[b,'n'],[c,'']]),square:terms([[a,'n^2']])};
}
function ruleQuestion(a,b,c){
 const s=quadratic(a,b,c),first=s.d1[0];
 return {
  prompt:'This sequence is quadratic. Find its nth term.',math:`${list(s.seq)}, ...`,
  answer:{type:'expr',label:'nth term =',value:s.rule},
  mistakes:[
   {value:linear(first,'n',s.seq[0]-first),why:'That rule is linear, so it only fits the first two terms. The first differences are not constant here. The second differences are, so the rule has an `n^2` term.'},
   {value:terms([[s.d2,'n^2'],[b,'n'],[c,'']]),why:`The number in front of \`n^2\` is half the second difference: half of ${s.d2} is ${a}.`},
   {value:terms([[a,'n^2'],[s.seq[0]-a,'']]),why:`That fits the first term only. Subtract \`${s.square}\` from every term to find the rest of the rule.`}],
  hint:`Find the first differences, then the second differences. Half the second difference is the number in front of \`n^2\`.`,
  steps:[
   {math:list(s.d1),note:'Find the first differences: subtract each term from the next.'},
   {math:list([s.d2,s.d2,s.d2]),note:`The second differences are all ${s.d2}. Half of ${s.d2} is ${a}, so the rule starts with \`${s.square}\`.`},
   {math:list(s.rest),note:`Subtract \`${s.square}\` from each term: \`${s.seq[0]} - ${a}\`, \`${s.seq[1]} - ${4*a}\`, \`${s.seq[2]} - ${9*a}\`, and so on.`},
   {math:b||c?linear(b,'n',c):'0',note:!b?`What is left is the same number every time: ${tick(c)}.`
    :!c?`What is left ${b>0?'goes up':'goes down'} by ${Math.abs(b)} each time and starts at ${tick(b)}, so its rule is \`${linear(b,'n',0)}\`.`
    :`What is left ${b>0?'goes up':'goes down'} by ${Math.abs(b)} each time, so its rule starts with \`${linear(b,'n',0)}\`. When n = 1 that gives ${tick(b)}, but the first number is ${tick(b+c)}, so ${c>0?'add '+c:'subtract '+(-c)}.`},
   {math:s.rule,note:'Add the two parts to get the nth term.'},
   {math:`${a===1?'':a}(3)^2${b?' '+signed(b).replace(/(\d+)$/,'$1(3)').replace(/ 1\(3\)$/,' (3)'):''}${c?' '+signed(c):''} = ${s.seq[2]}`,note:'Check: put n = 3 into the rule. It gives the third term.'}],
  verify:[1,2,3].map(n=>({op:'value',expr:'ANSWER',subs:{n:String(n)},equals:String(s.T(n))}))
 };
}
K.define({
 id:'quadratic-sequences',title:'Quadratic sequences',strand:STRAND,lesson:'18-06',
 blurb:'Use first and second differences to continue a quadratic sequence and to find its nth term.',
 levels:[
  {name:'The next term',make(rng){
   for(;;){
    const a=rng.pick([1,1,2]),b=rng.int(-3,4),c=rng.int(-4,6),s=quadratic(a,b,c),next=s.T(6),lastStep=s.d1[3];
    if(s.seq[0]<-6||s.d1[0]===0)continue;
    return {
     prompt:'Find the next term of this sequence.',math:`${list(s.seq)}, ...`,
     answer:{type:'number',label:'Next term =',value:String(next)},
     mistakes:[
      {value:String(s.seq[4]+lastStep),why:`The differences are not all the same. They grow by ${s.d2} each time, so the next difference is ${lastStep+s.d2}, not ${lastStep}.`},
      {value:String(lastStep+s.d2),why:`${lastStep+s.d2} is the next difference. Add it to the last term, ${s.seq[4]}.`},
      {value:String(s.seq[4]+s.d2),why:`${s.d2} is the second difference: it tells you how much the gaps grow. Add the next gap, ${lastStep+s.d2}, to the last term.`}],
     hint:'Find the differences between the terms. Then look at how those differences change.',
     steps:[
      {math:list(s.d1),note:'Find the first differences: subtract each term from the next.'},
      {math:list([s.d2,s.d2,s.d2]),note:`The first differences go up by ${s.d2} each time. These second differences are constant.`},
      {math:`${lastStep} + ${s.d2} = ${lastStep+s.d2}`,note:'So the next first difference is this.'},
      {math:`${s.seq[4]} + ${lastStep+s.d2} = ${next}`,note:'Add it to the last term.'}],
     verify:{op:'value',expr:`(${a})*6^2 + (${b})*6 + (${c})`,equals:'ANSWER'}
    };
   }
  }},
  {name:'Find the rule',make(rng){
   for(;;){
    const b=rng.int(-4,5),c=rng.int(-6,8);
    if(!b&&!c||quadratic(1,b,c).seq[0]<-8)continue;
    return ruleQuestion(1,b,c);
   }
  }},
  {name:'Exam style',make(rng){
   for(;;){
    const a=rng.pick([2,2,3]),b=rng.int(-5,5),c=rng.int(-6,8);
    if(!b&&!c||quadratic(a,b,c).seq[0]<-8)continue;
    return ruleQuestion(a,b,c);
   }
  }}]
});

/* ---------- Repeating patterns ---------- */
const PATTERNS=[
 {thing:'bead',row:'A string of beads',items:['red','blue','green','yellow','white']},
 {thing:'tile',row:'A row of tiles',items:['black','white','grey','blue','cream']},
 {thing:'flag',row:'A line of flags',items:['green','white','orange','blue','red']},
 {thing:'light',row:'A chain of lights',items:['red','green','yellow','blue','pink']}];
const ORDINAL=n=>n+(n%100>=11&&n%100<=13?'th':['th','st','nd','rd','th','th','th','th','th','th'][n%10]);
function repeating(rng){
 const p=rng.pick(PATTERNS),k=rng.int(3,5),block=rng.shuffle(p.items).slice(0,k);
 return {p,k,block,intro:`${p.row} repeats the pattern ${block.join(', ')}, ${block.join(', ')}, and so on.`};
}
function itemQuestion(rng,lo,hi){
 for(;;){
  const {p,k,block,intro}=repeating(rng),N=rng.int(lo,hi),r=N%k,spot=r||k,full=Math.floor(N/k);
  if(N<=k||r===1&&rng.chance(.6))continue;
  const why=i=>i===spot%k+1&&r?`That is one place too far. ${N} divided by ${k} leaves a remainder of ${r}, so count ${r} into the block, not ${r+1}.`
   :i===k&&r?`The last colour in the block comes up only when the remainder is 0. Here ${N} divided by ${k} leaves a remainder of ${r}.`
   :i===1&&!r?`The remainder is 0, so the ${ORDINAL(N)} ${p.thing} ends a block. It is the last colour in the block, not the first.`
   :!r?`${N} divided by ${k} leaves no remainder, so the ${ORDINAL(N)} ${p.thing} ends a block. It is the last colour in the block.`
   :`Divide ${N} by ${k}. The remainder, ${r}, tells you how far into the block the ${ORDINAL(N)} ${p.thing} is.`;
  return {
   prompt:`${intro} What colour is the ${ORDINAL(N)} ${p.thing}?`,
   answer:{type:'choice',options:block.map((colour,i)=>({text:colour,value:String(i+1),...(i+1===spot?{correct:true}:{why:why(i+1)})}))},
   hint:`The pattern repeats every ${k} ${p.thing}s. Divide ${N} by ${k} and look at the remainder.`,
   steps:[
    {math:`${N} ÷ ${k} = ${full} remainder ${r}`,note:`The block has ${k} colours, so divide by ${k}. There are ${full} full blocks before the ${ORDINAL(N)} ${p.thing}${r?'':', and it ends the last of them'}.`},
    {note:r?`A remainder of ${r} means the ${ORDINAL(N)} ${p.thing} is the ${ORDINAL(r)} colour in the block: ${block[r-1]}.`:`A remainder of 0 means the ${ORDINAL(N)} ${p.thing} is the last colour in the block: ${block[k-1]}.`}],
   verify:{op:'value',expr:`Mod(${N} - 1, ${k}) + 1`,equals:'ANSWER'}
  };
 }
}
K.define({
 id:'repeating-patterns',title:'Repeating patterns',strand:STRAND,lesson:'18-02',
 blurb:'Use division and the remainder to find a distant item in a pattern that repeats.',
 levels:[
  {name:'Near the start',make(rng){return itemQuestion(rng,7,24)}},
  {name:'A distant item',make(rng){return itemQuestion(rng,40,250)}},
  {name:'Count one colour',make(rng){
   for(;;){
    const {p,k,block,intro}=repeating(rng),N=rng.int(30,120),r=N%k,full=Math.floor(N/k),spot=rng.int(1,k),colour=block[spot-1],extra=spot<=r?1:0,count=full+extra;
    if(!r)continue;
    return {
     prompt:`${intro} How many ${colour} ${p.thing}s are there among the first ${N} ${p.thing}s?`,
     answer:{type:'number',value:String(count)},
     mistakes:[
      {value:String(full+1-extra),why:extra?`There are ${full} full blocks, but ${r===1?`the 1 ${p.thing} left over is ${colour} too`:`the ${r} ${p.thing}s left over also include a ${colour} one`}.`:`There are ${full} full blocks. The ${r} ${p.thing}${r===1?'':'s'} left over ${r===1?'does':'do'} not reach ${colour}, which is the ${ORDINAL(spot)} colour in the block.`},
      {value:String(N),why:`${N} is the number of ${p.thing}s of every colour. Only one in every ${k} is ${colour}.`}],
     hint:`Each block of ${k} has one ${colour} ${p.thing}. Count the full blocks, then check the ones left over.`,
     steps:[
      {math:`${N} ÷ ${k} = ${full} remainder ${r}`,note:`There are ${full} full blocks, and each one has one ${colour} ${p.thing}.`},
      {note:r===1?`The 1 left over is the first colour of the block, ${block[0]}. ${extra?`So there is one more ${colour} ${p.thing}.`:`That is not ${colour}.`}`:`The ${r} left over are the first ${r} colours of the block: ${block.slice(0,r).join(', ')}. ${extra?`That includes ${colour}.`:`That does not include ${colour}.`}`},
      {math:`${full} + ${extra} = ${count}`,note:extra?'Add one for the part block.':'Nothing is added for the part block.'}],
     verify:{op:'value',expr:`floor((${N} - ${spot})/${k}) + 1`,equals:'ANSWER'}
    };
   }
  }}]
});
})();
