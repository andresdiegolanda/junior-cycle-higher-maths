/* Skill drills: functions (chapter 19) and journey graphs (chapter 20).
   Outputs from inputs, inputs from outputs, the rule from two values, and reading a distance-time graph. */
(()=>{'use strict';
const K=SkillKit,{Q,qStr,terms,linear,quadratic,bracket,signed}=K;
const STRAND='Functions and graphs';
const tick=v=>Number(v)<0?'`'+v+'`':String(v);
const undo=b=>b>0?`Subtract ${b} from`:`Add ${-b} to`;
const dec=q=>String(q.n/q.d);                      /* 15/2 shown as 7.5 */

/* ---------- Outputs: f(k) ---------- */
/* One value of a x^2 + b x + c (a may be 0), written out as the student should write it. */
function valueOf(name,[a,b,c],k){
 const rule=a?quadratic(a,b,c):linear(b,'x',c),out=a*k*k+b*k+c;
 const parts=[];
 if(a)parts.push([a===1?'':a===-1?'-':String(a),`(${k})^2`]);
 if(b)parts.push([b===1?'':b===-1?'-':String(b),`(${k})`]);
 let written=parts.map(([coef,body],i)=>i===0?coef+body:(coef.startsWith('-')?' - ':' + ')+coef.replace('-','')+body).join('');
 if(c)written+=written?' '+signed(c):String(c);
 const middle=[a?String(a*k*k):null,b?String(b*k):null,c?String(c):null].filter(v=>v!==null).map((v,i)=>i===0?v:signed(Number(v))).join(' ');
 return {rule,out,written,middle,call:`${name}(${k})`};
}
function outputQuestion(name,coefs,k){
 const [a,b,c]=coefs,v=valueOf(name,coefs,k);
 const mistakes=[];
 if(a&&k<0)mistakes.push({value:String(v.out-2*a*k*k),why:`The square of a negative number is positive: \`(${k})^2 = ${k*k}\`.`});
 if(b&&k<0)mistakes.push({value:String(v.out-2*b*k),why:`Keep the sign of the input: \`${b}(${k}) = ${b*k}\`.`});
 if(!a&&b>1&&b<10&&k>0&&k<10)mistakes.push({value:String(b*10+k+c),why:`\`${b}x\` means ${b} times x. With \`x = ${k}\` that is \`${b}(${k}) = ${b*k}\`, not ${b}${k}.`});
 if(b)mistakes.push({value:String(v.out-b*k+b+k),why:`\`${linear(b,'x',0)}\` means ${tick(b)} times x. Multiply, do not add.`});
 if(c)mistakes.push({value:String(v.out-2*c),why:`Keep the sign of the last term: it is \`${signed(c)}\`.`});
 return {
  prompt:`Find \`${v.call}\` for this function.`,math:`${name}(x) = ${v.rule}`,
  answer:{type:'number',label:`${v.call} =`,value:String(v.out)},mistakes,
  hint:`Write the rule again with \`(${k})\` in every place where x was. The brackets keep the sign safe.`,
  steps:[
   {math:`${v.call} = ${v.written}`,note:`Replace every x with \`(${k})\`.`},
   ...(v.middle.includes(' ')?[{math:`${v.call} = ${v.middle}`,note:a?'Work out the power first, then the multiplication.':'Multiply first.'}]:[]),
   {math:`${v.call} = ${v.out}`,note:'Add and subtract from left to right.'}],
  verify:{op:'value',expr:`(${a})*x^2 + (${b})*x + (${c})`,subs:{x:String(k)},equals:'ANSWER'}
 };
}
K.define({
 id:'function-values',title:'Find f(x) for an input',strand:STRAND,lesson:'19-03',
 blurb:'Put an input into a function and work out the output, without losing a sign.',
 levels:[
  {name:'Linear rules',make(rng){
   for(;;){
    const name=rng.pick(['f','f','g']),b=rng.chance(.25)?-rng.int(2,5):rng.int(2,9),c=rng.nonzero(-9,12),k=rng.int(2,9);
    if(b<0&&c<0||b*k+c===0)continue;
    return outputQuestion(name,[0,b,c],k);
   }
  }},
  {name:'Squares and negative inputs',make(rng){
   for(;;){
    const name=rng.pick(['f','g']),a=rng.pick([1,1,1,2,-1]),b=rng.int(-6,6),c=rng.int(-9,9),k=rng.chance(.7)?-rng.int(1,5):rng.int(2,5);
    if(!b&&!c)continue;
    return outputQuestion(name,[a,b,c],k);
   }
  }},
  {name:'Exam style',make(rng){
   for(;;){
    const coefs=rng.chance(.5)?[0,rng.nonzero(-5,6),rng.nonzero(-8,8)]:[1,rng.int(-5,5),rng.nonzero(-8,8)],p=rng.nonzero(-4,5),q=rng.nonzero(-4,5),m=rng.int(2,4),plus=rng.chance(.5);
    if(p===q||Math.abs(coefs[1])===1&&!coefs[0])continue;
    const first=valueOf('f',coefs,p),second=valueOf('f',coefs,q),total=m*first.out+(plus?1:-1)*second.out,ask=`${m}f(${p}) ${plus?'+':'-'} f(${q})`;
    const inside=valueOf('f',coefs,m*p).out+(plus?1:-1)*second.out;
    return {
     prompt:`Find the value of \`${ask}\` for this function.`,math:`f(x) = ${first.rule}`,
     answer:{type:'number',label:'Value =',value:String(total)},
     mistakes:[
      {value:String(inside),why:`Keep the ${m} outside. Work out \`f(${p})\` first, then multiply the result by ${m}. \`${m}f(${p})\` is not \`f(${m*p})\`.`},
      {value:String(first.out+(plus?1:-1)*second.out),why:`Multiply \`f(${p})\` by ${m} before you ${plus?'add':'subtract'}.`},
      {value:String(m*first.out+(plus?-1:1)*second.out),why:`Check the sign between the two parts: it is ${plus?'plus':'minus'}.`}],
     hint:`Find \`f(${p})\` and \`f(${q})\` separately. Only then multiply and ${plus?'add':'subtract'}.`,
     steps:[
      {math:`f(${p}) = ${first.written} = ${first.out}`,note:`Find \`f(${p})\`: replace every x with \`(${p})\`.`},
      {math:`f(${q}) = ${second.written} = ${second.out}`,note:`Find \`f(${q})\` in the same way.`},
      {math:`${m}(${first.out}) ${plus?'+':'-'} ${bracket(second.out)} = ${total}`,note:`Now multiply \`f(${p})\` by ${m} and ${plus?'add':'subtract'} \`f(${q})\`.`}],
     verify:{op:'value',expr:`${m}*((${coefs[0]})*(${p})^2 + (${coefs[1]})*(${p}) + (${coefs[2]})) ${plus?'+':'-'} ((${coefs[0]})*(${q})^2 + (${coefs[1]})*(${q}) + (${coefs[2]}))`,equals:'ANSWER'}
    };
   }
  }}]
});

/* ---------- Inputs from outputs, and the rule from two values ---------- */
K.define({
 id:'function-inputs',title:'Work back to the input',strand:STRAND,lesson:'19-06',
 blurb:'Find the input that gives a stated output, where two functions agree, and the rule from two values.',
 levels:[
  {name:'Solve f(x) = k',make(rng){
   for(;;){
    const a=rng.pick([2,3,4,5,6,-2,-3]),b=rng.nonzero(-9,9),x=rng.nonzero(-5,8),t=a*x+b,rule=linear(a,'x',b);
    if(t===0||t===x)continue;
    return {
     prompt:`Find the value of x for which \`f(x) = ${t}\`.`,math:`f(x) = ${rule}`,
     answer:{type:'number',label:'x =',value:String(x)},
     mistakes:[
      {value:String(a*t+b),why:`You put ${tick(t)} in for x. Here ${tick(t)} is the output, so solve \`${rule} = ${t}\`.`},
      {value:qStr(Q(t+b,a)),why:`To undo \`${signed(b)}\`, do the opposite on both sides.`},
      {value:String(t-b),why:`You found \`${linear(a,'x',0)}\`. One more move: divide both sides by ${tick(a)}.`}],
     hint:`The output is ${tick(t)}. Write \`${rule} = ${t}\` and solve it.`,
     steps:[
      {math:`${rule} = ${t}`,note:`The output \`f(x)\` is ${tick(t)}, so the rule equals ${tick(t)}.`},
      {math:`${linear(a,'x',0)} = ${t-b}`,note:`${undo(b)} both sides.`},
      {math:`x = ${x}`,note:`Divide both sides by ${tick(a)}.`},
      {math:`f(${x}) = ${a}(${x}) ${signed(b)} = ${t}`,note:'Check: this input gives the stated output.'}],
     verify:{op:'solve',eq:`(${a})*x + (${b}) = ${t}`,variable:'x',solutions:['ANSWER']}
    };
   }
  }},
  {name:'Where two functions agree',make(rng){
   for(;;){
    const a=rng.pick([2,3,4,5,6]),c=rng.pick([1,2,3,-1,-2]),x=rng.nonzero(-5,7),b=rng.nonzero(-9,9),d=(a-c)*x+b;
    if(a-c<2||a+c===0||!d||Math.abs(d)>20)continue;
    const f=linear(a,'x',b),g=linear(c,'x',d),same=a*x+b;
    return {
     prompt:'Find the value of x for which `f(x) = g(x)`.',math:`f(x) = ${f} and g(x) = ${g}`,
     answer:{type:'number',label:'x =',value:String(x)},
     mistakes:[
      {value:qStr(Q(d+b,a-c)),why:`When \`${signed(b)}\` moves to the other side its sign changes.`},
      {value:qStr(Q(d-b,a+c)),why:`Subtract \`${linear(c,'x',0)}\` from both sides. The x terms on the left are then \`${linear(a-c,'x',0)}\`.`},
      {value:String(same),why:`${tick(same)} is the output that both functions give. The question asks for the input x.`}],
     hint:`Put the two rules equal to each other: \`${f} = ${g}\`. Then solve for x.`,
     steps:[
      {math:`${f} = ${g}`,note:'The two outputs are equal, so the two rules are equal.'},
      {math:`${linear(a-c,'x',b)} = ${d}`,note:`${c>0?'Subtract':'Add'} \`${linear(Math.abs(c),'x',0)}\` ${c>0?'from':'to'} both sides.`},
      {math:`${linear(a-c,'x',0)} = ${d-b}`,note:`${undo(b)} both sides.`},
      {math:`x = ${x}`,note:`Divide both sides by ${a-c}.`},
      {math:`f(${x}) = ${same} and g(${x}) = ${same}`,note:'Check: both functions give the same output for this input.'}],
     verify:{op:'solve',eq:`(${a})*x + (${b}) = (${c})*x + (${d})`,variable:'x',solutions:['ANSWER']}
    };
   }
  }},
  {name:'Find the rule',make(rng){
   for(;;){
    const a=rng.pick([2,3,4,5,-2,-3]),b=rng.nonzero(-8,8),p=rng.int(1,3),q=p+rng.int(1,4),u=a*p+b,v=a*q+b;
    if(u===v||u===0||v===0)continue;
    return {
     prompt:`A function has the rule \`f(x) = ax + b\`. It is known that \`f(${p}) = ${u}\` and \`f(${q}) = ${v}\`. Find a and b.`,
     answer:{type:'fields',fields:[{label:'a =',value:String(a)},{label:'b =',value:String(b)}]},
     mistakes:[
      {value:[String(b),String(a)],why:'Those are the right numbers in the wrong boxes. a multiplies x and b is added on.'},
      {value:[String(v-u),String(b)],why:`${tick(v-u)} is the change in the output when x goes up by ${q-p}. Divide it by ${q-p} to find a.`},
      {value:[String(-a),String(u+a*p)],why:'Check the order when you subtract the two equations. Subtract the whole first equation from the whole second one.'}],
     hint:`Each fact gives an equation in a and b: \`f(${p}) = ${u}\` means \`${terms([[p,'a'],[1,'b']])} = ${u}\`. Subtract one equation from the other to remove b.`,
     steps:[
      {math:`${terms([[p,'a'],[1,'b']])} = ${u} and ${terms([[q,'a'],[1,'b']])} = ${v}`,note:'Put each input into the rule. Each fact gives one equation.'},
      {math:`${terms([[q-p,'a']])} = ${v-u}`,note:'Subtract the first equation from the second. The b terms cancel.'},
      {math:`a = ${a}`,note:q-p===1?'So a is found.':`Divide both sides by ${q-p}.`},
      {math:`b = ${u} - ${p===1?'':p}(${a}) = ${b}`,note:'Put a into the first equation to find b.'},
      {math:`f(${q}) = ${a}(${q}) ${signed(b)} = ${v}`,note:'Check with the second fact.'}],
     verify:{op:'system',eqs:[`a*(${p}) + b = ${u}`,`a*(${q}) + b = ${v}`],solution:{a:'ANSWER0',b:'ANSWER1'}}
    };
   }
  }}]
});

/* ---------- Journey graphs ---------- */
const TRAVELLERS=[['Aoife','cycles','her'],['Cian','cycles','his'],['Niamh','walks','her'],['Tom','jogs','his'],['Ella','drives','her'],['Sean','drives','his']];
const SPEEDS={walks:[3,4,5,6],jogs:[8,9,10,12],cycles:[12,15,18,20,24],drives:[40,50,60,80]};   /* km/h that each could keep up */
const PLACES=['the beach','a friend\'s house','the library','the shop','training','the lake'];
/* An out, stop and back journey in whole hours: {points, speeds and times} */
function roundTrip(rng,speeds){
 for(;;){
  const out=rng.int(1,3),stop=rng.int(1,2),back=rng.int(1,3),v=rng.pick(speeds),d=v*out;
  if(d%back||out===back&&rng.chance(.6)||out+stop+back>7)continue;
  return {out,stop,back,d,vOut:v,vBack:d/back,total:out+stop+back,points:[[0,0],[out,d],[out+stop,d],[out+stop+back,0]]};
 }
}
const plural=(n,word)=>`${n} ${word}${n===1?'':'s'}`;
function tripFrame(rng){
 const [name,verb,their]=rng.pick(TRAVELLERS),t=roundTrip(rng,SPEEDS[verb]),place=rng.pick(PLACES);
 const step=t.d<=15?(t.d<=6?1:t.d<=10?2:5):t.d<=60?10:t.d<=120?20:40;
 return {name,their,t,intro:`The graph shows how ${name} ${verb} from home to ${place}, stays there for a while and then comes home.`,
  figure:K.journeyFigure({points:t.points,yStep:step})};
}
K.define({
 id:'journey-graphs',title:'Read a journey graph',strand:STRAND,lesson:'20-01',
 blurb:'Read distances, times, stops and speeds from a distance-time graph.',
 levels:[
  {name:'Read the graph',make(rng){
   const {name,their,t,intro,figure}=tripFrame(rng),kind=rng.pick(['far','stop','speed out','speed out']);
   if(kind==='far')return {
    prompt:`${intro} How far from home is the place where ${name} stops?`,figure,
    answer:{type:'number',value:String(t.d),unit:'km'},
    mistakes:[{value:String(2*t.d),why:'That is the distance for the whole trip, there and back. The question asks how far away the stop is.'},{value:String(t.out),why:`${t.out} is the time taken, read from the bottom axis. Read the distance from the side axis.`}],
    hint:'The flat part of the graph is the stop. Read its height on the distance axis.',
    steps:[{note:'A flat part of the graph means the distance from home is not changing: that is the stop.'},{math:`${t.d} km`,note:'Read across from the flat part to the distance axis.'}],
    verify:{op:'value',expr:`${t.vOut}*${t.out}`,equals:'ANSWER'}};
   if(kind==='stop')return {
    prompt:`${intro} For how long does ${name} stay there?`,figure,
    answer:{type:'number',value:String(t.stop),unit:t.stop===1?'hour':'hours',units:['hour','hours','h']},
    mistakes:[{value:String(t.out+t.stop),why:`${plural(t.out+t.stop,'hour')} is the clock time when the stop ends. Subtract the time when it starts.`},{value:String(t.total),why:'That is the time for the whole trip. The stop is only the flat part of the graph.'}],
    hint:'The stop is the flat part of the graph. Read the time where it starts and the time where it ends.',
    steps:[{note:`The flat part starts at ${plural(t.out,'hour')} and ends at ${plural(t.out+t.stop,'hour')}.`},{math:`${t.out+t.stop} - ${t.out} = ${t.stop}`,note:'Subtract the start time from the end time.'}],
    verify:{op:'value',expr:`(${t.out} + ${t.stop}) - ${t.out}`,equals:'ANSWER'}};
   return {
    prompt:`${intro} Find ${their} speed on the way there.`,figure,
    answer:{type:'number',value:String(t.vOut),unit:'km/h'},
    mistakes:[
     {value:String(t.d),why:`${t.d} km is the distance. Divide it by the time taken, ${plural(t.out,'hour')}.`},
     {value:qStr(Q(t.out,t.d)),why:'That is time divided by distance. Speed is distance divided by time.'},
     {value:qStr(Q(t.d,t.total)),why:`Use only the time for the way there, ${plural(t.out,'hour')}, not the time for the whole trip.`}],
    hint:'Speed is distance divided by time. Read both from the first sloping part of the graph.',
    steps:[
     {note:`The first sloping part goes from 0 km to ${t.d} km in ${plural(t.out,'hour')}.`},
     {math:`frac(${t.d}, ${t.out}) = ${t.vOut}`,note:'Speed is distance divided by time. The answer is in km/h.'}],
    verify:{op:'value',expr:`${t.d}/${t.out}`,equals:'ANSWER'}};
  }},
  {name:'The way back and the whole trip',make(rng){
   for(;;){
    const {name,their,t,intro,figure}=tripFrame(rng),kind=rng.pick(['speed back','average','average','total']);
    if(kind==='total')return {
     prompt:`${intro} How far does ${name} travel altogether?`,figure,
     answer:{type:'number',value:String(2*t.d),unit:'km'},
     mistakes:[{value:String(t.d),why:`${t.d} km is the distance there. ${name} also comes back.`},{value:'0',why:`${name} ends at home, 0 km away, but has travelled there and back.`}],
     hint:'Add the distance there and the distance back.',
     steps:[{note:`The graph rises to ${t.d} km and comes back down to 0 km.`},{math:`${t.d} + ${t.d} = ${2*t.d}`,note:'Add the distance there and the distance back.'}],
     verify:{op:'value',expr:`2*${t.vOut}*${t.out}`,equals:'ANSWER'}};
    if(kind==='speed back'){
     if(t.vBack===t.vOut)continue;
     return {
      prompt:`${intro} Find ${their} speed on the way home.`,figure,
      answer:{type:'number',value:String(t.vBack),unit:'km/h'},
      mistakes:[
       {value:String(t.vOut),why:`That is the speed on the way there. The way home is the last part of the graph, which takes ${plural(t.back,'hour')}.`},
       {value:qStr(Q(t.d,t.total)),why:`The way home starts at ${plural(t.out+t.stop,'hour')} and ends at ${plural(t.total,'hour')}, so it takes ${plural(t.back,'hour')}.`},
       {value:String(-t.vBack),why:'The line slopes down because the distance from home is falling. A speed is not negative.'}],
      hint:'The way home is the last sloping part. Find how long it takes by subtracting its start time from its end time.',
      steps:[
       {math:`${t.total} - ${t.out+t.stop} = ${t.back}`,note:`The last part runs from ${plural(t.out+t.stop,'hour')} to ${plural(t.total,'hour')}.`},
       {math:`frac(${t.d}, ${t.back}) = ${t.vBack}`,note:`${name} covers ${t.d} km in that time. Speed is distance divided by time.`}],
      verify:{op:'value',expr:`${t.d}/(${t.total} - (${t.out} + ${t.stop}))`,equals:'ANSWER'}};
    }
    const average=Q(2*t.d,t.total);
    if(average.d!==1&&average.d!==2)continue;
    return {
     prompt:`${intro} Find ${their} average speed for the whole trip, including the stop.`,figure,
     answer:{type:'number',value:dec(average),unit:'km/h'},
     mistakes:[
      {value:qStr(Q(t.d,t.total)),why:`Use the total distance travelled: ${t.d} km there and ${t.d} km back.`},
      {value:qStr(Q(2*t.d,t.out+t.back)),why:'The question says including the stop, so divide by the time for the whole trip.'},
      {value:qStr(Q(t.vOut+t.vBack,2)),why:'Do not average the two speeds. Divide the total distance by the total time.'}],
     hint:'Average speed is the total distance divided by the total time. The stop counts as time.',
     steps:[
      {math:`${t.d} + ${t.d} = ${2*t.d}`,note:'Total distance: there and back.'},
      {math:`frac(${2*t.d}, ${t.total}) = ${dec(average)}`,note:`Total time: the trip ends at ${plural(t.total,'hour')}. Divide the total distance by the total time.`}],
     verify:{op:'value',expr:`(2*${t.d})/${t.total}`,equals:'ANSWER'}};
   }
  }},
  {name:'Minutes on the time axis',make(rng){
   for(;;){
    const [name,verb,their]=rng.pick([['Aoife','cycles','her'],['Cian','cycles','his'],['Maeve','cycles','her'],['Dara','cycles','his']]),first=rng.pick([10,15,20,30]),rest=rng.pick([5,10,15]),second=rng.pick([10,15,20,30]);
    const v1=rng.pick([12,15,18,24]),v2=rng.pick([12,15,18,24]),d1=v1*first/60,d2=v2*second/60;
    if(!Number.isInteger(d1)||!Number.isInteger(d2)||v1===v2)continue;
    const points=[[0,0],[first,d1],[first+rest,d1],[first+rest+second,d1+d2]],total=first+rest+second,far=d1+d2;
    const figure=K.journeyFigure({points,xLabel:'Time (minutes)',yLabel:'Distance from home (km)',xStep:total>60?10:5,yStep:far<=8?1:2});
    const intro=`The graph shows how ${name} ${verb} from home to ${rng.pick(PLACES)}, with a rest on the way.`;
    const part=rng.pick(['first','last']),[minutes,km,v]=part==='first'?[first,d1,v1]:[second,d2,v2];
    return {
     prompt:`${intro} Find ${their} speed, in km/h, on the ${part} part of the journey.`,figure,
     answer:{type:'number',value:String(v),unit:'km/h'},
     mistakes:[
      {value:qStr(Q(km,minutes)),why:`That is in km per minute. There are 60 minutes in an hour, so multiply by 60.`},
      {value:qStr(Q(far*60,total)),why:`That is the average speed for the whole journey. Use only the ${part} part of the graph: ${km} km in ${minutes} minutes.`},
      {value:String(part==='first'?v2:v1),why:`That is the speed on the other moving part. The ${part} part covers ${km} km in ${minutes} minutes.`}],
     hint:`Read the distance and the time for the ${part} sloping part. Change the minutes into hours before you divide.`,
     steps:[
      {note:part==='first'?`The first sloping part goes from 0 km to ${d1} km in ${first} minutes.`:`The last sloping part goes from ${d1} km to ${far} km, which is ${d2} km, between ${first+rest} and ${total} minutes, which is ${second} minutes.`},
      {math:`${minutes} * ${60/minutes} = 60`,note:`${minutes} minutes fit into one hour ${60/minutes} times.`},
      {math:`${km} * ${60/minutes} = ${v}`,note:`So in one hour ${name} would cover ${60/minutes} times as far. The speed is ${v} km/h.`}],
     verify:{op:'value',expr:`${km}/(${minutes}/60)`,equals:'ANSWER'}};
   }
  }}]
});
})();
