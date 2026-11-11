/* Skill drills: statistics and probability. Each level's make(rng) returns one question. */
(()=>{
'use strict';
const K=SkillKit,{Q,qStr,fmt}=K;
const NAMES=['Aoife','Cian','Niamh','Conor','Ella','Tom','Maya','Darragh'];
const sum=a=>a.reduce((s,v)=>s+v,0);
const asc=a=>[...a].sort((x,y)=>x-y);
/* A data list inside a prompt, and the same list written as a sum. */
const show=a=>'`'+a.join(', ')+'`';
const plus=a=>a.map((v,i)=>i?(v<0?`+ (${v})`:`+ ${v}`):String(v)).join(' ');
const claimSum=a=>a.map(v=>`(${v})`).join(' + ');
const median=a=>{const s=asc(a),n=s.length;return n%2?Q(s[(n-1)/2]):Q(s[n/2-1]+s[n/2],2)};
const WORDS=['zero','one','two','three','four','five','six','seven','eight','nine','ten'];

K.define({
 id:'mean',
 title:'Find the mean',
 strand:'Statistics',
 lesson:'07-02',
 blurb:'Add all the values, then divide by how many values there are.',
 levels:[
  {name:'Whole numbers',make(rng){
   for(;;){
    const n=rng.int(4,6),m=rng.int(4,12),data=[];
    for(let i=0;i<n-1;i++)data.push(rng.int(Math.max(1,m-5),m+5));
    const last=n*m-sum(data);
    if(last<1||last>m+7)continue;
    data.push(last);
    const values=rng.shuffle(data),total=n*m,name=rng.pick(NAMES);
    if(new Set(values).size<3)continue;
    if(rng.chance(.25)){
     /* The total is given: the mean is the equal share. */
     const prompt=rng.pick([
      `${WORDS[n][0].toUpperCase()+WORDS[n].slice(1)} numbers add up to ${total}. Find the mean of the numbers.`,
      `A team scores ${total} points altogether in ${n} matches. Find the mean number of points per match.`,
      `${name} reads ${total} pages altogether over ${n} evenings. Find the mean number of pages per evening.`]);
     return {
      prompt,
      answer:{type:'number',label:'Mean =',value:String(m)},
      mistakes:[
       {value:String(total-n),why:`Sharing equally means dividing. Work out \`${total} / ${n}\`, not \`${total} - ${n}\`.`},
       {value:String(total*n),why:`The mean is the equal share of the total, so divide ${total} by ${n}. Do not multiply.`},
       {value:String(total),why:`That is the total. The mean is the equal share: divide the total by ${n}.`}],
      hint:`The mean is the equal share. Divide the total by ${n}.`,
      steps:[
       {math:`frac(${total}, ${n}) = ${m}`,note:`Mean = total divided by the number of values. Here the total is ${total} and there are ${n} values.`},
       {math:`${m} * ${n} = ${total}`,note:'Check: the mean times the number of values gives back the total.'}],
      verify:{op:'value',expr:`${total}/${n}`,equals:'ANSWER'}
     };
    }
    const prompt=rng.pick([
     `Find the mean of ${show(values)}.`,
     `Find the mean of these ${WORDS[n]} numbers: ${show(values)}.`,
     `${name} gets these marks in ${WORDS[n]} quizzes: ${show(values)}. Find the mean mark.`,
     `A team scores these numbers of points in ${WORDS[n]} matches: ${show(values)}. Find the mean number of points per match.`,
     `${name} counts the texts sent on ${WORDS[n]} days: ${show(values)}. Find the mean number of texts per day.`]);
    return {
     prompt,
     answer:{type:'number',label:'Mean =',value:String(m)},
     mistakes:[
      {value:String(total),why:`You found the total. Now share it equally: divide ${total} by the number of values, ${n}.`},
      {value:qStr(median(values)),why:`That is the median, the middle value when the list is in order. For the mean, add every value and divide by ${n}.`},
      {value:qStr(Q(total,n-1)),why:`Count the values again. There are ${n} of them, so divide the total by ${n}.`},
      {value:qStr(Q(total,n+1)),why:`Count the values again. There are ${n} of them, so divide the total by ${n}.`}],
     hint:`Add all ${WORDS[n]} values first. Then divide the total by ${n}.`,
     steps:[
      {math:`${plus(values)} = ${total}`,note:'Add all the values to get the total.'},
      {math:`frac(${total}, ${n}) = ${m}`,note:`Share the total equally: divide by the number of values, ${n}.`},
      {math:`${m} * ${n} = ${total}`,note:'Check: the mean times the number of values gives back the total.'}],
     verify:{op:'stat',fn:'mean',data:values,equals:'ANSWER'}
    };
   }
  }},
  {name:'Decimals and negatives',make(rng){
   const variant=rng.pick(['decimal','decimal','negative','negative','zero']);
   for(;;){
    const name=rng.pick(NAMES);
    if(variant==='decimal'){
     /* Work in tenths so the arithmetic stays exact. */
     const n=rng.int(4,5),mt=rng.int(18,95),tenths=[];
     for(let i=0;i<n-1;i++)tenths.push(rng.int(Math.max(5,mt-25),mt+25));
     const last=n*mt-sum(tenths);
     if(last<5||last>mt+35)continue;
     tenths.push(last);
     if(tenths.filter(t=>t%10).length<2||new Set(tenths).size<n)continue;
     const values=rng.shuffle(tenths).map(t=>t/10),total=n*mt/10,mean=mt/10,lo=Math.min(...values),hi=Math.max(...values);
     const context=rng.pick([
      {text:`Find the mean of ${show(values)}.`,unit:''},
      {text:`The rainfall, in mm, on ${WORDS[n]} days was ${show(values)}. Find the mean daily rainfall.`,unit:'mm'},
      {text:`${name} measures the lengths, in cm, of ${WORDS[n]} leaves: ${show(values)}. Find the mean length.`,unit:'cm'},
      {text:`The masses, in kg, of ${WORDS[n]} parcels are ${show(values)}. Find the mean mass.`,unit:'kg'}]);
     return {
      prompt:context.text,
      answer:{type:'number',label:'Mean =',value:String(mean),...(context.unit?{unit:context.unit}:{})},
      mistakes:[
       {value:String(total),why:`You found the total. Now divide ${total} by the number of values, ${n}.`},
       {value:String(mt),why:`Check the decimal point. The mean must lie between the smallest value, ${lo}, and the largest, ${hi}.`},
       {value:String(mt/100),why:`Check the decimal point. The mean must lie between the smallest value, ${lo}, and the largest, ${hi}.`}],
      hint:`Line up the decimal points and add. Then divide the total by ${n}.`,
      steps:[
       {math:`${plus(values)} = ${total}`,note:'Add all the values. Keep the decimal points lined up.'},
       {math:`frac(${total}, ${n}) = ${mean}`,note:`Divide the total by the number of values, ${n}.`},
       {math:`${lo} < ${mean} < ${hi}`,note:'Check: the mean lies between the smallest and the largest value.'}],
      verify:{op:'stat',fn:'mean',data:values,equals:'ANSWER'}
     };
    }
    if(variant==='negative'){
     const n=rng.int(5,6),m=rng.int(-4,5),data=[];
     for(let i=0;i<n-1;i++)data.push(rng.int(m-6,m+6));
     const last=n*m-sum(data);
     if(Math.abs(last)>12)continue;
     data.push(last);
     const values=rng.shuffle(data),total=n*m,negatives=values.filter(v=>v<0);
     const sizes=sum(values.map(Math.abs));
     if(negatives.length<2||values.filter(v=>v>0).length<1||total===0||sizes===n*total||new Set(values).size<n-1)continue;
     const prompt=rng.pick([
      `Find the mean of ${show(values)}.`,
      `The temperature at noon, in °C, on ${WORDS[n]} days was ${show(values)}. Find the mean temperature.`,
      `In a quiz a wrong answer loses points. ${name} gets these scores in ${WORDS[n]} rounds: ${show(values)}. Find the mean score.`]);
     return {
      prompt,
      answer:{type:'number',label:'Mean =',value:String(m)},
      mistakes:[
       {value:qStr(Q(sizes,n)),why:`A negative value pulls the total down. Adding \`${negatives[0]}\` is the same as subtracting ${-negatives[0]}.`},
       {value:String(total),why:`You found the total. Now divide ${total} by the number of values, ${n}.`},
       {value:String(-m),why:`Check the sign. The total is ${total}, so the mean is ${total<0?'negative':'positive'}.`}],
      hint:`Add the positive values, then take away the size of each negative value. Divide the total by ${n}.`,
      steps:[
       {math:`${plus(values)} = ${total}`,note:'Add all the values. Adding a negative number lowers the total.'},
       {math:`frac(${total}, ${n}) = ${m}`,note:`Divide the total by the number of values, ${n}.`},
       {math:`${m} * ${n} = ${total}`,note:'Check: the mean times the number of values gives back the total.'}],
      verify:{op:'stat',fn:'mean',data:values,equals:'ANSWER'}
     };
    }
    /* A list that contains zero: the zero still counts as a value. */
    const n=rng.int(5,6),m=rng.int(2,5),zeros=rng.int(1,2),data=Array(zeros).fill(0);
    for(let i=0;i<n-zeros-1;i++)data.push(rng.int(1,9));
    const last=n*m-sum(data);
    if(last<1||last>9)continue;
    data.push(last);
    const values=rng.shuffle(data),total=n*m;
    if(new Set(values).size<4)continue;
    const prompt=rng.pick([
     `A team scores these numbers of goals in ${WORDS[n]} matches: ${show(values)}. Find the mean number of goals per match.`,
     `${name} counts the emails received on ${WORDS[n]} days: ${show(values)}. Find the mean number of emails per day.`,
     `Find the mean of ${show(values)}.`]);
    return {
     prompt,
     answer:{type:'number',label:'Mean =',value:String(m)},
     mistakes:[
      {value:qStr(Q(total,n-zeros)),why:`A value of 0 still counts as a value. There are ${n} values, so divide by ${n}.`},
      {value:String(total),why:`You found the total. Now divide ${total} by the number of values, ${n}.`},
      {value:qStr(median(values)),why:`That is the median, the middle value in order. For the mean, add every value and divide by ${n}.`}],
     hint:`Count every value, including ${zeros===1?'the 0':'each 0'}. There are ${n} values.`,
     steps:[
      {math:`${plus(values)} = ${total}`,note:'Add all the values. A 0 adds nothing to the total.'},
      {math:`frac(${total}, ${n}) = ${m}`,note:`Divide by the number of values, ${n}. ${zeros===1?'The 0 is':'The 0s are'} counted.`},
      {math:`${m} * ${n} = ${total}`,note:'Check: the mean times the number of values gives back the total.'}],
     verify:{op:'stat',fn:'mean',data:values,equals:'ANSWER'}
    };
   }
  }},
  {name:'Working backwards',make(rng){
   const variant=rng.pick(['missing','missing','newmean','target']);
   for(;;){
    const name=rng.pick(NAMES);
    if(variant==='missing'){
     const n=rng.int(4,6),m=rng.int(5,15),known=[];
     for(let i=0;i<n-1;i++)known.push(rng.int(Math.max(1,m-6),m+6));
     const x=n*m-sum(known),total=n*m,part=sum(known);
     if(x<1||x>25||x===m||known.includes(x)||new Set(known).size<n-2)continue;
     const context=rng.chance(.4),at=context?n-1:rng.int(0,n-1);
     const withX=[...known.slice(0,at),'x',...known.slice(at)],all=[...known.slice(0,at),x,...known.slice(at)];
     const prompt=context
      ?rng.pick([
       `${name} has a mean mark of ${m} over ${WORDS[n]} tests. The marks in the first ${WORDS[n-1]} tests were ${show(known)}. Find the mark in the last test.`,
       `A team has a mean score of ${m} points over ${WORDS[n]} matches. The scores in the first ${WORDS[n-1]} matches were ${show(known)}. Find the score in the last match.`])
      :`The mean of these ${WORDS[n]} numbers is ${m}: ${show(withX)}. Find the value of \`x\`.`;
     return {
      prompt,
      answer:{type:'number',label:context?'Answer =':'x =',value:String(x)},
      mistakes:[
       {value:String(total),why:`That is the total of all ${n} values. Subtract the values you know, which add up to ${part}, to leave the missing one.`},
       {value:String(m),why:`That is the mean. The missing value is the amount that brings the total up to \`${n} * ${m} = ${total}\`.`},
       ...((n-1)*m-part>0?[{value:String((n-1)*m-part),why:`There are ${n} values, counting the missing one. The total is \`${n} * ${m} = ${total}\`, not \`${n-1} * ${m}\`.`}]:[]),
       {value:String(part),why:`That is the total of the values you know. Subtract it from the total of all ${n} values, \`${n} * ${m} = ${total}\`.`}],
      hint:`Work backwards. If the mean of ${n} values is ${m}, what must the ${n} values add up to?`,
      steps:[
       {math:`${n} * ${m} = ${total}`,note:`Total = mean times the number of values. All ${n} values must add up to ${total}.`},
       {math:`${plus(known)} = ${part}`,note:'Add the values you know.'},
       {math:context?`${total} - ${part} = ${x}`:`x = ${total} - ${part} = ${x}`,note:'The missing value is what is left.'},
       {math:`frac(${plus(all)}, ${n}) = frac(${total}, ${n}) = ${m}`,note:`Check: the mean of all ${WORDS[n]} values is ${m}.`}],
      verify:{op:'solve',eq:`(${claimSum(known)} + x)/${n} = ${m}`,variable:'x',solutions:['ANSWER']}
     };
    }
    if(variant==='newmean'){
     const n=rng.int(3,7),m=rng.int(8,20),d=rng.nonzero(-3,3),v=m+(n+1)*d,M=m+d,total=n*m;
     if(v<0)continue;
     const thing=rng.pick([{unit:'matches',one:'match',what:'score',verb:'scores'},{unit:'tests',one:'test',what:'mark',verb:'gets'},{unit:'rounds',one:'round',what:'score',verb:'scores'}]);
     return {
      prompt:`After ${n} ${thing.unit}, ${name} has a mean ${thing.what} of ${m}. In the next ${thing.one} ${name} ${thing.verb} ${v}. Find the new mean ${thing.what}.`,
      answer:{type:'number',label:'New mean =',value:String(M)},
      mistakes:[
       {value:qStr(Q(m+v,2)),why:`The old mean stands for ${n} ${thing.unit}, so it counts ${n} times. Find the old total first: \`${n} * ${m} = ${total}\`.`},
       {value:qStr(Q(total+v,n)),why:`There are now ${n+1} ${thing.unit}, so divide the new total by ${n+1}.`},
       {value:String(total+v),why:`That is the new total. Divide it by the new number of ${thing.unit}, ${n+1}.`}],
      hint:`Find the total for the first ${n} ${thing.unit}: mean times ${n}. Then add the new ${thing.what}.`,
      steps:[
       {math:`${n} * ${m} = ${total}`,note:`Old total = mean times the number of ${thing.unit}.`},
       {math:`${total} + ${v} = ${total+v}`,note:`Add the new ${thing.what} to get the new total.`},
       {math:`frac(${total+v}, ${n+1}) = ${M}`,note:`Divide by the new number of ${thing.unit}, ${n+1}.`}],
      verify:{op:'value',expr:`(${n}*${m} + ${v})/(${n} + 1)`,equals:'ANSWER'}
     };
    }
    /* The value needed to reach a target mean. */
    const n=rng.int(3,6),m=rng.int(6,15),d=rng.int(1,3),M=m+d,v=M+n*d,total=n*m,need=(n+1)*M;
    const thing=rng.pick([{unit:'games',one:'game',what:'score'},{unit:'tests',one:'test',what:'mark'},{unit:'rounds',one:'round',what:'score'}]);
    return {
     prompt:`After ${n} ${thing.unit}, ${name} has a mean ${thing.what} of ${m}. What ${thing.what} is needed in the next ${thing.one} to raise the mean to ${M}?`,
     answer:{type:'number',label:'Answer =',value:String(v)},
     mistakes:[
      {value:String(M),why:`That is the target mean. The next ${thing.what} must also lift the ${n} earlier ones, so compare the totals.`},
      {value:String(need),why:`That is the total needed after ${n+1} ${thing.unit}. Subtract the total so far, \`${n} * ${m} = ${total}\`.`},
      {value:String(need-m),why:`Subtract the total of all ${n} earlier ${thing.unit}, \`${n} * ${m} = ${total}\`, not one ${thing.what}.`}],
     hint:`Find two totals: the total needed after ${n+1} ${thing.unit}, and the total so far.`,
     steps:[
      {math:`${n+1} * ${M} = ${need}`,note:`Total needed = target mean times the new number of ${thing.unit}.`},
      {math:`${n} * ${m} = ${total}`,note:`Total so far = old mean times ${n}.`},
      {math:`${need} - ${total} = ${v}`,note:`The next ${thing.what} must make up the difference.`},
      {math:`frac(${total} + ${v}, ${n+1}) = ${M}`,note:'Check: the new mean is the target.'}],
     verify:{op:'solve',eq:`(${n}*${m} + x)/(${n} + 1) = ${M}`,variable:'x',solutions:['ANSWER']}
    };
   }
  }}
 ]
});
/* ---------- Median, mode and range ---------- */
const counts=a=>{const m=new Map();for(const v of a)m.set(v,(m.get(v)||0)+1);return m};
const modesOf=a=>{const m=counts(a),top=Math.max(...m.values());return [...m.keys()].filter(k=>m.get(k)===top)};
const ordinal=n=>n+(n%10===1&&n%100!==11?'st':n%10===2&&n%100!==12?'nd':n%10===3&&n%100!==13?'rd':'th');
const half=q=>String(q.n/q.d);
/* One statistic of a list. The values are whole numbers; scale 10 shows them as tenths.
   With ordered:true the data is already in order (a stem-and-leaf plot), so no sorting step. */
function listStat(kind,raw,{scale=1,unit,ordered=false}={}){
 const d=v=>v/scale,values=raw.map(d),sortedRaw=asc(raw),sorted=sortedRaw.map(d),n=raw.length,extra=unit?{unit}:{};
 const orderStep=note=>ordered?[]:[{math:sorted.join(', '),note}];
 if(kind==='median'){
  const odd=n%2===1,mid=odd?sortedRaw[(n-1)/2]:(sortedRaw[n/2-1]+sortedRaw[n/2])/2;
  const written=odd?raw[(n-1)/2]:(raw[n/2-1]+raw[n/2])/2,a=sorted[n/2-1],b=sorted[n/2],k=odd?(n+1)/2:n/2;
  const places=Math.round(Math.log10(scale)),show=v=>places?Number(v).toFixed(places):String(v);
  const two=`There are two middle values, ${show(a)} and ${show(b)}. The median is halfway between them: add them and divide by 2.`;
  return {
   answer:{type:'number',label:'Median =',value:String(d(mid)),...extra},
   mistakes:[
    ...(ordered?[]:[{value:String(d(written)),why:'You used the middle of the list as it is written. Put the values in order first, then find the middle.'}]),
    ...(odd?[]:[{value:String(a),why:two},{value:String(b),why:two}]),
    {value:qStr(Q(sum(raw),n*scale)),why:'That is the mean. The median is the middle value when the values are in order.'}],
   hint:ordered
    ?`Count the values first: there are ${n}. Then count along to the middle.`
    :odd?`Write the ${n} values in order, smallest first. Then find the one in the middle.`:`Write the ${n} values in order. An even list has two middle values, and the median is halfway between them.`,
   steps:odd?[
    ...orderStep('Put the values in order, smallest first.'),
    {math:`frac(${n} + 1, 2) = ${k}`,note:`There are ${n} values, so the median is the ${ordinal(k)} value.`},
    {math:`median = ${d(mid)}`,note:`Count along the ordered values to the ${ordinal(k)} one.`}]
   :[
    ...orderStep('Put the values in order, smallest first.'),
    {math:`frac(${n}, 2) = ${k}`,note:`There are ${n} values, so the two middle values are the ${ordinal(k)} and the ${ordinal(k+1)}: ${show(a)} and ${show(b)}.`},
    {math:`frac(${show(a)} + ${places?show(b):K.bracket(b)}, 2) = ${d(mid)}`,note:'The median is halfway between them: add them and divide by 2.'}],
   verify:{op:'stat',fn:'median',data:values,equals:'ANSWER'}
  };
 }
 if(kind==='mode'){
  const mode=modesOf(raw)[0],times=counts(raw).get(mode),med=median(raw);
  return {
   answer:{type:'number',label:'Mode =',value:String(d(mode)),...extra},
   mistakes:[
    {value:String(times),why:`That is how many times ${d(mode)} appears. The mode is the value itself, ${d(mode)}.`},
    {value:String(sorted[n-1]),why:'That is the largest value. The mode is the value that appears most often.'},
    {value:qStr(Q(med.n,med.d*scale)),why:'That is the median, the middle value. The mode is the value that appears most often.'}],
   hint:ordered?'Look for the value that appears most often. Equal leaves in the same row are equal values.':'Put the values in order so that equal values sit together. Which value appears most often?',
   steps:[
    ...(ordered?[{note:'Look along each row for leaves that repeat. Equal leaves in the same row are equal values.'}]:orderStep('Put the values in order so that equal values sit together.')),
    {math:`mode = ${d(mode)}`,note:`${d(mode)} appears ${times} times, more often than any other value.`}],
   verify:{op:'stat',fn:'mode',data:values,equals:'ANSWER'}
  };
 }
 const lo=sortedRaw[0],hi=sortedRaw[n-1],range=d(hi-lo);
 return {
  answer:{type:'number',label:'Range =',value:String(range),...extra},
  mistakes:[
   {value:String(d(hi)),why:`That is the largest value. The range is the largest minus the smallest: \`${d(hi)} - ${K.bracket(d(lo))}\`.`},
   lo<0?{value:String(d(hi+lo)),why:`The smallest value is \`${d(lo)}\`. Subtracting a negative number adds: \`${d(hi)} - (${d(lo)}) = ${d(hi)} + ${d(-lo)}\`.`}
       :{value:String(d(hi+lo)),why:'Subtract the smallest value from the largest. Do not add them.'},
   ...(ordered?[]:[{value:String(d(Math.abs(raw[n-1]-raw[0]))),why:'Use the largest and the smallest values, not the first and the last in the list.'}])],
  hint:'Find the largest value and the smallest value. The range is the gap between them.',
  steps:[
   ordered?{note:`The first leaf of the first row gives the smallest value, ${d(lo)}. The last leaf of the last row gives the largest, ${d(hi)}.`}
          :{math:sorted.join(', '),note:`Put the values in order. The smallest is ${d(lo)} and the largest is ${d(hi)}.`},
   {math:`${d(hi)} - ${K.bracket(d(lo))} = ${range}`,note:lo<0?'Range = largest minus smallest. Subtracting a negative number is the same as adding.':'Range = largest value minus smallest value.'}],
  verify:{op:'stat',fn:'range',data:values,equals:'ANSWER'}
 };
}

/* Frequency tables used by several skills. */
const TABLES=[
 {head:['Goals','Number of matches'],intro:'The table shows the goals a team scored in each match of a season.',noun:'number of goals',starts:[0],count:'How many matches did the team play?',total:'How many goals did the team score altogether?',mean:'Find the mean number of goals per match.',group:'matches',totalNoun:'total number of goals'},
 {head:['Mark','Number of students'],intro:'The table shows the marks of a class in a short quiz.',noun:'mark',starts:[1,2,3,4,5],count:'How many students did the quiz?',total:'What do all the marks add up to?',mean:'Find the mean mark.',group:'students',totalNoun:'total of all the marks'},
 {head:['Children','Number of families'],intro:'The table shows the number of children in each family on a road.',noun:'number of children',starts:[1],count:'How many families live on the road?',total:'How many children live on the road altogether?',mean:'Find the mean number of children per family.',group:'families',totalNoun:'total number of children'},
 {head:['Books','Number of students'],intro:'The table shows how many books each student in a class read last month.',noun:'number of books',starts:[0,1],count:'How many students are in the class?',total:'How many books did the class read altogether?',mean:'Find the mean number of books per student.',group:'students',totalNoun:'total number of books'}
];
const tableOf=(ctx,xs,fs)=>({head:ctx.head,rows:xs.map((x,i)=>[String(x),String(fs[i])])});
function tableStat(kind,xs,fs,ctx){
 const N=sum(fs),rows=xs.length,running=fs.map((f,i)=>sum(fs.slice(0,i+1))),at=k=>xs[running.findIndex(r=>r>=k)];
 const top=Math.max(...fs),mode=xs[fs.indexOf(top)];
 if(kind==='median'){
  const odd=N%2===1,k=odd?(N+1)/2:N/2,a=at(k),b=odd?a:at(k+1),med=(a+b)/2;
  return {
   answer:{type:'number',label:'Median =',value:String(med)},
   mistakes:[
    {value:half(median(xs)),why:`That is the middle of the first column. Each value appears as many times as its frequency, so count through all ${N} values.`},
    {value:half(median(fs)),why:`That is the median of the frequencies. The question is about the ${ctx.noun}. Use the frequencies to count along.`},
    {value:String(mode),why:'That is the mode, the value with the highest frequency. The median is the middle value when all the values are in order.'}],
   hint:'Add the frequencies to find how many values there are. Then count through the table to the middle.',
   steps:[
    {math:`${fs.join(' + ')} = ${N}`,note:'Add the frequencies to find how many values there are.'},
    odd?{math:`frac(${N} + 1, 2) = ${k}`,note:`The median is the ${ordinal(k)} value.`}
       :{math:`frac(${N}, 2) = ${k}`,note:`There are two middle values: the ${ordinal(k)} and the ${ordinal(k+1)}.`},
    {math:running.join(', '),note:`Keep a running total of the frequencies. ${odd?`The ${ordinal(k)} value is in the row for ${a}.`:a===b?`The ${ordinal(k)} and ${ordinal(k+1)} values are both in the row for ${a}.`:`The ${ordinal(k)} value is ${a} and the ${ordinal(k+1)} value is ${b}.`}`},
    odd||a===b?{math:`median = ${med}`,note:'The table lists the values in order, so this is the median.'}
       :{math:`frac(${a} + ${b}, 2) = ${med}`,note:'The median is halfway between the two middle values.'}],
   verify:{op:'stat',fn:'median',data:xs,freq:fs,equals:'ANSWER'}
  };
 }
 if(kind==='mode')return {
  answer:{type:'number',label:'Mode =',value:String(mode)},
  mistakes:[
   {value:String(top),why:`That is the highest frequency. The mode is the value beside it, ${mode}.`},
   {value:String(xs[rows-1]),why:'That is the largest value in the first column. The mode is the value with the highest frequency.'},
   {value:String(N),why:'That is the total of the frequencies. The mode is the value with the highest frequency.'}],
  hint:'The mode is the value that appears most often. Find the highest frequency, then read across to its value.',
  steps:[
   {math:`highest frequency = ${top}`,note:'Look down the frequency column for the largest number.'},
   {math:`mode = ${mode}`,note:`Read across: the frequency ${top} belongs to the value ${mode}. The mode is the value, not the frequency.`}],
  verify:{op:'stat',fn:'mode',data:xs,freq:fs,equals:'ANSWER'}
 };
 const lo=xs[0],hi=xs[rows-1];
 return {
  answer:{type:'number',label:'Range =',value:String(hi-lo)},
  mistakes:[
   {value:String(Math.max(...fs)-Math.min(...fs)),why:'That is the range of the frequencies. The range uses the values in the first column: largest minus smallest.'},
   {value:String(hi),why:`That is the largest value. Subtract the smallest value, ${lo}.`},
   {value:String(N),why:'That is the total of the frequencies. The range is the largest value minus the smallest value.'}],
  hint:'Use the first column only. The range is the largest value minus the smallest value.',
  steps:[
   {note:`Read the first column. The smallest value is ${lo} and the largest is ${hi}. Both have a frequency above 0, so both occur.`},
   {math:`${hi} - ${lo} = ${hi-lo}`,note:'Range = largest value minus smallest value.'}],
  verify:{op:'stat',fn:'range',data:xs,freq:fs,equals:'ANSWER'}
 };
}

K.define({
 id:'median-mode-range',
 title:'Median, mode and range',
 strand:'Statistics',
 lesson:'07-01',
 blurb:'Put the values in order, then read off the middle, the most common, or the spread.',
 levels:[
  {name:'Short lists',make(rng){
   const kind=rng.pick(['median','median','mode','range']);
   for(;;){
    const name=rng.pick(NAMES);let values;
    if(kind==='median'){
     const n=rng.pick([5,5,7]);values=Array.from({length:n},()=>rng.int(1,20));
     if(new Set(values).size<n-1||values[(n-1)/2]===asc(values)[(n-1)/2])continue;
    }else if(kind==='mode'){
     const n=rng.int(6,7),times=rng.int(2,3),[mode,...others]=rng.distinct(n-times+1,1,12);
     values=rng.shuffle([...Array(times).fill(mode),...others]);
     if(times===mode||mode===Math.max(...values))continue;
    }else{
     const n=rng.int(5,7);values=rng.distinct(n,2,30);
     if(Math.abs(values[n-1]-values[0])===Math.max(...values)-Math.min(...values))continue;
    }
    const prompt=rng.pick([
     `Find the ${kind} of ${show(values)}.`,
     `Find the ${kind} of ${show(values)}.`,
     `${name} writes down the points scored in each round of a game: ${show(values)}. Find the ${kind}.`,
     `The scores of the players in a card game are ${show(values)}. Find the ${kind} of the scores.`]);
    return {prompt,...listStat(kind,values)};
   }
  }},
  {name:'Even lists and negatives',make(rng){
   const kind=rng.pick(['median','median','mode','negative','decimal']);
   for(;;){
    const name=rng.pick(NAMES);
    if(kind==='median'){
     const n=rng.pick([6,6,8]),values=Array.from({length:n},()=>rng.int(1,30)),s=asc(values);
     if(new Set(values).size<n-1||s[n/2-1]===s[n/2]||values[n/2-1]+values[n/2]===s[n/2-1]+s[n/2])continue;
     const prompt=rng.pick([
      `Find the median of ${show(values)}.`,
      `Find the median of these ${WORDS[n]} numbers: ${show(values)}.`,
      `${name} records the minutes spent reading on ${WORDS[n]} evenings: ${show(values)}. Find the median.`,
      `The numbers of students in ${WORDS[n]} classes are ${show(values)}. Find the median.`]);
     return {prompt,...listStat('median',values)};
    }
    if(kind==='mode'){
     const n=rng.int(8,9),[mode,second,...others]=rng.distinct(n-3,1,15),values=rng.shuffle([mode,mode,mode,second,second,...others]);
     if(mode===3||mode===Math.max(...values))continue;
     const prompt=rng.pick([
      `Find the mode of ${show(values)}.`,
      `${name} asks ${WORDS[n]} friends how many apps they used today: ${show(values)}. Find the mode.`,
      `The numbers of goals scored in ${WORDS[n]} matches are ${show(values)}. Find the mode.`]);
     return {prompt,...listStat('mode',values)};
    }
    if(kind==='negative'){
     const n=rng.int(5,7),values=rng.distinct(n,-9,12),lo=Math.min(...values),hi=Math.max(...values);
     if(lo>=-1||hi<=0||Math.abs(values[n-1]-values[0])===hi-lo)continue;
     const prompt=rng.pick([
      `Find the range of ${show(values)}.`,
      `The temperature at midnight, in °C, on ${WORDS[n]} nights was ${show(values)}. Find the range of the temperatures.`]);
     return {prompt,...listStat('range',values)};
    }
    const n=rng.int(5,6),values=rng.distinct(n,105,198);
    if(values.filter(v=>v%10).length<n-1||Math.abs(values[n-1]-values[0])===Math.max(...values)-Math.min(...values))continue;
    const prompt=rng.pick([
     `Find the range of ${show(values.map(v=>v/10))}.`,
     `${name} times ${WORDS[n]} sprints, in seconds: ${show(values.map(v=>v/10))}. Find the range of the times.`]);
    return {prompt,...listStat('range',values,{scale:10})};
   }
  }},
  {name:'Tables and repeats',make(rng){
   const kind=rng.pick(['median','median','mode','range','list']);
   for(;;){
    if(kind==='list'){
     const start=rng.int(3,7),times=rng.shuffle(rng.pick([[1,2,2,4],[1,1,3,4],[2,2,2,3],[1,2,3,3,0]].slice(0,3))),values=rng.shuffle(times.flatMap((t,i)=>Array(t).fill(start+i)));
     const which=rng.pick(['median','mode','range']),n=values.length,s=asc(values),mode=modesOf(values)[0];
     if(which==='median'&&values[(n-1)/2]===s[(n-1)/2])continue;
     if(which==='mode'&&(mode===counts(values).get(mode)||mode===s[n-1]))continue;
     if(which==='range'&&Math.abs(values[n-1]-values[0])===s[n-1]-s[0])continue;
     const prompt=rng.pick([
      `The shoe sizes of nine students are ${show(values)}. Find the ${which} of the shoe sizes.`,
      `Nine players score these numbers of goals in a season: ${show(values)}. Find the ${which}.`]);
     return {prompt,...listStat(which,values)};
    }
    const ctx=rng.pick(kind==='range'?TABLES.filter(t=>t.starts[0]>0):TABLES),rows=rng.int(4,5),start=rng.pick(ctx.starts),xs=Array.from({length:rows},(_,i)=>start+i),fs=xs.map(()=>rng.int(1,9));
    const top=Math.max(...fs),parts=tableStat(kind,xs,fs,ctx);
    if(kind==='median'&&parts.answer.value===half(median(xs)))continue;
    if(kind==='mode'&&(fs.filter(f=>f===top).length>1||xs[fs.indexOf(top)]===top||fs.indexOf(top)===rows-1))continue;
    if(kind==='range'&&(top-Math.min(...fs)===xs[rows-1]-xs[0]||sum(fs)===xs[rows-1]-xs[0]))continue;
    return {prompt:`${ctx.intro} ${kind==='median'?`Find the median ${ctx.noun}.`:kind==='mode'?'Find the mode.':'Find the range.'}`,table:tableOf(ctx,xs,fs),...parts};
   }
  }}
 ]
});

/* ---------- The mean from a frequency table ---------- */
function tableMean(xs,fs,ctx,zeroTrap){
 const N=sum(fs),T=sum(xs.map((x,i)=>x*fs[i])),rows=xs.length,mean=T/N;
 return {
  answer:{type:'number',label:'Mean =',value:String(mean),...(ctx.unit?{unit:ctx.unit}:{})},
  mistakes:[
   ...(zeroTrap?[{value:qStr(Q(T,N-fs[0])),why:`The ${fs[0]} ${ctx.group} with 0 still count. Divide by all ${N} ${ctx.group}.`}]:[]),
   {value:qStr(Q(T,rows)),why:`Divide by the total of the frequencies, ${N}, not by the number of rows, ${rows}.`},
   {value:qStr(Q(sum(xs),rows)),why:'That is the mean of the first column only. Each value counts as many times as its frequency, so multiply first.'},
   {value:String(T),why:`That is the ${ctx.totalNoun}. Now divide by the total of the frequencies, ${N}.`},
   {value:qStr(Q(N,rows)),why:'That is the mean of the frequencies. Multiply each value by its frequency, add, then divide by the total of the frequencies.'}],
  hint:'Multiply each value by its frequency and add the results. Then divide by the total of the frequencies.',
  steps:[
   {math:`${xs.map((x,i)=>`(${x} * ${fs[i]})`).join(' + ')} = ${T}`,note:`Multiply each value by its frequency, then add. This is the ${ctx.totalNoun}.`},
   {math:`${fs.join(' + ')} = ${N}`,note:`Add the frequencies. There are ${N} ${ctx.group}.`},
   {math:`frac(${T}, ${N}) = ${mean}`,note:`Mean = total divided by the number of ${ctx.group}.`}],
  verify:{op:'stat',fn:'mean',data:xs,freq:fs,equals:'ANSWER'}
 };
}
const WIDE_TABLES=[
 {head:['Age (years)','Number of members'],intro:'The table shows the ages of the members of a youth club.',mean:'Find the mean age.',group:'members',totalNoun:'total of all the ages',unit:'years',xs:rng=>{const a=rng.int(11,13);return Array.from({length:rng.int(4,5)},(_,i)=>a+i)}},
 {head:['Pocket money (€)','Number of students'],intro:'The table shows the weekly pocket money, in euro, of some students.',mean:'Find the mean pocket money in euro.',group:'students',totalNoun:'total pocket money',xs:rng=>{const k=rng.pick([2,5,10]);return Array.from({length:4},(_,i)=>k*(i+1))}},
 {head:['Price (€)','Number sold'],intro:'The table shows the prices, in euro, of the tickets sold for a school show.',mean:'Find the mean price of a ticket in euro.',group:'tickets',totalNoun:'total paid',xs:rng=>{const a=rng.int(3,6),k=rng.pick([2,3,5]);return Array.from({length:rng.int(3,4)},(_,i)=>a+k*i)}}
];
const GROUPED=[
 {head:['Time (minutes)','Number of students'],intro:'The table shows how long some students took to travel to school.',what:'time',unit:'minutes',starts:[0],widths:[10,20,5]},
 {head:['Height (cm)','Number of students'],intro:'The table shows the heights of the students in a class.',what:'height',unit:'cm',starts:[130,140],widths:[10]},
 {head:['Mark','Number of students'],intro:'The table shows the marks of a year group in a test.',what:'mark',unit:'',starts:[0,20],widths:[20,10]},
 {head:['Distance (km)','Number of runners'],intro:'The table shows how far the members of a running club ran in one week.',what:'distance',unit:'km',starts:[0],widths:[4,10]},
 {head:['Amount (€)','Number of customers'],intro:'The table shows how much, in euro, the customers in a shop spent one morning.',what:'amount spent',unit:'',starts:[0],widths:[10,20]}
];

K.define({
 id:'frequency-table-mean',
 title:'Mean from a frequency table',
 strand:'Statistics',
 lesson:'07-04',
 blurb:'Multiply each value by its frequency, add, then divide by the total frequency.',
 levels:[
  {name:'Small tables',make(rng){
   const kind=rng.pick(['mean','mean','mean','count','total']);
   for(;;){
    const ctx=rng.pick(TABLES),rows=kind==='mean'?4:rng.int(3,4),start=rng.pick(ctx.starts),xs=Array.from({length:rows},(_,i)=>start+i),fs=xs.map(()=>rng.int(1,6));
    const N=sum(fs),T=sum(xs.map((x,i)=>x*fs[i]));
    if(N<6||T%N||T===N||new Set(fs).size<2)continue;
    /* Averaging the first column alone must not give the right answer by accident. */
    if(kind==='mean'&&T*rows===sum(xs)*N)continue;
    const table=tableOf(ctx,xs,fs),products=xs.map((x,i)=>`(${x} * ${fs[i]})`).join(' + ');
    if(kind==='mean')return {prompt:`${ctx.intro} ${ctx.mean}`,table,...tableMean(xs,fs,ctx,false)};
    if(kind==='count')return {
     prompt:`${ctx.intro} ${ctx.count}`,table,
     answer:{type:'number',label:'Answer =',value:String(N)},
     mistakes:[
      {value:String(rows),why:`That is the number of rows. Each row stands for several ${ctx.group}, so add the frequencies.`},
      {value:String(sum(xs)),why:`You added the first column. The number of ${ctx.group} is in the second column.`},
      {value:String(T),why:`That is the ${ctx.totalNoun}. The number of ${ctx.group} is the total of the second column.`}],
     hint:`The second column counts the ${ctx.group}. Add it up.`,
     steps:[
      {math:`${fs.join(' + ')} = ${N}`,note:`Add the frequencies. Each frequency says how many ${ctx.group} are in that row.`},
      {note:`This total, ${N}, is the number you divide by when you find the mean.`}],
     verify:{op:'value',expr:fs.join(' + '),equals:'ANSWER'}
    };
    return {
     prompt:`${ctx.intro} ${ctx.total}`,table,
     answer:{type:'number',label:'Answer =',value:String(T)},
     mistakes:[
      {value:String(N),why:`That is the number of ${ctx.group}. For the ${ctx.totalNoun}, multiply each value by its frequency, then add.`},
      {value:String(sum(xs)),why:'You added the first column. Each value appears as many times as its frequency, so multiply first.'},
      {value:String(sum(xs)*N),why:'Multiply each value by its own frequency, row by row. Then add the results.'}],
     hint:'Work row by row: value times frequency. Then add the results.',
     steps:[
      {math:xs.map((x,i)=>`${x} * ${fs[i]} = ${x*fs[i]}`).join(', '),note:'Multiply each value by its frequency, row by row.'},
      {math:`${xs.map((x,i)=>x*fs[i]).join(' + ')} = ${T}`,note:`Add the results. This is the ${ctx.totalNoun}.`}],
     verify:{op:'value',expr:xs.map((x,i)=>`${x}*${fs[i]}`).join(' + '),equals:'ANSWER'}
    };
   }
  }},
  {name:'Larger tables',make(rng){
   const kind=rng.pick(['zero','zero','wide','wide','wide']);
   for(;;){
    let ctx,xs;
    if(kind==='zero'){ctx=rng.pick(TABLES.filter(t=>t.starts[0]===0));xs=Array.from({length:rng.int(4,5)},(_,i)=>i)}
    else{ctx=rng.pick(WIDE_TABLES);xs=ctx.xs(rng)}
    const fs=xs.map(()=>rng.int(1,9)),N=sum(fs),T=sum(xs.map((x,i)=>x*fs[i]));
    if(N<10||(10*T)%N||new Set(fs).size<3||T*xs.length===sum(xs)*N)continue;
    if(kind==='zero'&&fs[0]<2)continue;
    return {prompt:`${ctx.intro} ${ctx.mean}`,table:tableOf(ctx,xs,fs),...tableMean(xs,fs,ctx,kind==='zero')};
   }
  }},
  {name:'Exam style',make(rng){
   const missing=rng.chance(.25);
   for(;;){
    if(missing){
     /* A frequency is unknown and the mean is given. */
     const ctx=rng.pick(TABLES),start=rng.pick(ctx.starts),xs=Array.from({length:4},(_,i)=>start+i),fs=xs.map(()=>rng.int(1,8)),h=rng.int(0,3),v=xs[h],x=fs[h];
     const N=sum(fs),T=sum(xs.map((xv,i)=>xv*fs[i])),m=T/N,S=T-v*x,M=N-x,coef=Math.abs(v-m),rhs=(m*M-S)*Math.sign(v-m);
     if(T%N||m<2||v===0||v===m||new Set(fs).size<3)continue;
     const total=K.terms([[v,'x'],[S,'']]),count=K.terms([[1,'x'],[M,'']]);
     return {
      prompt:`${ctx.intro} One frequency is missing and is shown as \`x\`. The mean ${ctx.noun} is ${m}. Find the value of \`x\`.`,
      table:{head:ctx.head,rows:xs.map((xv,i)=>[String(xv),i===h?'x':String(fs[i])])},
      answer:{type:'number',label:'x =',value:String(x)},
      mistakes:[
       ...(Q(m*M-S,v).n>0?[{value:qStr(Q(m*M-S,v)),why:`The \`x\` ${ctx.group} also count in the total of the frequencies. Divide by \`${count}\`, not by ${M}.`}]:[]),
       ...(Q(m*4-S,v).n>0?[{value:qStr(Q(m*4-S,v)),why:'Divide by the total of the frequencies, which includes `x`, not by the number of rows.'}]:[]),
       {value:String(m),why:'That is the mean. Use it to build an equation: total divided by the number of values equals the mean.'}],
      hint:'Write the total and the number of values using `x`. Then use mean = total divided by the number of values.',
      steps:[
       {math:total,note:`Multiply each value by its frequency and add. This is the ${ctx.totalNoun}, written with x.`},
       {math:`frac(${total}, ${count}) = ${m}`,note:`The frequencies add up to \`${count}\`. Mean = total divided by the number of values, so set this equal to ${m}.`},
       {math:`${total} = ${m}(${count})`,note:`Multiply both sides by \`${count}\`.`},
       {math:`${total} = ${K.terms([[m,'x'],[m*M,'']])}`,note:'Multiply out the bracket.'},
       {math:`${K.terms([[coef,'x']])} = ${rhs}`,note:'Collect the x terms on one side and the numbers on the other.'},
       ...(coef===1?[]:[{math:`x = ${x}`,note:`Divide both sides by ${coef}.`}]),
       {math:`frac(${T}, ${N}) = ${m}`,note:`Check: with x = ${x} the total is ${T} and there are ${N} ${ctx.group}, so the mean is ${m}.`}],
      verify:{op:'solve',eq:`(${xs.map((xv,i)=>i===h?`${xv}*x`:`${xv}*${fs[i]}`).join(' + ')})/(${fs.map((f,i)=>i===h?'x':f).join(' + ')}) = ${m}`,variable:'x',solutions:['ANSWER']}
     };
    }
    const ctx=rng.pick(GROUPED),w=rng.pick(ctx.widths),start=rng.pick(ctx.starts),rows=rng.int(4,5);
    const los=Array.from({length:rows},(_,i)=>start+w*i),mids=los.map(lo=>lo+w/2),fs=los.map(()=>rng.int(2,12));
    const N=sum(fs),T=sum(mids.map((m,i)=>m*fs[i])),mean=T/N,exact=Math.abs(mean*10-Math.round(mean*10))<1e-9,dp=v=>Number(K.decimal(v,1)).toFixed(1),answer=dp(mean);
    const shown=Math.abs(mean*1e4-Math.round(mean*1e4))<1e-7?String(Number(mean.toFixed(4))):mean.toFixed(4)+'...';
    if(new Set(fs).size<3||dp(T/rows)===answer||dp(sum(mids)/rows)===answer)continue;
    return {
     prompt:`${ctx.intro} The interval ${los[0]}-${los[0]+w} means at least ${los[0]} but less than ${los[0]+w}. Use mid-interval values to estimate the mean ${ctx.what}, correct to one decimal place.`,
     table:{head:ctx.head,rows:los.map((lo,i)=>[`${lo}-${lo+w}`,String(fs[i])])},
     answer:{type:'number',label:'Mean =',value:answer,round:1,...(ctx.unit?{unit:ctx.unit}:{})},
     mistakes:[
      {value:dp(mean-w/2),why:`You used the start of each interval. Use the mid-interval value, halfway between the two ends: the first one is ${mids[0]}.`},
      {value:dp(mean+w/2),why:`You used the end of each interval. Use the mid-interval value, halfway between the two ends: the first one is ${mids[0]}.`},
      {value:dp(T/rows),why:`Divide by the total of the frequencies, ${N}, not by the number of rows, ${rows}.`},
      {value:dp(sum(mids)/rows),why:'That is the mean of the mid-interval values only. Each one counts as many times as its frequency, so multiply first.'}],
     hint:`Find the middle of each interval first. The first mid-interval value is \`frac(${los[0]} + ${los[0]+w}, 2) = ${mids[0]}\`.`,
     steps:[
      {math:mids.join(', '),note:'Find the mid-interval value of each group: add the two ends and divide by 2.'},
      {math:`${mids.map((m,i)=>`(${m} * ${fs[i]})`).join(' + ')} = ${T}`,note:'Multiply each mid-interval value by its frequency, then add.'},
      {math:`${fs.join(' + ')} = ${N}`,note:'Add the frequencies.'},
      {math:exact?`frac(${T}, ${N}) = ${answer}`:`frac(${T}, ${N}) ≈ ${answer}`,note:exact?'Divide the total by the total of the frequencies.':`Divide. The calculator shows ${shown}, which is ${answer} correct to one decimal place.`}],
     verify:{op:'value',expr:`(${los.map((lo,i)=>`((${lo} + ${lo+w})/2)*${fs[i]}`).join(' + ')})/(${fs.join(' + ')})`,equals:'ANSWER',round:1}
    };
   }
  }}
 ]
});
/* ---------- Choosing and comparing averages ---------- */
const cap=s=>s[0].toUpperCase()+s.slice(1);
const OUTLIERS=[
 {text:(w,list)=>`${cap(w)} houses on a road sold for these prices, in thousands of euro: ${list}.`,typical:'house price',lo:150,hi:260,step:5,out:[560,950],high:true},
 {text:(w,list)=>`The weekly wages, in euro, of the ${w} people who work in a small shop are ${list}.`,typical:'wage',lo:400,hi:520,step:10,out:[1500,2600],high:true},
 {text:(w,list)=>`The ages, in years, of the ${w} people at a birthday party are ${list}.`,typical:'age',lo:11,hi:17,step:1,out:[42,78],high:true},
 {text:(w,list)=>`The marks of ${w} students in a test are ${list}.`,typical:'mark',lo:62,hi:88,step:1,out:[4,22],high:false}
];
function outlierSet(rng){
 for(;;){
  const ctx=rng.pick(OUTLIERS),n=rng.pick([5,5,7]),normal=[];
  while(normal.length<n-1){const v=ctx.lo+ctx.step*rng.int(0,Math.floor((ctx.hi-ctx.lo)/ctx.step));if(!normal.includes(v))normal.push(v)}
  let out=rng.int(ctx.out[0],ctx.out[1]);out+=(n-(sum(normal)+out)%n)%n;
  const values=rng.shuffle([...normal,out]),total=sum(values),mean=total/n,med=asc(values)[(n-1)/2],range=Math.max(...values)-Math.min(...values);
  if(ctx.high?mean<=Math.max(...normal):mean>=Math.min(...normal))continue;
  if(new Set([med,mean,range]).size<3)continue;
  return {ctx,n,values,out,total,mean,med,range};
 }
}
const CATEGORIES=[
 {thing:'favourite colour',plural:'colours',label:'Colour',items:['Red','Blue','Green','Yellow','Purple']},
 {thing:'favourite sport',plural:'sports',label:'Sport',items:['Football','Hurling','Rugby','Basketball','Swimming']},
 {thing:'favourite pet',plural:'pets',label:'Pet',items:['Dog','Cat','Fish','Rabbit','Hamster']},
 {thing:'favourite fruit',plural:'fruits',label:'Fruit',items:['Apple','Banana','Orange','Grapes','Pear']},
 {thing:'favourite subject',plural:'subjects',label:'Subject',items:['Maths','Science','Art','History','Music']}
];
const ABOUT={
 mean:'The mean is the total divided by the number of values. It uses every value, so one extreme value can move it a lot.',
 median:'The median is the middle value when the values are in order. An extreme value does not move it.',
 mode:'The mode is the value that appears most often. It only needs counting, so it works for words as well as numbers.'};
const DEFINE=[
 {q:'Which average do you find by adding all the values and dividing by how many there are?',a:'mean'},
 {q:'Which average is the middle value when the values are in order?',a:'median'},
 {q:'Which average is the value that appears most often?',a:'mode'},
 {q:'Which average uses every value in the list in its calculation?',a:'mean'},
 {q:'Which average is changed the most by one very large value?',a:'mean'},
 {q:'Which average can be found for data that is words, not numbers?',a:'mode'}
];
const averageOptions=(right,why={})=>['mean','median','mode'].map(a=>a===right?{text:'The '+a,correct:true}:{text:'The '+a,why:why[a]||ABOUT[a]});
/* A list of n whole numbers with a given mean and range. */
function setWith(rng,n,mean,range){
 for(let i=0;i<400;i++){
  const lo=mean-rng.int(1,range-1),hi=lo+range,inner=Array.from({length:n-2},()=>rng.int(lo,hi));
  if(lo>=0&&lo+hi+sum(inner)===n*mean&&new Set(inner).size>=n-3)return rng.shuffle([lo,hi,...inner]);
 }
 return null;
}

K.define({
 id:'choose-the-average',
 title:'Choose and compare averages',
 strand:'Statistics',
 lesson:'07-03',
 blurb:'Pick the average that fits the data, and use the range to compare spread.',
 levels:[
  {name:'Which average fits',make(rng){
   const variant=rng.pick(['outlier','outlier','outlier','category','tally','define']);
   if(variant==='outlier'){
    const {ctx,n,values,out,total,mean,med,range}=outlierSet(rng),dir=ctx.high?'up':'down';
    return {
     prompt:`${ctx.text(WORDS[n],show(values))} Which measure describes a typical ${ctx.typical} best?`,
     answer:{type:'choice',options:[
      {text:`The median, ${med}`,value:String(med),correct:true},
      {text:`The mean, ${mean}`,value:String(mean),why:`The mean is ${ctx.high?'higher':'lower'} than every value except ${out}. One extreme value pulls the mean ${dir}, so it is not typical here.`},
      {text:`The range, ${range}`,value:String(range),why:'The range measures how spread out the values are. It is not an average, so it cannot describe a typical value.'},
      {text:'The mode',why:'No value appears more than once, so this list has no mode.'}]},
     hint:'Look for a value that is far away from the others. Which average does it not affect?',
     steps:[
      {math:asc(values).join(', '),note:`Put the values in order. One value, ${out}, is far away from the rest. It is an outlier.`},
      {math:`frac(${total}, ${n}) = ${mean}`,note:`The mean uses every value, so the outlier pulls it ${dir}. It is ${ctx.high?'higher':'lower'} than every other value.`},
      {math:`median = ${med}`,note:'The median is the middle value. The outlier does not move it, so it describes a typical value best.'}],
     verify:{op:'stat',fn:'median',data:values,equals:'ANSWER'}
    };
   }
   if(variant==='category'){
    const c=rng.pick(CATEGORIES),N=rng.int(20,60),name=rng.pick(NAMES);
    return {
     prompt:rng.pick([
      `A survey records the ${c.thing} of each of the ${N} students in a year group. Which average can be found for this data?`,
      `${name} asks ${N} students to name their ${c.thing}. Which average makes sense for the answers?`]),
     answer:{type:'choice',options:averageOptions('mode',{
      mean:`You cannot add ${c.plural} together or divide them, so there is no mean. The data is words, not numbers.`,
      median:`The median needs the data in order from smallest to largest. ${cap(c.plural)} have no such order.`})},
     hint:'The answers are words, not numbers. Which average only needs counting?',
     steps:[
      {note:`${cap(c.plural)} are categories, not numbers. This is called categorical data.`},
      {note:'The mean needs adding and the median needs ordering, so neither works. The mode is the most common answer, which only needs counting.'}],
     verify:{op:'none',reason:'The answer is a property of categorical data, not a computed value.'}
    };
   }
   if(variant==='tally'){
    const c=rng.pick(CATEGORIES),items=rng.shuffle(c.items).slice(0,4),fs=rng.distinct(4,2,12),top=Math.max(...fs),low=Math.min(...fs),mode=items[fs.indexOf(top)],least=items[fs.indexOf(low)];
    return {
     prompt:`The table shows the ${c.thing} of the students in a class. What is the mode?`,
     table:{head:[c.label,'Number of students'],rows:items.map((item,i)=>[item,String(fs[i])])},
     answer:{type:'choice',options:[
      {text:mode,correct:true},
      {text:String(top),why:`${top} is the highest frequency. The mode is the answer that has that frequency, ${mode}.`},
      {text:least,why:`${least} has the lowest frequency, ${low}. The mode is the most common answer, the one with the highest frequency.`},
      {text:'There is no mode, because the data is not numbers',why:'Categories can have a mode. The mode is the most common answer, and finding it only needs counting.'}]},
     hint:'The mode is the most common answer. Look for the highest frequency, then read across.',
     steps:[
      {math:`highest frequency = ${top}`,note:'Look down the frequency column for the largest number.'},
      {note:`Read across: ${top} students chose ${mode}. The mode is ${mode}, the answer itself, not the number ${top}.`}],
     verify:{op:'none',reason:'The mode here is a category name, not a number.'}
    };
   }
   const d=rng.pick(DEFINE);
   return {
    prompt:d.q,
    answer:{type:'choice',options:averageOptions(d.a)},
    hint:'Think about how each average is found: one adds, one puts in order, one counts.',
    steps:[{note:ABOUT.mean},{note:ABOUT.median},{note:ABOUT.mode},{note:`So the answer is the ${d.a}.`}],
    verify:{op:'none',reason:'The answer is the definition of an average, not a computed value.'}
   };
  }},
  {name:'Compare two sets',make(rng){
   const variant=rng.pick(['ranges','consistent','consistent','means']);
   for(;;){
    const [first,second]=rng.shuffle(NAMES),n=5;
    const mS=rng.int(10,20),mW=mS+rng.int(1,4),steady=setWith(rng,n,mS,rng.int(2,5)),wild=setWith(rng,n,mW,rng.int(8,14));
    if(!steady||!wild)continue;
    const steadyFirst=rng.chance(.5),A=steadyFirst?steady:wild,B=steadyFirst?wild:steady,steadyName=steadyFirst?first:second,wildName=steadyFirst?second:first;
    const what=rng.pick([{row:'Player',noun:'points scored in five games',col:'Points'},{row:'Student',noun:'marks in five quizzes',col:'Marks'},{row:'Player',noun:'scores in five rounds of darts',col:'Scores'}]);
    const hi=x=>Math.max(...x),lo=x=>Math.min(...x),r=x=>hi(x)-lo(x),rS=r(steady),rW=r(wild);
    const intro=`The table shows the ${what.noun} for ${first} and ${second}.`,table={head:[what.row,what.col],rows:[[first,A.join(', ')],[second,B.join(', ')]]};
    const rangeSteps=[
     {math:`${hi(A)} - ${lo(A)} = ${r(A)}`,note:`${first}: range = largest value minus smallest value.`},
     {math:`${hi(B)} - ${lo(B)} = ${r(B)}`,note:`${second}: range = largest value minus smallest value.`},
     {note:`${steadyName} has the smaller range, so ${steadyName} is the more consistent of the two.`}];
    if(variant==='ranges')return {
     prompt:`${intro} Find the range for each ${what.row.toLowerCase()}.`,table,
     answer:{type:'fields',fields:[{label:`${first}:`,value:String(r(A))},{label:`${second}:`,value:String(r(B))}]},
     mistakes:[
      {value:[String(hi(A)),String(hi(B))],why:'Those are the largest values. The range is the largest value minus the smallest value.'},
      {value:[String(r(B)),String(r(A))],why:`The ranges are right but in the wrong boxes. The first box is for ${first}.`},
      {value:[String(sum(A)/n),String(sum(B)/n)],why:'Those are the means. The range is the largest value minus the smallest value.'}],
     hint:'For each row, find the largest and the smallest value and subtract.',
     steps:rangeSteps,
     verify:[{op:'stat',fn:'range',data:A,equals:'ANSWER0'},{op:'stat',fn:'range',data:B,equals:'ANSWER1'}]
    };
    if(variant==='consistent')return {
     prompt:`${intro} Who is more consistent?`,table,
     answer:{type:'choice',options:[
      {text:`${steadyName}, because the range of ${rS} is smaller`,value:String(rS),correct:true},
      {text:`${wildName}, because the range of ${rW} is bigger`,value:String(rW),why:'A bigger range means the values are more spread out. Consistent means close together, so look for the smaller range.'},
      {text:`${wildName}, because the mean of ${mW} is higher`,why:'A higher mean shows a higher typical value. It says nothing about how steady the values are. Compare the ranges.'},
      {text:`${steadyName}, because the mean of ${mS} is lower`,why:`Right person, wrong reason. The mean does not measure consistency. ${steadyName} is more consistent because the range is smaller.`}]},
     hint:'Consistent means the values are close together. Which statistic measures spread?',
     steps:rangeSteps,
     verify:[{op:'stat',fn:'range',data:steady,equals:'ANSWER'},{op:'value',expr:`Min(Max(${A.join(', ')}) - Min(${A.join(', ')}), Max(${B.join(', ')}) - Min(${B.join(', ')}))`,equals:'ANSWER'}]
    };
    return {
     prompt:`${intro} How much higher is the mean for ${wildName} than the mean for ${steadyName}?`,table,
     answer:{type:'number',label:'Difference =',value:String(mW-mS)},
     mistakes:[
      {value:String(sum(wild)-sum(steady)),why:`That is the difference between the totals. Divide each total by ${n} to get the means first.`},
      {value:String(rW-rS),why:'That is the difference between the ranges. The question asks about the means.'},
      {value:String(mW),why:`That is the higher mean. Subtract the other mean, ${mS}, to find the difference.`}],
     hint:`Find each mean first: add the five values and divide by ${n}. Then subtract.`,
     steps:[
      {math:`frac(${plus(wild)}, ${n}) = frac(${sum(wild)}, ${n}) = ${mW}`,note:`${wildName}: add the five values and divide by ${n}.`},
      {math:`frac(${plus(steady)}, ${n}) = frac(${sum(steady)}, ${n}) = ${mS}`,note:`${steadyName}: add the five values and divide by ${n}.`},
      {math:`${mW} - ${mS} = ${mW-mS}`,note:'Subtract the means.'}],
     verify:{op:'value',expr:`(${claimSum(wild)})/${n} - (${claimSum(steady)})/${n}`,equals:'ANSWER'}
    };
   }
  }},
  {name:'Exam style',make(rng){
   const variant=rng.pick(['left-out','left-out','purpose','classes']);
   for(;;){
    const name=rng.pick(NAMES);
    if(variant==='left-out'){
     const d=rng.int(3,8),m5=rng.int(60,80),five=setWith(rng,5,m5,rng.int(6,14)),out=m5-6*d,m6=m5-d;
     if(!five||out<5)continue;
     const values=rng.shuffle([...five,out]),total6=sum(values),total5=sum(five);
     return {
      prompt:`${name} gets these marks in six tests: ${show(values)}. The mark of ${out} was in a test taken while ill. By how much does the mean rise if that mark is left out?`,
      answer:{type:'number',label:'Rise =',value:String(d)},
      mistakes:[
       {value:String(m6),why:'That is the mean of all six marks. Find the mean of the other five as well, then subtract.'},
       {value:String(m5),why:`That is the mean without the ${out}. The question asks for the rise, so subtract the old mean, ${m6}.`},
       {value:String(m5-out),why:`That compares the new mean with the mark of ${out}. Compare the two means instead: \`${m5} - ${m6}\`.`}],
      hint:'Find two means: one for all six marks, one for the five marks that are left. Then subtract.',
      steps:[
       {math:`frac(${total6}, 6) = ${m6}`,note:'Add all six marks and divide by 6. This is the mean with the low mark.'},
       {math:`frac(${total5}, 5) = ${m5}`,note:`Leave out ${out}. Five marks are left, so divide their total by 5.`},
       {math:`${m5} - ${m6} = ${d}`,note:`The mean rises by ${d}. One outlier can move the mean a lot, which is why the median is often the better choice.`}],
      verify:{op:'value',expr:`(${claimSum(five)})/5 - (${claimSum(values)})/6`,equals:'ANSWER'}
     };
    }
    if(variant==='purpose'){
     const workers=rng.int(6,10),wage=rng.pick([500,550,600,650]),boss=rng.pick([4000,5000,6000]),item=rng.pick(['shoe','hat','football boot','glove']);
     const p=rng.pick([
      {q:`A shop owner wants to know which ${item} size to order the most of. Which average of the sizes sold is the most useful?`,a:'mode',because:`The owner needs the size that sells most often. That is the mode.`,
       why:{mean:'The mean could be a size such as 6.3, which does not exist. The owner needs the size that sells most often.',median:'The median gives the middle size, not the size that sells most often.'}},
      {q:`${cap(WORDS[workers])} workers in a company each earn a different amount close to €${wage} a week. The owner earns €${boss} a week. Which average gives the fairest picture of a typical wage?`,a:'median',because:`The owner's wage is an outlier. It pulls the mean up but does not move the median.`,
       why:{mean:`The owner's wage of €${boss} pulls the mean well above what the workers earn. Choose the average that an outlier does not move.`,mode:'The wages are all different, so no value repeats and there is no mode. The median is the safe choice when there is an outlier.'}},
      {q:`A teacher wants one number for a class test that takes every student's mark into account. The marks have no outliers. Which average should the teacher use?`,a:'mean',because:'Only the mean uses every value in its calculation.',
       why:{median:'The median looks only at the middle of the ordered list. It does not use every mark.',mode:'The mode looks only at the most common mark. It does not use every mark.'}},
      {q:`A café records the type of drink each customer orders. Which average can the café find?`,a:'mode',because:'Types of drink are categories. Only the mode works for categories.',
       why:{mean:'Types of drink are words. They cannot be added, so there is no mean.',median:'Types of drink have no order from smallest to largest, so there is no middle value.'}},
      {q:`The prices of ${rng.int(8,15)} houses on a road are listed. One is a mansion that cost far more than the rest. Which average describes a typical price best?`,a:'median',because:'The mansion is an outlier. It pulls the mean up but does not move the median.',
       why:{mean:'The price of the mansion pulls the mean up, above what most of the houses cost. Choose the average that an outlier does not move.',mode:'House prices rarely repeat, so there may be no mode. The median is the safe choice when there is an outlier.'}}]);
     return {
      prompt:p.q,
      answer:{type:'choice',options:averageOptions(p.a,p.why)},
      hint:'Ask two things. Is the data numbers or words? Is there a value far away from the rest?',
      steps:[{note:p.because},{note:ABOUT[p.a]}],
      verify:{op:'none',reason:'The answer is a judgement about which average fits a situation.'}
     };
    }
    /* Two classes: the mean says who did better, the range says who was more consistent. */
    const [x,y]=rng.shuffle(['2A','2B','2C','2D']).slice(0,2).sort(),means=rng.distinct(2,52,78),ranges=rng.distinct(2,12,45);
    const best=means[0]>means[1]?x:y,steadier=ranges[0]<ranges[1]?x:y,mHi=Math.max(...means),mLo=Math.min(...means),rLo=Math.min(...ranges),rHi=Math.max(...ranges);
    const say=(b,s)=>b===s?`Class ${b} did better on average and was also more consistent`:`Class ${b} did better on average, but Class ${s} was more consistent`;
    const whyMean=`The mean shows who did better on average: ${mHi} is higher than ${mLo}.`,whyRange=`The smaller range shows the more consistent class: ${rLo} is smaller than ${rHi}.`;
    const options=[];
    for(const b of [x,y])for(const s of [x,y])options.push(b===best&&s===steadier?{text:say(b,s),correct:true}:{text:say(b,s),why:[b!==best?whyMean:'',s!==steadier?whyRange:''].filter(Boolean).join(' ')});
    return {
     prompt:'The table shows the mean and the range of the marks of two classes in the same test. Which statement is true?',
     table:{head:['Class','Mean','Range'],rows:[[x,String(means[0]),String(ranges[0])],[y,String(means[1]),String(ranges[1])]]},
     answer:{type:'choice',options},
     hint:'Use the mean to compare how well the classes did. Use the range to compare how spread out the marks are.',
     steps:[
      {math:`${mHi} > ${mLo}`,note:`Class ${best} has the higher mean, so it did better on average.`},
      {math:`${rLo} < ${rHi}`,note:`Class ${steadier} has the smaller range. Its marks are closer together, so it was more consistent.`}],
     verify:{op:'none',reason:'The answer is a statement that compares two given means and two given ranges.'}
    };
   }
  }}
 ]
});

/* ---------- Pie charts ---------- */
const PIE_THEMES=[
 {what:'favourite sport',col:'Sport',items:['Football','Hurling','Rugby','Basketball','Swimming','Tennis']},
 {what:'favourite subject',col:'Subject',items:['Maths','Science','Art','History','Music','PE']},
 {what:'favourite fruit',col:'Fruit',items:['Apple','Banana','Orange','Grapes','Pear','Mango']},
 {what:'favourite pet',col:'Pet',items:['Dog','Cat','Fish','Rabbit','Hamster','Bird']}
];
const PIE_TOTALS=[20,24,30,36,40,45,60,72,90,120,180];
/* Frequencies that add up to a total whose angles are whole numbers. */
function pieData(rng,parts){
 for(;;){
  const N=rng.pick(PIE_TOTALS),per=360/N,counts=[];let left=N;
  for(let i=0;i<parts-1;i++){const c=rng.int(Math.ceil(N/10),Math.floor(N/2.5));counts.push(c);left-=c}
  if(left<N/12||left>N/2||new Set([...counts,left]).size<parts)continue;
  counts.push(left);
  const theme=rng.pick(PIE_THEMES),items=rng.shuffle(theme.items).slice(0,parts);
  return {N,per,counts,angles:counts.map(c=>c*per),theme,items};
 }
}
const SHARES=[{w:'One quarter',n:1,d:4},{w:'One third',n:1,d:3},{w:'One fifth',n:1,d:5},{w:'Two fifths',n:2,d:5},{w:'Three eighths',n:3,d:8},{w:'One sixth',n:1,d:6},{w:'Three tenths',n:3,d:10},{w:'Five twelfths',n:5,d:12},{w:'Two ninths',n:2,d:9}];
const degrees=value=>({type:'number',label:'Angle =',value:String(value),unit:'°'});

K.define({
 id:'pie-charts',
 title:'Pie chart angles',
 strand:'Statistics',
 lesson:'13-02',
 blurb:'A full circle is 360°. Each sector takes the same fraction of 360° as its share of the total.',
 levels:[
  {name:'Angle for a category',make(rng){
   const variant=rng.pick(['count','count','table','percent','fraction']);
   const {N,per,counts,angles,theme,items}=pieData(rng,rng.int(3,4)),j=rng.int(0,counts.length-1),k=counts[j],item=items[j],angle=angles[j];
   if(variant==='percent'){
    const p=rng.pick([5,10,15,20,25,30,35,40,45,60,65,70,75]),a=p*18/5;
    return {
     prompt:`In a survey, ${p}% of the students chose ${item} as their ${theme.what}. Find the angle of the sector for ${item} in a pie chart.`,
     answer:degrees(a),
     mistakes:[
      {value:String(p),why:`${p} is the percentage. The sector is ${p}% of the full circle, 360°.`},
      {value:qStr(Q(p*180,100)),why:'A full circle is 360°, not 180°. Find the percentage of 360.'},
      {value:qStr(Q(360,p)),why:`Do not divide 360 by ${p}. Find ${p}% of 360: \`frac(${p}, 100) * 360\`.`}],
     hint:`The whole pie chart is 100% and 360°. Find ${p}% of 360.`,
     steps:[
      {math:`${p}% = frac(${p}, 100)`,note:'Write the percentage as a fraction of the whole.'},
      {math:`frac(${p}, 100) * 360 = ${a}`,note:'The sector is the same fraction of the full circle, 360°.'}],
     verify:{op:'value',expr:`${p}/100*360`,equals:'ANSWER'}
    };
   }
   if(variant==='fraction'){
    const s=rng.pick(SHARES),a=360*s.n/s.d;
    return {
     prompt:`${s.w} of the students in a survey chose ${item} as their ${theme.what}. Find the angle of the sector for ${item} in a pie chart.`,
     answer:degrees(a),
     mistakes:[
      {value:qStr(Q(100*s.n,s.d)),why:'That is the percentage. A full circle is 360°, so find the fraction of 360, not of 100.'},
      {value:qStr(Q(180*s.n,s.d)),why:'A full circle is 360°, not 180°. Find the fraction of 360.'},
      ...(s.n>1?[{value:String(360/s.d),why:`That is the angle for one part out of ${s.d}. The fraction has ${s.n} parts, so multiply by ${s.n}.`}]:[])],
     hint:`A full circle is 360°. Find \`frac(${s.n}, ${s.d})\` of 360.`,
     steps:[
      {math:`frac(360, ${s.d}) = ${360/s.d}`,note:`Divide the full circle, 360°, into ${s.d} equal parts.`},
      {math:`frac(${s.n}, ${s.d}) * 360 = ${a}`,note:s.n>1?`Take ${s.n} of those parts.`:'One of those parts is the sector.'}],
     verify:{op:'value',expr:`${s.n}/${s.d}*360`,equals:'ANSWER'}
    };
   }
   const percent={value:qStr(Q(k*100,N)),why:'That is the percentage. A full circle is 360°, so multiply the fraction by 360, not by 100.'};
   const count={value:String(k),why:`${k} is the number of students. The angle is that fraction of 360°: \`frac(${k}, ${N}) * 360\`.`};
   if(variant==='table')return {
    prompt:`The table shows the ${theme.what} of some students. Find the angle of the sector for ${item} in a pie chart.`,
    table:{head:[theme.col,'Number of students'],rows:items.map((name,i)=>[name,String(counts[i])])},
    answer:degrees(angle),
    mistakes:[percent,count,
     {value:qStr(Q(360,counts.length)),why:'The sectors are not equal. Each angle depends on the frequency of its category.'},
     {value:qStr(Q(k*360,N-k)),why:`Divide by the total number of students, ${N}, not by the number who chose something else.`}],
    hint:'Add the frequencies to find the total first. Then find what fraction of the total the category is.',
    steps:[
     {math:`${counts.join(' + ')} = ${N}`,note:'Add the frequencies to find the total number of students.'},
     {math:`frac(${k}, ${N}) * 360 = ${angle}`,note:`${item} is this fraction of the students, so its sector is the same fraction of 360°.`},
     {math:`frac(360, ${N}) = ${per}`,note:`Check: each student is ${per}°, and \`${k} * ${per} = ${angle}\`.`}],
    verify:{op:'value',expr:`${k}/(${counts.join(' + ')})*360`,equals:'ANSWER'}
   };
   return {
    prompt:`In a survey of ${N} students, ${k} chose ${item} as their ${theme.what}. Find the angle of the sector for ${item} in a pie chart.`,
    answer:degrees(angle),
    mistakes:[percent,count,
     {value:qStr(Q(360,k)),why:`Divide 360 by the total number of students, ${N}, to get the angle for one student. Then multiply by ${k}.`}],
    hint:`What fraction of the students chose ${item}? The sector is that fraction of 360°.`,
    steps:[
     {math:`frac(360, ${N}) = ${per}`,note:`The full circle, 360°, is shared among ${N} students. Each student gets ${per}°.`},
     {math:`${k} * ${per} = ${angle}`,note:`${k} students chose ${item}, so the sector is ${k} times as big.`},
     {math:`frac(${k}, ${N}) * 360 = ${angle}`,note:'Check with the fraction method: the fraction of the students, times 360°.'}],
    verify:{op:'value',expr:`${k}/${N}*360`,equals:'ANSWER'}
   };
  }},
  {name:'From angle to number',make(rng){
   const variant=rng.pick(['number','number','total','other']);
   for(;;){
    const {N,per,counts,angles,theme,items}=pieData(rng,3),k=counts[0],A=angles[0],item=items[0],share=Q(A,360);
    if(variant==='number'){
     if(A===100)continue;
     return {
      prompt:`A pie chart shows the ${theme.what} of ${N} students. The sector for ${item} has an angle of ${A}°. How many students chose ${item}?`,
      answer:{type:'number',label:'Answer =',value:String(k),unit:'students'},
      mistakes:[
       {value:qStr(Q(A*N,100)),why:`A full circle is 360°, not 100. The fraction of the circle is \`frac(${A}, 360)\`.`},
       {value:qStr(Q(N*360,A)),why:`Multiply ${N} by \`frac(${A}, 360)\`, not by \`frac(360, ${A})\`. The answer cannot be more than ${N}.`},
       {value:String(A),why:`${A} is the angle in degrees. Find that fraction of the ${N} students.`}],
      hint:`What fraction of the full circle is ${A}°? The same fraction of the ${N} students chose ${item}.`,
      steps:[
       {math:`frac(${A}, 360) = ${fmt(share)}`,note:'The sector is this fraction of the full circle.'},
       {math:`${fmt(share)} * ${N} = ${k}`,note:`The same fraction of the ${N} students chose ${item}.`},
       {math:`frac(360, ${N}) = ${per}`,note:`Check: each student is ${per}°, and \`${k} * ${per} = ${A}\`.`}],
      verify:{op:'value',expr:`${A}/360*${N}`,equals:'ANSWER'}
     };
    }
    if(variant==='total'){
     if(k*A===360*N||360/A===N)continue;
     return {
      prompt:`In a pie chart of the ${theme.what} of some students, the sector for ${item} has an angle of ${A}° and stands for ${k} students. How many students were surveyed altogether?`,
      answer:{type:'number',label:'Answer =',value:String(N),unit:'students'},
      mistakes:[
       {value:qStr(Q(k*A,360)),why:`The ${k} students are only part of the survey, so the total must be more than ${k}. Find the angle for one student first.`},
       {value:qStr(Q(360,A)),why:`That is how many sectors of ${A}° fit in the circle. Each one stands for ${k} students, so multiply by ${k}.`},
       {value:String(360-A),why:'That is the angle left over in the circle. The question asks for a number of students.'}],
      hint:`${k} students share ${A}°. How many degrees is one student? How many students make 360°?`,
      steps:[
       {math:`frac(${A}, ${k}) = ${per}`,note:`${k} students share ${A}°, so each student is ${per}°.`},
       {math:`frac(360, ${per}) = ${N}`,note:'The full circle is 360°. Divide by the angle for one student.'},
       {math:`frac(${k}, ${N}) * 360 = ${A}`,note:'Check: this fraction of 360° gives the angle in the question.'}],
      verify:{op:'value',expr:`${k}*360/${A}`,equals:'ANSWER'}
     };
    }
    const B=angles[1],other=items[1],j=counts[1];
    if(k+(B-A)===j||B*per===j)continue;
    return {
     prompt:`In a pie chart of the ${theme.what} of some students, the sector for ${item} has an angle of ${A}° and stands for ${k} students. The sector for ${other} has an angle of ${B}°. How many students chose ${other}?`,
     answer:{type:'number',label:'Answer =',value:String(j),unit:'students'},
     mistakes:[
      ...(k+(B-A)>0?[{value:String(k+(B-A)),why:'Angles and numbers of students are in proportion. Do not add or subtract the angles. Find the angle for one student first.'}]:[]),
      {value:String(B*per),why:`Each student is ${per}°. Divide ${B} by ${per}; do not multiply.`},
      {value:qStr(Q(B,k)),why:`Divide ${A} by ${k} to get the angle for one student. Then divide ${B} by that angle.`}],
     hint:`Use the first sector to find how many degrees stand for one student.`,
     steps:[
      {math:`frac(${A}, ${k}) = ${per}`,note:`${k} students share ${A}°, so each student is ${per}°.`},
      {math:`frac(${B}, ${per}) = ${j}`,note:`Divide the angle for ${other} by the angle for one student.`}],
     verify:{op:'value',expr:`${B}/(${A}/${k})`,equals:'ANSWER'}
    };
   }
  }},
  {name:'Missing angles',make(rng){
   const variant=rng.pick(['missing','missing','number','equal']);
   for(;;){
    const {N,per,counts,angles,theme,items}=pieData(rng,4);
    if(variant==='equal'){
     const rest=counts[2]+counts[3];
     if(rest%2||[counts[0],counts[1]].includes(rest/2)||angles[0]+angles[1]===180)continue;
     const a=angles[0],b=angles[1],each=rest/2*per;
     return {
      prompt:`The table shows the angles in a pie chart of the ${theme.what} of some students. The sectors for ${items[2]} and ${items[3]} are equal. Find the angle of each of these two sectors.`,
      table:{head:[theme.col,'Angle'],rows:[[items[0],a+'°'],[items[1],b+'°'],[items[2],'?'],[items[3],'?']]},
      answer:degrees(each),
      mistakes:[
       {value:String(360-a-b),why:'That is the angle for the two sectors together. They are equal, so divide by 2.'},
       {value:String(a+b),why:'That is the total of the angles you know. Subtract it from 360, then share what is left.'},
       ...(a+b<180?[{value:qStr(Q(180-a-b,2)),why:'The angles in a full circle add up to 360°, not 180°.'}]:[])],
      hint:'All four angles add up to 360°. Find what is left for the two equal sectors together.',
      steps:[
       {math:`${a} + ${b} = ${a+b}`,note:'Add the angles you know.'},
       {math:`360 - ${a+b} = ${360-a-b}`,note:'The angles at the centre of a full circle add up to 360°. This is left for the two equal sectors.'},
       {math:`frac(${360-a-b}, 2) = ${each}`,note:'Share it equally between the two sectors.'}],
      verify:{op:'value',expr:`(360 - (${a} + ${b}))/2`,equals:'ANSWER'}
     };
    }
    const j=rng.int(0,3),known=angles.filter((_,i)=>i!==j),part=sum(known),x=angles[j];
    const table={head:[theme.col,'Angle'],rows:items.map((name,i)=>[name,i===j?'?':angles[i]+'°'])};
    if(variant==='missing')return {
     prompt:`The table shows the angles in a pie chart of the ${theme.what} of some students. Find the missing angle.`,table,
     answer:degrees(x),
     mistakes:[
      {value:String(part),why:'That is the total of the three angles you know. Subtract it from 360.'},
      ...(part<180?[{value:String(180-part),why:'The angles in a full circle add up to 360°, not 180°.'}]:[]),
      {value:String(x+100>360?x-100:x+100),why:'Check the subtraction from 360. Add your answer to the other three angles: the total should be 360.'}],
     hint:'The angles at the centre of a full circle add up to 360°.',
     steps:[
      {math:`${known.join(' + ')} = ${part}`,note:'Add the three angles you know.'},
      {math:`360 - ${part} = ${x}`,note:'The angles at the centre of a full circle add up to 360°.'},
      {math:`${angles.join(' + ')} = 360`,note:'Check: all four angles add up to 360°.'}],
     verify:{op:'value',expr:`360 - (${known.join(' + ')})`,equals:'ANSWER'}
    };
    if(x===counts[j]||x===100)continue;
    return {
     prompt:`${N} students were asked about their ${theme.what}. The table shows the angles in the pie chart. How many students chose ${items[j]}?`,table,
     answer:{type:'number',label:'Answer =',value:String(counts[j]),unit:'students'},
     mistakes:[
      {value:String(x),why:`${x}° is the missing angle. Now find that fraction of the ${N} students: \`frac(${x}, 360) * ${N}\`.`},
      {value:qStr(Q(x*N,100)),why:`A full circle is 360°, not 100. The fraction is \`frac(${x}, 360)\`.`},
      {value:qStr(Q(part*N,360)),why:`That is the number of students in the other three sectors. Subtract it from ${N}, or use the missing angle.`}],
     hint:'Find the missing angle first. Then find what fraction of 360° it is.',
     steps:[
      {math:`${known.join(' + ')} = ${part}`,note:'Add the three angles you know.'},
      {math:`360 - ${part} = ${x}`,note:`The angles add up to 360°, so the sector for ${items[j]} is ${x}°.`},
      {math:`frac(${x}, 360) * ${N} = ${counts[j]}`,note:`The sector is this fraction of the circle, so the same fraction of the ${N} students chose ${items[j]}.`}],
     verify:{op:'value',expr:`(360 - (${known.join(' + ')}))/360*${N}`,equals:'ANSWER'}
    };
   }
  }}
 ]
});
/* ---------- Stem-and-leaf plots ---------- */
const PLOTS=[
 {intro:'The stem-and-leaf plot shows the marks of some students in a test.',big:'What is the highest mark?',small:'What is the lowest mark?',noun:'mark'},
 {intro:'The stem-and-leaf plot shows the ages, in years, of the members of a walking club.',big:'What is the age of the oldest member?',small:'What is the age of the youngest member?',noun:'age'},
 {intro:'The stem-and-leaf plot shows the times, in minutes, that some students took to finish a puzzle.',big:'What is the longest time?',small:'What is the shortest time?',noun:'time'},
 {intro:'The stem-and-leaf plot shows the points a basketball team scored in each game of a season.',big:'What is the highest score?',small:'What is the lowest score?',noun:'score'}
];
const KEY='Key: 2 | 3 means 23.';
const leafRow=(rng,min,max)=>asc(Array.from({length:rng.int(min,max)},()=>rng.int(0,9)));
function makePlot(rng,rows,min,max){
 const first=rng.int(1,7-rows),stems=Array.from({length:rows},(_,i)=>first+i),leaves=stems.map(()=>leafRow(rng,min,max));
 return {stems,leaves,values:stems.flatMap((s,i)=>leaves[i].map(l=>s*10+l)),lens:leaves.map(l=>l.length),
  table:{head:['Stem','Leaf'],rows:stems.map((s,i)=>[String(s),leaves[i].join(' ')])}};
}
/* The statistic of an ordered list of whole numbers, as a number. */
function rawStat(kind,v){
 const n=v.length;
 return kind==='median'?(n%2?v[(n-1)/2]:(v[n/2-1]+v[n/2])/2):kind==='mode'?modesOf(v)[0]:v[n-1]-v[0];
}
const oneMode=v=>modesOf(v).length===1&&counts(v).get(modesOf(v)[0])>1;
const leafOnly=(value,full)=>({value:String(value),why:`That is only the leaf. A value is the stem and the leaf together: ${full}.`});

K.define({
 id:'stem-and-leaf',
 title:'Read a stem-and-leaf plot',
 strand:'Statistics',
 lesson:'13-04',
 blurb:'Join each leaf to its stem to read the values, which are already in order.',
 levels:[
  {name:'Read the plot',make(rng){
   const kind=rng.pick(['largest','smallest','count','range','range','mode','mode']);
   for(;;){
    const ctx=rng.pick(PLOTS),p=makePlot(rng,rng.int(3,4),2,4),{values,stems,leaves,lens,table}=p,n=values.length,lo=values[0],hi=values[n-1],intro=`${ctx.intro} ${KEY}`;
    if(kind==='largest'||kind==='smallest'){
     const big=kind==='largest',v=big?hi:lo,S=Math.floor(v/10),L=v%10,all=leaves.flat(),edge=big?Math.max(...all):Math.min(...all);
     const row=big?leaves.findIndex(l=>l.includes(edge)):leaves.length-1-[...leaves].reverse().findIndex(l=>l.includes(edge)),trap=stems[row]*10+edge;
     if(trap===v||S===L)continue;
     return {
      prompt:`${intro} ${big?ctx.big:ctx.small}`,table,
      answer:{type:'number',label:'Answer =',value:String(v)},
      mistakes:[
       leafOnly(L,v),
       {value:String(S),why:`That is only the stem. A value is the stem and the leaf together: ${v}.`},
       {value:String(trap),why:`The ${big?'largest':'smallest'} leaf, ${edge}, is in the row for stem ${stems[row]}, which makes ${trap}. Look in the ${big?'last':'first'} row for the ${big?'largest':'smallest'} value.`}],
      hint:`${big?'The largest value is the last leaf in the last row.':'The smallest value is the first leaf in the first row.'} Join the stem to the leaf.`,
      steps:[
       {note:`The stems are the tens and the leaves are the units. The ${big?'largest':'smallest'} value is the ${big?'last leaf in the last row':'first leaf in the first row'}: stem ${S}, leaf ${L}.`},
       {math:`(${S} * 10) + ${L} = ${v}`,note:`Stem ${S} means ${S} tens. Leaf ${L} means ${L} units.`}],
      verify:{op:'value',expr:`${big?'Max':'Min'}(${values.join(', ')})`,equals:'ANSWER'}
     };
    }
    if(kind==='count')return {
     prompt:`${intro} How many values are shown in the plot?`,table,
     answer:{type:'number',label:'Answer =',value:String(n)},
     mistakes:[
      {value:String(stems.length),why:'That is the number of stems. Each leaf is one value, so count the leaves.'},
      {value:String(n+stems.length),why:'Count only the leaves. A stem is not a value on its own.'},
      {value:String(hi),why:'That is the largest value. The question asks how many values there are, so count the leaves.'}],
     hint:'Each leaf stands for one value. Count the leaves, row by row.',
     steps:[
      {math:`${lens.join(' + ')} = ${n}`,note:'Count the leaves in each row and add. Each leaf is one value.'},
      {note:`There are ${n} values. You need this number to find the median.`}],
     verify:{op:'value',expr:lens.join(' + '),equals:'ANSWER'}
    };
    if(kind==='range'){
     const parts=listStat('range',values,{ordered:true});
     if(hi%10===lo%10)continue;
     return {prompt:`${intro} Find the range.`,table,...parts,
      mistakes:[{value:String(Math.abs(hi%10-lo%10)),why:`Those are only the leaves. Join each leaf to its stem first: the values are ${lo} and ${hi}.`},
       {value:String(10*(stems[stems.length-1]-stems[0])),why:`Use the full values, not only the stems. The smallest value is ${lo} and the largest is ${hi}.`},...parts.mistakes]};
    }
    if(!oneMode(values))continue;
    const parts=listStat('mode',values,{ordered:true}),mode=modesOf(values)[0];
    return {prompt:`${intro} Find the mode.`,table,...parts,mistakes:[leafOnly(mode%10,mode),...parts.mistakes]};
   }
  }},
  {name:'Median from a plot',make(rng){
   const odd=rng.chance(.5);
   for(;;){
    const ctx=rng.pick(PLOTS),p=makePlot(rng,rng.int(3,4),2,5),{values,lens,table}=p,n=values.length;
    if(n<9||n>15||(n%2===1)!==odd||(!odd&&values[n/2-1]===values[n/2]))continue;
    const parts=listStat('median',values,{ordered:true}),k=(n+1)/2;
    return {
     prompt:`${ctx.intro} ${KEY} Find the median ${ctx.noun}.`,table,...parts,
     mistakes:[
      ...(odd?[leafOnly(values[k-1]%10,values[k-1]),{value:String(values[k-2]),why:`That is the ${ordinal(k-1)} value. With ${n} values the median is the ${ordinal(k)} one: \`frac(${n} + 1, 2) = ${k}\`.`}]:[]),
      ...parts.mistakes],
     steps:[{math:`${lens.join(' + ')} = ${n}`,note:'Count the leaves, row by row. Each leaf is one value.'},...parts.steps]
    };
   }
  }},
  {name:'Exam style',make(rng){
   const variant=rng.pick(['decimal','decimal','back','back']);
   for(;;){
    if(variant==='decimal'){
     const ctx=rng.pick([
      {intro:'The stem-and-leaf plot shows the masses, in kg, of some parcels.',noun:'mass',unit:'kg'},
      {intro:'The stem-and-leaf plot shows the lengths, in cm, of some leaves.',noun:'length',unit:'cm'},
      {intro:'The stem-and-leaf plot shows the distances, in km, that some students travel to school.',noun:'distance',unit:'km'}]);
     const kind=rng.pick(['median','median','range','mode']),p=makePlot(rng,rng.int(3,4),2,4),{values,lens,table}=p,n=values.length;
     if(n<8||n>14||(kind==='mode'&&!oneMode(values)))continue;
     if(kind==='median'&&n%2===0&&values[n/2-1]===values[n/2])continue;
     const parts=listStat(kind,values,{scale:10,ordered:true,unit:ctx.unit});
     return {
      prompt:`${ctx.intro} Key: 2 | 3 means 2.3. Find the ${kind==='median'?'median '+ctx.noun:kind}.`,table,...parts,
      mistakes:[{value:String(rawStat(kind,values)),why:'Check the key. Here 2 | 3 means 2.3, not 23, so every value has one decimal place.'},...parts.mistakes],
      steps:kind==='median'?[{math:`${lens.join(' + ')} = ${n}`,note:'Count the leaves, row by row. Each leaf is one value. The key says the leaf is the first decimal place.'},...parts.steps]:parts.steps
     };
    }
    /* A back-to-back plot: the left side is read from the stem outwards. */
    const ctx=rng.pick([
     {intro:'The back-to-back stem-and-leaf plot shows the marks of two classes in the same test.',sides:['Class A','Class B'],noun:'mark'},
     {intro:'The back-to-back stem-and-leaf plot shows the points scored by two teams in the games of a season.',sides:['Team A','Team B'],noun:'score'},
     {intro:'The back-to-back stem-and-leaf plot shows the times, in minutes, that two groups took to finish a run.',sides:['Group 1','Group 2'],noun:'time'}]);
    const rows=rng.int(3,4),first=rng.int(1,7-rows),stems=Array.from({length:rows},(_,i)=>first+i),left=stems.map(()=>leafRow(rng,1,4)),right=stems.map(()=>leafRow(rng,1,4));
    const side=rng.int(0,1),kind=rng.pick(['median','median','range']),mine=side?right:left,theirs=side?left:right;
    const values=stems.flatMap((s,i)=>mine[i].map(l=>s*10+l)),others=stems.flatMap((s,i)=>theirs[i].map(l=>s*10+l)),n=values.length,lo=values[0],hi=values[n-1];
    if(n<7||n>12||others.length<7||rawStat(kind,values)===rawStat(kind,others))continue;
    if(kind==='median'&&n%2===0&&(values[n/2-1]===values[n/2]||[values[n/2-1],values[n/2]].includes(rawStat(kind,others))))continue;
    const parts=listStat(kind,values,{ordered:true}),name=ctx.sides[side],other=ctx.sides[1-side];
    const reading=side?`Use only the ${name} side, to the right of the stems.`:`Use only the ${name} side. On the left, the leaves are read from the stem outwards, so the leaf nearest the stem is the smallest in its row.`;
    const backwards=stems[rows-1]*10+left[rows-1][0]-(stems[0]*10+left[0][left[0].length-1]);
    return {
     prompt:`${ctx.intro} Key: 3 | 4 | 1 means 43 for ${ctx.sides[0]} and 41 for ${ctx.sides[1]}. Find the ${kind==='range'?'range':'median '+ctx.noun} for ${name}.`,
     table:{head:[ctx.sides[0],'Stem',ctx.sides[1]],rows:stems.map((s,i)=>[[...left[i]].reverse().join(' '),String(s),right[i].join(' ')])},
     ...parts,
     mistakes:[
      {value:String(rawStat(kind,others)),why:`That is the ${kind} for ${other}. The question asks about ${name}, on the ${side?'right':'left'} of the stems.`},
      ...(kind==='range'&&!side&&backwards>0?[{value:String(backwards),why:'On the left side the leaves are read from the stem outwards. In each row the leaf nearest the stem is the smallest.'}]:[]),
      ...parts.mistakes],
     steps:kind==='range'
      ?[{note:`${reading} The smallest value is ${lo} and the largest is ${hi}.`},parts.steps[1]]
      :[{note:reading},{math:`${mine.map(l=>l.length).join(' + ')} = ${n}`,note:'Count the leaves on that side. Each leaf is one value.'},...parts.steps]
    };
   }
  }}
 ]
});

/* ---------- Probability ---------- */
const COLOURS=['red','blue','green','yellow','white','black'];
const SIMPLE=' Give your answer as a fraction in its simplest form.';
const prob=q=>({type:'number',label:'P =',value:qStr(q),simplest:true});
/* "frac(4, 12) = frac(1, 3)", or one fraction when it is already in its simplest form. */
const reduce=(a,b)=>K.gcd(a,b)>1?`frac(${a}, ${b}) = ${fmt(Q(a,b))}`:`frac(${a}, ${b})`;
const ruleNote=(a,b)=>'Probability = favourable outcomes divided by all outcomes.'+(K.gcd(a,b)>1?' Then simplify the fraction.':'');
/* An event on the numbers 1 to n, with a count that sympy can recompute on its own. */
function numberEvent(rng,n){
 for(;;){
  const k=rng.int(2,n-2),e=rng.pick([
   {name:'an even number',test:v=>v%2===0,claim:`floor(${n}/2)`},
   {name:'an odd number',test:v=>v%2===1,claim:`ceiling(${n}/2)`},
   {name:'a multiple of 3',test:v=>v%3===0,claim:`floor(${n}/3)`},
   {name:`a number greater than ${k}`,test:v=>v>k,claim:`${n} - ${k}`,trap:`Greater than ${k} does not include ${k} itself.`},
   {name:`a number less than ${k}`,test:v=>v<k,claim:`${k} - 1`,trap:`Less than ${k} does not include ${k} itself.`},
   {name:'a prime number',test:v=>[2,3,5,7,11].includes(v),claim:`primepi(${n})`,trap:'1 is not a prime number. A prime number has exactly two factors.'},
   {name:`a factor of ${n}`,test:v=>n%v===0,claim:`divisor_count(${n})`},
   {name:'a square number',test:v=>[1,4,9].includes(v),claim:`floor(sqrt(${n}))`}]);
  e.hits=Array.from({length:n},(_,i)=>i+1).filter(e.test);e.fav=e.hits.length;
  if(e.fav>=2&&e.fav<n)return e;
 }
}
const device=(n,times)=>n===6
 ?`A fair six-sided die is rolled${times?` ${times} times`:''}.`
 :`A fair spinner has ${n} equal sectors numbered 1 to ${n}. It is spun ${times?`${times} times`:'once'}.`;
function bag(rng){
 for(;;){
  const colours=rng.shuffle(COLOURS).slice(0,3),nums=[rng.int(2,8),rng.int(2,8),rng.int(2,8)],total=sum(nums),j=rng.int(0,2);
  if(total<6||total>20||new Set(nums).size<2||nums[j]*2===total)continue;
  return {colours,nums,total,j,k:nums[j],colour:colours[j],text:`A bag holds ${nums[0]} ${colours[0]}, ${nums[1]} ${colours[1]} and ${nums[2]} ${colours[2]} counters. One counter is picked at random.`};
 }
}
const WORD_CARDS=['STATISTICS','MATHEMATICS','ALGEBRA','EQUATION','FRACTION','TRIANGLE','PARALLEL','BANANA','MISSISSIPPI','AVERAGE','DIVISION','HEXAGON'];

K.define({
 id:'probability',
 title:'Find a probability',
 strand:'Statistics',
 lesson:'09-03',
 blurb:'Count the outcomes that work, then divide by the number of equally likely outcomes.',
 levels:[
  {name:'Single events',make(rng){
   const variant=rng.pick(['bag','bag','die','spinner','letters']);
   for(;;){
    if(variant==='bag'){
     const b=bag(rng),{nums,total,k,colour}=b;
     return {
      prompt:`${b.text} Find the probability that it is ${colour}.${SIMPLE}`,
      answer:prob(Q(k,total)),
      mistakes:[
       {value:qStr(Q(k,total-k)),why:`Divide by the total number of counters, ${total}, not by the ${total-k} counters of the other colours.`},
       ...(k>1?[{value:qStr(Q(1,total)),why:`That is the probability of one particular counter. There are ${k} ${colour} counters.`}]:[]),
       {value:qStr(Q(total-k,total)),why:`That is the probability that it is not ${colour}. Put the number of ${colour} counters on top.`},
       {value:'1/3',why:'The three colours are not equally likely, because there are different numbers of each. Count the counters.'}],
      hint:`How many counters are there altogether? How many of them are ${colour}?`,
      steps:[
       {math:`${nums.join(' + ')} = ${total}`,note:'Count all the counters. Each one is equally likely to be picked.'},
       {math:reduce(k,total),note:`${k} of the ${total} counters ${k===1?'is':'are'} ${colour}. ${ruleNote(k,total)}`}],
      verify:{op:'value',expr:`${k}/(${nums.join(' + ')})`,equals:'ANSWER'}
     };
    }
    if(variant==='letters'){
     const word=rng.pick(WORD_CARDS),letters=[...word],len=letters.length,repeated=letters.filter(c=>letters.filter(x=>x===c).length>1),vowel=!repeated.length||rng.chance(.4),ch=repeated.length?rng.pick(repeated):letters[0];
     const fav=letters.filter(c=>vowel?'AEIOU'.includes(c):c===ch).length,target=vowel?'a vowel':`the letter ${ch}`,kinds=new Set(letters).size;
     if(fav*2===len)continue;
     return {
      prompt:`The letters of the word ${word} are written on separate cards. One card is picked at random. Find the probability that it shows ${target}.${SIMPLE}`,
      answer:prob(Q(fav,len)),
      mistakes:[
       ...(fav>1?[{value:qStr(Q(1,len)),why:`That is the probability of one particular card. ${fav} of the cards show ${target}.`}]:[]),
       {value:qStr(Q(fav,len-fav)),why:`Divide by the total number of cards, ${len}, not by the number of other cards.`},
       ...(vowel?[]:[{value:qStr(Q(1,kinds)),why:`There are ${kinds} different letters, but they are not equally likely because some appear more than once. Count the cards: there are ${len}.`}])],
      hint:`Count the letters in ${word}. Then count how many of them are ${vowel?'vowels':ch}.`,
      steps:[
       {note:`${word} has ${len} letters, so there are ${len} cards. Each card is equally likely.`},
       {math:reduce(fav,len),note:`${fav} of the ${len} cards ${fav===1?'shows':'show'} ${target}. ${ruleNote(fav,len)}`}],
      verify:{op:'value',expr:`${fav}/${len}`,equals:'ANSWER'}
     };
    }
    const n=variant==='die'?6:rng.pick([8,10,12]),e=numberEvent(rng,n),fav=e.fav;
    if(fav*2===n&&rng.chance(.6))continue;
    return {
     prompt:`${device(n)} Find the probability of getting ${e.name}.${SIMPLE}`,
     answer:prob(Q(fav,n)),
     mistakes:[
      ...(e.trap?[{value:qStr(Q(fav+1,n)),why:e.trap}]:[]),
      {value:qStr(Q(fav,n-fav)),why:`Divide by all ${n} outcomes, not by the ${n-fav} outcomes that do not count.`},
      {value:qStr(Q(n-fav,n)),why:`That is the probability of not getting ${e.name}. Put the number of outcomes that count on top.`},
      {value:qStr(Q(1,n)),why:`That is the probability of one single number. Here ${fav} numbers count.`}],
     hint:`List the numbers from 1 to ${n}. Which of them count as ${e.name}?`,
     steps:[
      {math:Array.from({length:n},(_,i)=>i+1).join(', '),note:`There are ${n} equally likely outcomes.`},
      {math:e.hits.join(', '),note:`These are the outcomes that give ${e.name}. There are ${fav} of them.`},
      {math:reduce(fav,n),note:ruleNote(fav,n)}],
     verify:{op:'value',expr:`(${e.claim})/${n}`,equals:'ANSWER'}
    };
   }
  }},
  {name:'Not, and expected number',make(rng){
   const variant=rng.pick(['not-bag','not-given','expected-device','expected-given']);
   for(;;){
    const name=rng.pick(NAMES);
    if(variant==='not-bag'){
     const b=bag(rng),{nums,total,k,colour}=b,rest=total-k;
     return {
      prompt:`${b.text} Find the probability that it is not ${colour}.${SIMPLE}`,
      answer:prob(Q(rest,total)),
      mistakes:[
       {value:qStr(Q(k,total)),why:`That is the probability that it is ${colour}. "Not ${colour}" means any of the other ${rest} counters.`},
       {value:qStr(Q(rest,k)),why:`Divide by the total number of counters, ${total}, not by the number of ${colour} counters.`},
       {value:'2/3',why:'The three colours are not equally likely, because there are different numbers of each. Count the counters.'}],
      hint:`Count the counters that are not ${colour}. Or find the probability of ${colour} and subtract it from 1.`,
      steps:[
       {math:`${nums.join(' + ')} = ${total}`,note:'Count all the counters.'},
       {math:`${total} - ${k} = ${rest}`,note:`${rest} of the counters are not ${colour}.`},
       {math:reduce(rest,total),note:ruleNote(rest,total)},
       {math:`1 - frac(${k}, ${total}) = frac(${rest}, ${total})`,note:`Check: the probabilities of ${colour} and not ${colour} add up to 1.`}],
      verify:{op:'value',expr:`1 - ${k}/(${nums.join(' + ')})`,equals:'ANSWER'}
     };
    }
    if(variant==='not-given'){
     const decimal=rng.chance(.5),d=decimal?100:rng.pick([5,6,8,10,12,20]),n=decimal?rng.pick([10,15,20,25,30,35,40,60,65,70,80,85,90]):rng.int(1,d-1);
     if(!decimal&&K.gcd(n,d)>1)continue;
     const p=decimal?String(n/100):`\`frac(${n}, ${d})\``,pm=decimal?String(n/100):`frac(${n}, ${d})`,am=decimal?String((100-n)/100):`frac(${d-n}, ${d})`;
     const c=rng.pick([
      {q:`The probability that it rains tomorrow is ${p}. Find the probability that it does not rain tomorrow.`},
      {q:`The probability that a bus is late is ${p}. Find the probability that the bus is not late.`},
      {q:`The probability that ${name} wins a game is ${p}. Find the probability that ${name} does not win.`},
      {q:`A spinner lands on red with probability ${p}. Find the probability that it does not land on red.`}]);
     return {
      prompt:c.q,
      answer:decimal?{type:'number',label:'P =',value:String((100-n)/100)}:prob(Q(d-n,d)),
      mistakes:decimal
       ?[{value:String(n/100),why:'That is the probability that it does happen. Subtract it from 1.'},
         {value:String(100-n/100),why:'As a decimal, certain is 1, not 100. Subtract the probability from 1.'},
         {value:String(100-n),why:'That is a percentage. The question uses a decimal, so give a decimal between 0 and 1.'}]
       :[{value:`${n}/${d}`,why:'That is the probability that it does happen. Subtract it from 1.'},
         {value:`${d}/${d-n}`,why:'A probability is never more than 1. Subtract the given probability from 1.'}],
      hint:'It either happens or it does not. The two probabilities add up to 1.',
      steps:[
       {math:`1 - ${pm} = ${am}`,note:`It either happens or it does not, so the two probabilities add up to 1. Subtract from 1.${decimal?'':` Think of 1 as \`frac(${d}, ${d})\`.`}`},
       {math:`${pm} + ${am} = 1`,note:'Check: the two probabilities add up to 1.'}],
      verify:{op:'value',expr:`1 - ${n}/${d}`,equals:'ANSWER'}
     };
    }
    if(variant==='expected-device'){
     const n=rng.pick([6,6,8,10,12]),e=numberEvent(rng,n),T=n*rng.pick([5,10,15,20,25,30]),answer=T*e.fav/n;
     return {
      prompt:`${device(n,T)} How many times would you expect to get ${e.name}?`,
      answer:{type:'number',label:'Expected =',value:String(answer),unit:'times'},
      mistakes:[
       ...(e.trap?[{value:qStr(Q(T*(e.fav+1),n)),why:e.trap}]:[]),
       {value:String(T/n),why:`That is the expected number for one single number. Here ${e.fav} numbers count, so the probability is \`frac(${e.fav}, ${n})\`.`},
       {value:String(e.fav),why:`That is how many outcomes count on one go. Multiply the probability, \`frac(${e.fav}, ${n})\`, by ${T}.`},
       {value:String(T-answer),why:`That is the expected number of times you do not get ${e.name}.`}],
      hint:`Find the probability on one go first. Then multiply it by ${T}.`,
      steps:[
       {math:e.hits.join(', '),note:`These ${e.fav} outcomes give ${e.name}, out of ${n} equally likely outcomes.`},
       {math:reduce(e.fav,n),note:'This is the probability on one go.'},
       {math:`${fmt(Q(e.fav,n))} * ${T} = ${answer}`,note:'Expected number = probability times the number of trials.'}],
      verify:{op:'value',expr:`${T}*(${e.claim})/${n}`,equals:'ANSWER'}
     };
    }
    const decimal=rng.chance(.6),pd=decimal?rng.pick([10,10,10,4,20]):rng.pick([3,5,6,8]),pn=rng.int(1,pd-1);
    if(K.gcd(pn,pd)>1||pn*2===pd)continue;
    const T=pd*rng.pick(pd>=10?[2,3,4,5,10]:[5,10,15,20]),answer=T*pn/pd,p=decimal?String(pn/pd):`\`frac(${pn}, ${pd})\``,pm=decimal?String(pn/pd):`frac(${pn}, ${pd})`;
    const c=rng.pick([
     `The probability that a seed grows is ${p}. ${T} seeds are planted. How many would you expect to grow?`,
     `The probability that a bus is late is ${p}. How many of the next ${T} buses would you expect to be late?`,
     `${name} scores from a penalty with probability ${p}. How many goals would you expect from ${T} penalties?`,
     `A biased coin lands on heads with probability ${p}. It is tossed ${T} times. How many heads would you expect?`]);
    return {
     prompt:c,
     answer:{type:'number',label:'Expected =',value:String(answer)},
     mistakes:[
      {value:qStr(Q(T*pd,pn)),why:`Multiply ${T} by the probability. Do not divide by it. The answer cannot be more than ${T}.`},
      {value:String(T-answer),why:'That uses the probability that it does not happen. Use the probability given in the question.'},
      ...(decimal?[]:[{value:qStr(Q(T,pd)),why:`That is \`frac(1, ${pd})\` of ${T}. The probability is \`frac(${pn}, ${pd})\`, so multiply by ${pn}.`}])],
     hint:`Expected number = probability times the number of trials. Find ${decimal?p:'that fraction'} of ${T}.`,
     steps:[
      {math:`${pm} * ${T} = ${answer}`,note:'Expected number = probability times the number of trials.'},
      {note:`This is what happens on average. The real number could be a little more or a little less than ${answer}.`}],
     verify:{op:'value',expr:`${T}*${pn}/${pd}`,equals:'ANSWER'}
    };
   }
  }},
  {name:'Two events',make(rng){
   const variant=rng.pick(['sum','sum','dice-other','coin-die','spinners','coins']);
   const pairs=(m,n,test)=>{const out=[];for(let a=1;a<=m;a++)for(let b=1;b<=n;b++)if(test(a,b))out.push([a,b]);return out};
   const listed=list=>list.map(p=>`(${p[0]}, ${p[1]})`).join(', ');
   for(;;){
    if(variant==='sum'){
     const mode=rng.pick(['exactly','exactly','least','most']),s=mode==='exactly'?rng.int(3,11):mode==='least'?rng.int(9,11):rng.int(3,5);
     const totals=mode==='exactly'?[s]:mode==='least'?Array.from({length:13-s},(_,i)=>s+i):Array.from({length:s-1},(_,i)=>2+i);
     const hit=pairs(6,6,(a,b)=>totals.includes(a+b)),fav=hit.length,unordered=hit.filter(p=>p[0]<=p[1]).length,swap=hit.find(p=>p[0]<p[1]);
     return {
      prompt:`Two fair six-sided dice are rolled and the two numbers are added. Find the probability that the total is ${mode==='exactly'?s:mode==='least'?s+' or more':s+' or less'}.${SIMPLE}`,
      answer:prob(Q(fav,36)),
      mistakes:[
       {value:qStr(Q(fav,12)),why:'Two dice give `6 * 6 = 36` equally likely outcomes, not `6 + 6 = 12`.'},
       {value:qStr(Q(unordered,36)),why:`(${swap[0]}, ${swap[1]}) and (${swap[1]}, ${swap[0]}) are different outcomes, because the dice are separate. Count both.`},
       {value:qStr(Q(totals.length,11)),why:'The 11 possible totals are not equally likely. Count the pairs of numbers out of 36.'}],
      hint:'Two dice have 36 equally likely outcomes. List the pairs of numbers that give the total you want.',
      steps:[
       {math:'6 * 6 = 36',note:'Each die has 6 outcomes, so there are 36 equally likely pairs.'},
       {note:`List the pairs that work: ${listed(hit)}. There are ${fav}.`},
       {math:reduce(fav,36),note:ruleNote(fav,36)}],
      verify:{op:'value',expr:`(${totals.map(t=>`(6 - Abs(${t} - 7))`).join(' + ')})/(6*6)`,equals:'ANSWER'}
     };
    }
    if(variant==='dice-other'){
     const e=rng.pick([
      {name:'both dice show the same number',test:(a,b)=>a===b,claim:'6',slip:{value:'1/36',why:'That is the probability of one particular double, such as (3, 3). There are 6 doubles.'}},
      {name:'both numbers are even',test:(a,b)=>a%2===0&&b%2===0,claim:'3*3',slip:{value:'1/2',why:'That is the probability for one die. Both dice must be even: there are `3 * 3 = 9` such pairs out of 36.'}},
      {name:'both numbers are odd',test:(a,b)=>a%2===1&&b%2===1,claim:'3*3',slip:{value:'1/2',why:'That is the probability for one die. Both dice must be odd: there are `3 * 3 = 9` such pairs out of 36.'}},
      {name:'both numbers are greater than 4',test:(a,b)=>a>4&&b>4,claim:'2*2',slip:{value:'1/3',why:'That is the probability for one die. Both dice must show 5 or 6: there are `2 * 2 = 4` such pairs out of 36.'}},
      {name:'both numbers are less than 3',test:(a,b)=>a<3&&b<3,claim:'2*2',slip:{value:'1/3',why:'That is the probability for one die. Both dice must show 1 or 2: there are `2 * 2 = 4` such pairs out of 36.'}},
      {name:'the two numbers multiply to give 12',test:(a,b)=>a*b===12,claim:'divisor_count(12) - 2',slip:{value:'1/18',why:'(2, 6) and (6, 2) are different outcomes, and so are (3, 4) and (4, 3). Count all four.'}},
      {name:'the two numbers multiply to give 6',test:(a,b)=>a*b===6,claim:'divisor_count(6)',slip:{value:'1/18',why:'(1, 6) and (6, 1) are different outcomes, and so are (2, 3) and (3, 2). Count all four.'}},
      {name:'the two numbers differ by exactly 1',test:(a,b)=>Math.abs(a-b)===1,claim:'2*5',slip:{value:'5/36',why:'(1, 2) and (2, 1) are different outcomes, because the dice are separate. Count both orders.'}}]);
     const hit=pairs(6,6,e.test),fav=hit.length;
     return {
      prompt:`Two fair six-sided dice are rolled. Find the probability that ${e.name}.${SIMPLE}`,
      answer:prob(Q(fav,36)),
      mistakes:[e.slip,{value:qStr(Q(fav,12)),why:'Two dice give `6 * 6 = 36` equally likely outcomes, not `6 + 6 = 12`.'}],
      hint:'Two dice have 36 equally likely outcomes. List the pairs that fit the description.',
      steps:[
       {math:'6 * 6 = 36',note:'Each die has 6 outcomes, so there are 36 equally likely pairs.'},
       {note:`List the pairs that work: ${listed(hit)}. There are ${fav}.`},
       {math:reduce(fav,36),note:ruleNote(fav,36)}],
      verify:{op:'value',expr:`(${e.claim})/(6*6)`,equals:'ANSWER'}
     };
    }
    if(variant==='coin-die'){
     const e=numberEvent(rng,6),face=rng.pick(['head','tail']),letter=face[0].toUpperCase(),fav=e.fav;
     return {
      prompt:`A fair coin is tossed and a fair six-sided die is rolled. Find the probability of getting a ${face} and ${e.name}.${SIMPLE}`,
      answer:prob(Q(fav,12)),
      mistakes:[
       ...(e.trap?[{value:qStr(Q(fav+1,12)),why:e.trap}]:[]),
       {value:qStr(Q(fav,8)),why:'There are `2 * 6 = 12` equally likely outcomes, not `2 + 6 = 8`.'},
       {value:qStr(Q(fav,6)),why:`That is the probability for the die alone. The coin must also show a ${face}, which happens half of the time.`},
       {value:'1/2',why:`That is the probability for the coin alone. The die must also show ${e.name}.`}],
      hint:'List the outcomes as pairs: the coin first, then the die. There are 12 of them.',
      steps:[
       {math:'2 * 6 = 12',note:'The coin has 2 outcomes and the die has 6, so there are 12 equally likely pairs.'},
       {note:`List the pairs that work: ${e.hits.map(h=>`(${letter}, ${h})`).join(', ')}. There are ${fav}.`},
       {math:reduce(fav,12),note:ruleNote(fav,12)}],
      verify:{op:'value',expr:`(1*(${e.claim}))/(2*6)`,equals:'ANSWER'}
     };
    }
    if(variant==='coins'){
     const c=rng.pick([
      {n:2,ks:[1],text:'exactly one head'},{n:2,ks:[2],text:'two heads'},{n:2,ks:[1,2],text:'at least one head'},{n:2,ks:[0],text:'no heads'},
      {n:3,ks:[1],text:'exactly one head'},{n:3,ks:[2],text:'exactly two heads'},{n:3,ks:[3],text:'three heads'},{n:3,ks:[1,2,3],text:'at least one head'},{n:3,ks:[2,3],text:'at least two heads'},{n:3,ks:[0,1],text:'at most one head'}]);
     const total=2**c.n,all=Array.from({length:total},(_,i)=>Array.from({length:c.n},(_,j)=>(i>>(c.n-1-j))&1?'T':'H').join(''));
     const hit=all.filter(o=>c.ks.includes([...o].filter(x=>x==='H').length)),fav=hit.length,product=Array(c.n).fill(2).join(' * '),plusses=Array(c.n).fill(2).join(' + ');
     return {
      prompt:`${c.n===2?'Two':'Three'} fair coins are tossed. Find the probability of getting ${c.text}.${SIMPLE}`,
      answer:prob(Q(fav,total)),
      mistakes:[
       {value:qStr(Q(c.ks.length,c.n+1)),why:`The ${c.n+1} possible numbers of heads are not equally likely. List every outcome separately: HT and TH are different outcomes.`},
       {value:qStr(Q(fav,2*c.n)),why:`There are \`${product} = ${total}\` equally likely outcomes, not \`${plusses} = ${2*c.n}\`.`},
       {value:qStr(Q(total-fav,total)),why:`That is the probability of not getting ${c.text}. Count the outcomes that fit the description.`}],
      hint:`List every outcome with H and T, one letter for each coin. There are ${total} of them.`,
      steps:[
       {math:`${product} = ${total}`,note:`Each coin has 2 outcomes, so there are ${total} equally likely outcomes.`},
       {note:`List them all: ${all.join(', ')}. The ones with ${c.text} are: ${hit.join(', ')}. There ${fav===1?'is':'are'} ${fav}.`},
       {math:reduce(fav,total),note:ruleNote(fav,total)}],
      verify:{op:'value',expr:`(${c.ks.map(k=>`binomial(${c.n}, ${k})`).join(' + ')})/2^${c.n}`,equals:'ANSWER'}
     };
    }
    const [m,n]=rng.pick([[3,4],[3,5],[4,5],[4,4],[3,3]]),s=rng.int(3,m+n-1),hit=pairs(m,n,(a,b)=>a+b===s),fav=hit.length;
    if(fav<2)continue;
    return {
     prompt:`Spinner A has ${m} equal sectors numbered 1 to ${m}. Spinner B has ${n} equal sectors numbered 1 to ${n}. Both are spun and the two numbers are added. Find the probability that the total is ${s}.${SIMPLE}`,
     answer:prob(Q(fav,m*n)),
     mistakes:[
      {value:qStr(Q(fav,m+n)),why:`There are \`${m} * ${n} = ${m*n}\` equally likely outcomes, not \`${m} + ${n} = ${m+n}\`.`},
      {value:qStr(Q(1,m+n-1)),why:`The ${m+n-1} possible totals are not equally likely. Count the pairs of numbers out of ${m*n}.`},
      {value:qStr(Q(1,m*n)),why:`That is the probability of one particular pair. ${fav} pairs give a total of ${s}.`}],
     hint:`List the outcomes as pairs: spinner A first, then spinner B. There are ${m*n} of them.`,
     steps:[
      {math:`${m} * ${n} = ${m*n}`,note:`Spinner A has ${m} outcomes and spinner B has ${n}, so there are ${m*n} equally likely pairs.`},
      {note:`List the pairs that add up to ${s}: ${listed(hit)}. There are ${fav}.`},
      {math:reduce(fav,m*n),note:ruleNote(fav,m*n)}],
     verify:{op:'value',expr:`(Min(${m}, ${s} - 1) - Max(1, ${s} - ${n}) + 1)/(${m}*${n})`,equals:'ANSWER'}
    };
   }
  }}
 ]
});
})();
