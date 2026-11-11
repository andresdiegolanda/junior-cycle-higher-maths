/* Skill drills: equations. Each level's make(rng) returns one question. */
(()=>{
'use strict';
const K=SkillKit,{terms,linear,fmt,Q,qStr,qSub,qDiv}=K;

K.define({
 id:'linear-equations',
 title:'Solve a linear equation',
 strand:'Algebra',
 lesson:'01-05',
 blurb:'Do the same thing to both sides until the letter is on its own.',
 levels:[
  {name:'One and two steps',make(rng){
   const x=rng.nonzero(-9,12),a=rng.int(2,9);
   if(rng.chance(.3)){
    /* x/a + b = c */
    const b=rng.nonzero(-9,9),value=x*a,c=x+b,equation=`frac(x, ${a}) ${K.signed(b)} = ${c}`;
    return {
     prompt:'Solve the equation.',math:equation,
     answer:{type:'number',label:'x =',value:String(value)},
     mistakes:[
      {value:String((c+b)*a),why:`To undo \`${K.signed(b)}\` do the opposite: ${b>0?'subtract '+b+' from':'add '+(-b)+' to'} both sides.`},
      {value:String(a*c-b),why:`If you multiply by ${a} first, every term is multiplied, including the ${Math.abs(b)}. It is easier to undo \`${K.signed(b)}\` first.`},
      {value:fmt(Q(c-b,a)),why:`\`frac(x, ${a})\` means x divided by ${a}. To undo a division, multiply both sides by ${a}.`}],
     hint:`Undo \`${K.signed(b)}\` first. Then undo the division by ${a}.`,
     steps:[
      {math:equation,note:'Start with the equation. Both sides are equal, like a balanced scale.'},
      {math:`frac(x, ${a}) = ${c-b}`,note:`${b>0?'Subtract '+b+' from':'Add '+(-b)+' to'} both sides to leave the x term on its own.`},
      {math:`x = ${value}`,note:`Multiply both sides by ${a} to undo the division.`},
      {math:`frac(${value}, ${a}) ${K.signed(b)} = ${c}`,note:'Check: put your value back into the original equation.'}],
     verify:{op:'solve',eq:`x/${a} + (${b}) = ${c}`,variable:'x',solutions:['ANSWER']}
    };
   }
   const b=rng.nonzero(-12,12),c=a*x+b,equation=`${linear(a,'x',b)} = ${c}`;
   return {
    prompt:'Solve the equation.',math:equation,
    answer:{type:'number',label:'x =',value:String(x)},
    mistakes:[
     {value:fmt(Q(c+b,a)),why:`To undo \`${K.signed(b)}\` you do the opposite: ${b>0?'subtract '+b+' from':'add '+(-b)+' to'} both sides.`},
     {value:String(c-b),why:`You found \`${a}x\`. One more move: divide both sides by ${a} to get x on its own.`},
     {value:String(-x),why:'Check your signs. Put your value back into the equation to test it.'}],
    hint:`First undo \`${K.signed(b)}\`. Then undo the multiplication by ${a}.`,
    steps:[
     {math:equation,note:'Start with the equation. Both sides are equal, like a balanced scale.'},
     {math:`${a}x = ${c-b}`,note:`${b>0?'Subtract '+b+' from':'Add '+(-b)+' to'} both sides. Now the x term is on its own.`},
     {math:`x = ${x}`,note:`Divide both sides by ${a}.`},
     {math:`${a}(${x}) ${K.signed(b)} = ${c}`,note:'Check: put your value back into the original equation.'}],
    verify:{op:'solve',eq:`${a}*x + (${b}) = ${c}`,variable:'x',solutions:['ANSWER']}
   };
  }},
  {name:'Brackets, or x on both sides',make(rng){
   const x=rng.nonzero(-8,9);
   if(rng.chance(.5)){
    /* a(x + b) = c */
    const a=rng.int(2,7)*rng.pick([1,1,-1]),b=rng.nonzero(-9,9),c=a*(x+b),equation=`${a}(${linear(1,'x',b)}) = ${c}`;
    return {
     prompt:'Solve the equation.',math:equation,
     answer:{type:'number',label:'x =',value:String(x)},
     mistakes:[
      {value:fmt(Q(c-b,a)),why:`The ${a} multiplies everything in the bracket: \`${a}(${linear(1,'x',b)}) = ${terms([[a,'x'],[a*b,'']])}\`, not \`${terms([[a,'x'],[b,'']])}\`.`},
      {value:String(c/a+b),why:`After dividing by ${a} you have \`${linear(1,'x',b)} = ${c/a}\`. Undo \`${K.signed(b)}\` by doing the opposite.`}],
     hint:`Either divide both sides by ${a} first, or multiply out the bracket first. Both work.`,
     steps:[
      {math:equation,note:`The whole bracket is multiplied by ${a}.`},
      {math:`${linear(1,'x',b)} = ${c/a}`,note:`Divide both sides by ${a}. This removes the multiplier outside the bracket.`},
      {math:`x = ${x}`,note:`${b>0?'Subtract '+b+' from':'Add '+(-b)+' to'} both sides.`},
      {math:`${a}(${x} ${K.signed(b)}) = ${a}(${x+b}) = ${c}`,note:'Check in the original equation.'}],
     verify:{op:'solve',eq:`${a}*(x + (${b})) = ${c}`,variable:'x',solutions:['ANSWER']}
    };
   }
   /* ax + b = cx + d with a > c */
   const c=rng.int(1,5),a=c+rng.int(1,5),b=rng.nonzero(-12,12),d=(a-c)*x+b,left=linear(a,'x',b),right=linear(c,'x',d),equation=`${left} = ${right}`;
   return {
    prompt:'Solve the equation.',math:equation,
    answer:{type:'number',label:'x =',value:String(x)},
    mistakes:[
     {value:fmt(Q(d-b,a+c)),why:`To move \`${c===1?'':c}x\` from the right, subtract it from both sides. That leaves \`${a-c===1?'':a-c}x\` on the left, not \`${a+c}x\`.`},
     {value:fmt(Q(d+b,a-c)),why:`To undo \`${K.signed(b)}\` on the left, do the opposite to both sides.`}],
    hint:`Get the x terms on one side: subtract \`${c===1?'':c}x\` from both sides.`,
    steps:[
     {math:equation,note:'There are x terms on both sides. Collect them on one side first.'},
     {math:`${linear(a-c,'x',b)} = ${d}`,note:`Subtract \`${c===1?'':c}x\` from both sides.`},
     {math:`${a-c===1?'':a-c}x = ${d-b}`,note:`${b>0?'Subtract '+b+' from':'Add '+(-b)+' to'} both sides.`},
     ...(a-c===1?[]:[{math:`x = ${x}`,note:`Divide both sides by ${a-c}.`}]),
     {math:`${a}(${x}) ${K.signed(b)} = ${a*x+b} and ${c===1?'':c}(${x})${d?' '+K.signed(d):''} = ${c*x+d}`,note:'Check: both sides give the same number.'}],
    verify:{op:'solve',eq:`${a}*x + (${b}) = ${c}*x + (${d})`,variable:'x',solutions:['ANSWER']}
   };
  }},
  {name:'Exam style',make(rng){
   /* a(x + b) = c(x + d) + e, with a fraction or negative answer possible */
   for(;;){
    const a=rng.int(2,6),c=rng.int(2,5),b=rng.nonzero(-6,6),d=rng.nonzero(-6,6),e=rng.int(-9,9);
    if(a===c)continue;
    const solution=Q(c*d+e-a*b,a-c);
    if(Math.abs(solution.n)>40||solution.d>6)continue;
    const leftBracket=linear(1,'x',b),rightBracket=linear(1,'x',d);
    const equation=`${a}(${leftBracket}) = ${c===1?'':c}(${rightBracket})${e?' '+K.signed(e):''}`;
    const leftExpanded=linear(a,'x',a*b),rightExpanded=linear(c,'x',c*d+e);
    const k=a-c,rhs=c*d+e-a*b;
    return {
     prompt:'Solve the equation. Give a fraction in its simplest form if the answer is not a whole number.',math:equation,
     answer:{type:'number',label:'x =',value:qStr(solution),simplest:true},
     mistakes:[
      {value:fmt(Q(c*d+e-b,a-c)),why:`Multiply every term in the bracket: \`${a}(${leftBracket}) = ${leftExpanded}\`.`},
      {value:fmt(Q(c*d+e-a*b,a+c)),why:`Subtract \`${c===1?'':c}x\` from both sides to collect the x terms. That gives \`${k===1?'':k===-1?'-':k}x\` on the left.`},
      {value:fmt(Q(c*d+e+a*b,a-c)),why:'Check the sign when you move the number term. Do the opposite operation on both sides.'}],
     hint:'Multiply out both brackets first. Then collect the x terms on one side and the numbers on the other.',
     steps:[
      {math:equation,note:'Multiply out the brackets before anything else.'},
      {math:`${leftExpanded} = ${rightExpanded}`,note:e?'Each number outside multiplies every term inside its bracket. Then tidy the right side.':'Each number outside multiplies every term inside its bracket.'},
      {math:`${linear(k,'x',a*b)} = ${c*d+e}`,note:`Subtract \`${c===1?'':c}x\` from both sides.`},
      {math:`${k===1?'':k===-1?'-':k}x = ${rhs}`,note:`${a*b>0?'Subtract '+a*b+' from':'Add '+(-a*b)+' to'} both sides.`},
      ...(k===1?[]:[{math:`x = ${terms([[solution,'']])}`,note:`Divide both sides by ${k}${solution.d===1?'':K.gcd(rhs,k)>1?' and simplify the fraction':'. The answer stays as a fraction'}.`}])],
     verify:{op:'solve',eq:`${a}*(x + (${b})) = ${c}*(x + (${d})) + (${e})`,variable:'x',solutions:['ANSWER']}
    };
   }
  }}
 ]
});
})();
