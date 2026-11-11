/* Skill drills: number skills that algebra depends on. Each level's make(rng) returns one question. */
(()=>{
'use strict';
const K=SkillKit,{Q,qAdd,qSub,qMul,qDiv,qStr,qEq,fmt}=K;

/* A number in brackets when negative: 3 * (-2). */
const nb=n=>n<0?`(${n})`:String(n);
/* Drops listed mistakes that equal the answer or an earlier mistake. */
function distinctMistakes(value,list){
 const seen=[String(value)],out=[];
 for(const m of list){const v=String(m.value);if(seen.some(s=>K.sameValue(s,v)))continue;seen.push(v);out.push({value:v,why:m.why})}
 return out;
}
/* A typed-number question whose answer is recomputed from the claim string. */
function numberQuestion({prompt='Work out the value.',math,value,mistakes=[],hint,steps,claim,answer={},round}){
 const verify={op:'value',expr:claim,equals:'ANSWER'};if(Number.isInteger(round))verify.round=round;
 return {prompt,math,answer:{type:'number',value:String(value),...answer},mistakes:distinctMistakes(value,mistakes),hint,steps,verify};
}

/* ---------- Negative numbers ---------- */
K.define({
 id:'negative-numbers',
 title:'Negative numbers',
 strand:'Number',
 lesson:'01-04',
 blurb:'Add, subtract, multiply and divide when some of the numbers are below zero.',
 levels:[
  {name:'Add and subtract',make(rng){
   const hint='Picture the number line. Start at the first number. Adding moves right and subtracting moves left.';
   for(;;){
    const a=rng.int(2,12),b=rng.int(2,12),kind=rng.pick(['-a+b','-a+b','a-b','a-b','a--b','a--b','-a-b','-a-b','-a+-b','-a--b']);
    if(a===b)continue;
    if(kind==='-a+b'){
     const value=b-a,math=`-${a} + ${b}`;
     return numberQuestion({math,value,hint,claim:`(-${a}) + ${b}`,
      mistakes:[
       {value:-(a+b),why:`Adding ${b} moves to the right on the number line, back towards zero. You moved left.`},
       {value:a-b,why:`The size is right but the sign is not. Start at \`-${a}\` and move ${b} places right: ${b>a?'you pass zero, so the answer is positive':'you do not reach zero, so the answer is still negative'}.`},
       {value:a+b,why:`The first number is negative. Start at \`-${a}\`, not at ${a}.`}],
      steps:[
       {math,note:`Start at \`-${a}\` on the number line. Adding ${b} moves ${b} places to the right.`},
       {math:`${math} = ${value}`,note:b>a?`The first ${a} places bring you to 0. ${b-a===1?'One more place takes':'The other '+(b-a)+' take'} you up to ${b-a}.`:`You stop ${a-b} places short of 0, so the answer is negative.`}]});
    }
    if(kind==='a-b'){
     if(b<a)continue;
     const value=a-b,math=`${a} - ${b}`;
     return numberQuestion({math,value,hint,claim:`${a} - ${b}`,
      mistakes:[
       {value:b-a,why:`You took the smaller number from the bigger one. Here you start at ${a} and move ${b} places left, which takes you below zero.`},
       {value:-(a+b),why:`You start at ${a}, above zero. Only ${b-a} of the ${b} places ${b-a===1?'is':'are'} below zero.`}],
      steps:[
       {math,note:`Start at ${a}. Subtracting ${b} moves ${b} places to the left.`},
       {math:`${math} = ${value}`,note:`The first ${a} places bring you to 0. ${b-a===1?'One more place takes':'The other '+(b-a)+' take'} you below zero.`}]});
    }
    if(kind==='a--b'){
     const value=a+b,math=`${a} - (-${b})`;
     return numberQuestion({math,value,hint:'Subtracting a negative number is the same as adding the positive number.',claim:`${a} - (-${b})`,
      mistakes:[
       {value:a-b,why:`Subtracting a negative is the same as adding. \`${a} - (-${b})\` becomes \`${a} + ${b}\`.`},
       {value:-(a+b),why:'The two minus signs together make a plus, so you are adding two positive numbers.'}],
      steps:[
       {math:`${math} = ${a} + ${b}`,note:'Subtracting a negative number is the same as adding the positive number.'},
       {math:`${a} + ${b} = ${value}`,note:'Now add as usual.'}]});
    }
    if(kind==='-a-b'){
     const value=-(a+b),math=`-${a} - ${b}`;
     return numberQuestion({math,value,hint,claim:`(-${a}) - ${b}`,
      mistakes:[
       {value:b-a,why:`Subtracting ${b} moves ${b} places to the left, further below zero. You moved right.`},
       {value:a+b,why:'You start below zero and move further left, so the answer is negative.'},
       {value:a-b,why:`The first number is negative. Start at \`-${a}\`, then move ${b} places left.`}],
      steps:[
       {math,note:`Start at \`-${a}\`. Subtracting ${b} moves ${b} more places to the left.`},
       {math:`${math} = ${value}`,note:`You end up \`${a} + ${b} = ${a+b}\` places below zero.`}]});
    }
    if(kind==='-a+-b'){
     const value=-(a+b),math=`-${a} + (-${b})`;
     return numberQuestion({math,value,hint:'Adding a negative number is the same as subtracting the positive number.',claim:`(-${a}) + (-${b})`,
      mistakes:[
       {value:b-a,why:`Adding a negative is the same as subtracting. \`-${a} + (-${b})\` becomes \`-${a} - ${b}\`.`},
       {value:a+b,why:'Both numbers are negative, so the total is negative.'}],
      steps:[
       {math:`${math} = -${a} - ${b}`,note:'Adding a negative number is the same as subtracting the positive number.'},
       {math:`-${a} - ${b} = ${value}`,note:`Start at \`-${a}\` and move ${b} more places to the left.`}]});
    }
    const value=b-a,math=`-${a} - (-${b})`;
    return numberQuestion({math,value,hint:'Subtracting a negative number is the same as adding the positive number.',claim:`(-${a}) - (-${b})`,
     mistakes:[
      {value:-(a+b),why:`Subtracting a negative is the same as adding. \`-${a} - (-${b})\` becomes \`-${a} + ${b}\`.`},
      {value:a-b,why:`The size is right but the sign is not. Start at \`-${a}\` and move ${b} places to the right.`},
      {value:a+b,why:`The first number is negative. Start at \`-${a}\`, not at ${a}.`}],
     steps:[
      {math:`${math} = -${a} + ${b}`,note:'Subtracting a negative number is the same as adding the positive number.'},
      {math:`-${a} + ${b} = ${value}`,note:`Start at \`-${a}\` and move ${b} places to the right.`}]});
   }
  }},
  {name:'Multiply and divide',make(rng){
   const hint='Work out the size first. Then the sign: same signs give a positive answer, different signs give a negative answer.';
   for(;;){
    const a=rng.int(2,9),b=rng.int(2,9),kind=rng.pick(['times','times','times','divide','divide','divide','three','square']);
    if(kind==='times'){
     const sa=rng.sign(),sb=sa===1?-1:rng.sign(),x=sa*a,y=sb*b,value=x*y,math=`${x} * ${nb(y)}`,same=sa===sb;
     return numberQuestion({math,value,hint,claim:`(${x})*(${y})`,
      mistakes:[
       {value:-value,why:same?'A negative times a negative is positive. The signs are the same, so the answer is positive.':'One number is negative and one is positive. The signs are different, so the answer is negative.'},
       {value:x+y,why:`The sign between the numbers is ×. Multiply the sizes, \`${a} * ${b} = ${a*b}\`, then decide the sign.`}],
      steps:[
       {math:`${a} * ${b} = ${a*b}`,note:'Multiply the sizes first, ignoring the signs.'},
       {math:`${math} = ${value}`,note:same?'Both numbers are negative. Same signs give a positive answer.':'One number is negative and one is positive. Different signs give a negative answer.'}]});
    }
    if(kind==='divide'){
     const sa=rng.sign(),sb=sa===1?-1:rng.sign(),x=sa*a*b,y=sb*b,value=x/y,math=`${x} ÷ ${nb(y)}`,same=sa===sb;
     return numberQuestion({math,value,hint,claim:`(${x})/(${y})`,
      mistakes:[
       {value:-value,why:same?'A negative divided by a negative is positive. The signs are the same, so the answer is positive.':'The signs are different, so the answer is negative.'},
       {value:x-y,why:`The sign between the numbers is ÷. Divide the sizes, \`${a*b} ÷ ${b} = ${a}\`, then decide the sign.`}],
      steps:[
       {math:`${a*b} ÷ ${b} = ${a}`,note:'Divide the sizes first, ignoring the signs.'},
       {math:`${math} = ${value}`,note:same?'Both numbers are negative. Same signs give a positive answer.':'One number is negative and one is positive. Different signs give a negative answer.'}]});
    }
    if(kind==='three'){
     const c=rng.int(2,5),signs=rng.pick([[-1,1,-1],[-1,-1,1],[-1,-1,-1],[1,-1,-1],[-1,-1,-1]]);
     if(a>6||b>6)continue;
     const x=signs[0]*a,y=signs[1]*b,z=signs[2]*c,value=x*y*z,negatives=signs.filter(s=>s<0).length,math=`${x} * ${nb(y)} * ${nb(z)}`;
     return numberQuestion({math,value,hint:'Multiply the sizes. Then count the negative signs: an even number of them gives a positive answer, an odd number gives a negative answer.',claim:`(${x})*(${y})*(${z})`,
      mistakes:[
       {value:-value,why:`Count the negative signs. There are ${negatives}, which is an ${negatives%2?'odd':'even'} number, so the answer is ${negatives%2?'negative':'positive'}.`}],
      steps:[
       {math:`${x} * ${nb(y)} = ${x*y}`,note:`Multiply the first two numbers. ${signs[0]===signs[1]?'Same signs give a positive answer.':'Different signs give a negative answer.'}`},
       {math:`${x*y} * ${nb(z)} = ${value}`,note:`Multiply the result by the third number. ${Math.sign(x*y)===signs[2]?'Same signs give a positive answer.':'Different signs give a negative answer.'}`}]});
    }
    const math=`(-${a})^2`,value=a*a;
    return numberQuestion({math,value,hint:'Squaring a number means multiplying it by itself.',claim:`(-${a})^2`,
     mistakes:[
      {value:-value,why:`\`(-${a})^2\` means \`(-${a}) * (-${a})\`. A negative times a negative is positive.`},
      {value:-2*a,why:`Squared means multiplied by itself, not multiplied by 2. Work out \`(-${a}) * (-${a})\`.`},
      {value:2*a,why:`Squared means multiplied by itself, not multiplied by 2. Work out \`(-${a}) * (-${a})\`.`}],
     steps:[
      {math:`${math} = (-${a}) * (-${a})`,note:'Squaring means multiplying the number by itself.'},
      {math:`(-${a}) * (-${a}) = ${value}`,note:'Same signs give a positive answer.'}]});
   }
  }},
  {name:'Mixed operations',make(rng){
   for(;;){
    const kind=rng.pick(['square','products','substitute','bracket']);
    if(kind==='square'){
     /* (-a)^2 - b * (-c)  or  (-a)^2 + b * (-c) */
     const a=rng.int(2,7),b=rng.int(2,6),c=rng.int(2,6),minus=rng.chance(.6),product=-b*c,value=minus?a*a-product:a*a+product;
     const math=`(-${a})^2 ${minus?'-':'+'} ${b} * (-${c})`;
     return numberQuestion({math,value,hint:'Work out the square and the multiplication first. Keep each negative number in its brackets until you have dealt with it.',claim:`(-${a})^2 ${minus?'-':'+'} ${b}*(-${c})`,
      mistakes:[
       {value:minus?a*a+product:a*a-product,why:minus?`\`${b} * (-${c}) = ${product}\`. Subtracting \`${product}\` is the same as adding ${-product}.`:`\`${b} * (-${c}) = ${product}\`, a negative number. Adding \`${product}\` is the same as subtracting ${-product}.`},
       {value:-a*a+(minus?-product:product),why:`\`(-${a})^2\` means \`(-${a}) * (-${a})\`, which is \`${a*a}\`, a positive number.`},
       {value:-a*a+(minus?product:-product),why:`\`(-${a})^2\` means \`(-${a}) * (-${a})\`, which is \`${a*a}\`. Then check the sign of \`${b} * (-${c})\`.`}],
      steps:[
       {math:`(-${a})^2 = (-${a}) * (-${a}) = ${a*a}`,note:'Do the square first. Negative times negative is positive.'},
       {math:`${b} * (-${c}) = ${product}`,note:'Then the multiplication. Different signs give a negative answer.'},
       {math:`${a*a} ${minus?'-':'+'} (${product}) = ${a*a} ${minus?'+':'-'} ${-product}`,note:minus?'Subtracting a negative is the same as adding.':'Adding a negative is the same as subtracting.'},
       {math:`${a*a} ${minus?'+':'-'} ${-product} = ${value}`,note:'Finish the sum.'}]});
    }
    if(kind==='products'){
     /* -a * b - c * (-d) */
     const a=rng.int(2,7),b=rng.int(2,7),c=rng.int(2,7),d=rng.int(2,7);
     if(a*b===c*d)continue;
     const value=-a*b+c*d,math=`-${a} * ${b} - ${c} * (-${d})`;
     return numberQuestion({math,value,hint:'Do the two multiplications first. Then subtract, taking care with the signs.',claim:`(-${a})*${b} - ${c}*(-${d})`,
      mistakes:[
       {value:-a*b-c*d,why:`\`${c} * (-${d}) = ${-c*d}\`. Subtracting \`${-c*d}\` is the same as adding ${c*d}.`},
       {value:a*b+c*d,why:`\`-${a} * ${b}\` has different signs, so it is \`${-a*b}\`, a negative number.`},
       {value:a*b-c*d,why:`Check both products: \`-${a} * ${b} = ${-a*b}\` and \`${c} * (-${d}) = ${-c*d}\`.`}],
      steps:[
       {math:`-${a} * ${b} = ${-a*b}`,note:'First multiplication. Different signs give a negative answer.'},
       {math:`${c} * (-${d}) = ${-c*d}`,note:'Second multiplication. Different signs give a negative answer.'},
       {math:`${-a*b} - (${-c*d}) = ${-a*b} + ${c*d}`,note:'Subtracting a negative is the same as adding.'},
       {math:`${-a*b} + ${c*d} = ${value}`,note:'Finish the sum.'}]});
    }
    if(kind==='substitute'){
     /* p x^2 + b x + c at a negative x */
     const p=rng.pick([1,1,2,3]),b=rng.nonzero(-6,6),c=rng.int(-9,9),x=-rng.int(2,5),expression=K.quadratic(p,b,c);
     const square=x*x,first=p*square,middle=b*x,value=first+middle+c;
     if(Math.abs(b)===1)continue;
     const shown=`${p===1?'':p}(${x})^2 ${b<0?'-':'+'} ${Math.abs(b)}(${x})${c?' '+K.signed(c):''}`;
     return numberQuestion({prompt:`Find the value of the expression when \`x = ${x}\`.`,math:expression,value,
      hint:`Write \`(${x})\` in brackets everywhere you see x. Then work out the square first.`,
      claim:`${p}*(${x})^2 + (${b})*(${x}) + (${c})`,
      mistakes:[
       {value:-first+middle+c,why:`\`(${x})^2\` means \`(${x}) * (${x}) = ${square}\`, a positive number. Putting the value in brackets helps.`},
       {value:first-middle+c,why:`Check the middle term: \`${b}(${x}) = ${middle}\`. ${b<0?'Negative times negative is positive.':'Positive times negative is negative.'}`},
       {value:-first-middle+c,why:`Put \`(${x})\` in brackets each time. \`(${x})^2 = ${square}\` and \`${b}(${x}) = ${middle}\`.`}],
      steps:[
       {math:shown,note:`Replace every x with \`(${x})\`, in brackets.`},
       {math:`(${x})^2 = ${square}`,note:'Square first. Negative times negative is positive.'},
       {math:K.terms([[first,''],[middle,''],[c,'']]),note:`${p===1?'':'Multiply the square by '+p+'. '}The middle term is \`${b}(${x}) = ${middle}\`.`},
       {math:`${K.terms([[first,''],[middle,''],[c,'']])} = ${value}`,note:'Add and subtract from left to right.'}]});
    }
    /* -a(b - c) with b < c, or a(b - c) - d */
    const a=rng.int(2,6),b=rng.int(1,6),c=b+rng.int(2,6),d=rng.int(2,9),inside=b-c;
    if(rng.chance(.5)){
     const value=-a*inside,math=`-${a}(${b} - ${c})`;
     return numberQuestion({math,value,hint:'Work out the bracket first. Then multiply, and decide the sign.',claim:`(-${a})*(${b} - ${c})`,
      mistakes:[
       {value:a*inside,why:`The bracket is \`${inside}\` and it is multiplied by \`-${a}\`. Negative times negative is positive.`},
       {value:-a*(c+b),why:`\`${b} - ${c}\` is \`${inside}\`. You start at ${b} and move ${c} places left.`},
       {value:-a*b-c,why:`The \`-${a}\` multiplies the whole bracket. Work out \`${b} - ${c}\` first.`}],
      steps:[
       {math:`${b} - ${c} = ${inside}`,note:'Brackets first. The answer is below zero.'},
       {math:`-${a} * (${inside}) = ${value}`,note:'Negative times negative is positive.'}]});
    }
    const value=a*inside-d,math=`${a}(${b} - ${c}) - ${d}`;
    return numberQuestion({math,value,hint:'Work out the bracket first, then multiply, then subtract.',claim:`${a}*(${b} - ${c}) - ${d}`,
     mistakes:[
      {value:-a*inside-d,why:`The bracket is \`${inside}\`, a negative number. \`${a} * (${inside}) = ${a*inside}\`.`},
      {value:a*inside+d,why:`\`${a*inside} - ${d}\` moves ${d} more places to the left, further below zero.`}],
     steps:[
      {math:`${b} - ${c} = ${inside}`,note:'Brackets first. The answer is below zero.'},
      {math:`${a} * (${inside}) = ${a*inside}`,note:'Different signs give a negative answer.'},
      {math:`${a*inside} - ${d} = ${value}`,note:`Subtracting ${d} moves ${d} more places to the left.`}]});
   }
  }}
 ]
});

/* ---------- Order of operations ---------- */
K.define({
 id:'order-of-operations',
 title:'Order of operations',
 strand:'Number',
 lesson:'01-04',
 blurb:'Brackets first, then powers, then multiply and divide, then add and subtract.',
 levels:[
  {name:'Multiply before adding',make(rng){
   const hint='Multiply and divide before you add and subtract.';
   for(;;){
    const kind=rng.pick(['a+bc','a+bc','a-bc','a+b/c','a-b/c','ab+cd']),b=rng.int(2,9),c=rng.int(2,9);
    if(kind==='a+bc'){
     const a=rng.int(2,12),value=a+b*c,math=`${a} + ${b} * ${c}`;
     if(a===b||b===c)continue;
     return numberQuestion({math,value,hint,claim:`${a} + ${b}*${c}`,
      mistakes:[{value:(a+b)*c,why:`You added first. Multiplication comes before addition, so work out \`${b} * ${c}\` first.`}],
      steps:[
       {math:`${b} * ${c} = ${b*c}`,note:'Multiplication comes before addition, so do this part first.'},
       {math:`${a} + ${b*c} = ${value}`,note:'Now add.'}]});
    }
    if(kind==='a-bc'){
     if(b>6||c>6||b===c)continue;
     const a=b*c+rng.int(1,12),value=a-b*c,math=`${a} - ${b} * ${c}`;
     return numberQuestion({math,value,hint,claim:`${a} - ${b}*${c}`,
      mistakes:[{value:(a-b)*c,why:`You subtracted first. Multiplication comes before subtraction, so work out \`${b} * ${c}\` first.`}],
      steps:[
       {math:`${b} * ${c} = ${b*c}`,note:'Multiplication comes before subtraction, so do this part first.'},
       {math:`${a} - ${b*c} = ${value}`,note:'Now subtract.'}]});
    }
    if(kind==='a+b/c'||kind==='a-b/c'){
     const plus=kind==='a+b/c',k=rng.int(2,9),top=c*k,a=plus?rng.int(2,12):k+rng.int(1,12),value=plus?a+k:a-k,sign=plus?'+':'-';
     if(a===top||c>6)continue;
     const math=`${a} ${sign} ${top} ÷ ${c}`;
     return numberQuestion({math,value,hint,claim:`${a} ${sign} ${top}/${c}`,
      mistakes:[{value:qStr(Q(plus?a+top:a-top,c)),why:`You ${plus?'added':'subtracted'} first. Division comes before ${plus?'addition':'subtraction'}, so work out \`${top} ÷ ${c}\` first.`}],
      steps:[
       {math:`${top} ÷ ${c} = ${k}`,note:`Division comes before ${plus?'addition':'subtraction'}, so do this part first.`},
       {math:`${a} ${sign} ${k} = ${value}`,note:plus?'Now add.':'Now subtract.'}]});
    }
    const a=rng.int(2,9),d=rng.int(2,9),value=a*b+c*d,math=`${a} * ${b} + ${c} * ${d}`;
    if(a===c&&b===d)continue;
    return numberQuestion({math,value,hint:'Do both multiplications first. Then add the two results.',claim:`${a}*${b} + ${c}*${d}`,
     mistakes:[
      {value:(a*b+c)*d,why:`You worked from left to right. Do both multiplications before you add: \`${a} * ${b}\` and \`${c} * ${d}\`.`},
      {value:a*(b+c)*d,why:`You added \`${b} + ${c}\` first. Do both multiplications before you add.`}],
     steps:[
      {math:`${a} * ${b} = ${a*b}`,note:'First multiplication.'},
      {math:`${c} * ${d} = ${c*d}`,note:'Second multiplication.'},
      {math:`${a*b} + ${c*d} = ${value}`,note:'Add last.'}]});
   }
  }},
  {name:'Brackets and powers',make(rng){
   const hint='Order: brackets, then powers, then multiply and divide, then add and subtract.';
   for(;;){
    const kind=rng.pick(['a+bc2','(a+b)2-c','a(b-c)+d','a2-bc','ab2']);
    if(kind==='a+bc2'){
     const a=rng.int(1,12),b=rng.int(2,5),c=rng.int(2,5),value=a+b*c*c,math=`${a} + ${b} * ${c}^2`;
     return numberQuestion({math,value,hint,claim:`${a} + ${b}*${c}^2`,
      mistakes:[
       {value:a+b*c*b*c,why:`The power belongs to the ${c} only. Work out \`${c}^2 = ${c*c}\` first, then multiply by ${b}.`},
       {value:(a+b)*c*c,why:'You added first. Powers and multiplication come before addition.'},
       {value:a+b*c*2,why:`\`${c}^2\` means \`${c} * ${c}\`, not \`${c} * 2\`.`}],
      steps:[
       {math:`${c}^2 = ${c*c}`,note:'There are no brackets, so the power comes first.'},
       {math:`${b} * ${c*c} = ${b*c*c}`,note:'Then multiply.'},
       {math:`${a} + ${b*c*c} = ${value}`,note:'Add last.'}]});
    }
    if(kind==='(a+b)2-c'){
     const a=rng.int(1,6),b=rng.int(1,6),s=a+b,c=rng.int(1,20),value=s*s-c,math=`(${a} + ${b})^2 - ${c}`;
     if(value===0||a===b||c===s)continue;
     return numberQuestion({math,value,hint,claim:`(${a} + ${b})^2 - ${c}`,
      mistakes:[
       {value:a*a+b*b-c,why:`Work out the bracket first: \`${a} + ${b} = ${s}\`. Then square the ${s}.`},
       {value:a+b*b-c,why:`The whole bracket is squared, not only the ${b}. Work out \`${a} + ${b}\` first.`},
       {value:s*2-c,why:`\`${s}^2\` means \`${s} * ${s}\`, not \`${s} * 2\`.`}],
      steps:[
       {math:`${a} + ${b} = ${s}`,note:'Brackets first.'},
       {math:`${s}^2 = ${s*s}`,note:'Then the power.'},
       {math:`${s*s} - ${c} = ${value}`,note:'Subtract last.'}]});
    }
    if(kind==='a(b-c)+d'){
     const a=rng.int(2,9),c=rng.int(1,8),diff=rng.int(2,8),b=c+diff,d=rng.int(1,12),value=a*diff+d,math=`${a}(${b} - ${c}) + ${d}`;
     return numberQuestion({math,value,hint,claim:`${a}*(${b} - ${c}) + ${d}`,
      mistakes:[
       {value:a*b-c+d,why:`The ${a} multiplies the whole bracket. Work out \`${b} - ${c}\` first.`},
       {value:a*(diff+d),why:`Multiply before you add: \`${a} * ${diff}\` first, then add ${d}.`}],
      steps:[
       {math:`${b} - ${c} = ${diff}`,note:'Brackets first.'},
       {math:`${a} * ${diff} = ${a*diff}`,note:'Then multiply. A number written beside a bracket multiplies it.'},
       {math:`${a*diff} + ${d} = ${value}`,note:'Add last.'}]});
    }
    if(kind==='a2-bc'){
     const a=rng.int(3,9),b=rng.int(2,6),c=rng.int(2,6),value=a*a-b*c,math=`${a}^2 - ${b} * ${c}`;
     if(value===0||b===c)continue;
     return numberQuestion({math,value,hint,claim:`${a}^2 - ${b}*${c}`,
      mistakes:[
       {value:(a*a-b)*c,why:`Multiply before you subtract. Work out \`${b} * ${c}\` and then take it from \`${a*a}\`.`},
       {value:2*a-b*c,why:`\`${a}^2\` means \`${a} * ${a}\`, not \`${a} * 2\`.`}],
      steps:[
       {math:`${a}^2 = ${a*a}`,note:'The power comes first.'},
       {math:`${b} * ${c} = ${b*c}`,note:'Then multiply.'},
       {math:`${a*a} - ${b*c} = ${value}`,note:value<0?'Subtract last. The answer is below zero.':'Subtract last.'}]});
    }
    const a=rng.int(2,6),b=rng.int(2,6),value=a*b*b,math=`${a} * ${b}^2`;
    if(a===b)continue;
    return numberQuestion({math,value,hint,claim:`${a}*${b}^2`,
     mistakes:[
      {value:a*b*a*b,why:`Powers come before multiplication. Square the ${b} first, then multiply by ${a}.`},
      {value:a*b*2,why:`\`${b}^2\` means \`${b} * ${b}\`, not \`${b} * 2\`.`}],
     steps:[
      {math:`${b}^2 = ${b*b}`,note:`The power belongs to the ${b} only, and powers come before multiplication.`},
      {math:`${a} * ${b*b} = ${value}`,note:'Then multiply.'}]});
   }
  }},
  {name:'Fraction bars and negatives',make(rng){
   for(;;){
    const kind=rng.pick(['top','both','power','mixed']);
    if(kind==='top'){
     /* (a + b * c) / d with c negative */
     const d=rng.int(2,7),value=rng.nonzero(-6,6),b=rng.int(2,6),c=-rng.int(2,6),top=d*value,a=top-b*c;
     if(a<1||a>40||a===b||Math.abs(value)===1)continue;
     const math=`frac(${a} + ${b} * (${c}), ${d})`;
     return numberQuestion({math,value,hint:'The fraction bar works like brackets. Work out the whole top line first, then divide.',claim:`(${a} + ${b}*(${c}))/${d}`,
      mistakes:[
       {value:qStr(Q((a+b)*c,d)),why:`On the top line, multiply before you add: \`${b} * (${c}) = ${b*c}\`.`},
       {value:qStr(Q(a-b*c,d)),why:`\`${b} * (${c}) = ${b*c}\`, a negative number. Adding it is the same as subtracting ${-b*c}.`},
       {value:qStr(qAdd(Q(a),Q(b*c,d))),why:'The fraction bar covers the whole top line. Finish the top before you divide.'}],
      steps:[
       {math:`${b} * (${c}) = ${b*c}`,note:'Work on the top line first. Multiplication comes before addition.'},
       {math:`${a} + (${b*c}) = ${top}`,note:`Adding a negative is the same as subtracting: \`${a} - ${-b*c}\`.`},
       {math:`frac(${top}, ${d}) = ${value}`,note:'Now divide the top by the bottom.'}]});
    }
    if(kind==='both'){
     /* ((-a)^2 - b) / (c - d) */
     const a=rng.int(2,6),c=rng.int(1,6),k=rng.int(2,6),d=c+k,value=rng.nonzero(-8,8),top=-k*value,b=a*a-top;
     if(b<1||b>40||Math.abs(value)===1)continue;
     const math=`frac((-${a})^2 - ${b}, ${c} - ${d})`;
     return numberQuestion({math,value,hint:'The fraction bar works like brackets. Work out the top line and the bottom line separately, then divide.',claim:`((-${a})^2 - ${b})/(${c} - ${d})`,
      mistakes:[
       {value:-value,why:`Check the signs. The top is \`${top}\` and the bottom is \`${c} - ${d} = ${-k}\`. ${top<0?'Same signs give a positive answer.':'Different signs give a negative answer.'}`},
       {value:qStr(Q(-a*a-b,-k)),why:`\`(-${a})^2\` means \`(-${a}) * (-${a}) = ${a*a}\`, a positive number.`}],
      steps:[
       {math:`(-${a})^2 - ${b} = ${a*a} - ${b} = ${top}`,note:'Top line: the power first, then subtract.'},
       {math:`${c} - ${d} = ${-k}`,note:'Bottom line.'},
       {math:`frac(${top}, ${-k}) = ${value}`,note:`Divide the top by the bottom. ${top<0?'Same signs give a positive answer.':'Different signs give a negative answer.'}`}]});
    }
    if(kind==='power'){
     /* a - b(c - d)^2 */
     const a=rng.int(1,20),b=rng.int(2,5),c=rng.int(1,6),inside=-rng.int(2,4),d=c-inside,square=inside*inside,value=a-b*square;
     if(value===0||a===b)continue;
     const math=`${a} - ${b}(${c} - ${d})^2`;
     return numberQuestion({math,value,hint:'Order: brackets, then powers, then multiply, then subtract.',claim:`${a} - ${b}*(${c} - ${d})^2`,
      mistakes:[
       {value:(a-b)*square,why:`Do the multiplication before the subtraction. Keep \`${a} -\` until the end.`},
       {value:a+b*square,why:`\`(${inside})^2 = ${square}\`, a positive number. You then subtract \`${b} * ${square}\`.`},
       {value:a-b*inside*b*inside,why:`The power belongs to the bracket only. Square the bracket first, then multiply by ${b}.`}],
      steps:[
       {math:`${c} - ${d} = ${inside}`,note:'Brackets first.'},
       {math:`(${inside})^2 = ${square}`,note:'Then the power. Negative times negative is positive.'},
       {math:`${b} * ${square} = ${b*square}`,note:'Then multiply.'},
       {math:`${a} - ${b*square} = ${value}`,note:'Subtract last.'}]});
    }
    /* (-a * b) / c - (-d)^2 */
    const a=rng.int(2,5),c=rng.int(2,5),m=rng.int(2,3),b=c*m,d=rng.int(2,5),quotient=-a*m,value=quotient-d*d;
    if(a===c)continue;
    const math=`frac(-${a} * ${b}, ${c}) - (-${d})^2`;
    return numberQuestion({math,value,hint:'Work out the fraction and the power separately. Subtract at the end.',claim:`((-${a})*${b})/${c} - (-${d})^2`,
     mistakes:[
      {value:quotient+d*d,why:`\`(-${d})^2 = ${d*d}\`, a positive number, and it is subtracted.`},
      {value:-quotient-d*d,why:`The top of the fraction is \`-${a} * ${b} = ${-a*b}\`, so the fraction is negative.`},
      {value:-quotient+d*d,why:`Check both parts: the fraction is \`${quotient}\` and \`(-${d})^2 = ${d*d}\` is subtracted.`}],
     steps:[
      {math:`-${a} * ${b} = ${-a*b}`,note:'Top of the fraction first. Different signs give a negative answer.'},
      {math:`frac(${-a*b}, ${c}) = ${quotient}`,note:'Divide the top by the bottom.'},
      {math:`(-${d})^2 = ${d*d}`,note:'Now the power. Negative times negative is positive.'},
      {math:`${quotient} - ${d*d} = ${value}`,note:'Subtract last.'}]});
   }
  }}
 ]
});

/* ---------- Fractions ---------- */
const F=(n,d)=>`frac(${n}, ${d})`;
const lcm=(a,b)=>a*b/K.gcd(a,b);
/* A numerator that makes a proper fraction in its simplest form. */
const topFor=(rng,d)=>{for(;;){const n=rng.int(1,d-1);if(K.gcd(n,d)===1)return n}};
/* A top-heavy fraction shown as a mixed number: 2frac(1, 3). */
const mixed=q=>q.d===1?String(q.n):q.n<q.d?F(q.n,q.d):`${Math.floor(q.n/q.d)}${F(q.n%q.d,q.d)}`;
const FRACTION_PROMPT='Work out. Give your answer as a fraction in its simplest form.';
const MIXED_PROMPT='Work out. Give your answer in its simplest form. You can type a mixed number with a space, such as 2 1/3.';
const PAIRS=[[2,4],[2,6],[2,8],[3,6],[3,9],[4,8],[5,10],[2,10],[3,12],[4,12],[2,3],[2,5],[3,4],[3,5],[2,7],[4,5],[3,7],[2,9],[3,8],[5,6]];
/* The closing worked steps: simplify n/d when possible, then show a top-heavy answer as a mixed number. */
function closingSteps(n,d,showMixed=false){
 const q=Q(n,d),g=K.gcd(n,d),out=[];
 if(g>1)out.push({math:`${F(n,d)} = ${fmt(q)}`,note:q.d===1?`${n} divided by ${d} is ${q.n}.`:`Divide the top and bottom by ${g} to write the fraction in its simplest form.`});
 if(showMixed&&q.d!==1&&q.n>q.d)out.push({math:`${fmt(q)} = ${mixed(q)}`,note:`As a mixed number: ${q.n} divided by ${q.d} is ${Math.floor(q.n/q.d)} with ${q.n%q.d} left over. Either form is accepted.`});
 return out;
}
const fractionQuestion=o=>numberQuestion({prompt:FRACTION_PROMPT,...o,value:qStr(o.value),mistakes:(o.mistakes||[]).map(m=>({value:qStr(m.value),why:m.why})),answer:{simplest:true}});

K.define({
 id:'fractions',
 title:'Fraction arithmetic',
 strand:'Number',
 lesson:'21-01',
 blurb:'Add, subtract, multiply and divide fractions, and give the answer in its simplest form.',
 levels:[
  {name:'Add and subtract',make(rng){
   for(;;){
    let [b,d]=rng.pick(PAIRS);if(rng.chance(.5))[b,d]=[d,b];
    let a=topFor(rng,b),c=topFor(rng,d);const plus=rng.chance(.5);
    if(!plus&&a*d<c*b)[a,b,c,d]=[c,d,a,b];
    const L=lcm(b,d),A=a*L/b,C=c*L/d,S=plus?A+C:A-C,sign=plus?'+':'-';
    if(S<=0)continue;
    const steps=[];
    if(b!==L)steps.push({math:`${F(a,b)} = ${F(A,L)}`,note:`Use ${L} as the common denominator. Multiply the top and bottom of the first fraction by ${L/b}.`});
    if(d!==L)steps.push({math:`${F(c,d)} = ${F(C,L)}`,note:`${b!==L?'':'Use '+L+' as the common denominator. '}Multiply the top and bottom of the second fraction by ${L/d}.`});
    steps.push({math:`${F(A,L)} ${sign} ${F(C,L)} = ${F(S,L)}`,note:`The denominators match, so ${plus?'add':'subtract'} the numerators. The denominator stays ${L}.`});
    steps.push(...closingSteps(S,L));
    const mistakes=[];
    if(plus)mistakes.push({value:Q(a+c,b+d),why:'You added the tops and added the bottoms. Fractions need the same denominator before you add, and that denominator does not change.'});
    else if(a!==c)mistakes.push({value:Q(Math.abs(a-c),Math.abs(b-d)),why:'You subtracted the tops and subtracted the bottoms. Fractions need the same denominator before you subtract, and that denominator does not change.'});
    if(plus||a>c)mistakes.push({value:Q(plus?a+c:a-c,L),why:`You changed the denominators to ${L} but kept the old numerators. Whatever you multiply the bottom by, multiply the top by the same number.`});
    return fractionQuestion({math:`${F(a,b)} ${sign} ${F(c,d)}`,value:Q(S,L),mistakes,steps,
     hint:`Change the fractions so they have the same denominator. Look for a number that both ${b} and ${d} divide into.`,
     claim:`(${a}/${b}) ${sign} (${c}/${d})`});
   }
  }},
  {name:'Multiply and divide',make(rng){
   for(;;){
    const kind=rng.pick(['times','times','divide','divide','whole','share']);
    const b=rng.int(2,8),d=rng.int(2,8),a=topFor(rng,b),c=topFor(rng,d),n=rng.int(2,9);
    if(kind==='times'){
     if(b===d&&a===c)continue;
     const top=a*c,bottom=b*d,more=closingSteps(top,bottom);
     return fractionQuestion({math:`${F(a,b)} * ${F(c,d)}`,value:Q(top,bottom),
      hint:'To multiply fractions, multiply top by top and bottom by bottom. Then simplify.',
      claim:`(${a}/${b})*(${c}/${d})`,
      mistakes:[
       {value:Q(a*d,b*c),why:'You turned the second fraction upside down. That is the method for dividing. To multiply, go straight across: top times top, bottom times bottom.'},
       {value:Q((a*lcm(b,d)/b)*(c*lcm(b,d)/d),lcm(b,d)),why:'You do not need a common denominator to multiply. Multiply top by top and bottom by bottom.'},
       {value:qAdd(Q(a,b),Q(c,d)),why:'That is the sum of the two fractions. The sign is ×, so multiply top by top and bottom by bottom.'}],
      steps:[
       {math:`${F(a,b)} * ${F(c,d)} = ${F(`${a} * ${c}`,`${b} * ${d}`)}`,note:'Multiply the tops together and the bottoms together.'},
       {math:`${F(`${a} * ${c}`,`${b} * ${d}`)} = ${F(top,bottom)}`,note:more.length?'Work out the top and the bottom.':`Work out the top and the bottom. No number divides into both ${top} and ${bottom}, so this is the simplest form.`},
       ...more]});
    }
    if(kind==='divide'){
     if(b===d&&a===c)continue;
     const top=a*d,bottom=b*c;
     return fractionQuestion({math:`${F(a,b)} ÷ ${F(c,d)}`,value:Q(top,bottom),
      hint:'To divide by a fraction, turn the second fraction upside down and multiply.',
      claim:`(${a}/${b})/(${c}/${d})`,
      mistakes:[
       {value:Q(a*c,b*d),why:`You multiplied without turning the second fraction upside down. Dividing by \`${F(c,d)}\` is the same as multiplying by \`${F(d,c)}\`.`},
       {value:Q(b*c,a*d),why:'Turn the second fraction upside down, not the first.'}],
      steps:[
       {math:`${F(a,b)} ÷ ${F(c,d)} = ${F(a,b)} * ${F(d,c)}`,note:'To divide by a fraction, turn it upside down and multiply.'},
       {math:`${F(a,b)} * ${F(d,c)} = ${F(top,bottom)}`,note:'Multiply the tops together and the bottoms together.'},
       ...closingSteps(top,bottom,true)]});
    }
    if(kind==='whole'){
     if(b<3)continue;
     const top=n*a;
     return fractionQuestion({math:`${n} * ${F(a,b)}`,value:Q(top,b),
      hint:`Write ${n} as \`${F(n,1)}\`. Then multiply top by top and bottom by bottom.`,
      claim:`${n}*(${a}/${b})`,
      mistakes:[
       {value:Q(a,b),why:`You multiplied the top and the bottom by ${n}, which gives back the same fraction. Multiply the top only.`},
       {value:Q(a,n*b),why:`You multiplied the bottom by ${n}. That makes the fraction smaller. Multiply the top by ${n} and leave the bottom alone.`}],
      steps:[
       {math:`${n} = ${F(n,1)}`,note:'Write the whole number as a fraction over 1.'},
       {math:`${F(n,1)} * ${F(a,b)} = ${F(top,b)}`,note:'Multiply the tops together and the bottoms together.'},
       ...closingSteps(top,b,true)]});
    }
    if(b<3&&a===1&&n===2)continue;
    const bottom=b*n;
    return fractionQuestion({math:`${F(a,b)} ÷ ${n}`,value:Q(a,bottom),
     hint:`Write ${n} as \`${F(n,1)}\`. To divide by a fraction, turn it upside down and multiply.`,
     claim:`(${a}/${b})/${n}`,
     mistakes:[
      {value:Q(a*n,b),why:`You multiplied by ${n}. Dividing by ${n} makes the fraction smaller: it is the same as multiplying by \`${F(1,n)}\`.`},
      {value:Q(b*n,a),why:`Turn the ${n} upside down, not the first fraction. Dividing by ${n} is the same as multiplying by \`${F(1,n)}\`.`}],
     steps:[
      {math:`${F(a,b)} ÷ ${n} = ${F(a,b)} * ${F(1,n)}`,note:`Dividing by ${n} is the same as multiplying by \`${F(1,n)}\`.`},
      {math:`${F(a,b)} * ${F(1,n)} = ${F(a,bottom)}`,note:'Multiply the tops together and the bottoms together.'},
      ...closingSteps(a,bottom)]});
   }
  }},
  {name:'Exam style',make(rng){
   for(;;){
    const kind=rng.pick(['mixedadd','mixedadd','mixedtimes','three','context']);
    if(kind==='mixedadd'){
     let [b,d]=rng.pick([...PAIRS,[4,6],[6,8],[6,9],[4,10]]);if(rng.chance(.5))[b,d]=[d,b];
     let a=topFor(rng,b),c=topFor(rng,d),w1=rng.int(1,4),w2=rng.int(1,3);const plus=rng.chance(.45);
     if(!plus&&(w1*b+a)*d<(w2*d+c)*b)[a,b,w1,c,d,w2]=[c,d,w2,a,b,w1];
     const p=w1*b+a,r=w2*d+c,L=lcm(b,d),P=p*L/b,R=r*L/d,S=plus?P+R:P-R,sign=plus?'+':'-';
     if(S<=0||L>12)continue;
     const mistakes=[];
     if(plus)mistakes.push({value:qAdd(Q(w1+w2),Q(a+c,b+d)),why:'You added the fraction parts top to top and bottom to bottom. The fraction parts need a common denominator first.'});
     else if(a*d<c*b)mistakes.push({value:qAdd(Q(w1-w2),qSub(Q(c,d),Q(a,b))),why:'You subtracted the fraction parts the wrong way round. Change both mixed numbers to top-heavy fractions first and this cannot happen.'});
     mistakes.push({value:plus?qAdd(Q(a,b),Q(c,d)):qSub(Q(w1*b+a,b),Q(c,d)),why:plus?'You added the fraction parts and left out the whole numbers.':`The second number is \`${w2}${F(c,d)}\`. Subtract its whole number part as well.`});
     return fractionQuestion({prompt:MIXED_PROMPT,math:`${w1}${F(a,b)} ${sign} ${w2}${F(c,d)}`,value:Q(S,L),mistakes,
      hint:'Change each mixed number to a top-heavy fraction first. Then find a common denominator.',
      claim:`(${w1} + ${a}/${b}) ${sign} (${w2} + ${c}/${d})`,
      steps:[
       {math:`${w1}${F(a,b)} = ${F(p,b)} and ${w2}${F(c,d)} = ${F(r,d)}`,note:'Change each mixed number to a top-heavy fraction: multiply the whole number by the denominator, then add the numerator.'},
       {math:`${F(p,b)} ${sign} ${F(r,d)} = ${F(P,L)} ${sign} ${F(R,L)}`,note:`Use ${L} as the common denominator.`},
       {math:`${F(P,L)} ${sign} ${F(R,L)} = ${F(S,L)}`,note:`${plus?'Add':'Subtract'} the numerators. The denominator stays ${L}.`},
       ...closingSteps(S,L,true)]});
    }
    if(kind==='mixedtimes'){
     const b=rng.int(2,5),d=rng.int(2,5),a=topFor(rng,b),c=topFor(rng,d),w1=rng.int(1,3),w2=rng.int(1,3),times=rng.chance(.5);
     const p=w1*b+a,r=w2*d+c;
     if(p*d===r*b)continue;
     const top=times?p*r:p*d,bottom=times?b*d:b*r,sign=times?'*':'÷';
     return fractionQuestion({prompt:MIXED_PROMPT,math:`${w1}${F(a,b)} ${sign} ${w2}${F(c,d)}`,value:Q(top,bottom),
      hint:`Change each mixed number to a top-heavy fraction first. ${times?'Then multiply top by top and bottom by bottom.':'Then turn the second fraction upside down and multiply.'}`,
      claim:`(${w1} + ${a}/${b})${times?'*':'/'}(${w2} + ${c}/${d})`,
      mistakes:times?[
       {value:qAdd(Q(w1*w2),Q(a*c,b*d)),why:'You multiplied the whole numbers and the fraction parts separately. That leaves out part of the product. Change to top-heavy fractions first.'},
       {value:Q(p*d,b*r),why:'You turned the second fraction upside down. That is the method for dividing.'}]:[
       {value:Q(p*r,b*d),why:`You multiplied without turning the second fraction upside down. Dividing by \`${F(r,d)}\` is the same as multiplying by \`${F(d,r)}\`.`},
       {value:Q(b*r,p*d),why:'Turn the second fraction upside down, not the first.'}],
      steps:[
       {math:`${w1}${F(a,b)} = ${F(p,b)} and ${w2}${F(c,d)} = ${F(r,d)}`,note:'Change each mixed number to a top-heavy fraction: multiply the whole number by the denominator, then add the numerator.'},
       times?{math:`${F(p,b)} * ${F(r,d)} = ${F(top,bottom)}`,note:'Multiply the tops together and the bottoms together.'}
        :{math:`${F(p,b)} ÷ ${F(r,d)} = ${F(p,b)} * ${F(d,r)} = ${F(top,bottom)}`,note:'Turn the second fraction upside down and multiply.'},
       ...closingSteps(top,bottom,true),
       ...(K.gcd(top,bottom)===1&&top<bottom?[{math:F(top,bottom),note:`No number divides into both ${top} and ${bottom}, so this is the simplest form.`}]:[])]});
    }
    if(kind==='three'){
     const [b,d,f]=rng.shuffle(rng.pick([[2,3,4],[2,3,6],[2,4,8],[3,4,6],[2,5,10],[3,4,12],[2,6,12],[2,4,5],[3,6,9],[4,5,10],[2,3,9],[3,4,8]]));
     const a=topFor(rng,b),c=topFor(rng,d),e=topFor(rng,f),[s1,s2]=rng.pick([['+','-'],['-','+'],['+','-'],['+','+']]);
     const L=lcm(lcm(b,d),f),A=a*L/b,C=c*L/d,E=e*L/f,k1=s1==='+'?1:-1,k2=s2==='+'?1:-1,S=A+k1*C+k2*E;
     if(S<=0||A+k1*C<=0)continue;
     const mistakes=[];
     if(k1+k2<2)mistakes.push({value:Q(A+C+E,L),why:'One of the fractions is subtracted. Check the sign in front of each fraction.'});
     else mistakes.push({value:Q(a+c+e,b+d+f),why:'You added the tops and added the bottoms. The fractions need the same denominator first, and that denominator does not change.'});
     if(a+k1*c+k2*e>0)mistakes.push({value:Q(a+k1*c+k2*e,L),why:`You changed the denominators to ${L} but kept the old numerators. Whatever you multiply the bottom by, multiply the top by the same number.`});
     const more=closingSteps(S,L,true);
     return fractionQuestion({prompt:MIXED_PROMPT,math:`${F(a,b)} ${s1} ${F(c,d)} ${s2} ${F(e,f)}`,value:Q(S,L),mistakes,
      hint:`Find one denominator that works for all three fractions. Look for a number that ${b}, ${d} and ${f} all divide into.`,
      claim:`(${a}/${b}) ${s1} (${c}/${d}) ${s2} (${e}/${f})`,
      steps:[
       {math:`${F(A,L)} ${s1} ${F(C,L)} ${s2} ${F(E,L)}`,note:`Write every fraction with the common denominator ${L}. Multiply each top by the same number as its bottom.`},
       {math:`${F(`${A} ${s1} ${C} ${s2} ${E}`,L)} = ${F(S,L)}`,note:'Combine the numerators, working from left to right. The denominator stays the same.'},
       ...more]});
    }
    /* A short context: two parts are used, what fraction is left? */
    let [b,d]=rng.pick(PAIRS);if(rng.chance(.5))[b,d]=[d,b];
    const a=topFor(rng,b),c=topFor(rng,d),L=lcm(b,d),A=a*L/b,C=c*L/d,left=L-A-C;
    if(left<=0)continue;
    const [start,middle,end,ask]=rng.pick([
     ['Aoife spends','of her pocket money on a cinema ticket','on snacks','What fraction of her pocket money is left?'],
     ['Conor uses','of his phone data on video','on music','What fraction of his data is left?'],
     ['Niamh walks','of a trail before lunch','after lunch','What fraction of the trail is left to walk?'],
     ['Tomás reads','of a book on Saturday','on Sunday','What fraction of the book is left to read?']]);
    return fractionQuestion({prompt:`${start} \`${F(a,b)}\` ${middle} and \`${F(c,d)}\` of it ${end}. ${ask} Give your answer in its simplest form.`,value:Q(left,L),
     hint:'Add the two fractions first. Then subtract the total from 1.',
     claim:`1 - (${a}/${b}) - (${c}/${d})`,
     mistakes:[
      {value:Q(A+C,L),why:'That is the fraction already used. Subtract it from 1 to find what is left.'},
      {value:qSub(Q(1),Q(a+c,b+d)),why:'You added the tops and added the bottoms. The two fractions need a common denominator before you add them.'}],
     steps:[
      {math:`${F(a,b)} + ${F(c,d)} = ${F(A,L)} + ${F(C,L)} = ${F(A+C,L)}`,note:`Add the two parts. Use ${L} as the common denominator.`},
      {math:`1 - ${F(A+C,L)} = ${F(L,L)} - ${F(A+C,L)} = ${F(left,L)}`,note:`The whole is 1, which is \`${F(L,L)}\`. Subtract to find what is left.`},
      ...closingSteps(left,L)]});
   }
  }}
 ]
});

/* ---------- Percentages ---------- */
/* A decimal without floating-point noise: 0.15, 1.2. */
const dec=x=>String(Math.round(x*1e6)/1e6);
const NAMES=['Aoife','Conor','Niamh','Tomás','Ciara','Darragh','Ella','Oisín'];

K.define({
 id:'percentages',
 title:'Percentages and multipliers',
 strand:'Number',
 lesson:'04-01',
 blurb:'Find a percentage of an amount, use a multiplier for an increase or decrease, and work back to the original amount.',
 levels:[
  {name:'Percentage of an amount',make(rng){
   for(;;){
    const kind=rng.pick(['of','of','context','outof']),who=rng.pick(NAMES);
    if(kind==='outof'){
     const whole=rng.pick([20,25,40,50,80,200]),p=rng.pick([5,10,15,20,25,30,35,40,45,60,70,75,80,90]),part=whole*p/100;
     if(!Number.isInteger(part))continue;
     const prompt=rng.pick([
      `${who} scores ${part} out of ${whole} in a test. Write the score as a percentage.`,
      `A team wins ${part} of its ${whole} matches. What percentage of its matches does it win?`,
      `${part} of the ${whole} students in a year group walk to school. What percentage is that?`]);
     return numberQuestion({prompt,value:p,answer:{unit:'%'},
      hint:'Write the part over the whole as a fraction. Then multiply by 100.',
      claim:`${part}/${whole}*100`,
      mistakes:[
       {value:qStr(Q(whole*100,part)),why:`You divided the wrong way round. The part goes on top: \`frac(${part}, ${whole})\`.`},
       {value:qStr(Q(part,whole)),why:'That is the fraction written as a decimal. Multiply by 100 to write it as a percentage.'},
       {value:100-p,why:'That is the percentage for the rest. The question asks about the part that is given.'}],
      steps:[
       {math:`frac(${part}, ${whole})`,note:'Write the part over the whole.'},
       {math:`frac(${part}, ${whole}) * 100 = ${p}%`,note:'Multiply by 100 to change the fraction to a percentage.'}]});
    }
    const p=rng.pick([10,20,25,50,5,15,30,40,60,75,35,45,80]),amount=rng.int(1,25)*20,value=amount*p/100;
    if(!Number.isInteger(value)||amount===100)continue;
    const context=kind==='context'?rng.int(0,2):-1;
    const prompt=[`Find ${p}% of ${amount}.`,
     `A jacket costs €${amount}. A sale takes ${p}% off the price. How much money is taken off?`,
     `${who} earns €${amount} and saves ${p}% of it. How much money is saved?`,
     `A sports club has ${amount} members and ${p}% of them are under 16. How many members are under 16?`][context+1];
    return numberQuestion({prompt,value,answer:context===0||context===1?{label:'€'}:{},
     hint:'Per cent means out of 100. Change the percentage to a decimal, then multiply.',
     claim:`${p}/100*${amount}`,
     mistakes:[
      {value:qStr(Q(amount,p)),why:`You divided by ${p}. Per cent means out of 100: divide by 100, then multiply by ${p}.`},
      {value:amount*p,why:`You multiplied by ${p}. ${p}% is \`frac(${p}, 100)\`, so divide by 100 as well.`},
      {value:amount-value,why:`That is what remains after ${p}% is taken away. The question asks for the ${p}% itself.`}],
     steps:[
      {math:`${p}% = frac(${p}, 100) = ${dec(p/100)}`,note:'Per cent means out of 100. Write the percentage as a decimal.'},
      {math:`${dec(p/100)} * ${amount} = ${value}`,note:'Multiply the amount by the decimal.'}]});
   }
  }},
  {name:'Increase and decrease',make(rng){
   for(;;){
    const kind=rng.pick(['plain','plain','context','context','multiplier']),up=rng.chance(.5),p=rng.pick([5,10,12,15,20,25,30,35,40,8,4,60]),who=rng.pick(NAMES);
    const percent=up?100+p:100-p,mult=dec(percent/100),sign=up?'+':'-';
    if(kind==='multiplier'){
     const mistakes=[
      {value:dec(p/100),why:`That multiplier finds ${p}% of the amount. To ${up?'increase':'decrease'} by ${p}%, ${up?'add it to':'take it from'} 1.`},
      {value:dec((up?100-p:100+p)/100),why:`That multiplier gives ${up?'a decrease':'an increase'}. For ${up?'an increase':'a decrease'} the multiplier is ${up?'more':'less'} than 1.`}];
     if(p<10)mistakes.push({value:dec(up?1+p/10:1-p/10),why:`${p}% is ${dec(p/100)} as a decimal, not ${dec(p/10)}.`});
     return numberQuestion({prompt:`What single multiplier ${up?'increases':'decreases'} an amount by ${p}%? Give your answer as a decimal.`,value:mult,mistakes,
      hint:`Start from 100%. ${up?'Add':'Subtract'} ${p}%, then write the result as a decimal.`,
      claim:`1 ${sign} ${p}/100`,
      steps:[
       {math:`100% ${sign} ${p}% = ${percent}%`,note:`${up?'An increase':'A decrease'} of ${p}% leaves ${percent}% of the original amount.`},
       {math:`${percent}% = frac(${percent}, 100) = ${mult}`,note:'Divide by 100 to write the percentage as a decimal.'}]});
    }
    const amount=rng.int(2,30)*20,value=amount*percent/100;
    if(!Number.isInteger(value)||amount===100)continue;
    const prompt=kind==='plain'?`${up?'Increase':'Decrease'} ${amount} by ${p}%.`:up?rng.pick([
      `A gym membership costs €${amount} a year. The price rises by ${p}%. Find the new price.`,
      `${who} earns €${amount} a week and gets a pay rise of ${p}%. Find the new weekly pay.`,
      `A streaming plan costs €${amount} a year. The price goes up by ${p}%. Find the new price.`]):rng.pick([
      `A phone costs €${amount}. In a sale the price is reduced by ${p}%. Find the sale price.`,
      `A bike costs €${amount}. ${who} gets a discount of ${p}%. How much does ${who} pay?`,
      `A console costs €${amount}. Its price drops by ${p}%. Find the new price.`]);
    return numberQuestion({prompt,value,answer:kind==='plain'?{}:{label:'€'},
     hint:`Find the multiplier first: 100% ${up?'plus':'minus'} ${p}%, written as a decimal. Then multiply.`,
     claim:`${amount}*(100 ${sign} ${p})/100`,
     mistakes:[
      {value:amount*p/100,why:`That is ${p}% of ${amount}. ${up?'Add it to':'Subtract it from'} the original amount, or multiply by ${mult} to do it in one step.`},
      {value:amount*(up?100-p:100+p)/100,why:`The amount goes ${up?'up':'down'}, so the multiplier is ${up?'more':'less'} than 1.`},
      {value:up?amount+p:amount-p,why:`${p}% is not the same as the number ${p}. Find ${p}% of ${amount} first.`}],
     steps:[
      {math:`100% ${sign} ${p}% = ${percent}%`,note:`${up?'An increase':'A decrease'} of ${p}% leaves ${percent}% of the original amount.`},
      {math:`${percent}% = ${mult}`,note:'Write this as a decimal. It is the multiplier.'},
      {math:`${amount} * ${mult} = ${value}`,note:'Multiply the original amount by the multiplier.'}]});
   }
  }},
  {name:'Reverse and percentage change',make(rng){
   for(;;){
    const kind=rng.pick(['reverse','reverse','vat','change','change']),up=rng.chance(.5),who=rng.pick(NAMES);
    if(kind==='change'){
     const old=rng.pick([20,25,40,50,60,75,80,120,150,200,250,400]),p=rng.pick([4,5,8,10,12,15,20,25,30,35,40,45,60]),now=old*(up?100+p:100-p)/100,diff=Math.abs(now-old);
     if(!Number.isInteger(now))continue;
     const prompt=up?rng.pick([
       `The price of a game rises from €${old} to €${now}. Find the percentage increase.`,
       `${who} had weekly pay of €${old}. It is now €${now}. Find the percentage increase.`,
       `A club grows from ${old} members to ${now} members. Find the percentage increase.`]):rng.pick([
       `A coat is reduced from €${old} to €${now}. Find the percentage decrease.`,
       `The number of students who walk to school falls from ${old} to ${now}. Find the percentage decrease.`,
       `A phone bill drops from €${old} to €${now}. Find the percentage decrease.`]);
     return numberQuestion({prompt,value:p,answer:{unit:'%'},
      hint:'Find the change. Divide it by the original value, then multiply by 100.',
      claim:up?`(${now} - ${old})/${old}*100`:`(${old} - ${now})/${old}*100`,
      mistakes:[
       {value:qStr(Q(diff*100,now)),why:`Divide the change by the original value, ${old}, not by the new value.`},
       {value:diff,why:'That is the change itself. Divide it by the original value and multiply by 100.'},
       {value:qStr(Q(now*100,old)),why:'That is the new value as a percentage of the original. The percentage change is the difference between that and 100%.'}],
      steps:[
       {math:`${Math.max(old,now)} - ${Math.min(old,now)} = ${diff}`,note:'Find the change.'},
       {math:`frac(${diff}, ${old}) = ${dec(diff/old)}`,note:'Divide the change by the original value.'},
       {math:`${dec(diff/old)} * 100 = ${p}%`,note:'Multiply by 100 to write it as a percentage.'}]});
    }
    let original,p,rate,now,prompt,rise;
    if(kind==='vat'){
     rise=true;p=rng.pick([23,23,13.5]);original=rng.int(1,12)*(p===23?100:200);rate=p===23?'23':'(27/2)';now=original*(1000+p*10)/1000;
     prompt=p===23?`A ${rng.pick(['laptop','television','washing machine','guitar','tablet'])} costs €${now} including VAT at ${p}%. Find the price before VAT.`
      :`A bill for ${rng.pick(['a car repair','a boiler service','painting a house','fitting a kitchen'])} comes to €${now} including VAT at ${p}%. Find the amount before VAT.`;
    }else{
     rise=up;p=rng.pick([5,10,15,20,25,30,40,50,60]);original=rng.int(2,20)*20;rate=String(p);now=original*(rise?100+p:100-p)/100;
     prompt=rise?rng.pick([
       `After a price rise of ${p}%, a concert ticket costs €${now}. Find the price before the rise.`,
       `A shop adds ${p}% to the cost price of a jacket and sells it for €${now}. Find the cost price.`,
       `${who} gets a pay rise of ${p}% and now earns €${now} a week. Find the weekly pay before the rise.`]):rng.pick([
       `In a sale, all prices are reduced by ${p}%. A pair of runners costs €${now} in the sale. Find the original price.`,
       `A bike is sold for €${now} after a discount of ${p}%. Find the price before the discount.`,
       `A second-hand phone has lost ${p}% of its value and is now worth €${now}. Find its original value.`]);
    }
    if(!Number.isInteger(now)||original===100)continue;
    const percent=rise?100+p:100-p,mult=dec(percent/100),sign=rise?'+':'-';
    return numberQuestion({prompt,value:original,answer:{label:'€'},
     hint:`The €${now} is ${percent}% of the original amount. Find the multiplier, then divide by it.`,
     claim:`${now}/((100 ${sign} ${rate})/100)`,
     mistakes:[
      {value:dec(now*(rise?100-p:100+p)/100),why:`You found ${p}% of €${now} and ${rise?'took it off':'added it on'}. The ${p}% was worked out on the original amount, which is a different number. Divide by the multiplier ${mult} instead.`},
      {value:dec(now*percent/100),why:`You multiplied by ${mult}. That applies the change a second time. To go back to the original, divide by ${mult}.`}],
     steps:[
      {math:`100% ${sign} ${p}% = ${percent}% = ${mult}`,note:`The amount you are given is ${percent}% of the original. Write that as a multiplier.`},
      {math:`original * ${mult} = ${now}`,note:'Write what happened as an equation.'},
      {math:`original = frac(${now}, ${mult}) = ${original}`,note:'Divide by the multiplier to undo the change.'},
      {math:`${original} * ${mult} = ${now}`,note:'Check: apply the change to your answer.'}]});
   }
  }}
 ]
});

/* ---------- Index laws ---------- */
/* A power in the kit's notation: x^3, x^{12}, x^{-2}; the index 1 is not written. */
const pw=(base,n)=>n===1?String(base):n>9||n<0?`${base}^{${n}}`:`${base}^${n}`;
const LETTERS=['x','a','y','p','m','t'];
const exprQuestion=({prompt,math,value,mistakes=[],hint,steps,claim})=>({prompt,math,answer:{type:'expr',value},
 mistakes:distinctMistakes(value,mistakes),hint,steps,verify:{op:'identity',a:claim,b:'ANSWER'}});
/* A question that asks for the missing index k. */
const indexQuestion=({math,value,mistakes=[],hint,steps,claim,base})=>({prompt:'Find the value of k.',math,answer:{type:'number',label:'k =',value:String(value)},
 mistakes:distinctMistakes(value,mistakes),hint,steps,verify:{op:'identity',a:claim,b:`${base}^ANSWER`}});

K.define({
 id:'index-laws',
 title:'Index laws',
 strand:'Number',
 lesson:'14-01',
 blurb:'Add the indices to multiply, subtract them to divide, and multiply them for a power of a power.',
 levels:[
  {name:'Multiply and divide',make(rng){
   for(;;){
    const kind=rng.pick(['times','times','divide','divide','ktimes','kdivide']),L=rng.pick(LETTERS),B=rng.pick([2,3,5,7,10]);
    if(kind==='times'||kind==='ktimes'){
     const m=rng.int(2,7),n=rng.int(2,7);
     if(m===n||m+n>12)continue;
     const base=kind==='times'?L:B,left=`${pw(base,m)} * ${pw(base,n)}`;
     const steps=[
      {math:`${left} = ${base}^{${m} + ${n}}`,note:`\`${pw(base,m)}\` is ${m} copies of ${base} multiplied together and \`${pw(base,n)}\` is ${n} more. The base is the same, so add the indices.`},
      {math:`${base}^{${m} + ${n}} = ${pw(base,m+n)}`,note:`\`${m} + ${n} = ${m+n}\`.`}];
     const hint='When you multiply powers of the same base, add the indices.';
     if(kind==='times')return exprQuestion({prompt:`Write as a single power of ${L}.`,math:left,value:pw(L,m+n),hint,steps,claim:`${L}^${m}*${L}^${n}`,
      mistakes:[
       ...(m*n<=12?[{value:pw(L,m*n),why:`You multiplied the indices. When you multiply powers of the same base, add the indices: \`${m} + ${n}\`.`}]:[]),
       {value:pw(L,Math.abs(m-n)),why:'You subtracted the indices. That is the rule for dividing. To multiply, add them.'}]});
     return indexQuestion({math:`${left} = ${B}^k`,value:m+n,hint,steps,claim:`${B}^${m}*${B}^${n}`,base:B,
      mistakes:[
       {value:m*n,why:`You multiplied the indices. When you multiply powers of the same base, add the indices: \`${m} + ${n}\`.`},
       {value:Math.abs(m-n),why:'You subtracted the indices. That is the rule for dividing. To multiply, add them.'}]});
    }
    const m=rng.int(5,12),n=rng.int(2,m-2);
    if(m-n===n||kind==='divide'&&m+n>12)continue;
    const base=kind==='divide'?L:B,left=`frac(${pw(base,m)}, ${pw(base,n)})`;
    const steps=[
     {math:`${left} = ${base}^{${m} - ${n}}`,note:`${n} of the ${m} copies of ${base} on top cancel with the ${n} below. The base is the same, so subtract the indices.`},
     {math:`${base}^{${m} - ${n}} = ${pw(base,m-n)}`,note:`\`${m} - ${n} = ${m-n}\`.`}];
    const hint='When you divide powers of the same base, subtract the bottom index from the top index.';
    if(kind==='divide')return exprQuestion({prompt:`Write as a single power of ${L}.`,math:left,value:pw(L,m-n),hint,steps,claim:`${L}^${m}/${L}^${n}`,
     mistakes:[
      ...(m+n<=12?[{value:pw(L,m+n),why:'You added the indices. That is the rule for multiplying. To divide, subtract them.'}]:[]),
      ...(m%n===0?[{value:pw(L,m/n),why:`You divided the indices. When you divide powers of the same base, subtract the indices: \`${m} - ${n}\`.`}]:[])]});
    return indexQuestion({math:`${left} = ${B}^k`,value:m-n,hint,steps,claim:`${B}^${m}/${B}^${n}`,base:B,
     mistakes:[
      {value:m+n,why:'You added the indices. That is the rule for multiplying. To divide, subtract them.'},
      ...(m%n===0?[{value:m/n,why:`You divided the indices. When you divide powers of the same base, subtract the indices: \`${m} - ${n}\`.`}]:[])]});
   }
  }},
  {name:'Powers of powers',make(rng){
   for(;;){
    const kind=rng.pick(['power','power','number','combined','lone','product']),L=rng.pick(LETTERS);
    if(kind==='power'){
     const m=rng.int(2,6),n=rng.int(2,Math.floor(12/m));
     if(m===2&&n===2)continue;
     return exprQuestion({prompt:`Write as a single power of ${L}.`,math:`(${pw(L,m)})^${n}`,value:pw(L,m*n),claim:`(${L}^${m})^${n}`,
      hint:'For a power of a power, multiply the indices.',
      mistakes:[{value:pw(L,m+n),why:`You added the indices. That is the rule for \`${pw(L,m)} * ${pw(L,n)}\`. For a power of a power, multiply them: \`${m} * ${n}\`.`}],
      steps:[
       {math:`(${pw(L,m)})^${n} = ${L}^{${m} * ${n}}`,note:`\`(${pw(L,m)})^${n}\` means \`${pw(L,m)}\` written ${n} times and multiplied together. That is ${n} lots of ${m}, so multiply the indices.`},
       {math:`${L}^{${m} * ${n}} = ${pw(L,m*n)}`,note:`\`${m} * ${n} = ${m*n}\`.`}]});
    }
    if(kind==='number'){
     const c=rng.int(2,5),n=rng.int(2,3),m=rng.int(2,Math.floor(12/n));
     if(c**n>125)continue;
     const value=`${c**n}${pw(L,m*n)}`;
     return exprQuestion({prompt:'Simplify.',math:`(${c}${pw(L,m)})^${n}`,value,claim:`(${c}*${L}^${m})^${n}`,
      hint:`The power outside the bracket applies to the ${c} and to the \`${pw(L,m)}\`.`,
      mistakes:[
       {value:`${c}${pw(L,m*n)}`,why:`The power applies to the ${c} as well: \`${c}^${n} = ${c**n}\`.`},
       {value:`${c*n}${pw(L,m*n)}`,why:`\`${c}^${n}\` means \`${Array(n).fill(c).join(' * ')}\`, not \`${c} * ${n}\`.`},
       {value:`${c**n}${pw(L,m+n)}`,why:`For a power of a power, multiply the indices: \`${m} * ${n}\`.`}],
      steps:[
       {math:`(${c}${pw(L,m)})^${n} = ${c}^${n} * (${pw(L,m)})^${n}`,note:'The power applies to every factor inside the bracket.'},
       {math:`${c}^${n} = ${c**n}`,note:'Work out the number part.'},
       {math:`(${pw(L,m)})^${n} = ${pw(L,m*n)}`,note:'Power of a power: multiply the indices.'},
       {math:`(${c}${pw(L,m)})^${n} = ${value}`,note:'Put the two parts together.'}]});
    }
    if(kind==='combined'){
     const a=rng.int(2,6),b=rng.int(2,6),c=rng.int(2,a+b-2);
     if(a===b||c===a||c===b||a+b>12)continue;
     return exprQuestion({prompt:`Write as a single power of ${L}.`,math:`frac(${pw(L,a)} * ${pw(L,b)}, ${pw(L,c)})`,value:pw(L,a+b-c),claim:`${L}^${a}*${L}^${b}/${L}^${c}`,
      hint:'Simplify the top line first. Then divide.',
      mistakes:[
       ...(a*b-c>0&&a*b-c<=12?[{value:pw(L,a*b-c),why:`On the top line the powers are multiplied, so add the indices: \`${a} + ${b}\`.`}]:[]),
       ...(a+b+c<=12?[{value:pw(L,a+b+c),why:`Dividing by \`${pw(L,c)}\` means you subtract ${c} from the index.`}]:[])],
      steps:[
       {math:`${pw(L,a)} * ${pw(L,b)} = ${pw(L,a+b)}`,note:'Top line first. Multiplying: add the indices.'},
       {math:`frac(${pw(L,a+b)}, ${pw(L,c)}) = ${pw(L,a+b-c)}`,note:'Dividing: subtract the indices.'}]});
    }
    if(kind==='lone'){
     const m=rng.int(2,9),first=rng.chance(.5),math=first?`${L} * ${pw(L,m)}`:`${pw(L,m)} * ${L}`;
     return exprQuestion({prompt:`Write as a single power of ${L}.`,math,value:pw(L,m+1),claim:`${L}^${m}*${L}`,
      hint:`A letter on its own has the index 1.`,
      mistakes:[
       {value:pw(L,m),why:`The ${L} on its own has the index 1, so the index goes up by 1.`},
       {value:`2${pw(L,m)}`,why:`The sign is ×, not +. Multiplying by ${L} adds 1 to the index.`}],
      steps:[
       {math:`${math} = ${L}^{${first?'1 + '+m:m+' + 1'}}`,note:`${L} on its own has the index 1. The base is the same, so add the indices.`},
       {math:`${L}^{${first?'1 + '+m:m+' + 1'}} = ${pw(L,m+1)}`,note:`\`${m} + 1 = ${m+1}\`.`}]});
    }
    const c1=rng.int(2,6),c2=rng.int(2,6),m=rng.int(1,6),n=rng.int(2,6);
    if(m===n||c1===c2)continue;
    const value=`${c1*c2}${pw(L,m+n)}`,math=`${c1}${pw(L,m)} * ${c2}${pw(L,n)}`;
    return exprQuestion({prompt:'Simplify.',math,value,claim:`${c1}*${L}^${m}*${c2}*${L}^${n}`,
     hint:'Multiply the numbers together. Then multiply the letters by adding the indices.',
     mistakes:[
      {value:`${c1+c2}${pw(L,m+n)}`,why:`Multiply the numbers in front: \`${c1} * ${c2} = ${c1*c2}\`. Only the indices are added.`},
      ...(m*n<=12?[{value:`${c1*c2}${pw(L,m*n)}`,why:`When you multiply powers of the same base, add the indices: \`${m} + ${n}\`.`}]:[])],
     steps:[
      {math:`${c1} * ${c2} = ${c1*c2}`,note:'Multiply the numbers.'},
      {math:`${pw(L,m)} * ${pw(L,n)} = ${pw(L,m+n)}`,note:`Multiply the letters: add the indices${m===1?', remembering that '+L+' on its own has the index 1':''}.`},
      {math:`${math} = ${value}`,note:'Put the two parts together.'}]});
   }
  }},
  {name:'Zero and negative indices',make(rng){
   for(;;){
    const kind=rng.pick(['evaluate','kdivide','kdivide','ktimes','kpower','zero','fraction']),L=rng.pick(LETTERS),B=rng.pick([2,3,4,5,10]);
    if(kind==='evaluate'){
     const n=rng.int(2,3),size=B**n;
     return numberQuestion({prompt:'Evaluate. Give your answer as a fraction.',math:pw(B,-n),value:`1/${size}`,answer:{simplest:true},claim:`${B}^(-${n})`,
      hint:'A negative index means one over the positive power.',
      mistakes:[
       {value:-size,why:`A negative index does not make the answer negative. \`${pw(B,-n)}\` means \`frac(1, ${pw(B,n)})\`.`},
       {value:size,why:`That is \`${pw(B,n)}\`. The negative index means one over that number.`},
       {value:-B*n,why:`The index is not a multiplier. \`${pw(B,-n)}\` means \`frac(1, ${pw(B,n)})\`.`},
       {value:`1/${B*n}`,why:`\`${pw(B,n)}\` means \`${Array(n).fill(B).join(' * ')} = ${size}\`, not \`${B} * ${n}\`.`}],
      steps:[
       {math:`${pw(B,-n)} = frac(1, ${pw(B,n)})`,note:'A negative index means one over the positive power.'},
       {math:`frac(1, ${pw(B,n)}) = frac(1, ${size})`,note:`\`${pw(B,n)} = ${Array(n).fill(B).join(' * ')} = ${size}\`.`}]});
    }
    if(kind==='kdivide'){
     const m=rng.int(2,8),n=rng.int(m,12),k=m-n,left=`frac(${pw(L,m)}, ${pw(L,n)})`;
     return indexQuestion({math:`${left} = ${L}^k`,value:k,claim:`${L}^${m}/${L}^${n}`,base:L,
      hint:'Subtract the bottom index from the top index. The answer can be zero or negative.',
      mistakes:k===0?[
       {value:1,why:`The fraction is equal to 1, and 1 is \`${L}^0\`. The question asks for the index, which is 0.`},
       {value:m+n,why:'You added the indices. To divide, subtract them.'}]:[
       {value:-k,why:`Subtract the bottom index from the top index: \`${m} - ${n}\`. The bigger power is on the bottom, so the index is negative.`},
       {value:m+n,why:'You added the indices. To divide, subtract them.'}],
      steps:[
       {math:`${left} = ${L}^{${m} - ${n}}`,note:'Dividing: subtract the bottom index from the top index.'},
       {math:`${L}^{${m} - ${n}} = ${pw(L,k)}`,note:k===0?`\`${m} - ${n} = 0\`. Anything (except zero) to the power 0 is 1, which fits: the top and bottom are equal.`:`\`${m} - ${n} = ${k}\`. A negative index is allowed: \`${pw(L,k)}\` means \`frac(1, ${pw(L,-k)})\`.`}]});
    }
    if(kind==='ktimes'){
     const m=rng.int(2,9),n=rng.int(2,9),k=m-n;
     return indexQuestion({math:`${pw(L,m)} * ${pw(L,-n)} = ${L}^k`,value:k,claim:`${L}^${m}*${L}^(-${n})`,base:L,
      hint:'Add the indices, keeping the sign of each one.',
      mistakes:[
       {value:m+n,why:`Add the indices with their signs: \`${m} + (-${n})\`. Adding a negative is the same as subtracting.`},
       {value:-m*n,why:'You multiplied the indices. When you multiply powers of the same base, add the indices.'},
       ...(k!==0?[{value:-k,why:`Check the sign: \`${m} + (-${n}) = ${m} - ${n}\`.`}]:[])],
      steps:[
       {math:`${pw(L,m)} * ${pw(L,-n)} = ${L}^{${m} + (-${n})}`,note:'Multiplying: add the indices, signs included.'},
       {math:`${L}^{${m} + (-${n})} = ${pw(L,k)}`,note:`\`${m} + (-${n}) = ${m} - ${n} = ${k}\`.`}]});
    }
    if(kind==='kpower'){
     const m=rng.int(1,4),n=rng.int(2,4),k=-m*n;
     return indexQuestion({math:`(${pw(L,-m)})^${n} = ${L}^k`,value:k,claim:`(${L}^(-${m}))^${n}`,base:L,
      hint:'For a power of a power, multiply the indices. Keep the sign.',
      mistakes:[
       {value:m*n,why:`\`-${m} * ${n}\` has different signs, so the index is negative.`},
       {value:n-m,why:`You added the indices. For a power of a power, multiply them: \`-${m} * ${n}\`.`}],
      steps:[
       {math:`(${pw(L,-m)})^${n} = ${L}^{-${m} * ${n}}`,note:'Power of a power: multiply the indices.'},
       {math:`${L}^{-${m} * ${n}} = ${pw(L,k)}`,note:`\`-${m} * ${n} = ${k}\`. Different signs give a negative answer.`}]});
    }
    if(kind==='zero'){
     const a=rng.int(3,9),b=rng.int(2,5),n=rng.int(2,3),power=b**n;
     if(a===b||power>64)continue;
     if(rng.chance(.5)){
      const math=`${a}^0 + ${pw(b,n)}`;
      return numberQuestion({prompt:'Evaluate.',math,value:1+power,claim:`${a}^0 + ${b}^${n}`,
       hint:'Any number except zero, raised to the power 0, is 1.',
       mistakes:[
        {value:power,why:`\`${a}^0\` is 1, not 0. Any number except zero to the power 0 is 1.`},
        {value:a+power,why:`\`${a}^0\` is 1, not ${a}.`},
        {value:1+b*n,why:`\`${pw(b,n)}\` means \`${Array(n).fill(b).join(' * ')} = ${power}\`, not \`${b} * ${n}\`.`}],
       steps:[
        {math:`${a}^0 = 1`,note:'Any number except zero, raised to the power 0, is 1.'},
        {math:`${pw(b,n)} = ${Array(n).fill(b).join(' * ')} = ${power}`,note:'Work out the other power.'},
        {math:`1 + ${power} = ${1+power}`,note:'Add.'}]});
     }
     const math=`${a} * ${b}^0`;
     return numberQuestion({prompt:'Evaluate.',math,value:a,claim:`${a}*${b}^0`,
      hint:'Any number except zero, raised to the power 0, is 1. Powers come before multiplication.',
      mistakes:[
       {value:0,why:`\`${b}^0\` is 1, not 0. Any number except zero to the power 0 is 1.`},
       {value:a*b,why:`\`${b}^0\` is 1, not ${b}.`},
       {value:1,why:`The power 0 belongs to the ${b} only. Work out \`${b}^0\` first, then multiply by ${a}.`}],
      steps:[
       {math:`${b}^0 = 1`,note:`The power belongs to the ${b} only. Any number except zero, raised to the power 0, is 1.`},
       {math:`${a} * 1 = ${a}`,note:'Then multiply.'}]});
    }
    /* B^m / B^(m + d), evaluated */
    const m=rng.int(2,5),d=rng.int(1,3),size=B**d;
    if(size>125)continue;
    return numberQuestion({prompt:'Use the index laws to simplify. Then evaluate, giving your answer as a fraction.',math:`frac(${pw(B,m)}, ${pw(B,m+d)})`,value:`1/${size}`,answer:{simplest:true},claim:`${B}^${m}/${B}^${m+d}`,
     hint:'Subtract the indices first. A negative index means one over the positive power.',
     mistakes:[
      {value:size,why:`\`${m} - ${m+d} = ${-d}\`, a negative index. \`${pw(B,-d)}\` means \`frac(1, ${pw(B,d)})\`.`},
      {value:-size,why:`A negative index does not make the answer negative. \`${pw(B,-d)}\` means \`frac(1, ${pw(B,d)})\`.`}],
     steps:[
      {math:`frac(${pw(B,m)}, ${pw(B,m+d)}) = ${B}^{${m} - ${m+d}} = ${pw(B,-d)}`,note:'Dividing: subtract the bottom index from the top index.'},
      {math:d===1?`${pw(B,-d)} = frac(1, ${B})`:`${pw(B,-d)} = frac(1, ${pw(B,d)}) = frac(1, ${size})`,note:'A negative index means one over the positive power.'}]});
   }
  }}
 ]
});

/* ---------- Standard form ---------- */
/* A front number is kept as whole digits: digits "45" stands for 4.5, "307" for 3.07. */
const frontNumber=digits=>digits.length>1?digits[0]+'.'+digits.slice(1):digits;
/* The ordinary number for (front number) * 10^n, built by moving the decimal point in the digit string. */
function ordinaryNumber(digits,n){
 const k=digits.length-1;
 if(n<0)return '0.'+'0'.repeat(-n-1)+digits;
 return n>=k?digits+'0'.repeat(n-k):digits.slice(0,n+1)+'.'+digits.slice(n+1);
}
const withCommas=text=>/^\d{5,}$/.test(text)?text.replace(/\B(?=(\d{3})+(?!\d))/g,','):text;
const p10=n=>n<0||n>9?`10^{${n}}`:`10^${n}`;
/* The same number as an exact fraction for the independent check. */
const exactClaim=(digits,n)=>`(${digits}/${10**(digits.length-1)})*10^(${n})`;
function drawDigits(rng){
 const k=rng.pick([0,1,1,1,2]);
 for(;;){const digits=String(rng.int(10**k,10**(k+1)-1));if(digits.endsWith('0')&&k>0||digits==='1')continue;return digits}
}
const POWER_LABEL='× 10 to the power';
function standardQuestion({prompt,math,front,power,mistakes=[],hint,steps,claims}){
 const answer=[String(front),String(power)],seen=[answer.join('|')],kept=[];
 for(const m of mistakes){const key=m.value.map(String).join('|');if(seen.includes(key))continue;seen.push(key);kept.push({value:m.value.map(String),why:m.why})}
 return {prompt,math,answer:{type:'fields',fields:[{value:answer[0]},{label:POWER_LABEL,value:answer[1]}]},mistakes:kept,hint,steps,
  verify:claims.map(expr=>({op:'value',expr,equals:'ANSWER0'}))};
}
/* "Write N in standard form" and "write as an ordinary number", for a given range of powers. */
function convertQuestion(rng,toStandard,n){
 const digits=drawDigits(rng),front=frontNumber(digits),plain=ordinaryNumber(digits,n),shown=withCommas(plain),small=n<0,places=Math.abs(n);
 if(toStandard){
  const shifted=digits.length>1?digits.slice(0,2)+(digits.length>2?'.'+digits.slice(2):''):digits+'0';
  return standardQuestion({prompt:`Write ${shown} in standard form.`,front,power:n,
   hint:'Put the decimal point after the first digit that is not zero. Then count how many places it moved.',
   claims:[`(${exactClaim(digits,n)})/10^ANSWER1`,`${digits}/${10**(digits.length-1)}`],
   mistakes:[
    {value:[front,-n],why:small?'The number is less than 1, so the power of 10 is negative.':'The number is greater than 10, so the power of 10 is positive.'},
    {value:[shifted,n-1],why:'That has the right value, but the first number must be at least 1 and less than 10. Put the decimal point after the first non-zero digit.'},
    {value:[front,n+1],why:`The first number is right. Check the power: count how many places the decimal point moves between ${front} and ${shown}.`},
    {value:[front,n-1],why:`The first number is right. Check the power: count how many places the decimal point moves between ${front} and ${shown}.`}],
   steps:[
    {math:front,note:'Put the decimal point after the first digit that is not zero. This gives a number that is at least 1 and less than 10.'},
    {math:`${shown} = ${front} * ${p10(n)}`,note:`To get from ${front} back to ${shown} the decimal point moves ${places} place${places===1?'':'s'} to the ${small?'left, so the power is negative':'right, so the power is positive'}.`}]});
 }
 const padded=digits+'0'.repeat(places),mistakes=[];
 if(!small&&digits.length>1)mistakes.push({value:padded,why:`The power ${n} tells you how many places the decimal point moves. It is not the number of zeros to write at the end.`});
 if(small)mistakes.push({value:ordinaryNumber(digits,n-1),why:places===1?`Moving one place to the left puts the ${digits[0]} straight after the decimal point.`:`Count the places from the decimal point in ${front}. The first digit ends up in decimal place ${places}, so there ${places-1===1?'is 1 zero':'are '+(places-1)+' zeros'} after the decimal point.`});
 mistakes.push({value:ordinaryNumber(digits,-n),why:small?'A negative power of 10 makes the number smaller. Move the decimal point to the left.':'A positive power of 10 makes the number bigger. Move the decimal point to the right.'});
 return numberQuestion({prompt:'Write as an ordinary number.',math:`${front} * ${p10(n)}`,value:plain,mistakes,
  hint:small?`A negative power makes the number smaller. Move the decimal point ${places} place${places===1?'':'s'} to the left.`:`Multiplying by \`${p10(n)}\` moves the decimal point ${places} places to the right.`,
  claim:exactClaim(digits,n),
  steps:[
   {math:`${p10(n)} = ${small?ordinaryNumber('1',n):withCommas('1'+'0'.repeat(n))}`,note:small?`\`${p10(n)}\` means 1 divided by 10${places===1?'':', '+places+' times'}.`:`\`${p10(n)}\` is 1 followed by ${n} zeros.`},
   {math:`${front} * ${p10(n)} = ${shown}`,note:`Start from ${front} and move the decimal point ${places} place${places===1?'':'s'} to the ${small?'left':'right'}. Fill any empty places with zeros.`}]});
}

K.define({
 id:'standard-form',
 title:'Standard form',
 strand:'Number',
 lesson:'14-05',
 blurb:'Write very large and very small numbers as a number from 1 up to 10, times a power of 10.',
 levels:[
  {name:'Large numbers',make(rng){
   return convertQuestion(rng,rng.chance(.6),rng.int(3,7));
  }},
  {name:'Small numbers and adjusting',make(rng){
   for(;;){
    const kind=rng.pick(['to','to','from','from','adjust']);
    if(kind!=='adjust')return convertQuestion(rng,kind==='to',-rng.int(1,5));
    /* A front number that is too big or too small: 45 * 10^3, 0.45 * 10^{-2}. */
    const digits=drawDigits(rng),front=frontNumber(digits),shift=rng.sign(),given=rng.nonzero(-6,6),n=given+shift;
    if(n===0)continue;
    const start=shift===1?(digits.length>1?digits.slice(0,2)+(digits.length>2?'.'+digits.slice(2):''):digits+'0'):'0.'+digits;
    return standardQuestion({prompt:'This number is not in standard form yet. Write it in standard form.',math:`${start} * ${p10(given)}`,front,power:n,
     hint:`Write ${start} in standard form first. Then combine the two powers of 10.`,
     claims:[`(${exactClaim(digits,shift)})*10^(${given})/10^ANSWER1`,`${digits}/${10**(digits.length-1)}`],
     mistakes:[
      {value:[front,given-shift],why:`You made the first number ${shift===1?'10 times smaller':'10 times bigger'}, so the power of 10 must go ${shift===1?'up':'down'} by 1 to keep the value the same.`},
      {value:[front,given],why:`${start} is \`${front} * ${p10(shift)}\`. That extra power of 10 changes the index.`},
      {value:[start,given],why:'The first number must be at least 1 and less than 10.'}],
     steps:[
      {math:`${start} = ${front} * ${p10(shift)}`,note:'Write the first number in standard form on its own.'},
      {math:`${front} * ${p10(shift)} * ${p10(given)} = ${front} * ${p10(n)}`,note:`Multiply the powers of 10 by adding the indices: \`${shift} + ${K.bracket(given)} = ${n}\`.`}]});
   }
  }},
  {name:'Multiply and divide',make(rng){
   for(;;){
    const times=rng.chance(.5),p=rng.nonzero(-5,8),q=rng.nonzero(-5,6);
    if(p===q)continue;
    if(times){
     const a=rng.pick([12,15,20,25,30,35,40,45,50,60,70,80,90,16,24,32]),b=rng.pick([12,15,20,25,30,40,50,60,70,80,90]);
     const product=a*b/100,adjust=product>=10,front=adjust?product/10:product,sum=p+q,n=adjust?sum+1:sum;
     if(a===b||!Number.isInteger(front*100)||n===0)continue;
     const A=dec(a/10),B=dec(b/10);
     return standardQuestion({prompt:'Work out. Give your answer in standard form.',math:`(${A} * ${p10(p)}) * (${B} * ${p10(q)})`,front:dec(front),power:n,
      hint:'Multiply the two front numbers. Add the indices of the powers of 10. Then check that the front number is less than 10.',
      claims:[`((${a}/10)*10^(${p}))*((${b}/10)*10^(${q}))/10^ANSWER1`],
      mistakes:[
       ...(adjust?[
        {value:[dec(product),sum],why:`That has the right value, but ${dec(product)} is not less than 10. Write it as \`${dec(front)} * 10^1\`, which adds 1 to the power.`},
        {value:[dec(front),sum-1],why:`You made the front number 10 times smaller, so the power of 10 goes up by 1, not down.`},
        {value:[dec(front),sum],why:`${dec(product)} is \`${dec(front)} * 10^1\`. That extra 10 adds 1 to the power.`}]:[]),
       {value:[dec(front),adjust?p*q+1:p*q],why:`To multiply powers of 10, add the indices: \`${p} + ${K.bracket(q)}\`.`},
       {value:[dec((a+b)/10),sum],why:`Multiply the front numbers: \`${A} * ${B}\`. Only the indices are added.`}],
      steps:[
       {math:`${A} * ${B} = ${dec(product)}`,note:'Multiply the two front numbers.'},
       {math:`${p10(p)} * ${p10(q)} = ${p10(sum)}`,note:`Multiply the powers of 10 by adding the indices: \`${p} + ${K.bracket(q)} = ${sum}\`.`},
       {math:`${dec(product)} * ${p10(sum)}`,note:adjust?`This has the right value, but ${dec(product)} is not less than 10.`:`${dec(product)} is at least 1 and less than 10, so this is in standard form.`},
       ...(adjust?[{math:`${dec(product)} * ${p10(sum)} = ${dec(front)} * ${p10(n)}`,note:`Write ${dec(product)} as \`${dec(front)} * 10^1\`. The extra 10 adds 1 to the power.`}]:[])]});
    }
    const [a,b]=rng.pick([[80,20],[90,30],[60,40],[75,25],[30,40],[12,40],[20,80],[48,12],[96,32],[63,90],[15,60],[84,21],[90,20],[70,20],[50,40],[24,60],[18,90],[45,90],[36,45],[72,24],[64,16],[56,80],[35,50],[42,60]]);
    const quotient=a/b,adjust=quotient<1,front=adjust?quotient*10:quotient,difference=p-q,n=adjust?difference-1:difference;
    if(!Number.isInteger(Math.round(front*1e6)/1e4)||n===0)continue;
    const A=dec(a/10),B=dec(b/10);
    return standardQuestion({prompt:'Work out. Give your answer in standard form.',math:`frac(${A} * ${p10(p)}, ${B} * ${p10(q)})`,front:dec(front),power:n,
     hint:'Divide the two front numbers. Subtract the indices of the powers of 10. Then check that the front number is at least 1.',
     claims:[`(((${a}/10)*10^(${p}))/((${b}/10)*10^(${q})))/10^ANSWER1`],
     mistakes:[
      ...(adjust?[
       {value:[dec(quotient),difference],why:`That has the right value, but ${dec(quotient)} is less than 1. Write it as \`${dec(front)} * 10^{-1}\`, which takes 1 from the power.`},
       {value:[dec(front),difference+1],why:'You made the front number 10 times bigger, so the power of 10 goes down by 1, not up.'},
       {value:[dec(front),difference],why:`${dec(quotient)} is \`${dec(front)} * 10^{-1}\`. That takes 1 from the power.`}]:[]),
      {value:[dec(front),adjust?p+q-1:p+q],why:`To divide powers of 10, subtract the indices: \`${p} - ${K.bracket(q)}\`.`}],
     steps:[
      {math:`frac(${A}, ${B}) = ${dec(quotient)}`,note:'Divide the two front numbers.'},
      {math:`frac(${p10(p)}, ${p10(q)}) = ${p10(difference)}`,note:`Divide the powers of 10 by subtracting the indices: \`${p} - ${K.bracket(q)} = ${difference}\`.`},
      {math:`${dec(quotient)} * ${p10(difference)}`,note:adjust?`This has the right value, but ${dec(quotient)} is less than 1.`:`${dec(quotient)} is at least 1 and less than 10, so this is in standard form.`},
      ...(adjust?[{math:`${dec(quotient)} * ${p10(difference)} = ${dec(front)} * ${p10(n)}`,note:`Write ${dec(quotient)} as \`${dec(front)} * 10^{-1}\`. That takes 1 from the power.`}]:[])]});
   }
  }}
 ]
});

/* ---------- Rounding ---------- */
/* Decimals are kept as a whole number of units: whole / 10^places. That keeps every rounding exact. */
function fixed(whole,places){
 if(places<=0)return String(whole*10**(-places));
 const text=String(whole).padStart(places+1,'0');
 return text.slice(0,-places)+'.'+text.slice(-places);
}
/* whole / 10^places rounded to r decimal places (r may be negative for tens and hundreds), in units of 10^-r. */
function roundAt(whole,places,r){const scale=10**(places-r),cut=Math.floor(whole/scale);return (whole-cut*scale)*2>=scale?cut+1:cut}
const placeWord=r=>r<0?`the nearest ${withCommas(String(10**-r))}`:r===0?'the nearest whole number':`${r} decimal place${r===1?'':'s'}`;
/* One rounding question. r is the number of decimal places kept; figures is set for significant figures. */
function roundingQuestion({whole,places,r,figures,prompt}){
 const shown=fixed(whole,places),scale=10**(places-r),cut=Math.floor(whole/scale),next=Math.floor(whole/(scale/10))%10,up=next>=5;
 const kept=roundAt(whole,places,r),value=fixed(kept,r),display=withCommas(value);
 const mistakes=[{value:fixed(up?cut:cut+1,r),why:up?`You cut the number off. The next digit is ${next}, which is 5 or more, so the last digit you keep goes up by 1.`:`The next digit is ${next}, which is less than 5, so the last digit you keep stays the same.`}];
 if(r<0)mistakes.push({value:kept,why:'Keep the size of the number. The digits you round away are replaced by zeros.'});
 if(figures&&places>=figures&&r!==figures)mistakes.push({value:fixed(roundAt(whole,places,figures),figures),why:`That is correct to ${placeWord(figures)}. Significant figures are counted from the first digit that is not zero.`});
 if(!figures&&r+1<places)mistakes.push({value:fixed(roundAt(whole,places,r+1),r+1),why:`That is correct to ${placeWord(r+1)}. The question asks for ${placeWord(r)}.`});
 if(!figures&&r>=1)mistakes.push({value:fixed(roundAt(whole,places,r-1),r-1),why:`That is correct to ${placeWord(r-1)}. The question asks for ${placeWord(r)}.`});
 const first=String(whole)[0];
 return numberQuestion({prompt,value,mistakes:mistakes.filter(m=>!K.sameValue(String(m.value),shown)),round:r,claim:shown,
  hint:figures?'Start counting at the first digit that is not zero. Then look at the next digit to decide whether to round up.':'Find the last digit you are keeping. The digit after it decides: 5 or more rounds up, less than 5 stays the same.',
  steps:[
   {math:withCommas(shown),note:figures?`The first significant figure is ${first}, the first digit that is not zero. Count ${figures} figure${figures===1?'':'s'} from there: that keeps ${withCommas(fixed(cut,r))}.`:`Keeping ${r>0?placeWord(r):r===0?'the whole number part':'the digits down to the '+withCommas(String(10**-r))+'s'} gives ${withCommas(fixed(cut,r))}. Now look at the next digit.`},
   {math:`${withCommas(shown)} ≈ ${display}`,note:`The next digit is ${next}, which is ${up?'5 or more, so round up':'less than 5, so the last digit you keep stays the same'}.${r<0?' The places after it are filled with zeros.':''}`}]});
}
/* A number for the estimation questions: a 3-figure value that rounds to d * 10^e. */
function estimateOperand(rng,exps,dMax=9){
 const d=rng.int(2,dMax),e=rng.pick(exps);
 for(;;){
  const off=rng.int(-45,45),t=d*100+off;
  if(off===0||t%10===0)continue;
  if(roundAt(t,2,0)!==d)throw new Error('estimate operand does not round as expected');
  return {raw:ordinaryNumber(String(t),e),rounded:ordinaryNumber(String(d),e),q:e>=0?Q(d*10**e):Q(d,10**-e),claim:`(${d}*10^(${e}))`,e};
 }
}

K.define({
 id:'rounding',
 title:'Rounding and estimating',
 strand:'Number',
 lesson:'14-06',
 blurb:'Round to decimal places or significant figures, and estimate an answer by rounding first.',
 levels:[
  {name:'Decimal places',make(rng){
   for(;;){
    const kind=rng.pick(['places','places','places','whole','tens']);
    if(kind==='tens'){
     const r=-rng.int(1,3),whole=rng.int(10**(-r)+1,10**(-r+2)-1),unit=10**-r;
     if(whole%unit===0||roundAt(whole,0,r)===0)continue;
     return roundingQuestion({whole,places:0,r,prompt:`Round ${withCommas(String(whole))} to the nearest ${withCommas(String(unit))}.`});
    }
    const r=kind==='whole'?0:rng.int(1,3),places=r+rng.int(1,2),whole=rng.int(0,60)*10**places+rng.int(1,10**places-1);
    if(whole%10===0||Math.floor(whole/10**(places-r))%10===9&&rng.chance(.7))continue;
    /* An answer such as 35.0 would be typed as 35, so those numbers are not used. */
    if(r>0&&Math.round(whole/10**(places-r))%10===0)continue;
    return roundingQuestion({whole,places,r,prompt:`Write ${fixed(whole,places)} correct to ${placeWord(r)}.`});
   }
  }},
  {name:'Significant figures',make(rng){
   for(;;){
    const kind=rng.pick(['large','decimal','small','small']),figures=rng.int(1,3);
    let whole,places;
    if(kind==='large'){places=0;whole=rng.int(1000,999999)}
    else if(kind==='decimal'){places=rng.int(1,3);whole=rng.int(10**(places+1),10**(places+2)-1)}
    else{const zeros=rng.int(1,3),length=rng.int(3,4);whole=rng.int(10**(length-1),10**length-1);places=zeros+length}
    const length=String(whole).length,r=places-length+figures;
    if(length<=figures||whole%10===0||String(roundAt(whole,places,r)).length>figures)continue;
    if(kind==='decimal'&&r===figures||r>0&&Math.round(whole/10**(places-r))%10===0)continue;
    return roundingQuestion({whole,places,r,figures,prompt:`Write ${withCommas(fixed(whole,places))} correct to ${figures} significant figure${figures===1?'':'s'}.`});
   }
  }},
  {name:'Estimate a calculation',make(rng){
   const prompt='Estimate the value by rounding each number to one significant figure.';
   for(;;){
    const kind=rng.pick(['product','quotient','quotient','sum','context']);
    if(kind==='product'||kind==='context'){
     const a=estimateOperand(rng,kind==='context'?[2]:[0,1,2]),b=estimateOperand(rng,kind==='context'?[0,1]:[-1,0,1]),value=qMul(a.q,b.q);
     if(value.d!==1||a.rounded===b.rounded)continue;
     const who=rng.pick(NAMES),context=kind==='context'?rng.pick([
       `${a.raw} people each pay €${b.raw}${b.e===1?'0':''} for a ticket. Estimate the total paid, in euro, by rounding each number to one significant figure.`,
       `A school prints ${a.raw} posters. Each poster uses ${b.raw} ml of ink. Estimate the total ink used, in ml, by rounding each number to one significant figure.`,
       `${who} cycles ${b.raw} km on each of ${a.raw} days. Estimate the total distance, in km, by rounding each number to one significant figure.`]):null;
     return numberQuestion({prompt:context||prompt,math:context?undefined:`${a.raw} * ${b.raw}`,value:value.n,claim:`${a.claim}*${b.claim}`,
      hint:'Round each number so that it has one non-zero digit. Then multiply the rounded numbers.',
      mistakes:[
       {value:value.n*10,why:'Check the place value in your multiplication. Count the zeros in the two rounded numbers.'},
       {value:dec(value.n/10),why:'Check the place value in your multiplication. Count the zeros in the two rounded numbers.'}],
      steps:[
       {math:`${a.raw} ≈ ${a.rounded} and ${b.raw} ≈ ${b.rounded}`,note:'Round each number to one significant figure.'},
       {math:`${a.rounded} * ${b.rounded} = ${value.n}`,note:'Multiply the rounded numbers. This is the estimate.'}]});
    }
    if(kind==='quotient'){
     const a=estimateOperand(rng,[0,1]),b=estimateOperand(rng,[0,1]),c=estimateOperand(rng,[-1,0],5),top=qMul(a.q,b.q),value=qDiv(top,c.q);
     if(value.d!==1||top.d!==1||a.rounded===b.rounded)continue;
     const small=c.e<0,mistakes=[];
     if(small){
      mistakes.push({value:qStr(qMul(top,c.q)),why:`You multiplied by ${c.rounded}. Dividing by ${c.rounded} makes the answer bigger, because ${c.rounded} is less than 1.`});
      mistakes.push({value:top.n,why:`${c.raw} rounds to ${c.rounded} correct to one significant figure, not to 1.`});
     }else mistakes.push({value:top.n,why:`That is the top line. Divide it by ${c.rounded} to finish.`});
     return numberQuestion({prompt,math:`frac(${a.raw} * ${b.raw}, ${c.raw})`,value:value.n,mistakes,claim:`${a.claim}*${b.claim}/${c.claim}`,
      hint:'Round all three numbers first. Work out the top line, then divide.',
      steps:[
       {math:`${a.raw} ≈ ${a.rounded} and ${b.raw} ≈ ${b.rounded} and ${c.raw} ≈ ${c.rounded}`,note:'Round each number to one significant figure.'},
       {math:`${a.rounded} * ${b.rounded} = ${top.n}`,note:'Work out the top line.'},
       {math:`frac(${top.n}, ${c.rounded}) = ${value.n}`,note:small?`Divide. There are ${value.n} lots of ${c.rounded} in ${top.n}, so dividing by a number less than 1 makes the answer bigger.`:'Divide by the bottom number. This is the estimate.'}]});
    }
    const e=rng.pick([1,2]),a=estimateOperand(rng,[e]),b=estimateOperand(rng,[e]),c=estimateOperand(rng,[0,-1],5),top=qAdd(a.q,b.q),value=qDiv(top,c.q);
    if(value.d!==1||a.rounded===b.rounded)continue;
    return numberQuestion({prompt,math:`frac(${a.raw} + ${b.raw}, ${c.raw})`,value:value.n,claim:`(${a.claim} + ${b.claim})/${c.claim}`,
     hint:'Round all three numbers first. The fraction bar works like brackets, so add the top line before you divide.',
     mistakes:[
      {value:qStr(qAdd(a.q,qDiv(b.q,c.q))),why:'The fraction bar covers the whole top line. Add the two numbers on top first, then divide.'},
      ...(c.e<0?[{value:qStr(qMul(top,c.q)),why:`You multiplied by ${c.rounded}. Dividing by ${c.rounded} makes the answer bigger, because ${c.rounded} is less than 1.`}]:[{value:top.n,why:`That is the top line. Divide it by ${c.rounded} to finish.`}])],
     steps:[
      {math:`${a.raw} ≈ ${a.rounded} and ${b.raw} ≈ ${b.rounded} and ${c.raw} ≈ ${c.rounded}`,note:'Round each number to one significant figure.'},
      {math:`${a.rounded} + ${b.rounded} = ${top.n}`,note:'Work out the top line first.'},
      {math:`frac(${top.n}, ${c.rounded}) = ${value.n}`,note:c.e<0?`Divide. There are ${value.n} lots of ${c.rounded} in ${top.n}.`:'Divide by the bottom number. This is the estimate.'}]});
   }
  }}
 ]
});

/* ---------- Compound interest ---------- */
/* Money is kept in whole cents and rates in tenths of a percent, so every amount is exact. */
const money=cents=>fixed(cents,2);
const CENT_NOTE=' Give your answer correct to the nearest cent.';
/* Growth or depreciation at one fixed yearly rate. ask is 'amount' or 'change'. */
function compoundQuestion({prompt,start,tenths,years,falling=false,ask='amount'}){
 const M=falling?1000-tenths:1000+tenths,mult=dec(M/1000),rate=dec(tenths/10),sign=falling?'-':'+',percent=dec(M/10);
 const exact=start*M**years,final=roundAt(exact,3*years,2),isExact=exact%10**(3*years-2)===0,eq=isExact?'=':'≈';
 const yearOne=roundAt(start*M,3,2),change=Math.abs(final-start*100),simpleChange=start*tenths*years/10,simple=falling?start*100-simpleChange:start*100+simpleChange;
 const before=roundAt(start*M**(years-1),3*(years-1),2),wrongWay=roundAt(start*(falling?1000+tenths:1000-tenths)**years,3*years,2);
 const growth=`${start}*(1 ${sign} (${tenths}/10)/100)^${years}`;
 const mistakes=[{value:money(ask==='amount'?simple:simpleChange),why:falling?`That takes the same amount off every year. Each year's ${rate}% is worked out on the new, smaller value.`:`That is simple interest: the same interest every year. With compound interest, each year's interest is worked out on the new, larger amount.`}];
 if(ask==='amount'){
  mistakes.push({value:money(before),why:`That is the value after ${years-1} year${years===2?'':'s'}. Multiply by ${mult} once more.`});
  mistakes.push(falling?{value:money(wrongWay),why:`The value falls, so the multiplier is less than 1. Use \`1 - ${dec(tenths/1000)} = ${mult}\`.`}:{value:money(change),why:`That is the interest only. Add it to the €${start} to get the final amount.`});
 }else mistakes.push({value:money(final),why:falling?'That is the value at the end. Subtract it from the starting value to find how much was lost.':`That is the final amount. Subtract the €${start} you started with to find the interest.`});
 const steps=[{math:`100% ${sign} ${rate}% = ${percent}% = ${mult}`,note:falling?'The value falls, so each year it is multiplied by a number less than 1.':'Each year the amount is multiplied by this number.'}];
 if(years===2){
  steps.push({math:`${start} * ${mult} = ${money(yearOne)}`,note:'End of year 1.'});
  steps.push({math:`${money(yearOne)} * ${mult} ${eq} ${money(final)}`,note:`End of year 2. The multiplier is applied to the new amount, not to the original €${start}.`});
 }else{
  steps.push({math:`${start} * ${Array(years).fill(mult).join(' * ')} = ${start} * ${mult}^${years}`,note:'Multiply by the multiplier once for each year.'});
  steps.push({math:`${start} * ${mult}^${years} ${eq} ${money(final)}`,note:`Use the power key on your calculator.${isExact?'':' Round to the nearest cent.'}`});
 }
 if(ask==='change')steps.push(falling?{math:`${start} - ${money(final)} = ${money(change)}`,note:'Subtract from the starting value to find how much value was lost.'}:{math:`${money(final)} - ${start} = ${money(change)}`,note:'Subtract the starting amount to find the interest.'});
 return numberQuestion({prompt:prompt+CENT_NOTE,value:money(ask==='amount'?final:change),answer:{label:'€',round:2},mistakes,round:2,
  hint:`Find the multiplier for one year: 100% ${falling?'minus':'plus'} ${rate}%, written as a decimal. Then multiply by it once for each year.`,
  claim:ask==='amount'?growth:falling?`${start} - ${growth}`:`${growth} - ${start}`,steps});
}

K.define({
 id:'compound-interest',
 title:'Compound interest',
 strand:'Number',
 lesson:'04-06',
 blurb:'Multiply by the same multiplier once for each year, for growth and for depreciation.',
 levels:[
  {name:'Two years',make(rng){
   const start=rng.int(2,50)*100,rate=rng.pick([2,3,4,5,6,8,10]),who=rng.pick(NAMES),ask=rng.chance(.65)?'amount':'change';
   const prompt=ask==='amount'?rng.pick([
     `${who} invests €${start} at ${rate}% compound interest per year. Find the value of the investment after 2 years.`,
     `A savings account pays ${rate}% compound interest each year. €${start} is put into the account. How much is in the account after 2 years?`,
     `A credit union pays ${rate}% compound interest per year. ${who} saves €${start} there. Find the amount after 2 years.`]):rng.pick([
     `€${start} is invested for 2 years at ${rate}% compound interest per year. Find the total interest earned.`,
     `${who} puts €${start} into an account that pays ${rate}% compound interest per year. How much interest is earned in 2 years?`]);
   return compoundQuestion({prompt,start,tenths:rate*10,years:2,ask});
  }},
  {name:'Three years',make(rng){
   const start=rng.int(2,80)*50,rate=rng.pick([2,3,4,5,6,7,8,1.5,2.5,3.5,4.5]),who=rng.pick(NAMES),ask=rng.chance(.65)?'amount':'change';
   const prompt=ask==='amount'?rng.pick([
     `${who} invests €${start} at ${rate}% compound interest per year. Find the value of the investment after 3 years.`,
     `${who} borrows €${start} at ${rate}% compound interest per year and repays everything after 3 years. How much is repaid?`,
     `A bank pays ${rate}% compound interest per year. €${start} is left in an account for 3 years. Find the final amount.`]):rng.pick([
     `€${start} is invested for 3 years at ${rate}% compound interest per year. Find the total interest earned.`,
     `${who} borrows €${start} for 3 years at ${rate}% compound interest per year. Find the total interest charged.`]);
   return compoundQuestion({prompt,start,tenths:Math.round(rate*10),years:3,ask});
  }},
  {name:'Depreciation and changing rates',make(rng){
   const kind=rng.pick(['value','value','loss','rates']),who=rng.pick(NAMES);
   if(kind==='rates'){
    const start=rng.int(2,60)*100,[first,second]=rng.shuffle([2,2.5,3,3.5,4,5,6]),t1=Math.round(first*10),t2=Math.round(second*10),m1=dec(1+t1/1000),m2=dec(1+t2/1000);
    const exact=start*(1000+t1)*(1000+t2),final=roundAt(exact,6,2),yearOne=roundAt(start*(1000+t1),3,2),eq=exact%10000===0?'=':'≈';
    return numberQuestion({prompt:`€${start} is invested for 2 years at compound interest. The rate is ${first}% in the first year and ${second}% in the second year. Find the value of the investment after 2 years.${CENT_NOTE}`,
     value:money(final),answer:{label:'€',round:2},round:2,
     hint:'Each year has its own multiplier. Use the first one on the starting amount and the second one on the new amount.',
     claim:`${start}*(1 + (${t1}/10)/100)*(1 + (${t2}/10)/100)`,
     mistakes:[
      {value:money(start*100+start*(t1+t2)/10),why:`You added the two rates and used them once. The second rate applies to the amount at the end of year 1, which is more than €${start}.`},
      {value:money(roundAt(start*(1000+t1)**2,6,2)),why:`The rate changes in year 2. Use the multiplier ${m2} for the second year.`},
      {value:money(yearOne),why:`That is the amount after 1 year. Multiply it by ${m2} for the second year.`}],
     steps:[
      {math:`${start} * ${m1} = ${money(yearOne)}`,note:`Year 1: the multiplier for ${first}% is ${m1}.`},
      {math:`${money(yearOne)} * ${m2} ${eq} ${money(final)}`,note:`Year 2: the multiplier for ${second}% is ${m2}. It is applied to the new amount.`}]});
   }
   const rate=rng.pick([5,8,10,12,15,20,25]),years=rng.pick([2,3]),item=rng.pick(['car','van','tractor','laptop','phone','camera']),cheap=['laptop','phone','camera'].includes(item);
   const start=cheap?rng.int(4,30)*100:rng.int(4,60)*500;
   const prompt=kind==='value'?rng.pick([
     `A ${item} is bought for €${start}. It loses ${rate}% of its value each year. Find its value after ${years} years.`,
     `${who} buys a ${item} for €${start}. Its value depreciates by ${rate}% per year. What is it worth after ${years} years?`])
    :`A ${item} is bought for €${start}. Its value depreciates by ${rate}% each year. By how much has its value fallen after ${years} years?`;
   return compoundQuestion({prompt,start,tenths:rate*10,years,falling:true,ask:kind==='value'?'amount':'change'});
  }}
 ]
});
})();
