/* Skill drills: equations and their uses. Each level's make(rng) returns one question. */
(()=>{
'use strict';
const K=SkillKit,{terms,linear,quadratic,fmt,Q,qStr,qDiv,signed}=K;
const FLIP={'<':'>','>':'<','<=':'>=','>=':'<='},OPS=['<','>','<=','>='];
const NAMES=['Aoife','Sean','Emma','Conor','Niamh','Liam','Sara','Tom','Mia','Adam'];
const undo=b=>b>0?`Subtract ${b} from`:`Add ${-b} to`;
const cf=(a,letter='x')=>terms([[a,letter]]);
/* A fraction with its minus sign in front: -frac(5, 2). */
const nf=q=>terms([[q,'']]);
const lcm=(a,b)=>Math.abs(a*b)/K.gcd(a,b);
/* Keeps the predicted wrong numbers that differ from the right answer and from each other. */
function wrongs(right,list){
 const seen=[String(right)];
 return list.filter(m=>{const v=String(m.value);if(seen.some(s=>K.sameValue(s,v)))return false;seen.push(v);return true});
}
/* The solution of a linear equation written in the kit's notation, or null if it is not linear in x. */
function solveLinear(equation){
 const [left,right]=equation.split('='),p=K.poly(`(${left}) - (${right})`),a=p.get('x'),b=p.get('')||Q(0);
 if(!a||[...p.keys()].some(k=>k!=='x'&&k!==''))return null;
 return qStr(qDiv(Q(-b.n,b.d),a));
}

/* ---------- Inequalities ---------- */
K.define({
 id:'inequalities',
 title:'Solve a linear inequality',
 strand:'Algebra',
 lesson:'01-09',
 blurb:'Solve it like an equation, but reverse the sign when you multiply or divide by a negative.',
 levels:[
  {name:'Positive coefficients',make(rng){
   const op=rng.pick(OPS),a=rng.int(2,rng.chance(.5)?6:9);
   if(rng.chance(.4)){
    /* x/a + b < c */
    const k=rng.nonzero(-5,8),b=rng.nonzero(-9,9),c=k+b,value=a*k,ineq=`frac(x, ${a}) ${signed(b)} ${op} ${c}`;
    return {
     prompt:'Solve the inequality.',math:ineq,
     answer:{type:'inequality',variable:'x',op,value:String(value)},
     mistakes:wrongs(value,[
      {value:String((c+b)*a),why:`To undo \`${signed(b)}\` do the opposite: ${undo(b).toLowerCase()} both sides.`},
      {value:qStr(Q(k,a)),why:`\`frac(x, ${a})\` means x divided by ${a}. To undo a division, multiply both sides by ${a}.`},
      {value:String(k),why:`You found \`frac(x, ${a})\`. One more move: multiply both sides by ${a}.`}]),
     hint:`Work as you would with an equation. Undo \`${signed(b)}\` first, then undo the division by ${a}.`,
     steps:[
      {math:ineq,note:'Solve it like an equation: do the same thing to both sides.'},
      {math:`frac(x, ${a}) ${op} ${k}`,note:`${undo(b)} both sides.`},
      {math:`x ${op} ${value}`,note:`Multiply both sides by ${a}. ${a} is positive, so the sign stays the same.`}],
     verify:{op:'inequality',ineq:`x/${a} + (${b}) ${op} ${c}`,variable:'x'}
    };
   }
   const x=rng.nonzero(-6,9),b=rng.nonzero(-12,12),c=a*x+b,ineq=`${linear(a,'x',b)} ${op} ${c}`;
   return {
    prompt:'Solve the inequality.',math:ineq,
    answer:{type:'inequality',variable:'x',op,value:String(x)},
    mistakes:wrongs(x,[
     {value:qStr(Q(c+b,a)),why:`To undo \`${signed(b)}\` do the opposite: ${undo(b).toLowerCase()} both sides.`},
     {value:String(c-b),why:`You found \`${a}x\`. One more move: divide both sides by ${a}.`}]),
    hint:`Work as you would with an equation. Undo \`${signed(b)}\` first, then divide by ${a}.`,
    steps:[
     {math:ineq,note:'Solve it like an equation: do the same thing to both sides.'},
     {math:`${a}x ${op} ${c-b}`,note:`${undo(b)} both sides.`},
     {math:`x ${op} ${x}`,note:`Divide both sides by ${a}. ${a} is positive, so the sign stays the same.`}],
    verify:{op:'inequality',ineq:`${a}*x + (${b}) ${op} ${c}`,variable:'x'}
   };
  }},
  {name:'Negative coefficients',make(rng){
   for(;;){
    const op=rng.pick(OPS),flip=FLIP[op],x=rng.nonzero(-7,8),form=rng.pick(['negative','reversed','both sides']);
    /* A whole number inside the answer, used to test it. */
    const t=flip.includes('<')?x-1:x+1,sub=(n,v)=>n===1?String(v):`${n}(${v})`;
    if(form==='both sides'){
     /* ax + b < cx + d with a < c */
     const a=rng.int(1,4),c=a+rng.int(1,4),k=a-c,b=rng.nonzero(-10,10),d=k*x+b;
     if(d===0)continue;
     const ineq=`${linear(a,'x',b)} ${op} ${linear(c,'x',d)}`;
     return {
      prompt:'Solve the inequality.',math:ineq,
      answer:{type:'inequality',variable:'x',op:flip,value:String(x)},
      mistakes:wrongs(x,[
       {value:String(-x),why:`After collecting, the x term is \`${cf(k)}\`. Divide by ${k}, not by ${-k}, and reverse the sign.`},
       {value:qStr(Q(d-b,a+c)),why:`Subtract \`${cf(c)}\` from both sides to collect the x terms. That leaves \`${cf(k)}\` on the left.`}]),
      hint:`Collect the x terms on the left. If the number in front of x is negative, the sign reverses when you divide.`,
      steps:[
       {math:ineq,note:'Collect the x terms on one side first.'},
       {math:`${linear(k,'x',b)} ${op} ${d}`,note:`Subtract \`${cf(c)}\` from both sides.`},
       {math:`${cf(k)} ${op} ${d-b}`,note:`${undo(b)} both sides.`},
       {math:`x ${flip} ${x}`,note:`Divide both sides by ${k}. Dividing by a negative number reverses the sign.`},
       {math:`${sub(a,t)} ${signed(b)} = ${a*t+b} and ${sub(c,t)} ${signed(d)} = ${c*t+d}`,note:`Check with \`x = ${t}\`, a value in the answer: \`${a*t+b} ${op} ${c*t+d}\` is true.`}],
      verify:{op:'inequality',ineq:`${a}*x + (${b}) ${op} ${c}*x + (${d})`,variable:'x'}
     };
    }
    /* -ax + b < c, or b - ax < c */
    const a=rng.int(2,7),b=form==='reversed'?rng.int(1,15):rng.nonzero(-10,10),c=-a*x+b;
    const ineq=form==='reversed'?`${b} - ${a}x ${op} ${c}`:`${linear(-a,'x',b)} ${op} ${c}`;
    return {
     prompt:'Solve the inequality.',math:ineq,
     answer:{type:'inequality',variable:'x',op:flip,value:String(x)},
     mistakes:wrongs(x,[
      {value:String(-x),why:`The x term is \`-${a}x\`, so divide by -${a}, not by ${a}. Then reverse the sign.`},
      {value:qStr(Q(c+b,-a)),why:`To undo the ${Math.abs(b)}, do the opposite: ${undo(b).toLowerCase()} both sides.`},
      {value:String(c-b),why:`You found \`-${a}x\`. Divide both sides by -${a} and reverse the sign.`}]),
     hint:`Get \`-${a}x\` on its own first. When you divide by -${a}, the inequality sign turns around.`,
     steps:[
      {math:ineq,note:form==='reversed'?`The x term is \`-${a}x\`. Keep its minus sign with it.`:'Get the x term on its own first.'},
      {math:`-${a}x ${op} ${c-b}`,note:`${undo(b)} both sides.`},
      {math:`x ${flip} ${x}`,note:`Divide both sides by -${a}. Dividing by a negative number reverses the sign.`},
      {math:form==='reversed'?`${b} - ${a}(${t}) = ${b-a*t}`:`-${a}(${t}) ${signed(b)} = ${b-a*t}`,note:`Check with \`x = ${t}\`, a value in the answer: \`${b-a*t} ${op} ${c}\` is true.`}],
     verify:{op:'inequality',ineq:`(${-a})*x + (${b}) ${op} ${c}`,variable:'x'}
    };
   }
  }},
  {name:'Exam style',make(rng){
   for(;;){
    const kind=rng.pick(['brackets','whole number','whole number','context']),op=rng.pick(OPS),flip=FLIP[op];
    if(kind==='brackets'){
     /* a(x + b) < c(x + d) with a < c, so the x term is negative after collecting */
     const a=rng.int(2,5),c=a+rng.int(1,4),b=rng.nonzero(-6,6),d=rng.nonzero(-6,6),k=a-c,rhs=c*d-a*b;
     if(rhs===0)continue;
     const solution=Q(rhs,k);
     if(solution.d>4||Math.abs(solution.n)>30)continue;
     const ineq=`${a}(${linear(1,'x',b)}) ${op} ${c}(${linear(1,'x',d)})`;
     return {
      prompt:'Solve the inequality. Give a fraction in its simplest form if the answer is not a whole number.',math:ineq,
      answer:{type:'inequality',variable:'x',op:flip,value:qStr(solution),simplest:true},
      mistakes:wrongs(qStr(solution),[
       {value:qStr(Q(rhs,-k)),why:`After collecting, the x term is \`${cf(k)}\`. Divide by ${k}, not by ${-k}, and reverse the sign.`},
       {value:qStr(Q(d-b,k)),why:`Multiply every term in each bracket: \`${a}(${linear(1,'x',b)}) = ${linear(a,'x',a*b)}\`.`}]),
      hint:'Multiply out the brackets and collect the x terms on one side. Watch the sign when you divide by a negative number.',
      steps:[
       {math:ineq,note:'Multiply out both brackets first.'},
       {math:`${linear(a,'x',a*b)} ${op} ${linear(c,'x',c*d)}`,note:'Each number outside multiplies every term inside its bracket.'},
       {math:`${linear(k,'x',a*b)} ${op} ${c*d}`,note:`Subtract \`${c}x\` from both sides.`},
       {math:`${cf(k)} ${op} ${rhs}`,note:`${undo(a*b)} both sides.`},
       {math:`x ${flip} ${nf(solution)}`,note:`Divide both sides by ${k}. Dividing by a negative number reverses the sign.`}],
      verify:{op:'inequality',ineq:`${a}*(x + (${b})) ${op} ${c}*(x + (${d}))`,variable:'x'}
     };
    }
    if(kind==='whole number'){
     /* b - ax < c or ax + b < c, then the greatest or smallest whole number in the answer */
     const a=rng.int(2,5),m=rng.int(3,48),bound=Q(m,a),size=m/a,negative=rng.chance(.6),b=rng.int(1,15);
     if(size<1.5||size>12||bound.d!==1&&rng.chance(.4))continue;
     const c=negative?b-m:m+b,final=negative?flip:op,greatest=final.includes('<');
     const ineq=negative?`${b} - ${a}x ${op} ${c}`:`${linear(a,'x',b)} ${op} ${c}`;
     const value={'<':Math.ceil(size)-1,'<=':Math.floor(size),'>':Math.floor(size)+1,'>=':Math.ceil(size)}[final];
     const strict=final.length===1,word=greatest?'greatest':'smallest',lhs=negative?`${b} - ${a}*(V)`:`${a}*(V) + ${b}`;
     const holds=v=>`${lhs.replace('V',v)} ${op} ${c}`;
     return {
      prompt:`Find the ${word} whole number x that satisfies the inequality.`,math:ineq,
      answer:{type:'number',label:'x =',value:String(value)},
      mistakes:wrongs(value,[
       ...(bound.d===1&&strict?[{value:String(m/a),why:`\`x ${final} ${m/a}\` does not include ${m/a} itself. Take the next whole number ${greatest?'below':'above'} it.`}]:[]),
       {value:String(greatest?value+1:value-1),why:`Test your number in the inequality. It has to make the statement true.`},
       {value:String(greatest?Math.floor(size)+1:Math.ceil(size)-1),why:`Check the direction of your final inequality. ${negative?`Dividing by -${a} reverses the sign.`:'Then choose a whole number on the correct side.'}`}]),
      hint:`Solve the inequality first. Then choose the ${word} whole number that fits your answer.`,
      steps:[
       {math:ineq,note:'Solve the inequality first.'},
       {math:`${negative?'-':''}${a}x ${op} ${negative?-m:m}`,note:`Subtract ${b} from both sides.`},
       {math:`x ${final} ${nf(bound)}`,note:negative?`Divide both sides by -${a}. Dividing by a negative number reverses the sign.`:`Divide both sides by ${a}.`},
       {math:`x = ${value}`,note:bound.d===1?(strict?`${m/a} itself is not included, so the ${word} whole number is ${value}.`:`${m/a} itself is included, so the ${word} whole number is ${value}.`):`\`${fmt(bound)}\` is between ${Math.floor(size)} and ${Math.ceil(size)}, so the ${word} whole number is ${value}.`}],
      verify:{op:'value',expr:`Piecewise((1, And(${holds('ANSWER')}, Not(${holds(greatest?'ANSWER + 1':'ANSWER - 1')}))), (0, True))`,equals:'1'}
     };
    }
    /* A short context that needs a whole-number answer. */
    const name=rng.pick(NAMES);
    if(rng.chance(.5)){
     const fixed=rng.int(3,6),rate=rng.int(2,4),money=rng.int(15,40),spare=money-fixed,value=Math.floor(spare/rate);
     if(value<2)continue;
     return {
      prompt:`A taxi charges €${fixed} plus €${rate} for each kilometre. ${name} has €${money}. What is the greatest whole number of kilometres ${name} can travel?`,
      answer:{type:'number',value:String(value),unit:'km'},
      mistakes:wrongs(value,[
       {value:String(value+1),why:`That many kilometres would cost €${fixed+rate*(value+1)}, which is more than €${money}. Round down.`},
       {value:String(Math.floor(money/rate)),why:`Take the fixed charge of €${fixed} away first. Only €${spare} is left for the kilometres.`}]),
      hint:`Call the distance x km. The cost \`${fixed} + ${rate}x\` must be less than or equal to ${money}.`,
      steps:[
       {math:`${fixed} + ${rate}x <= ${money}`,note:`For x kilometres the cost is the fixed €${fixed} plus €${rate} for each one. It cannot be more than €${money}.`},
       {math:`${rate}x <= ${spare}`,note:`Subtract ${fixed} from both sides.`},
       {math:`x <= ${fmt(Q(spare,rate))}`,note:`Divide both sides by ${rate}.`},
       {math:`x = ${value}`,note:`${spare%rate?`\`${fmt(Q(spare,rate))}\` is between ${Math.floor(spare/rate)} and ${Math.ceil(spare/rate)}. `:''}The greatest whole number that fits is ${value}. Check: \`${fixed} + ${rate}(${value}) = ${fixed+rate*value}\`.`}],
      verify:{op:'value',expr:`Piecewise((1, And(${fixed} + ${rate}*(ANSWER) <= ${money}, Not(${fixed} + ${rate}*(ANSWER + 1) <= ${money}))), (0, True))`,equals:'1'}
     };
    }
    const saved=rng.int(10,60),weekly=rng.int(4,12),target=rng.int(90,200),need=target-saved,value=Math.floor(need/weekly)+1;
    return {
     prompt:`${name} has €${saved} saved and saves €${weekly} every week. What is the smallest number of weeks after which ${name} has more than €${target}?`,
     answer:{type:'number',value:String(value),unit:'weeks'},
     mistakes:wrongs(value,[
      {value:String(value-1),why:`After that many weeks the total is €${saved+weekly*(value-1)}, which is not more than €${target}. One more week is needed.`},
      {value:String(Math.floor(target/weekly)+1),why:`${name} already has €${saved}. Only €${need} more has to be saved.`}]),
     hint:`Call the number of weeks x. The savings \`${saved} + ${weekly}x\` must be greater than ${target}.`,
     steps:[
      {math:`${saved} + ${weekly}x > ${target}`,note:`After x weeks the savings are €${saved} plus €${weekly} for each week. They must be more than €${target}.`},
      {math:`${weekly}x > ${need}`,note:`Subtract ${saved} from both sides.`},
      {math:`x > ${fmt(Q(need,weekly))}`,note:`Divide both sides by ${weekly}.`},
      {math:`x = ${value}`,note:`${need%weekly?`\`${fmt(Q(need,weekly))}\` is between ${Math.floor(need/weekly)} and ${Math.ceil(need/weekly)}. `:`${need/weekly} weeks give exactly €${target}, which is not more than €${target}. `}The smallest whole number that fits is ${value}. Check: \`${saved} + ${weekly}(${value}) = ${saved+weekly*value}\`.`}],
     verify:{op:'value',expr:`Piecewise((1, And(${saved} + ${weekly}*(ANSWER) > ${target}, Not(${saved} + ${weekly}*(ANSWER - 1) > ${target}))), (0, True))`,equals:'1'}
    };
   }
  }}
 ]
});

/* ---------- Simultaneous equations ---------- */
const eqText=([a,b,e])=>`${terms([[a,'x'],[b,'y']])} = ${e}`;
const side=([a,b],x,y)=>`${a===1?'':a===-1?'-':a}(${x}) ${b<0?'-':'+'} ${Math.abs(b)===1?'':Math.abs(b)}(${y})`;
/* The cheapest way to make one letter match: which letter (0 for x, 1 for y) and the two multipliers. */
function plan(E1,E2){
 const [forY,forX]=[1,0].map(i=>{const l=lcm(E1[i],E2[i]);return {i,m1:l/Math.abs(E1[i]),m2:l/Math.abs(E2[i])}});
 return forY.m1*forY.m2<=forX.m1*forX.m2?forY:forX;
}
/* Worked elimination for a1x + b1y = e1 and a2x + b2y = e2 with solution (x, y). */
function eliminate(E1,E2,x,y,{check=true,intro=false}={}){
 const {i,m1,m2}=plan(E1,E2),S1=E1.map(v=>v*m1),S2=E2.map(v=>v*m2),add=S1[i]+S2[i]===0;
 let R=S1.map((v,j)=>add?v+S2[j]:v-S2[j]),how=add?'Add the two equations':'Subtract the second equation from the first';
 if(!add&&R[1-i]<0){R=R.map(v=>-v);how='Subtract the first equation from the second'}
 const gone='xy'[i],kept='xy'[1-i],coef=R[1-i],keptValue=i?x:y,goneValue=i?y:x,steps=[];
 if(m1*m2===1)steps.push({math:`${eqText(E1)} and ${eqText(E2)}`,note:`${intro?'Write one equation for each sentence. ':''}The ${gone} terms are ${add?'opposite, so adding':'the same, so subtracting'} the equations removes ${gone}.`});
 else{
  if(intro)steps.push({math:`${eqText(E1)} and ${eqText(E2)}`,note:'Write one equation for each sentence.'});
  steps.push({math:`${eqText(S1)} and ${eqText(S2)}`,note:(m1>1&&m2>1?`Multiply the first equation by ${m1} and the second by ${m2}.`:`Multiply the ${m1>1?'first':'second'} equation by ${Math.max(m1,m2)}.`)+` Now the ${gone} terms ${add?'are opposite':'are the same'}.`});
 }
 /* When a negative is subtracted, show the two subtractions. */
 const [top,under]=how.endsWith('from the second')?[S2,S1]:[S1,S2],br=t=>t.startsWith('-')?`(${t})`:t;
 const detail=!add&&(under[1-i]<0||under[2]<0)?` Take care with the signs: \`${cf(top[1-i],kept)} - ${br(cf(under[1-i],kept))} = ${cf(coef,kept)}\` and \`${top[2]} - ${K.bracket(under[2])} = ${R[2]}\`.`:'';
 steps.push({math:`${cf(coef,kept)} = ${R[2]}`,note:`${how}. The ${gone} terms cancel.${detail}`});
 if(coef!==1)steps.push({math:`${kept} = ${keptValue}`,note:`Divide both sides by ${coef}.`});
 const [a,b,e]=E1,known=i?a*x:b*y,left=i?b:a,size=Math.abs(b)===1?'':Math.abs(b);
 const put=i?`${a===1?(x<0?`(${x})`:x):a===-1?`-(${x})`:`${a}(${x})`} ${b<0?'-':'+'} ${size}y`:`${cf(a,'x')} ${b<0?'-':'+'} ${size}(${y})`;
 const worked=`${i?terms([[a*x,''],[b,'y']]):terms([[a,'x'],[b*y,'']])} = ${e}`;
 steps.push({math:`${put} = ${e}`,note:`Put \`${kept} = ${keptValue}\` into the first equation.`});
 if(worked!==`${put} = ${e}`)steps.push({math:worked,note:'Work out the multiplication.'});
 if(left!==1){steps.push({math:`${cf(left,gone)} = ${e-known}`,note:`${undo(known)} both sides.`});steps.push({math:`${gone} = ${goneValue}`,note:`Divide both sides by ${left}.`})}
 else steps.push({math:`${gone} = ${goneValue}`,note:`${undo(known)} both sides.`});
 if(check)steps.push({math:`${side(E2,x,y)} = ${E2[2]}`,note:'Check: both values also fit the second equation.'});
 return {steps,gone,add,m1,m2};
}
const system=(E1,E2)=>({op:'system',eqs:[E1,E2].map(([a,b,e])=>`(${a})*x + (${b})*y = ${e}`),solution:{x:'ANSWER0',y:'ANSWER1'}});
function simultaneous(E1,E2,x,y,hint){
 const work=eliminate(E1,E2,x,y);
 return {
  prompt:'Solve the simultaneous equations.',math:`${eqText(E1)} and ${eqText(E2)}`,
  answer:{type:'fields',fields:[{label:'x =',value:String(x)},{label:'y =',value:String(y)}]},
  mistakes:[
   ...(x!==y?[{value:[String(y),String(x)],why:'These are the right numbers in the wrong boxes. Check which letter each value belongs to.'}]:[]),
   {value:[String(x),String(-y)],why:'Your x is right. Check the sign of y: put both values into the second equation and see if it balances.'},
   {value:[String(-x),String(y)],why:'Your y is right. Check the sign of x: put both values into the first equation and see if it balances.'}],
  hint:hint(work),steps:work.steps,verify:system(E1,E2)
 };
}
/* Fills in the right-hand sides and rejects systems with no single answer or large numbers. */
function finish(E1,E2,x,y,limit,tidy=true){
 if(E1[0]*E2[1]-E2[0]*E1[1]===0)return false;
 if(tidy&&(K.gcd(E1[0],E1[1])>1||K.gcd(E2[0],E2[1])>1))return false;
 E1[2]=E1[0]*x+E1[1]*y;E2[2]=E2[0]*x+E2[1]*y;
 return E1[2]!==0&&E2[2]!==0&&Math.abs(E1[2])<=limit&&Math.abs(E2[2])<=limit;
}
K.define({
 id:'simultaneous-equations',
 title:'Solve simultaneous equations',
 strand:'Algebra',
 lesson:'10-01',
 blurb:'Make one letter cancel by adding or subtracting the equations, then find the other.',
 levels:[
  {name:'Add or subtract',make(rng){
   for(;;){
    /* Half the questions use positive numbers only, apart from the term that cancels. */
    const gentle=rng.chance(.5),x=gentle?rng.int(1,6):rng.nonzero(-4,6),y=gentle?rng.int(1,6):rng.nonzero(-4,6),kind=rng.pick(['add y','subtract y','subtract x']);
    let E1,E2;
    if(kind==='add y'){const b=rng.int(1,3);E1=[rng.int(1,4),b];E2=[rng.int(1,4),-b];if(rng.chance(.5))[E1,E2]=[E2,E1]}
    else if(kind==='subtract y'){const b=rng.int(1,3)*(gentle?1:rng.sign());E1=[rng.int(1,5),b];E2=[rng.int(1,5),b]}
    else{const a=rng.int(1,4);E1=[a,gentle?rng.int(1,4):rng.nonzero(-3,4)];E2=[a,gentle?rng.int(1,4):rng.nonzero(-3,4)]}
    if(!finish(E1,E2,x,y,40)||gentle&&(E1[2]<0||E2[2]<0))continue;
    const p=plan(E1,E2);if(p.m1*p.m2!==1)continue;
    return simultaneous(E1,E2,x,y,work=>`Compare the ${work.gone} terms. Terms that are the same cancel when you subtract. Opposite terms cancel when you add.`);
   }
  }},
  {name:'Multiply one equation',make(rng){
   for(;;){
    const x=rng.nonzero(-4,6),y=rng.nonzero(-4,6),m=rng.int(2,4);
    let small,big;
    if(rng.chance(.6)){const b=rng.int(1,3)*rng.sign();small=[rng.int(1,5),b];big=[rng.int(1,5),b*m*rng.sign()]}
    else{const a=rng.int(1,3);small=[a,rng.nonzero(-4,4)];big=[a*m,rng.nonzero(-5,5)]}
    const [E1,E2]=rng.chance(.5)?[small,big]:[big,small];
    if(!finish(E1,E2,x,y,50))continue;
    const p=plan(E1,E2);if((p.m1===1)===(p.m2===1)||p.m1*p.m2>4)continue;
    return simultaneous(E1,E2,x,y,work=>`Multiply the ${work.m1>1?'first':'second'} equation by ${Math.max(work.m1,work.m2)} so that the ${work.gone} terms ${work.add?'are opposite. Then add the equations':'are the same. Then subtract'}. Remember to multiply every term.`);
   }
  }},
  {name:'Exam style',make(rng){
   const PAIRS=[[2,3],[2,5],[3,4],[3,5],[4,5]];
   for(;;){
    if(rng.chance(.4)){
     /* Two prices. */
     const [place,A,As,B,Bs,xr,yr]=rng.pick([['At a cinema','adult ticket','adult tickets','child ticket','child tickets',[8,13],[4,7]],['In a café','pizza','pizzas','drink','drinks',[8,12],[2,4]],['In a sports shop','T-shirt','T-shirts','cap','caps',[10,16],[5,9]],['At a diner','burger','burgers','milkshake','milkshakes',[6,9],[3,5]]]);
     const x=rng.int(...xr),y=rng.int(...yr),E1=[rng.int(1,4),rng.int(1,4)],E2=[rng.int(1,4),rng.int(1,4)];
     if(x<=y||!finish(E1,E2,x,y,99,false))continue;
     const p=plan(E1,E2);if(p.m1*p.m2>6||p.m1*p.m2===1)continue;
     const n=(count,one,many)=>`${count} ${count===1?one:many}`,work=eliminate(E1,E2,x,y,{check:false,intro:true});
     return {
      prompt:`${place}, ${n(E1[0],A,As)} and ${n(E1[1],B,Bs)} cost €${E1[2]}. ${n(E2[0],A,As)} and ${n(E2[1],B,Bs)} cost €${E2[2]}. Let x be the price of one ${A} and y the price of one ${B}, in euro. Find x and y.`,
      answer:{type:'fields',fields:[{label:'x =',value:String(x)},{label:'y =',value:String(y)}]},
      mistakes:[{value:[String(y),String(x)],why:`These are the right prices in the wrong boxes. x is the price of one ${A}.`}],
      hint:'Write one equation for each sentence. Then make one letter cancel.',
      steps:work.steps,verify:system(E1,E2)
     };
    }
    const x=rng.nonzero(-4,5),y=rng.nonzero(-4,5),[a,c]=rng.shuffle(rng.pick(PAIRS)),[b,d]=rng.shuffle(rng.pick(PAIRS));
    const E1=[a,b*rng.sign()],E2=[c,d*rng.sign()];
    if(!finish(E1,E2,x,y,60))continue;
    return simultaneous(E1,E2,x,y,work=>`No letter matches yet. Multiply the first equation by ${work.m1} and the second by ${work.m2} so that the ${work.gone} terms ${work.add?'are opposite':'are the same'}.`);
   }
  }}
 ]
});

/* ---------- Words into equations ---------- */
/* A typed-number word problem. sol says how the answer relates to x in the claim. */
const word=({prompt,value,label,unit,mistakes,hint,steps,eq,sol='ANSWER'})=>({
 prompt,answer:{type:'number',value:String(value),...(label?{label}:{}),...(unit?{unit}:{})},
 mistakes:wrongs(value,mistakes),hint,steps,verify:{op:'solve',eq,variable:'x',solutions:[sol]}});
K.define({
 id:'words-to-equations',
 title:'Words into equations',
 strand:'Algebra',
 lesson:'01-06',
 blurb:'Call the unknown x, write the sentence as an equation, then solve it.',
 levels:[
  {name:'Choose the equation',make(rng){
   for(;;){
    const [name,other]=rng.shuffle(NAMES),kind=rng.pick(['multiply then add','add then multiply','ages','perimeter']);
    let prompt,right,wrong,eq,hint,steps;
    if(kind==='multiply then add'){
     const x=rng.int(2,12),a=rng.int(2,6),b=rng.int(1,9),minus=rng.chance(.4),c=a*x+(minus?-b:b),s=minus?'-':'+',verb=minus?'subtract':'add';
     if(c<=0)continue;
     prompt=`${name} thinks of a number x, multiplies it by ${a} and then ${verb}s ${b}. The result is ${c}. Which equation says this?`;
     right=`${a}x ${s} ${b} = ${c}`;
     wrong=[
      {math:`${a}(x ${s} ${b}) = ${c}`,why:`The bracket means ${verb} ${b} first and then multiply. The sentence multiplies first.`},
      {math:`x + ${a} ${s} ${b} = ${c}`,why:`"Multiplies it by ${a}" is \`${a}x\`, not \`x + ${a}\`.`},
      {math:`${a}x = ${c} ${s} ${b}`,why:`Moving the ${b} across changes its sign. The sentence gives \`${a}x ${s} ${b} = ${c}\`, which is the same as \`${a}x = ${c} ${minus?'+':'-'} ${b}\`.`}];
     eq=`${a}*x ${s} ${b} = ${c}`;
     hint=`Follow the order of the sentence: write "x multiplied by ${a}" first, then ${verb} ${b}.`;
     steps=[{math:`${a}x`,note:`The number multiplied by ${a}.`},{math:`${a}x ${s} ${b}`,note:`Then ${verb} ${b}.`},{math:right,note:`The result is ${c}, so the expression equals ${c}.`}];
    }else if(kind==='add then multiply'){
     const x=rng.int(2,12),a=rng.int(2,6),b=rng.int(1,9),c=a*(x+b);
     prompt=`${name} thinks of a number x, adds ${b} and then multiplies the result by ${a}. The answer is ${c}. Which equation says this?`;
     right=`${a}(x + ${b}) = ${c}`;
     wrong=[
      {math:`${a}x + ${b} = ${c}`,why:`This multiplies only x by ${a}. The ${b} was added before multiplying, so \`x + ${b}\` needs a bracket.`},
      {math:`x + ${b} + ${a} = ${c}`,why:`"Multiplies the result by ${a}" means ${a} times all of \`x + ${b}\`, not adding ${a}.`},
      {math:`frac(x + ${b}, ${a}) = ${c}`,why:`This divides by ${a}. The sentence multiplies by ${a}.`}];
     eq=`${a}*(x + ${b}) = ${c}`;
     hint=`The adding happens first. Use a bracket so that ${a} multiplies the whole result.`;
     steps=[{math:`x + ${b}`,note:`The number with ${b} added.`},{math:`${a}(x + ${b})`,note:`Multiply the whole result by ${a}. The bracket keeps \`x + ${b}\` together.`},{math:right,note:`The answer is ${c}, so the expression equals ${c}.`}];
    }else if(kind==='ages'){
     const x=rng.int(5,14),k=rng.int(2,9),S=2*x+k;
     prompt=`${name} is x years old. ${other} is ${k} years older than ${name}. The sum of their ages is ${S}. Which equation says this?`;
     right=`x + (x + ${k}) = ${S}`;
     wrong=[
      {math:`x + ${k} = ${S}`,why:`\`x + ${k}\` is only the age of ${other}. The sum needs the age of ${name} as well.`},
      {math:`x + ${k}x = ${S}`,why:`"${k} years older" means add ${k}. \`${k}x\` would mean ${k} times as old.`},
      {math:`x + (x - ${k}) = ${S}`,why:`${other} is older, so that age is \`x + ${k}\`, not \`x - ${k}\`.`}];
     eq=`x + (x + ${k}) = ${S}`;
     hint=`Write the age of ${other} using x first. Then add the two ages.`;
     steps=[{math:`x + ${k}`,note:`The age of ${other}: ${k} more than x.`},{math:right,note:`Add the two ages. The sum is ${S}.`}];
    }else{
     const x=rng.int(3,12),d=rng.int(2,8),P=4*x+2*d;
     if(x*(x+d)===P)continue;
     prompt=`A rectangle is x cm wide. Its length is ${d} cm more than its width. The perimeter is ${P} cm. Which equation says this?`;
     right=`2x + 2(x + ${d}) = ${P}`;
     wrong=[
      {math:`x + (x + ${d}) = ${P}`,why:'That adds only one width and one length. The perimeter goes around all four sides.'},
      {math:`x(x + ${d}) = ${P}`,why:'Width times length gives the area. The perimeter adds the four sides.'},
      {math:`2x + ${d} = ${P}`,why:`Each length is \`x + ${d}\`, and there are two of them.`}];
     eq=`2*x + 2*(x + ${d}) = ${P}`;
     hint='Write the length using x. Then add two widths and two lengths.';
     steps=[{math:`x + ${d}`,note:`The length is ${d} cm more than the width.`},{math:right,note:`Two widths and two lengths make the perimeter of ${P} cm.`}];
    }
    const options=[{math:right,correct:true},...wrong].map(o=>{const value=solveLinear(o.math);return value===null?o:{...o,value}});
    const values=options.filter(o=>'value' in o).map(o=>o.value);
    if(new Set(values).size!==values.length)continue;
    return {prompt,answer:{type:'choice',options},hint,steps,verify:{op:'solve',eq,variable:'x',solutions:['ANSWER']}};
   }
  }},
  {name:'Write and solve',make(rng){
   for(;;){
    const [name,other]=rng.shuffle(NAMES),kind=rng.pick(['number','consecutive','ages','perimeter']);
    if(kind==='number'){
     const x=rng.int(2,12),a=rng.int(2,6),b=rng.int(1,12),minus=rng.chance(.5),c=a*x+(minus?-b:b),s=minus?'-':'+',verb=minus?'subtract':'add';
     if(c<=0)continue;
     return word({
      prompt:`${name} thinks of a number, multiplies it by ${a} and then ${verb}s ${b}. The result is ${c}. What number did ${name} think of?`,
      value:x,hint:'Call the number x. Write what was done to it as an equation, then solve the equation.',
      steps:[
       {math:`${a}x ${s} ${b} = ${c}`,note:'Call the number x and follow the sentence.'},
       {math:`${a}x = ${minus?c+b:c-b}`,note:`${minus?'Add '+b+' to':'Subtract '+b+' from'} both sides.`},
       {math:`x = ${x}`,note:`Divide both sides by ${a}.`},
       {math:`${a}(${x}) ${s} ${b} = ${c}`,note:'Check: the number gives the right result.'}],
      mistakes:[
       {value:qStr(Q(minus?c-b:c+b,a)),why:`To undo "${verb} ${b}", do the opposite to both sides.`},
       {value:String(minus?c+b:c-b),why:`That is \`${a}x\`. Divide by ${a} to find the number.`}],
      eq:`${a}*x ${s} ${b} = ${c}`});
    }
    if(kind==='consecutive'){
     const x=rng.int(3,30),S=3*x+3,ask=rng.pick(['smallest','largest']);
     return word({
      prompt:`The sum of three consecutive whole numbers is ${S}. Find the ${ask} of the three numbers.`,
      value:ask==='smallest'?x:x+2,hint:'Call the smallest number x. The next two are `x + 1` and `x + 2`.',
      steps:[
       {math:`x + (x + 1) + (x + 2) = ${S}`,note:'Call the smallest number x. The next two are `x + 1` and `x + 2`.'},
       {math:`3x + 3 = ${S}`,note:'Collect like terms.'},
       {math:`x = ${x}`,note:'Subtract 3 from both sides, then divide by 3.'},
       {math:`${x} + ${x+1} + ${x+2} = ${S}`,note:`Check the sum. The numbers are ${x}, ${x+1} and ${x+2}, so the ${ask} is ${ask==='smallest'?x:x+2}.`}],
      mistakes:[
       {value:String(x+1),why:`That is the middle number. The question asks for the ${ask}.`},
       {value:String(ask==='smallest'?x+2:x),why:`That is the ${ask==='smallest'?'largest':'smallest'} number. The question asks for the ${ask}.`}],
      eq:`x + (x + 1) + (x + 2) = ${S}`,sol:ask==='smallest'?'ANSWER':'ANSWER - 2'});
    }
    if(kind==='ages'){
     const x=rng.int(4,15),k=rng.int(2,9),S=2*x+k,older=rng.chance(.4);
     return word({
      prompt:`${other} is ${k} years older than ${name}. The sum of their ages is ${S}. How old is ${older?other:name}?`,
      value:older?x+k:x,unit:'years',hint:`Call the age of ${name} x. Then the age of ${other} is \`x + ${k}\`.`,
      steps:[
       {math:`x + (x + ${k}) = ${S}`,note:`Call the age of ${name} x. Then the age of ${other} is \`x + ${k}\`.`},
       {math:`2x + ${k} = ${S}`,note:'Collect like terms.'},
       {math:`2x = ${S-k}`,note:`Subtract ${k} from both sides.`},
       {math:`x = ${x}`,note:`Divide both sides by 2. ${name} is ${x}${older?` and ${other} is ${x+k}`:''}.`}],
      mistakes:[
       {value:String(older?x:x+k),why:`That is the age of ${older?name:other}. The question asks about ${older?other:name}.`},
       {value:qStr(Q(S,2)),why:`Halving the sum would make them the same age. ${other} is ${k} years older.`},
       {value:String(S-k),why:`That is twice the age of ${name}. Divide it by 2.`}],
      eq:`x + (x + ${k}) = ${S}`,sol:older?`ANSWER - ${k}`:'ANSWER'});
    }
    const x=rng.int(3,14),d=rng.int(2,9),P=4*x+2*d,length=rng.chance(.4);
    return word({
     prompt:`The length of a rectangle is ${d} cm more than its width. The perimeter is ${P} cm. Find the ${length?'length':'width'}.`,
     value:length?x+d:x,unit:'cm',hint:`Call the width x. The length is \`x + ${d}\`, and the perimeter adds all four sides.`,
     steps:[
      {math:`2x + 2(x + ${d}) = ${P}`,note:`Call the width x. The length is \`x + ${d}\`. Add two widths and two lengths.`},
      {math:`4x + ${2*d} = ${P}`,note:'Multiply out the bracket and collect like terms.'},
      {math:`4x = ${P-2*d}`,note:`Subtract ${2*d} from both sides.`},
      {math:`x = ${x}`,note:`Divide both sides by 4. The width is ${x} cm${length?` and the length is ${x+d} cm`:''}.`}],
     mistakes:[
      {value:String(length?x:x+d),why:`That is the ${length?'width':'length'}. The question asks for the ${length?'length':'width'}.`},
      {value:qStr(Q(P-d,2)),why:'A rectangle has two widths and two lengths. Add all four sides.'},
      {value:qStr(Q(P-d,4)),why:`There are two lengths, and each is \`x + ${d}\`. Together they give \`2x + ${2*d}\`.`}],
     eq:`2*x + 2*(x + ${d}) = ${P}`,sol:length?`ANSWER - ${d}`:'ANSWER'});
   }
  }},
  {name:'Exam style',make(rng){
   const name=rng.pick(NAMES),kind=rng.pick(['future ages','prices','odd or even']);
   if(kind==='future ages'){
    const m=rng.int(3,5),x=m===3?rng.int(10,16):m===4?rng.int(7,14):rng.int(6,11),k=rng.int(2,8),S=(m+1)*x+2*k,parent=rng.pick(['mother','father','aunt','uncle']);
    return word({
     prompt:`${name}'s ${parent} is ${m} times as old as ${name}. In ${k} years' time the sum of their ages will be ${S}. How old is ${name} now?`,
     value:x,unit:'years',hint:`Call the age of ${name} now x. In ${k} years' time each person is ${k} years older.`,
     steps:[
      {math:`(x + ${k}) + (${m}x + ${k}) = ${S}`,note:`Call the age of ${name} x, so the ${parent} is \`${m}x\`. In ${k} years each of them is ${k} years older.`},
      {math:`${m+1}x + ${2*k} = ${S}`,note:'Collect like terms.'},
      {math:`${m+1}x = ${S-2*k}`,note:`Subtract ${2*k} from both sides.`},
      {math:`x = ${x}`,note:`Divide both sides by ${m+1}.`},
      {math:`${x+k} + ${m*x+k} = ${S}`,note:`Check: in ${k} years they are ${x+k} and ${m*x+k}.`}],
     mistakes:[
      {value:qStr(Q(S-k,m+1)),why:`Both people are ${k} years older, so ${k} is added twice.`},
      {value:qStr(Q(S,m+1)),why:`The sum ${S} is in ${k} years' time. Add ${k} to each age before you add the ages.`},
      {value:String(m*x),why:`That is the age of the ${parent} now. The question asks about ${name}.`}],
     eq:`(x + ${k}) + (${m}*x + ${k}) = ${S}`});
   }
   if(kind==='prices'){
    const [A,As,B,Bs]=rng.pick([['An adult ticket','adult tickets','a child ticket','child tickets'],['A large pizza','large pizzas','a small pizza','small pizzas'],['A hoodie','hoodies','a T-shirt','T-shirts']]);
    const x=rng.int(5,12),d=rng.int(2,6),p=rng.int(2,4),q=rng.int(2,5),T=p*(x+d)+q*x,dear=rng.chance(.3);
    return word({
     prompt:`${A} costs €${d} more than ${B}. ${name} pays €${T} for ${p} ${As} and ${q} ${Bs}. Find the price of ${dear?A.toLowerCase().replace('t-shirt','T-shirt'):B}.`,
     value:dear?x+d:x,label:'€',hint:`Call the price of ${B} x. Then ${A.toLowerCase()} costs \`x + ${d}\`.`,
     steps:[
      {math:`${p}(x + ${d}) + ${q}x = ${T}`,note:`Call the price of ${B} x. Then ${A.toLowerCase()} costs \`x + ${d}\`.`},
      {math:`${p}x + ${p*d} + ${q}x = ${T}`,note:'Multiply out the bracket.'},
      {math:`${p+q}x = ${T-p*d}`,note:`Collect the x terms and subtract ${p*d} from both sides.`},
      {math:`x = ${x}`,note:`Divide both sides by ${p+q}.${dear?` The dearer item costs \`${x} + ${d} = ${x+d}\` euro.`:''}`},
      {math:`${p}(${x+d}) + ${q}(${x}) = ${T}`,note:'Check the total cost.'}],
     mistakes:[
      {value:String(dear?x:x+d),why:`That is the price of ${dear?B:A.toLowerCase()}. Read which price the question asks for.`},
      {value:qStr(Q(T-d,p+q)),why:`Each of the ${p} dearer items costs €${d} more, so the bracket gives \`${p}x + ${p*d}\`.`},
      {value:qStr(Q(T,p+q)),why:`That shares the cost equally. One kind of item costs €${d} more than the other.`}],
     eq:`${p}*(x + ${d}) + ${q}*x = ${T}`,sol:dear?`ANSWER - ${d}`:'ANSWER'});
   }
   const parity=rng.pick(['even','odd']),x=2*rng.int(2,24)+(parity==='odd'?1:0),S=3*x+6,ask=rng.pick(['smallest','largest']);
   return word({
    prompt:`The sum of three consecutive ${parity} numbers is ${S}. Find the ${ask} of the three numbers.`,
    value:ask==='smallest'?x:x+4,hint:`Consecutive ${parity} numbers go up in twos. Call the smallest x, then the others are \`x + 2\` and \`x + 4\`.`,
    steps:[
     {math:`x + (x + 2) + (x + 4) = ${S}`,note:`Call the smallest number x. Consecutive ${parity} numbers go up in twos.`},
     {math:`3x + 6 = ${S}`,note:'Collect like terms.'},
     {math:`x = ${x}`,note:'Subtract 6 from both sides, then divide by 3.'},
     {math:`${x} + ${x+2} + ${x+4} = ${S}`,note:`Check the sum. The numbers are ${x}, ${x+2} and ${x+4}, so the ${ask} is ${ask==='smallest'?x:x+4}.`}],
    mistakes:[
     {value:String(x+2),why:`That is the middle number. The question asks for the ${ask}.`},
     {value:String(ask==='smallest'?x+4:x),why:`That is the ${ask==='smallest'?'largest':'smallest'} number. The question asks for the ${ask}.`},
     {value:String(ask==='smallest'?x+1:x+3),why:`Consecutive ${parity} numbers are 2 apart: \`x\`, \`x + 2\` and \`x + 4\`.`}],
    eq:`x + (x + 2) + (x + 4) = ${S}`,sol:ask==='smallest'?'ANSWER':'ANSWER - 4'});
  }}
 ]
});

/* ---------- Quadratics by factorising ---------- */
const rootsAnswer=(first,second)=>({type:'fields',unordered:true,simplest:true,fields:[{label:'x =',value:String(first)},{label:'or x =',value:String(second)}]});
/* Both orders of a wrong pair, so the message is found whichever box is filled first. */
const bothOrders=(a,b,why)=>[{value:[String(a),String(b)],why},...(String(a)===String(b)?[]:[{value:[String(b),String(a)],why}])];
/* x^2 + bx + c = 0 with whole-number roots p and q. before holds any rearranging steps. */
function monic(p,q,{equation,before=[],eq,hint,check=true}){
 const b=-(p+q),c=p*q,standard=`${quadratic(1,b,c)} = 0`,one=linear(1,'x',-p),two=linear(1,'x',-q);
 return {
  prompt:'Solve the equation.',math:equation||standard,
  answer:rootsAnswer(p,q),
  mistakes:bothOrders(-p,-q,`Those are the numbers inside the brackets. Each root has the opposite sign: \`${one} = 0\` gives \`x = ${p}\`.`),
  hint:hint||`Look for two numbers that multiply to ${c} and add to ${b}. They go into the two brackets.`,
  steps:[
   ...before,
   ...(before.length?[]:[{math:standard,note:'One side is already zero, so factorise the other side.'}]),
   {math:`(${one})(${two}) = 0`,note:`Find two numbers that multiply to ${c} and add to ${b}: they are ${-p} and ${-q}.`},
   {math:`${one} = 0 or ${two} = 0`,note:'A product is zero only when one of its factors is zero.'},
   {math:`x = ${p} or x = ${q}`,note:'Solve each small equation.'},
   ...(check?[{math:`(${p})^2 ${b<0?'-':'+'} ${Math.abs(b)===1?'':Math.abs(b)}(${p}) ${signed(c)} = 0`,note:'Check one root in the equation with zero on one side. The other root can be checked the same way.'}]:[])],
  verify:{op:'solve',eq:eq||`x^2 + (${b})*x + (${c}) = 0`,variable:'x',solutions:['ANSWER0','ANSWER1']}
 };
}
K.define({
 id:'quadratics-factorising',
 title:'Solve a quadratic by factorising',
 strand:'Algebra',
 lesson:'15-01',
 blurb:'Get zero on one side, factorise, then set each bracket equal to zero.',
 levels:[
  {name:'Ready to factorise',make(rng){
   for(;;){
    const kind=rng.pick(['both negative','both positive','mixed']);
    let p=rng.int(1,7),q=rng.int(1,7);
    if(kind==='both negative'){p=-p;q=-q}else if(kind==='mixed')q=-q;
    if(p===q||p===-q||Math.abs(p*q)>36)continue;
    return monic(p,q,{});
   }
  }},
  {name:'Rearrange first',make(rng){
   for(;;){
    const kind=rng.pick(['number on the right','x on the right','bracket','no number term']);
    if(kind==='no number term'){
     /* x^2 = kx: the roots are 0 and k */
     const k=rng.nonzero(-9,9,[1,-1]),equation=`x^2 = ${cf(k)}`,factorised=`x(${linear(1,'x',-k)}) = 0`;
     return {
      prompt:'Solve the equation.',math:equation,
      answer:rootsAnswer(0,k),
      mistakes:bothOrders(0,-k,`Check the sign: \`${linear(1,'x',-k)} = 0\` gives \`x = ${k}\`.`),
      hint:'Do not divide by x. Bring both terms to one side and take out the common factor x.',
      steps:[
       {math:equation,note:'Dividing both sides by x would lose a root. Get zero on one side instead.'},
       {math:`${terms([[1,'x^2'],[-k,'x']])} = 0`,note:`${k>0?'Subtract':'Add'} \`${cf(Math.abs(k))}\` ${k>0?'from':'to'} both sides.`},
       {math:factorised,note:'Take out the common factor x.'},
       {math:`x = 0 or ${linear(1,'x',-k)} = 0`,note:'A product is zero only when one of its factors is zero.'},
       {math:`x = 0 or x = ${k}`,note:'Solve each small equation.'}],
      verify:{op:'solve',eq:`x^2 = (${k})*x`,variable:'x',solutions:['ANSWER0','ANSWER1']}
     };
    }
    let p=rng.int(1,8),q=-rng.int(1,8);
    if(rng.chance(.25))p=-p;
    if(p===q||p===-q||Math.abs(p*q)>40)continue;
    const b=-(p+q),c=p*q,standard=`${quadratic(1,b,c)} = 0`,hint='Get zero on one side first. Then factorise and set each bracket equal to zero.';
    if(kind==='number on the right'){
     const equation=`${terms([[1,'x^2'],[b,'x']])} = ${-c}`;
     return monic(p,q,{equation,hint,eq:`x^2 + (${b})*x = ${-c}`,before:[
      {math:equation,note:'A quadratic can only be solved by factorising when one side is zero.'},
      {math:standard,note:`${undo(-c)} both sides.`}]});
    }
    if(kind==='x on the right'){
     const equation=`x^2 = ${linear(-b,'x',-c)}`;
     return monic(p,q,{equation,hint,eq:`x^2 = (${-b})*x + (${-c})`,before:[
      {math:equation,note:'A quadratic can only be solved by factorising when one side is zero.'},
      {math:standard,note:'Bring every term to the left side. Each term changes sign when it crosses over.'}]});
    }
    const equation=`x(${linear(1,'x',b)}) = ${-c}`;
    return monic(p,q,{equation,hint:'Multiply out the bracket, then get zero on one side before you factorise.',check:false,eq:`x*(x + (${b})) = ${-c}`,before:[
     {math:equation,note:`The right side is not zero, so you cannot read the roots from this bracket.`},
     {math:`${terms([[1,'x^2'],[b,'x']])} = ${-c}`,note:'Multiply out the bracket.'},
     {math:standard,note:`${undo(-c)} both sides.`}]});
   }
  }},
  {name:'Leading coefficient',make(rng){
   for(;;){
    /* (ax + m)(x + n) = 0 */
    const a=rng.pick([2,2,3,3,5,4]),m=rng.nonzero(-7,7),n=rng.nonzero(-6,6);
    if(K.gcd(a,m)!==1||m===a*n)continue;
    const b=a*n+m,c=m*n;
    if(b===0||Math.abs(c)>30)continue;
    const equation=`${quadratic(a,b,c)} = 0`,first=linear(a,'x',m),second=linear(1,'x',n),guide=`\`${a} * ${K.bracket(c)} = ${a*c}\``;
    /* Sometimes the number term starts on the right and has to be moved first. */
    const moved=rng.chance(.35),shown=moved?`${terms([[a,'x^2'],[b,'x']])} = ${-c}`:equation;
    return {
     prompt:'Solve the equation. Give any fraction in its simplest form.',math:shown,
     answer:rootsAnswer(qStr(Q(-m,a)),-n),
     mistakes:[
      ...bothOrders(-m,-n,`\`${first} = 0\` gives \`${a}x = ${-m}\`. Divide by ${a} as well to find x.`),
      ...bothOrders(qStr(Q(m,a)),n,'Check the signs. Set each bracket equal to zero and solve it.')],
     hint:`${moved?'Get zero on one side first. Then find':'Find'} two numbers that multiply to ${guide} and add to ${b}. Use them to split the middle term.`,
     steps:[
      ...(moved?[{math:shown,note:'A quadratic can only be solved by factorising when one side is zero.'}]:[]),
      {math:equation,note:`${moved?undo(-c)+' both sides. Then find':'Find'} two numbers that multiply to ${guide} and add to ${b}. They are ${a*n} and ${m}.`},
      {math:`${terms([[a,'x^2'],[a*n,'x'],[m,'x'],[c,'']])} = 0`,note:'Split the middle term using those two numbers.'},
      {math:`(${first})(${second}) = 0`,note:`Factorise in pairs: \`${a}x(${second}) ${signed(m)}(${second})\`. The bracket \`(${second})\` is common.`},
      {math:`${first} = 0 or ${second} = 0`,note:'A product is zero only when one of its factors is zero.'},
      {math:`x = ${nf(Q(-m,a))} or x = ${-n}`,note:'Solve each small equation.'}],
     verify:{op:'solve',eq:moved?`${a}*x^2 + (${b})*x = ${-c}`:`${a}*x^2 + (${b})*x + (${c}) = 0`,variable:'x',solutions:['ANSWER0','ANSWER1']}
    };
   }
  }}
 ]
});

/* ---------- Equations with fractions ---------- */
const DENOMINATORS=[[2,3],[2,5],[3,4],[3,5],[4,5],[2,7],[4,6],[3,7]];
/* frac(m1x + p, a) + or - frac(m2x + q, b) = c, cleared by multiplying by the lowest common multiple. */
function clearFractions(m1,p,a,sign,m2,q,b,c){
 const L=lcm(a,b),A=L/a,B=L/b,top1=linear(m1,'x',p),top2=linear(m2,'x',q),s=sign>0?'+':'-';
 const kx=A*m1+sign*B*m2,k0=A*p+sign*B*q,rhs=c*L;
 if(kx===0||K.gcd(m1,p)>1||K.gcd(m2,q)>1)return null;
 const solution=Q(rhs-k0,kx),equation=`frac(${top1}, ${a}) ${s} frac(${top2}, ${b}) = ${c}`;
 return {solution,question:{
  prompt:'Solve the equation.',math:equation,
  answer:{type:'number',label:'x =',value:qStr(solution),simplest:true},
  mistakes:wrongs(qStr(solution),[
   ...(sign<0?[{value:qStr(Q(rhs-(A*p+B*q),kx)),why:`The minus sign applies to the whole of the second top: \`-${B}(${top2}) = ${terms([[-B*m2,'x'],[-B*q,'']])}\`.`}]:[]),
   {value:qStr(Q(c-k0,kx)),why:`Multiply every term by ${L}, including the ${c} on the right side.`},
   {value:qStr(Q(rhs-(p+sign*q),kx)),why:`Each multiplier applies to every term in its bracket: \`${A}(${top1}) = ${terms([[A*m1,'x'],[A*p,'']])}\`.`}]),
  hint:sign<0?`Multiply every term by ${L} and keep each top in a bracket. Take care with the minus sign in front of the second fraction.`:`Multiply every term by ${L}, the lowest common multiple of ${a} and ${b}. Keep each top in a bracket.`,
  steps:[
   {math:equation,note:`The denominators are ${a} and ${b}. Their lowest common multiple is ${L}.`},
   {math:`${A}(${top1}) ${s} ${B}(${top2}) = ${rhs}`,note:`Multiply every term by ${L}. Each denominator divides out, and each top stays in a bracket.`},
   {math:`${terms([[A*m1,'x'],[A*p,''],[sign*B*m2,'x'],[sign*B*q,'']])} = ${rhs}`,note:sign<0?'Multiply out the brackets. The minus sign changes both terms of the second bracket.':'Multiply out the brackets.'},
   {math:`${linear(kx,'x',k0)} = ${rhs}`,note:'Collect like terms.'},
   ...(k0?[{math:`${cf(kx)} = ${rhs-k0}`,note:`${undo(k0)} both sides.`}]:[]),
   ...(kx!==1?[{math:`x = ${nf(solution)}`,note:`Divide both sides by ${kx}.${solution.d!==1?' The answer stays as a fraction.':''}`}]:[])],
  verify:{op:'solve',eq:`((${m1})*x + (${p}))/${a} ${s} ((${m2})*x + (${q}))/${b} = ${c}`,variable:'x',solutions:['ANSWER']}
 }};
}
K.define({
 id:'equations-with-fractions',
 title:'Clear fractions in an equation',
 strand:'Algebra',
 lesson:'21-03',
 blurb:'Multiply every term by the lowest common multiple of the denominators, then solve.',
 levels:[
  {name:'Two simple fractions',make(rng){
   for(;;){
    /* frac(mx, a) + or - frac(x, b) = c */
    const [a,b]=rng.shuffle(rng.pick(DENOMINATORS)),L=lcm(a,b),A=L/a,B=L/b,minus=rng.chance(.4),m=rng.pick([1,1,1,2,3]);
    if(K.gcd(m,a)!==1)continue;
    const k=minus?A*m-B:A*m+B;
    if(k<=0)continue;
    const x=L*rng.int(1,4)*(rng.chance(.2)?-1:1),c=x*k/L,s=minus?'-':'+',equation=`frac(${cf(m)}, ${a}) ${s} frac(x, ${b}) = ${c}`;
    if(Math.abs(c*L)>150||k>10)continue;
    return {
     prompt:'Solve the equation.',math:equation,
     answer:{type:'number',label:'x =',value:String(x)},
     mistakes:wrongs(x,[
      {value:qStr(Q(c,k)),why:`Multiply every term by ${L}, including the ${c} on the right side.`},
      ...(minus||m>1?[]:[{value:qStr(Q(c*(a+b),2)),why:'Fractions cannot be added by adding the tops and adding the bottoms. Multiply every term by the common denominator instead.'}]),
      ...(k===1?[]:[{value:String(c*L),why:`You found \`${k}x\`. One more move: divide both sides by ${k}.`}])]),
     hint:`Multiply every term by ${L}, the lowest common multiple of ${a} and ${b}. Then there are no fractions left.`,
     steps:[
      {math:equation,note:`The denominators are ${a} and ${b}. Their lowest common multiple is ${L}.`},
      {math:`${A*m}x ${s} ${B}x = ${c*L}`,note:`Multiply every term by ${L}. Each denominator divides out.`},
      {math:`${cf(k)} = ${c*L}`,note:'Collect like terms.'},
      ...(k===1?[]:[{math:`x = ${x}`,note:`Divide both sides by ${k}.`}]),
      {math:`${m*x/a} ${s} ${K.bracket(x/b)} = ${c}`,note:'Check: put the value back into each fraction of the original equation.'}],
     verify:{op:'solve',eq:`${m}*x/${a} ${s} x/${b} = ${c}`,variable:'x',solutions:['ANSWER']}
    };
   }
  }},
  {name:'Brackets on top',make(rng){
   for(;;){
    const [a,b]=rng.shuffle(rng.pick(DENOMINATORS)),p=rng.nonzero(-5,6),q=rng.nonzero(-5,6),m1=rng.pick([1,1,2]);
    if(rng.chance(.6)){
     const made=clearFractions(m1,p,a,1,1,q,b,rng.nonzero(-3,8));
     if(!made||made.solution.d!==1||made.solution.n===0||Math.abs(made.solution.n)>15)continue;
     return made.question;
    }
    /* frac(m1x + p, a) = frac(x + q, b) */
    const L=lcm(a,b),A=L/a,B=L/b,kx=A*m1-B,top1=linear(m1,'x',p),top2=linear(1,'x',q);
    if(kx<=0||K.gcd(m1,p)>1)continue;
    const solution=Q(B*q-A*p,kx);
    if(solution.d!==1||solution.n===0||Math.abs(solution.n)>15)continue;
    const equation=`frac(${top1}, ${a}) = frac(${top2}, ${b})`;
    return {
     prompt:'Solve the equation.',math:equation,
     answer:{type:'number',label:'x =',value:qStr(solution)},
     mistakes:wrongs(qStr(solution),[
      {value:qStr(Q(q-p,kx)),why:`Each multiplier applies to every term in its bracket: \`${A}(${top1}) = ${linear(A*m1,'x',A*p)}\`.`},
      {value:qStr(Q(B*q+A*p,kx)),why:`To undo \`${signed(A*p)}\` on the left, do the opposite to both sides.`},
      ...(a*m1===b?[]:[{value:qStr(Q(b*q-a*p,a*m1-b)),why:`Multiply each top by the other denominator: \`${b}(${top1}) = ${a}(${top2})\`.`}]),
      ...(kx===1?[]:[{value:String(B*q-A*p),why:`You found \`${cf(kx)}\`. One more move: divide both sides by ${kx}.`}]),
      {value:qStr(Q(A*p-B*q,kx)),why:'Check your signs. Put your value back into the equation to test it.'}]),
     hint:`Multiply both sides by ${L}, the lowest common multiple of ${a} and ${b}. Keep each top in a bracket.`,
     steps:[
      {math:equation,note:`Multiply both sides by ${L}, the lowest common multiple of ${a} and ${b}.`},
      {math:`${A}(${top1}) = ${B}(${top2})`,note:'Each denominator divides out. Each top stays in a bracket.'},
      {math:`${linear(A*m1,'x',A*p)} = ${linear(B,'x',B*q)}`,note:'Multiply out the brackets.'},
      {math:`${linear(kx,'x',A*p)} = ${B*q}`,note:`Subtract \`${B}x\` from both sides.`},
      {math:`${cf(kx)} = ${B*q-A*p}`,note:`${undo(A*p)} both sides.`},
      ...(kx===1?[]:[{math:`x = ${fmt(solution)}`,note:`Divide both sides by ${kx}.`}])],
     verify:{op:'solve',eq:`((${m1})*x + (${p}))/${a} = (x + (${q}))/${b}`,variable:'x',solutions:['ANSWER']}
    };
   }
  }},
  {name:'Exam style',make(rng){
   for(;;){
    /* A minus sign in front of the second fraction; the answer may be a fraction. */
    const [a,b]=rng.shuffle(rng.pick(DENOMINATORS)),p=rng.nonzero(-5,6),q=rng.nonzero(-5,6),plain=rng.chance(.5);
    const m1=plain?1:rng.int(1,3),m2=plain?1:rng.int(1,3);
    if(!plain&&m1===1&&m2===1)continue;
    const made=clearFractions(m1,p,a,-1,m2,q,b,rng.nonzero(-3,6));
    if(!made||made.solution.d>5||Math.abs(made.solution.n)>40||made.solution.n===0)continue;
    made.question.prompt='Solve the equation. Give a fraction in its simplest form if the answer is not a whole number.';
    return made.question;
   }
  }}
 ]
});

/* ---------- The quadratic formula ---------- */
/* False when a value sits so close to a rounding boundary that one decimal place is unsafe. */
const safeRound=v=>Math.abs(Math.abs(v*10)%1-.5)>.03&&Math.abs(v)>=.06;
/* A value correct to one decimal place, always written with that place: 2.0, not 2. */
const dp1=v=>K.roundTo(v,1).toFixed(1);
const isSquare=n=>Number.isInteger(Math.sqrt(n));
K.define({
 id:'quadratic-formula',
 title:'Use the quadratic formula',
 strand:'Algebra',
 lesson:'15-02',
 blurb:'Read off a, b and c, then substitute carefully into the formula.',
 levels:[
  {name:'Identify a, b, c',make(rng){
   for(;;){
    const a=rng.pick([1,1,2,3,4,5]),b=rng.nonzero(-9,9),c=rng.nonzero(-9,9),D=b*b-4*a*c,equation=`${quadratic(a,b,c)} = 0`;
    if(b===c||K.gcd(K.gcd(a,b),c)>1||b>0&&c>0&&rng.chance(.7))continue;
    if(rng.chance(.4)){
     return {
      prompt:'Write down the values of a, b and c for the quadratic formula.',math:equation,
      answer:{type:'fields',fields:[{label:'a =',value:String(a)},{label:'b =',value:String(b)},{label:'c =',value:String(c)}]},
      mistakes:[
       ...(b<0||c<0?[{value:[String(a),String(Math.abs(b)),String(Math.abs(c))],why:'Keep the sign with each number. A term that is subtracted has a negative value.'}]:[]),
       {value:[String(a),String(c),String(b)],why:'b is the number in front of x. c is the number on its own.'}],
      hint:'a is the number in front of `x^2`, b is the number in front of x, and c is the number on its own. Keep the signs.',
      steps:[
       {math:equation,note:'Compare the equation with `ax^2 + bx + c = 0`.'},
       {math:`a = ${a}`,note:a===1?'There is no number written in front of `x^2`, so a is 1.':'a is the number in front of `x^2`.'},
       {math:`b = ${b}`,note:b===1?'No number is written in front of x, so b is 1.':b===-1?'The x term is subtracted and no number is written in front of it, so b is -1.':`b is the number in front of x${b<0?', with its minus sign':''}.`},
       {math:`c = ${c}`,note:`c is the number on its own${c<0?', with its minus sign':''}.`}],
      verify:{op:'identity',a:`(ANSWER0)*x^2 + (ANSWER1)*x + (ANSWER2)`,b:`${a}*x^2 + (${b})*x + (${c})`}
     };
    }
    if(D<0)continue;
    return {
     prompt:'Find the value of `b^2 - 4ac` for this equation.',math:equation,
     answer:{type:'number',value:String(D)},
     mistakes:wrongs(D,[
      ...(b<0?[{value:String(-b*b-4*a*c),why:`\`(${b})^2 = ${b*b}\`, not ${-b*b}. A negative number squared is positive.`}]:[]),
      ...(c<0?[{value:String(b*b+4*a*c),why:`c is negative, so \`-4(${a})(${c}) = +${-4*a*c}\`. Subtracting a negative number adds.`}]:[{value:String(b*b+4*a*c),why:'The formula subtracts `4ac`. Here `4ac` is positive, so take it away.'}]),
      {value:String(b*b-a*c),why:'Do not forget the 4: the expression is `b^2 - 4ac`.'},
      {value:String(2*b-4*a*c),why:`\`b^2\` means b times b, so \`(${b})^2 = ${b*b}\`.`}]),
     hint:`Here \`a = ${a}\`, \`b = ${b}\` and \`c = ${c}\`. Put each number into \`b^2 - 4ac\` inside a bracket.`,
     steps:[
      {math:equation,note:`Compare with \`ax^2 + bx + c = 0\`: \`a = ${a}\`, \`b = ${b}\` and \`c = ${c}\`.`},
      {math:`b^2 - 4ac = (${b})^2 - 4(${a})(${c})`,note:'Substitute, with a bracket around each number.'},
      {math:`b^2 - 4ac = ${b*b} ${signed(-4*a*c)}`,note:`\`(${b})^2 = ${b*b}\` and \`-4(${a})(${c}) = ${-4*a*c}\`.`},
      {math:`b^2 - 4ac = ${D}`,note:'This is the number that goes under the square root in the formula.'}],
     verify:{op:'value',expr:`(${b})^2 - 4*(${a})*(${c})`,equals:'ANSWER'}
    };
   }
  }},
  {name:'One decimal place',make(rng){
   for(;;){
    const a=rng.pick([1,1,2,3]),b=rng.nonzero(-9,9),c=rng.nonzero(-9,9),D=b*b-4*a*c;
    if(D<=0||isSquare(D)||K.gcd(K.gcd(a,b),c)>1)continue;
    const root=Math.sqrt(D),small=(-b-root)/(2*a),large=(-b+root)/(2*a);
    if(!safeRound(small)||!safeRound(large)||dp1(small)===dp1(large))continue;
    const larger=rng.chance(.6),rearranged=rng.chance(.35),value=dp1(larger?large:small);
    const equation=rearranged?`${terms([[a,'x^2'],[b,'x']])} = ${-c}`:`${quadratic(a,b,c)} = 0`;
    return {
     prompt:`Use the quadratic formula to find the ${larger?'larger':'smaller'} root, correct to one decimal place.`,math:equation,
     answer:{type:'number',label:'x =',value,round:1},
     mistakes:wrongs(value,[
      {value:dp1(larger?small:large),why:`That is the ${larger?'smaller':'larger'} root. The question asks for the ${larger?'larger':'smaller'} one.`},
      {value:dp1((b+(larger?root:-root))/(2*a)),why:`\`-b\` means change the sign of b. Here \`b = ${b}\`, so \`-b = ${-b}\`.`},
      {value:dp1(-b+(larger?root:-root)/(2*a)),why:`The whole top is divided by \`2a = ${2*a}\`, not only the square root.`},
      ...(a>1?[{value:dp1((-b+(larger?root:-root))/2),why:`The bottom of the formula is \`2a\`. Here that is \`2(${a}) = ${2*a}\`.`}]:[])]),
     hint:rearranged?'Get zero on one side first. Then read off a, b and c with their signs.':`Here \`a = ${a}\`, \`b = ${b}\` and \`c = ${c}\`. Work out \`b^2 - 4ac\` first.`,
     steps:[
      ...(rearranged?[{math:`${quadratic(a,b,c)} = 0`,note:`${undo(-c)} both sides, so that one side is zero.`}]:[]),
      {math:'x = frac(-b ± sqrt(b^2 - 4ac), 2a)',note:`This is the formula. Here \`a = ${a}\`, \`b = ${b}\` and \`c = ${c}\`.`},
      {math:`b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${D}`,note:'Work out the part under the square root first.'},
      {math:`x = frac(${-b} ± sqrt(${D}), ${2*a})`,note:`\`-b = ${-b}\` and \`2a = ${2*a}\`.`},
      {math:`x = ${K.decimal(large,3)} or x = ${K.decimal(small,3)}`,note:`\`sqrt(${D})\` is about ${K.decimal(root,3)}. Work out the plus and the minus separately.`},
      {math:`x = ${value}`,note:`The ${larger?'larger':'smaller'} root, correct to one decimal place.`}],
     verify:{op:'value',expr:`(-(${b}) ${larger?'+':'-'} sqrt((${b})^2 - 4*(${a})*(${c})))/(2*(${a}))`,equals:'ANSWER',round:1}
    };
   }
  }},
  {name:'Exam style',make(rng){
   for(;;){
    if(rng.chance(.5)){
     /* A rectangle: x(x + d) = A */
     const d=rng.int(1,9),A=rng.int(10,90),D=d*d+4*A;
     if(isSquare(D))continue;
     const root=Math.sqrt(D),width=(-d+root)/2,other=(-d-root)/2;
     if(!safeRound(width)||!safeRound(other))continue;
     const shape=rng.pick(['rectangular garden','rectangular room','rectangular patio','rectangular lawn']),value=dp1(width);
     return {
      prompt:`A ${shape} is ${d} m longer than it is wide. Its area is ${A} square metres. Find its width, correct to one decimal place.`,
      answer:{type:'number',value,round:1,unit:'m'},
      mistakes:wrongs(value,[
       {value:dp1(other),why:'A width cannot be negative. Take the positive root.'},
       {value:dp1(width+d),why:'That is the length. The question asks for the width.'},
       {value:dp1(-other),why:`\`-b\` means change the sign of b. Here \`b = ${d}\`, so \`-b = ${-d}\`.`}]),
      hint:`Call the width x. Then the length is \`x + ${d}\` and \`x(x + ${d}) = ${A}\`. Get zero on one side and use the formula.`,
      steps:[
       {math:`x(x + ${d}) = ${A}`,note:`Call the width x. The length is \`x + ${d}\`, and width times length gives the area.`},
       {math:`${quadratic(1,d,-A)} = 0`,note:'Multiply out the bracket and get zero on one side.'},
       {math:`b^2 - 4ac = (${d})^2 - 4(1)(${-A}) = ${D}`,note:`Here \`a = 1\`, \`b = ${d}\` and \`c = ${-A}\`.`},
       {math:`x = frac(${-d} ± sqrt(${D}), 2)`,note:'Substitute into the quadratic formula.'},
       {math:`x = ${K.decimal(width,3)} or x = ${K.decimal(other,3)}`,note:`\`sqrt(${D})\` is about ${K.decimal(root,3)}. Work out the plus and the minus separately.`},
       {math:`x = ${value}`,note:'A width cannot be negative, so take the positive root, correct to one decimal place.'}],
      verify:{op:'value',expr:`(-(${d}) + sqrt((${d})^2 - 4*1*(-${A})))/(2*1)`,equals:'ANSWER',round:1}
     };
    }
    /* A ball: ut - 5t^2 = H */
    const u=rng.pick([15,20,25,30,35]),H=rng.int(5,60),D=u*u-20*H;
    if(D<=0||isSquare(D))continue;
    const root=Math.sqrt(D),first=(u-root)/10,second=(u+root)/10;
    if(!safeRound(first)||!safeRound(second)||dp1(first)===dp1(second))continue;
    const early=rng.chance(.6),value=dp1(early?first:second);
    return {
     prompt:`A ball is thrown straight up. Its height after t seconds is \`h = ${u}t - 5t^2\` metres. The ball is ${H} m high at two different times. Find the ${early?'first':'second'} of these times, correct to one decimal place.`,
     answer:{type:'number',label:'t =',value,round:1,unit:'s'},
     mistakes:wrongs(value,[
      {value:dp1(early?second:first),why:`That is the ${early?'second':'first'} time. The question asks for the ${early?'first':'second'}, which is the ${early?'smaller':'larger'} root.`},
      {value:dp1((-u+(early?-root:root))/10),why:`After rearranging, \`b = ${-u}\`, so \`-b = ${u}\`.`}]),
     hint:`Put \`h = ${H}\` into the formula and bring every term to one side. Then use the quadratic formula with t in place of x.`,
     steps:[
      {math:`${u}t - 5t^2 = ${H}`,note:`Put \`h = ${H}\` into the formula.`},
      {math:`5t^2 - ${u}t + ${H} = 0`,note:'Bring every term to one side, with the squared term positive.'},
      {math:`b^2 - 4ac = (${-u})^2 - 4(5)(${H}) = ${D}`,note:`Here \`a = 5\`, \`b = ${-u}\` and \`c = ${H}\`.`},
      {math:`t = frac(${u} ± sqrt(${D}), 10)`,note:'Substitute into the quadratic formula.'},
      {math:`t = ${K.decimal(first,3)} or t = ${K.decimal(second,3)}`,note:`\`sqrt(${D})\` is about ${K.decimal(root,3)}. Work out the minus and the plus separately.`},
      {math:`t = ${value}`,note:`The ${early?'first':'second'} time is the ${early?'smaller':'larger'} root, correct to one decimal place.`}],
     verify:{op:'value',expr:`(-(-${u}) ${early?'-':'+'} sqrt((-${u})^2 - 4*5*(${H})))/(2*5)`,equals:'ANSWER',round:1}
    };
   }
  }}
 ]
});

/* ---------- Change the subject of a formula ---------- */
/* A choice between rearrangements. Each option carries its right-hand side as its value. */
function subjectChoice({formula,subject,correct,wrong,claim,hint,steps,positive=false}){
 return {
  prompt:`Make \`${subject}\` the subject of the formula${positive?`, where \`${subject}\` is positive`:''}.`,math:formula,
  answer:{type:'choice',options:[{math:`${subject} = ${correct}`,value:correct,correct:true},...wrong.map(([value,why])=>({math:`${subject} = ${value}`,value,why}))]},
  hint,steps,verify:{op:'identity',a:claim[0],b:claim[1]}
 };
}
/* A typed value found from a formula. The claim uses x for the unknown letter. */
function formulaValue({formula,find,given,value,mistakes,hint,steps,eq}){
 const list=given.map(([letter,number])=>`\`${letter} = ${number}\``);
 return {
  prompt:`Find the value of \`${find}\` when ${list.slice(0,-1).join(', ')}${list.length>1?' and ':''}${list[list.length-1]}.`,math:formula,
  answer:{type:'number',label:`${find} =`,value:String(value)},
  mistakes:wrongs(value,mistakes),hint,steps,verify:{op:'solve',eq,variable:'x',solutions:['ANSWER']}
 };
}
K.define({
 id:'change-the-subject',
 title:'Change the subject',
 strand:'Algebra',
 lesson:'21-05',
 blurb:'Undo each operation in turn, as in an equation, until the letter you want is on its own.',
 levels:[
  {name:'One or two steps',make(rng){
   const [T,X,q]=rng.pick([['P','n','c'],['C','t','b'],['T','x','k'],['A','h','u'],['V','r','p'],['F','m','d'],['y','x','c'],['W','d','b']]);
   const k=rng.int(2,9),kind=rng.pick(['multiply and add','divide and add','bracket','product']),minus=rng.chance(.4),s=minus?'-':'+',o=minus?'+':'-';
   const move=`${minus?'Add':'Subtract'} \`${q}\` ${minus?'to':'from'} both sides`,aim=`The aim is to get \`${X}\` on its own. Undo one operation at a time.`;
   if(kind==='multiply and add'){
    const formula=`${T} = ${k}${X} ${s} ${q}`;
    return subjectChoice({formula,subject:X,correct:`frac(${T} ${o} ${q}, ${k})`,
     wrong:[
      [`frac(${T} ${s} ${q}, ${k})`,`To undo \`${s} ${q}\`, do the opposite. ${move}.`],
      [`frac(${T}, ${k}) ${o} ${q}`,`${move} first. If you divide first, every term must be divided by ${k}, including \`${q}\`.`],
      [`${k}(${T} ${o} ${q})`,`\`${X}\` is multiplied by ${k}. To undo that, divide by ${k}.`]],
     claim:[`${k}*(ANSWER) ${s} ${q}`,T],
     hint:`Treat it like an equation in \`${X}\`. Undo \`${s} ${q}\` first, then undo the multiplication by ${k}.`,
     steps:[{math:formula,note:aim},{math:`${T} ${o} ${q} = ${k}${X}`,note:`${move}.`},{math:`${X} = frac(${T} ${o} ${q}, ${k})`,note:`Divide both sides by ${k}, and write \`${X}\` on the left.`}]});
   }
   if(kind==='divide and add'){
    const formula=`${T} = frac(${X}, ${k}) ${s} ${q}`;
    return subjectChoice({formula,subject:X,correct:`${k}(${T} ${o} ${q})`,
     wrong:[
      [`${k}${T} ${o} ${q}`,`Multiply the whole of \`${T} ${o} ${q}\` by ${k}. It needs a bracket.`],
      [`${k}(${T} ${s} ${q})`,`To undo \`${s} ${q}\`, do the opposite. ${move}.`],
      [`frac(${T} ${o} ${q}, ${k})`,`\`${X}\` is divided by ${k}. To undo that, multiply by ${k}.`]],
     claim:[`(ANSWER)/${k} ${s} ${q}`,T],
     hint:`Undo \`${s} ${q}\` first. Then undo the division by ${k}, keeping the other side in a bracket.`,
     steps:[{math:formula,note:aim},{math:`${T} ${o} ${q} = frac(${X}, ${k})`,note:`${move}.`},{math:`${X} = ${k}(${T} ${o} ${q})`,note:`Multiply both sides by ${k}. The bracket keeps \`${T} ${o} ${q}\` together.`}]});
   }
   if(kind==='bracket'){
    const formula=`${T} = ${k}(${X} ${s} ${q})`;
    return subjectChoice({formula,subject:X,correct:`frac(${T}, ${k}) ${o} ${q}`,
     wrong:[
      [`frac(${T} ${o} ${q}, ${k})`,`The ${k} multiplies the whole bracket. Divide by ${k} first, and only then deal with \`${q}\`.`],
      [`frac(${T}, ${k}) ${s} ${q}`,`To undo \`${s} ${q}\`, do the opposite. ${move}.`],
      [`${k}${T} ${o} ${q}`,`The bracket is multiplied by ${k}. To undo that, divide by ${k}.`]],
     claim:[`${k}*((ANSWER) ${s} ${q})`,T],
     hint:`Divide both sides by ${k} first. That leaves the bracket on its own.`,
     steps:[{math:formula,note:aim},{math:`frac(${T}, ${k}) = ${X} ${s} ${q}`,note:`Divide both sides by ${k}.`},{math:`${X} = frac(${T}, ${k}) ${o} ${q}`,note:`${move}.`}]});
   }
   const [R,first,second]=rng.pick([['A','l','w'],['F','m','a'],['d','s','t'],['C','n','p'],['V','A','h'],['W','F','d']]),[u,Y]=rng.chance(.5)?[first,second]:[second,first],formula=`${R} = ${first}${second}`;
   return subjectChoice({formula,subject:Y,correct:`frac(${R}, ${u})`,
    wrong:[
     [`${R} - ${u}`,`\`${u}\` multiplies \`${Y}\`. To undo a multiplication, divide.`],
     [`${R}${u}`,`That multiplies by \`${u}\` again. Divide both sides by \`${u}\` instead.`],
     [`frac(${u}, ${R})`,`That is upside down. Dividing both sides by \`${u}\` leaves \`${R}\` on top.`]],
    claim:[`${u}*(ANSWER)`,R],
    hint:`\`${first}${second}\` means \`${first}\` times \`${second}\`. Undo the multiplication by \`${u}\`.`,
    steps:[{math:formula,note:`\`${Y}\` is multiplied by \`${u}\`.`},{math:`frac(${R}, ${u}) = ${Y}`,note:`Divide both sides by \`${u}\`.`},{math:`${Y} = frac(${R}, ${u})`,note:`Write the formula with \`${Y}\` on the left.`}]});
  }},
  {name:'Find a value',make(rng){
   for(;;){
    const kind=rng.pick(['v = u + at','perimeter','triangle','speed','temperature','line']);
    if(kind==='v = u + at'){
     const a=rng.int(2,9),t=rng.int(2,9),u=rng.int(1,20),v=u+a*t,findA=rng.chance(.5),[find,known,value,other]=findA?['a','t',a,t]:['t','a',t,a];
     return formulaValue({formula:'v = u + at',find,given:[['v',v],['u',u],[known,other]],value,
      mistakes:[
       {value:qStr(Q(v+u,other)),why:`To undo \`+ ${u}\`, subtract ${u} from both sides.`},
       {value:String(v-u),why:`You found \`${other}${find}\`. Divide both sides by ${other}.`},
       {value:qStr(Q(v-other,u)),why:`Check which number replaces which letter: \`u = ${u}\` and \`${known} = ${other}\`.`}],
      hint:`Put the known numbers into the formula. Then solve the equation for \`${find}\`.`,
      steps:[
       {math:`${v} = ${u} + ${other}${find}`,note:'Put the known values into the formula.'},
       {math:`${v-u} = ${other}${find}`,note:`Subtract ${u} from both sides.`},
       {math:`${find} = ${value}`,note:`Divide both sides by ${other}.`},
       {math:`${find} = frac(v - u, ${known}) = frac(${v} - ${u}, ${other}) = ${value}`,note:'You can also rearrange the formula first and then substitute. The result is the same.'}],
      eq:`${v} = ${u} + ${other}*x`});
    }
    if(kind==='perimeter'){
     const l=rng.int(3,20),w=rng.int(2,12),P=2*l+2*w;
     if(l<=w)continue;
     return formulaValue({formula:'P = 2l + 2w',find:'l',given:[['P',P],['w',w]],value:l,
      mistakes:[
       {value:qStr(Q(P-w,2)),why:`\`2w\` means 2 times ${w}, which is ${2*w}.`},
       {value:String(P-2*w),why:'You found `2l`. Divide both sides by 2.'},
       {value:qStr(Q(P+2*w,2)),why:`To undo \`+ ${2*w}\`, subtract ${2*w} from both sides.`}],
      hint:'Put the known numbers into the formula. Then solve the equation for `l`.',
      steps:[
       {math:`${P} = 2l + 2(${w})`,note:'Put the known values into the formula.'},
       {math:`${P} = 2l + ${2*w}`,note:`\`2(${w}) = ${2*w}\`.`},
       {math:`${P-2*w} = 2l`,note:`Subtract ${2*w} from both sides.`},
       {math:`l = ${l}`,note:'Divide both sides by 2.'}],
      eq:`${P} = 2*x + 2*${w}`});
    }
    if(kind==='triangle'){
     const b=rng.int(2,12),h=rng.int(2,12);
     if(b*h%2||b===h)continue;
     const A=b*h/2;
     return formulaValue({formula:'A = frac(1, 2)bh',find:'h',given:[['A',A],['b',b]],value:h,
      mistakes:[
       {value:qStr(Q(A,b)),why:`Half of \`bh\` is ${A}, so \`bh\` is ${2*A}. Multiply by 2 before you divide by ${b}.`},
       {value:String(2*A),why:`You found \`${b}h\`. Divide both sides by ${b}.`},
       {value:qStr(Q(A,2*b)),why:'To undo the half, multiply both sides by 2.'}],
      hint:'Put the known numbers in, then multiply both sides by 2 to clear the fraction.',
      steps:[
       {math:`${A} = frac(1, 2)(${b})h`,note:'Put the known values into the formula.'},
       {math:`${2*A} = ${b}h`,note:'Multiply both sides by 2 to clear the fraction.'},
       {math:`h = ${h}`,note:`Divide both sides by ${b}.`}],
      eq:`${A} = (1/2)*${b}*x`});
    }
    if(kind==='speed'){
     const speed=rng.int(2,12)*rng.pick([1,5,10]),t=rng.int(2,9),d=speed*t;
     if(speed===t)continue;
     return formulaValue({formula:'s = frac(d, t)',find:'t',given:[['s',speed],['d',d]],value:t,
      mistakes:[
       {value:String(d*speed),why:`\`t\` is on the bottom. Multiply both sides by \`t\`, then divide by ${speed}.`},
       {value:qStr(Q(speed,d)),why:`That is upside down. From \`${speed}t = ${d}\`, divide ${d} by ${speed}.`}],
      hint:'`t` is on the bottom. Multiply both sides by `t` first.',
      steps:[
       {math:`${speed} = frac(${d}, t)`,note:'Put the known values into the formula.'},
       {math:`${speed}t = ${d}`,note:'Multiply both sides by `t`. Now `t` is no longer on the bottom.'},
       {math:`t = ${t}`,note:`Divide both sides by ${speed}.`}],
      eq:`${speed} = ${d}/x`});
    }
    if(kind==='temperature'){
     const C=5*rng.nonzero(-3,9),F=9*C/5+32;
     return formulaValue({formula:'F = frac(9C, 5) + 32',find:'C',given:[['F',F]],value:C,
      mistakes:[
       {value:qStr(Q(5*(F+32),9)),why:'To undo `+ 32`, subtract 32 from both sides.'},
       {value:String(F-32),why:'That is `frac(9C, 5)`. Multiply by 5 and then divide by 9.'},
       {value:qStr(Q(9*(F-32),5)),why:'To undo `frac(9C, 5)`, multiply by 5 and divide by 9.'}],
      hint:'Undo `+ 32` first. Then multiply by 5 and divide by 9.',
      steps:[
       {math:`${F} = frac(9C, 5) + 32`,note:'Put the known value into the formula.'},
       {math:`${F-32} = frac(9C, 5)`,note:'Subtract 32 from both sides.'},
       {math:`${5*(F-32)} = 9C`,note:'Multiply both sides by 5.'},
       {math:`C = ${C}`,note:'Divide both sides by 9.'}],
      eq:`${F} = 9*x/5 + 32`});
    }
    const m=rng.nonzero(-6,7,[1,-1]),x=rng.nonzero(-5,8),c=rng.nonzero(-9,9),y=m*x+c;
    return formulaValue({formula:'y = mx + c',find:'x',given:[['y',y],['m',m],['c',c]],value:x,
     mistakes:[
      {value:qStr(Q(y+c,m)),why:`To undo \`${signed(c)}\`, do the opposite: ${undo(c).toLowerCase()} both sides.`},
      {value:String(y-c),why:`You found \`${m}x\`. Divide both sides by ${m}.`},
      {value:String(-x),why:'Check the signs when you divide. Put your value back into the formula to test it.'}],
     hint:'Put the known numbers into the formula. Then solve the equation for `x`.',
     steps:[
      {math:`${y} = ${m}x ${signed(c)}`,note:'Put the known values into the formula.'},
      {math:`${y-c} = ${m}x`,note:`${undo(c)} both sides.`},
      {math:`x = ${x}`,note:`Divide both sides by ${m}.`},
      {math:`${m}(${x}) ${signed(c)} = ${y}`,note:'Check: the value gives the right y.'}],
     eq:`${y} = (${m})*x + (${c})`});
   }
  }},
  {name:'Exam style',make(rng){
   const kind=rng.pick(['fraction','on the bottom','squared']),k=rng.int(2,9);
   if(kind==='fraction'){
    const [T,X,q,r]=rng.pick([['P','n','c','d'],['T','x','k','m'],['A','h','u','w'],['V','r','p','t'],['y','x','c','d'],['W','d','b','a']]);
    const minus=rng.chance(.5),s=minus?'-':'+',o=minus?'+':'-',formula=`${T} = frac(${k}${X} ${s} ${q}, ${r})`,move=`${minus?'Add':'Subtract'} \`${q}\` ${minus?'to':'from'} both sides`;
    return subjectChoice({formula,subject:X,correct:`frac(${r}${T} ${o} ${q}, ${k})`,
     wrong:[
      [`frac(${r}${T} ${s} ${q}, ${k})`,`To undo \`${s} ${q}\`, do the opposite. ${move}.`],
      [`frac(${r}(${T} ${o} ${q}), ${k})`,`Multiply by \`${r}\` first. That gives \`${r}${T}\` on the left, and only then do you deal with \`${q}\`.`],
      [`frac(${T} ${o} ${q}, ${k}${r})`,`\`${r}\` divides the right side. To undo that, multiply both sides by \`${r}\`.`]],
     claim:[`(${k}*(ANSWER) ${s} ${q})/${r}`,T],
     hint:`Clear the fraction first: multiply both sides by \`${r}\`.`,
     steps:[
      {math:formula,note:'Clear the fraction first.'},
      {math:`${r}${T} = ${k}${X} ${s} ${q}`,note:`Multiply both sides by \`${r}\`.`},
      {math:`${r}${T} ${o} ${q} = ${k}${X}`,note:`${move}.`},
      {math:`${X} = frac(${r}${T} ${o} ${q}, ${k})`,note:`Divide both sides by ${k}, and write \`${X}\` on the left.`}]});
   }
   if(kind==='on the bottom'){
    const [T,u,X]=rng.pick([['s','d','t'],['P','V','R'],['d','m','v'],['p','F','A'],['a','v','t'],['c','d','n']]),j=rng.int(1,6),top=`${j===1?'':j}${u}`,formula=`${T} = frac(${top}, ${X})`;
    return subjectChoice({formula,subject:X,correct:`frac(${top}, ${T})`,
     wrong:[
      [`${top}${T}`,`\`${X}\` is on the bottom. Multiply both sides by \`${X}\`, then divide by \`${T}\`.`],
      [`frac(${T}, ${top})`,`That is upside down. After multiplying by \`${X}\` you have \`${T}${X} = ${top}\`, so divide by \`${T}\`.`],
      [`${top} - ${T}`,'The formula divides. Undo a division by multiplying, not by subtracting.']],
     claim:[`${j}*${u}/(ANSWER)`,T],
     hint:`\`${X}\` is on the bottom. Multiply both sides by \`${X}\` first.`,
     steps:[
      {math:formula,note:`\`${X}\` is on the bottom, so get it off the bottom first.`},
      {math:`${T}${X} = ${top}`,note:`Multiply both sides by \`${X}\`.`},
      {math:`${X} = frac(${top}, ${T})`,note:`Divide both sides by \`${T}\`.`}]});
   }
   const [T,X]=rng.pick([['A','r'],['d','t'],['P','v'],['y','x'],['V','s'],['F','v']]),formula=`${T} = ${k}${X}^2`;
   return subjectChoice({formula,subject:X,positive:true,correct:`sqrt(frac(${T}, ${k}))`,
    wrong:[
     [`sqrt(${T} - ${k})`,`\`${X}^2\` is multiplied by ${k}, so divide by ${k}. Subtracting does not undo a multiplication.`],
     [`frac(${T}, ${2*k})`,'The opposite of squaring is taking the square root, not halving.'],
     [`sqrt(${k}${T})`,`\`${X}^2\` is multiplied by ${k}. Divide by ${k} to undo that.`]],
    claim:[`${k}*(ANSWER)^2`,T],
    hint:`Get \`${X}^2\` on its own first. Then take the square root of both sides.`,
    steps:[
     {math:formula,note:`Get \`${X}^2\` on its own first.`},
     {math:`frac(${T}, ${k}) = ${X}^2`,note:`Divide both sides by ${k}.`},
     {math:`${X} = sqrt(frac(${T}, ${k}))`,note:'Take the square root of both sides.'}]});
  }}
 ]
});

/* ---------- The nth term of a linear sequence ---------- */
const sequence=(a,d,count=4)=>Array.from({length:count},(_,i)=>a+i*d).join(', ');
const nthRule=(a,d)=>terms([[d,'n'],[a-d,'']]);
/* A first term and a common difference: going up, or (when down is true) going down. */
const drawSequence=(rng,down)=>down?[rng.int(30,80),-rng.int(2,7)]:[rng.int(1,15),rng.int(2,9)];
K.define({
 id:'nth-term',
 title:'Find the nth term',
 strand:'Algebra',
 lesson:'18-04',also:['18-03'],
 blurb:'Use the common difference to build a rule for any term of a linear sequence.',
 levels:[
  {name:'Next and later terms',make(rng){
   const [a,d]=drawSequence(rng,rng.chance(.25)),size=Math.abs(d),start=`The first four terms of a sequence are ${sequence(a,d)}. The terms change by the same amount each time.`;
   const difference={math:`${a+d} - ${a} = ${d}`,note:`Find the common difference: each term is ${size} ${d>0?'more':'less'} than the one before.`};
   if(rng.chance(.4)){
    const value=a+4*d;
    return {
     prompt:`${start} Find the next term.`,
     answer:{type:'number',value:String(value)},
     mistakes:wrongs(value,[
      {value:String(a+5*d),why:'That is the sixth term. The next term after the fourth is the fifth.'},
      {value:String(a+2*d),why:`The terms go ${d>0?'up':'down'} by ${size} each time. Check the direction.`}]),
     hint:'Find how much is added or subtracted from one term to the next. Do the same to the last term.',
     steps:[difference,{math:`${a+3*d} ${signed(d)} = ${value}`,note:`${d>0?'Add':'Subtract'} ${size} ${d>0?'to':'from'} the fourth term.`}],
     verify:{op:'value',expr:`${a} + (5 - 1)*(${d})`,equals:'ANSWER'}
    };
   }
   const n=rng.pick(d<0?[8,9,10,11,12].filter(k=>a+(k-1)*d>0).concat(6):[8,10,12,15,20,25,30]),value=a+(n-1)*d;
   return {
    prompt:`${start} Find the ${n}th term.`,
    answer:{type:'number',value:String(value)},
    mistakes:wrongs(value,[
     {value:String(a+n*d),why:`From term 1 to term ${n} there are ${n-1} steps, not ${n}.`},
     {value:String(n*d),why:`That ignores where the sequence starts. Begin at the first term, ${a}.`},
     {value:String(a+4*d),why:`That is the next term. The question asks for term number ${n}.`}]),
    hint:`From the first term to the ${n}th term there are ${n-1} steps of the common difference.`,
    steps:[
     difference,
     {math:`${n} - 1 = ${n-1}`,note:`From the first term to the ${n}th term there are ${n-1} steps.`},
     {math:`${a} + ${n-1}(${d}) = ${value}`,note:`Start at the first term and add the difference ${n-1} times.`}],
    verify:{op:'value',expr:`${a} + (${n} - 1)*(${d})`,equals:'ANSWER'}
   };
  }},
  {name:'Find the rule',make(rng){
   for(;;){
    const down=rng.chance(.35),[a,d]=down?drawSequence(rng,true):[rng.int(-6,15),rng.int(2,9)],c=a-d,rule=nthRule(a,d),asTable=rng.chance(.35);
    if(a===0||c===0)continue;
    return {
     prompt:asTable?'The table shows the first four terms of a sequence. Write the nth term as an expression in n.':`The first four terms of a sequence are ${sequence(a,d)}. Write the nth term as an expression in n.`,
     ...(asTable?{table:{head:['n','1','2','3','4'],rows:[['Term',...[0,1,2,3].map(i=>String(a+i*d))]]}}:{}),
     answer:{type:'expr',value:rule,form:'simplified'},
     mistakes:[
      {value:terms([[d,'n'],[a,'']]),why:`Test it with \`n = 1\`: it gives ${d+a}, but the first term is ${a}. The number part is the first term minus the common difference.`},
      {value:terms([[a,'n'],[d,'']]),why:`The number in front of n is the common difference, ${d}. The first term does not go there.`},
      {value:terms([[1,'n'],[d,'']]),why:`A change of ${d} each time means the rule contains \`${d}n\`, not \`n ${signed(d)}\`.`}],
     hint:'The common difference goes in front of n. Then choose the number part so that `n = 1` gives the first term.',
     steps:[
      {math:`${a+d} - ${K.bracket(a)} = ${d}`,note:`The common difference is ${d}, so the rule starts with \`${d}n\`.`},
      {math:`${d}(1) ${signed(c)} = ${a}`,note:`When \`n = 1\`, \`${d}n\` gives ${d}. To reach the first term, ${a}, ${c>0?'add '+c:'subtract '+(-c)}.`},
      {math:rule,note:`This is the nth term. Check with \`n = 2\`: \`${d}(2) ${signed(c)} = ${a+d}\`.`}],
     verify:{op:'identity',a:`${a} + (n - 1)*(${d})`,b:'ANSWER'}
    };
   }
  }},
  {name:'Exam style',make(rng){
   const kind=rng.pick(['which term','pattern count','pattern which','pattern rule']);
   if(kind==='which term'){
    let [a,d]=drawSequence(rng,rng.chance(.3));
    if(a===d)a+=1;
    const c=a-d,N=rng.int(12,d<0?40:60),V=a+(N-1)*d,rule=nthRule(a,d);
    return {
     prompt:`A sequence starts ${sequence(a,d)} and continues in the same way. Which term of the sequence is equal to ${V}?`,
     answer:{type:'number',label:'n =',value:String(N)},
     mistakes:wrongs(N,[
      {value:String(N-1),why:'That counts the steps from the first term. The term number is one more than the number of steps.'},
      {value:qStr(Q(V,d)),why:`The rule is \`${rule}\`, not \`${d}n\`. Include the number part.`},
      {value:String(d*V+c),why:`That is the value of term number ${V}. Here ${V} is the value of the term, so solve \`${rule} = ${V}\`.`}]),
     hint:`Find the nth term first. Then set it equal to ${V} and solve for n.`,
     steps:[
      {math:rule,note:`The common difference is ${d} and the first term is ${a}, so this is the nth term. The number part is the first term minus the difference: \`${a} - ${K.bracket(d)} = ${c}\`.`},
      {math:`${rule} = ${V}`,note:`Set the nth term equal to ${V}.`},
      {math:`${d}n = ${V-c}`,note:`${undo(c)} both sides.`},
      {math:`n = ${N}`,note:`Divide both sides by ${d}. It is term number ${N}.`}],
     verify:{op:'solve',eq:`${a} + (n - 1)*(${d}) = ${V}`,variable:'n',solutions:['ANSWER']}
    };
   }
   /* A growing pattern made from objects. */
   const noun=rng.pick(['matchsticks','tiles','dots','cubes','beads','coins']),d=rng.int(2,6),a=d+rng.int(1,5),c=a-d,rule=nthRule(a,d);
   const story=`A pattern is made from ${noun}. Pattern 1 uses ${a}, pattern 2 uses ${a+d} and pattern 3 uses ${a+2*d}. The pattern continues in the same way.`;
   const build=[
    {math:`${a+d} - ${a} = ${d}`,note:`Each pattern uses ${d} more ${noun} than the one before, so the rule starts with \`${d}n\`.`},
    {math:rule,note:`Pattern 1 uses ${a}, and \`${d}(1) = ${d}\`, so add ${c}. This is the number of ${noun} in pattern n.`}];
   if(kind==='pattern rule'){
    return {
     prompt:`${story} Write an expression in n for the number of ${noun} in pattern n.`,
     answer:{type:'expr',value:rule,form:'simplified'},
     mistakes:[
      {value:terms([[d,'n'],[a,'']]),why:`Test it with \`n = 1\`: it gives ${d+a}, but pattern 1 uses ${a}. The number part is ${a} minus the common difference.`},
      {value:terms([[a,'n']]),why:`That would make pattern 2 use ${2*a}. Only ${d} ${noun} are added each time.`},
      {value:terms([[a,'n'],[d,'']]),why:`The number in front of n is the common difference, ${d}.`}],
     hint:`Find how many ${noun} are added each time. That number goes in front of n.`,
     steps:[...build,{math:`${d}(3) + ${c} = ${a+2*d}`,note:'Check the rule with pattern 3.'}],
     verify:{op:'identity',a:`${a} + (n - 1)*(${d})`,b:'ANSWER'}
    };
   }
   if(kind==='pattern count'){
    const M=rng.pick([20,25,30,40,50,100]),value=a+(M-1)*d;
    return {
     prompt:`${story} How many ${noun} does pattern ${M} use?`,
     answer:{type:'number',value:String(value)},
     mistakes:wrongs(value,[
      {value:String(a+M*d),why:`From pattern 1 to pattern ${M} there are ${M-1} steps, not ${M}.`},
      {value:String(M*a),why:`Pattern ${M} is not ${M} copies of pattern 1. Only ${d} ${noun} are added each time.`},
      {value:String(M*d),why:`The rule is \`${rule}\`, not \`${d}n\`. Include the number part.`}]),
     hint:'Find the rule for pattern n first. Then put the pattern number in place of n.',
     steps:[...build,{math:`${d}(${M}) + ${c} = ${value}`,note:`Put \`n = ${M}\` into the rule.`}],
     verify:{op:'value',expr:`${a} + (${M} - 1)*(${d})`,equals:'ANSWER'}
    };
   }
   const N=rng.int(12,60),V=a+(N-1)*d;
   return {
    prompt:`${story} Which pattern uses exactly ${V} ${noun}?`,
    answer:{type:'number',label:'n =',value:String(N)},
    mistakes:wrongs(N,[
     {value:String(N-1),why:'That counts the steps from pattern 1. The pattern number is one more than the number of steps.'},
     {value:qStr(Q(V,d)),why:`The rule is \`${rule}\`, not \`${d}n\`. Include the number part.`},
     {value:String(d*V+c),why:`That is the number of ${noun} in pattern ${V}. Here ${V} is the number of ${noun}, so solve \`${rule} = ${V}\`.`}]),
    hint:`Find the rule for pattern n first. Then set it equal to ${V} and solve for n.`,
    steps:[...build,
     {math:`${rule} = ${V}`,note:`Set the rule equal to ${V}.`},
     {math:`${d}n = ${V-c}`,note:`Subtract ${c} from both sides.`},
     {math:`n = ${N}`,note:`Divide both sides by ${d}. It is pattern ${N}.`}],
    verify:{op:'solve',eq:`${a} + (n - 1)*(${d}) = ${V}`,variable:'n',solutions:['ANSWER']}
   };
  }}
 ]
});
})();
