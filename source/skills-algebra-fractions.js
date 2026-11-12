/* Skill drills: fractions with letters below the line (chapter 21).
   Cancelling factors, multiplying and dividing, and adding over a common denominator. */
(()=>{'use strict';
const K=SkillKit,{terms,linear,quadratic}=K;
const STRAND='Algebra';
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a};
const lowest=(n,d)=>{const g=gcd(n,d);return [n/g,d/g,g]};
const retry=make=>{for(;;){const q=make();if(q)return q}};
const LETTERS=['x','x','y','t','n'];
const tick=v=>Number(v)<0?'`'+v+'`':String(v);
const lin=(L,p)=>linear(1,L,p);
const coef=(k,body)=>k===1?body:k+body;
const times=(k,inner)=>k===1?inner:`${k}(${inner})`;
const frac=(top,bottom)=>String(bottom)==='1'?String(top):`frac(${top}, ${bottom})`;
const banned=(L,value)=>`Remember that \`${L}\` still cannot be ${tick(value)}, because the bottom you started with would be zero.`;
function question(prompt,math,top,bottom,steps,hint,mistakes=[]){
 return {prompt,math,answer:{type:'expr',value:frac(top,bottom),form:'rational'},mistakes,hint,steps,verify:{op:'identity',a:math,b:'ANSWER',lowest:true}};
}

/* ---------- Cancel factors, not terms ---------- */
const SIMPLIFY='Simplify this fraction.';
const TOP_FIRST='Take the common factor out of the top. Then see what cancels with the bottom.';
const BOTH='Factorise the top and the bottom. Then cancel a factor that is in both.';
const twoNumbers=(p,q)=>`Find two numbers that multiply to ${tick(p*q)} and add to ${tick(p+q)}: ${tick(q)} and ${tick(p)}.`;
function oneFactor(rng){
 const L=rng.pick(LETTERS),v=rng.int(0,3);
 if(v===0){
  const k=rng.int(2,6),p=rng.int(1,5),q=rng.nonzero(-7,7);if(gcd(p,q)!==1)return null;
  const inner=linear(p,L,q),seen=`Factorising first makes that easy to see: \`${k}(${inner})\`.`;
  return question(SIMPLIFY,`frac(${linear(k*p,L,k*q)}, ${k})`,inner,1,[
   {math:`frac(${k}(${inner}), ${k})`,note:`Take the common factor ${k} out of the top.`},
   {math:inner,note:`${k} is now a factor of the top and of the bottom, so it cancels.`}],TOP_FIRST,[
   {value:linear(p,L,k*q),why:`Divide every term on top by ${k}, not only the first one. ${seen}`},
   {value:linear(k*p,L,q),why:`Divide every term on top by ${k}, not only the last one. ${seen}`}]);
 }
 if(v===1){
  const k=rng.int(2,5),m=rng.int(2,5),p=rng.int(1,4),q=rng.nonzero(-7,7);if(gcd(p,q)!==1)return null;
  const inner=linear(p,L,q);
  return question(SIMPLIFY,`frac(${linear(k*p,L,k*q)}, ${k*m})`,inner,m,[
   {math:`frac(${k}(${inner}), ${k*m})`,note:`Take the common factor ${k} out of the top.`},
   {math:`frac(${inner}, ${m})`,note:`The bottom is \`${k} * ${m}\`, so ${k} is a factor of the top and of the bottom. It cancels.`}],TOP_FIRST,[
   {value:`frac(${linear(p,L,k*q)}, ${m})`,why:`Divide every term on top by ${k}, not only the first one. Factorising first makes that easy to see: \`${k}(${inner})\`.`},
   {value:`frac(${linear(k*p,L,k*q)}, ${m})`,why:`The bottom was divided by ${k}, so the top must be divided by ${k} too.`}]);
 }
 if(v===2){
  const c=rng.int(1,4),a=rng.nonzero(-8,8),inner=linear(c,L,a);
  return question(SIMPLIFY,`frac(${terms([[c,L+'^2'],[a,L]])}, ${L})`,inner,1,[
   {math:`frac(${L}(${inner}), ${L})`,note:`Take the common factor \`${L}\` out of the top.`},
   {math:inner,note:`\`${L}\` is now a factor of the top and of the bottom, so it cancels. ${banned(L,0)}`}],TOP_FIRST,[
   {value:terms([[c,L+'^2'],[a,'']]),why:`Divide every term on top by \`${L}\`, not only the last one. Factorising first makes that easy to see: \`${L}(${inner})\`.`}]);
 }
 const g=rng.int(2,5),n=rng.int(1,5),d=rng.int(2,5),up=rng.chance(.6);if(gcd(n,d)!==1)return null;
 const math=up?`frac(${g*n}${L}^2, ${g*d}${L})`:`frac(${g*n}${L}, ${g*d}${L}^2)`;
 return question(SIMPLIFY,math,up?coef(n,L):n,up?d:d+L,[
  {math:up?`frac(${coef(n,L+'^2')}, ${d}${L})`:`frac(${coef(n,L)}, ${d}${L}^2)`,note:`Divide the top and the bottom by ${g}.`},
  {math:up?frac(coef(n,L),d):frac(n,d+L),note:up?`Divide the top and the bottom by \`${L}\`. One \`${L}\` is left on the top. ${banned(L,0)}`:`Divide the top and the bottom by \`${L}\`. One \`${L}\` is left on the bottom.`}],
  'Cancel the numbers first, then the letters.',[
  {value:up?frac(n,d+L):frac(coef(n,L),d),why:up?`There are two of \`${L}\` on the top and one on the bottom, so one \`${L}\` is left on the top.`:`There is one \`${L}\` on the top and two on the bottom, so one \`${L}\` is left on the bottom.`}]);
}
function factoriseOnce(rng){
 const L=rng.pick(LETTERS),v=rng.int(0,3);
 if(v<2){
  const k=rng.int(2,6),p=rng.nonzero(-7,7),B=`(${lin(L,p)})`,line=linear(k,L,k*p),square=terms([[1,L+'^2'],[p,L]]),cancel=`\`${B}\` is a factor of the top and of the bottom, so it cancels. ${banned(L,-p)}`;
  if(v===0)return question(SIMPLIFY,`frac(${line}, ${square})`,k,L,[
   {math:`frac(${k}${B}, ${square})`,note:`Factorise the top: take out ${k}.`},
   {math:`frac(${k}${B}, ${L}${B})`,note:`Factorise the bottom: take out \`${L}\`.`},
   {math:`frac(${k}, ${L})`,note:cancel}],BOTH);
  return question(SIMPLIFY,`frac(${square}, ${line})`,L,k,[
   {math:`frac(${L}${B}, ${line})`,note:`Factorise the top: take out \`${L}\`.`},
   {math:`frac(${L}${B}, ${k}${B})`,note:`Factorise the bottom: take out ${k}.`},
   {math:`frac(${L}, ${k})`,note:cancel}],BOTH);
 }
 if(v===2){
  const p=rng.int(2,9)*rng.sign(),shared=lin(L,p),other=lin(L,-p);
  return question(SIMPLIFY,`frac(${quadratic(1,0,-p*p,L)}, ${shared})`,other,1,[
   {math:`frac((${other})(${shared}), ${shared})`,note:`The top is a difference of two squares: \`${L}^2\` minus ${Math.abs(p)} squared.`},
   {math:other,note:`\`(${shared})\` is a factor of the top and of the bottom, so it cancels. ${banned(L,-p)}`}],BOTH,[
   {value:shared,why:`\`(${shared})\` is the bracket that cancels. The other bracket is the one that is left.`}]);
 }
 const [p,q]=rng.distinct(2,-7,7,[0]);if(p+q===0)return null;
 const shared=lin(L,p),other=lin(L,q);
 return question(SIMPLIFY,`frac(${quadratic(1,p+q,p*q,L)}, ${shared})`,other,1,[
  {math:`frac((${other})(${shared}), ${shared})`,note:`Factorise the top. ${twoNumbers(p,q)}`},
  {math:other,note:`\`(${shared})\` is a factor of the top and of the bottom, so it cancels. ${banned(L,-p)}`}],BOTH,[
  {value:shared,why:`\`(${shared})\` is the bracket that cancels. The other bracket is the one that is left.`}]);
}
function factoriseBoth(rng){
 const L=rng.pick(LETTERS),v=rng.int(0,2),square=L+'^2';
 const trinomial=(p,q)=>({text:quadratic(1,p+q,p*q,L),rest:linear(p+q,L,p*q),factors:`(${lin(L,q)})(${lin(L,p)})`,left:lin(L,q),note:where=>`Factorise the ${where}. ${twoNumbers(p,q)}`});
 let top,bottom,p;
 if(v===0){
  let q;[p,q]=rng.distinct(2,-7,7,[0]);if(p+q===0)return null;
  top={text:quadratic(1,0,-p*p,L),rest:String(-p*p),factors:`(${lin(L,-p)})(${lin(L,p)})`,left:lin(L,-p),note:where=>`The ${where} is a difference of two squares.`};
  bottom=trinomial(p,q);
 }else if(v===1){
  let q,r;[p,q,r]=rng.distinct(3,-6,6,[0]);if(p+q===0||p+r===0)return null;
  top=trinomial(p,q);bottom=trinomial(p,r);
 }else{
  let q;[p,q]=rng.distinct(2,-7,7,[0]);if(p+q===0)return null;
  top=trinomial(p,q);
  bottom={text:terms([[1,square],[p,L]]),rest:terms([[p,L]]),factors:`${L}(${lin(L,p)})`,left:L,note:where=>`Factorise the ${where}: take out the common factor \`${L}\`.`};
 }
 if(rng.chance(.4))[top,bottom]=[bottom,top];
 return question(SIMPLIFY,`frac(${top.text}, ${bottom.text})`,top.left,bottom.left,[
  {math:`frac(${top.factors}, ${bottom.text})`,note:top.note('top')},
  {math:`frac(${top.factors}, ${bottom.factors})`,note:bottom.note('bottom')},
  {math:frac(top.left,bottom.left),note:`\`(${lin(L,p)})\` is a factor of the top and of the bottom, so it cancels. ${banned(L,-p)}`}],BOTH,[
  {value:`frac(${top.rest}, ${bottom.rest})`,why:`\`${square}\` is a term here, not a factor, so it cannot be cancelled. Factorise the top and the bottom first, then cancel a whole bracket.`},
  {value:frac(bottom.left,top.left),why:'That is upside down. Keep what is left of the top on the top.'}]);
}
K.define({
 id:'simplify-algebraic-fractions',title:'Simplify algebraic fractions',strand:STRAND,lesson:'21-02',
 blurb:'Factorise the top and the bottom, then cancel a factor that is in both. Cancel factors, never single terms.',
 levels:[
  {name:'One common factor',make(rng){return retry(()=>oneFactor(rng))}},
  {name:'Factorise, then cancel',make(rng){return retry(()=>factoriseOnce(rng))}},
  {name:'Quadratics on top and bottom',make(rng){return retry(()=>factoriseBoth(rng))}}]
});

/* ---------- Multiply and divide ---------- */
const MULTIPLY='Multiply. Give your answer in its simplest form.',DIVIDE='Divide. Give your answer in its simplest form.';
const FLIP='Dividing by a fraction is the same as multiplying by it upside down. Turn the second fraction upside down and multiply.';
const NO_FLIP='Turn the second fraction upside down before you multiply.',WRONG_FLIP='Turn the second fraction upside down, not the first.';
const ACROSS='Multiply the tops. Multiply the bottoms.';
const DIVIDE_HINT='To divide by a fraction, turn it upside down and multiply. Then cancel what the top and the bottom share.';
const FACTOR_HINT='Factorise first. Then cancel any factor that is on a top and on a bottom.';
function multiplySingle(rng){
 const L=rng.pick(LETTERS);
 if(rng.chance(.55)){
  const p=rng.int(1,6),q=rng.int(2,6),r=rng.int(1,6),s=rng.int(1,5);if(gcd(p,q)!==1||gcd(r,s)!==1)return null;
  const [n,d,g]=lowest(p*r,q*s);if(g===1)return null;
  return question(MULTIPLY,`frac(${coef(p,L)}, ${q}) * frac(${r}, ${coef(s,L+'^2')})`,n,coef(d,L),[
   {math:`frac(${coef(p*r,L)}, ${coef(q*s,L+'^2')})`,note:ACROSS},
   {math:frac(n,coef(d,L)),note:`Divide the top and the bottom by \`${coef(g,L)}\`.`}],
   'Multiply top by top and bottom by bottom. Then cancel what the top and the bottom share.',[
   {value:`frac(${coef(p*s,L+'^3')}, ${q*r})`,why:'That is cross-multiplying. To multiply fractions, go straight across: top times top, and bottom times bottom.'},
   {value:frac(coef(n,L),d),why:`There is one \`${L}\` on the top and two on the bottom, so one \`${L}\` is left on the bottom.`}]);
 }
 const a=rng.nonzero(-7,7),q=rng.int(2,6),r=rng.int(1,6),[n,d,g]=lowest(r,q),B=lin(L,a),first=`frac(${B}, ${q})`,second=`frac(${coef(r,L)}, ${B})`,swap=rng.chance(.5);
 const steps=[
  {math:swap?`${coef(r,L)} * frac(1, ${q})`:`frac(1, ${q}) * ${coef(r,L)}`,note:`\`(${B})\` is on the top of one fraction and on the bottom of the other, so it cancels.`},
  {math:`frac(${coef(r,L)}, ${q})`,note:'Multiply what is left.'}];
 if(g>1)steps.push({math:frac(coef(n,L),d),note:`Divide the top and the bottom by ${g}.`});
 return question(MULTIPLY,swap?`${second} * ${first}`:`${first} * ${second}`,coef(n,L),d,steps,'Look for a bracket that is on the top of one fraction and on the bottom of the other. It cancels.');
}
function divideSingle(rng){
 const L=rng.pick(LETTERS),v=rng.int(0,2);
 if(v===0){
  const p=rng.int(1,6),q=rng.int(2,6),r=rng.int(1,6),s=rng.int(1,5);if(gcd(p,q)!==1||gcd(r,s)!==1)return null;
  const [n,d,g]=lowest(p*s,q*r),first=`frac(${coef(p,L)}, ${q})`,top=coef(n,L+'^2');
  const steps=[{math:`${first} * ${frac(coef(s,L),r)}`,note:FLIP},{math:`frac(${coef(p*s,L+'^2')}, ${q*r})`,note:ACROSS}];
  if(g>1)steps.push({math:frac(top,d),note:`Divide the top and the bottom by ${g}.`});
  return question(DIVIDE,`${first} ÷ frac(${r}, ${coef(s,L)})`,top,d,steps,DIVIDE_HINT,[
   {value:`frac(${p*r}, ${q*s})`,why:NO_FLIP},
   {value:`frac(${q*r}, ${coef(p*s,L+'^2')})`,why:WRONG_FLIP}]);
 }
 if(v===1){
  const p=rng.int(1,6),q=rng.int(1,5),r=rng.int(1,6),s=rng.int(1,5);if(gcd(p,q)!==1||gcd(r,s)!==1)return null;
  const [n,d,g]=lowest(p*s,q*r),first=`frac(${p}, ${coef(q,L)})`;
  return question(DIVIDE,`${first} ÷ frac(${r}, ${coef(s,L+'^2')})`,coef(n,L),d,[
   {math:`${first} * ${frac(coef(s,L+'^2'),r)}`,note:FLIP},
   {math:`frac(${coef(p*s,L+'^2')}, ${coef(q*r,L)})`,note:ACROSS},
   {math:frac(coef(n,L),d),note:`Divide the top and the bottom by \`${coef(g,L)}\`.`}],DIVIDE_HINT,[
   {value:`frac(${p*r}, ${coef(q*s,L+'^3')})`,why:NO_FLIP},
   {value:`frac(${q*r}, ${coef(p*s,L)})`,why:WRONG_FLIP}]);
 }
 const a=rng.nonzero(-7,7),q=rng.int(2,6),r=rng.int(1,6),[n,d,g]=lowest(r,q),B=lin(L,a),first=`frac(${B}, ${q})`;
 const steps=[
  {math:`${first} * frac(${coef(r,L)}, ${B})`,note:FLIP},
  {math:`frac(1, ${q}) * ${coef(r,L)}`,note:`\`(${B})\` is on the top of one fraction and on the bottom of the other, so it cancels.`},
  {math:`frac(${coef(r,L)}, ${q})`,note:'Multiply what is left.'}];
 if(g>1)steps.push({math:frac(coef(n,L),d),note:`Divide the top and the bottom by ${g}.`});
 return question(DIVIDE,`${first} ÷ frac(${B}, ${coef(r,L)})`,coef(n,L),d,steps,DIVIDE_HINT,[
  {value:`frac((${B})^2, ${coef(q*r,L)})`,why:NO_FLIP},
  {value:`frac(${q}, ${coef(r,L)})`,why:WRONG_FLIP}]);
}
function factoriseFirst(rng){
 const L=rng.pick(LETTERS),v=rng.int(0,2),p=rng.nonzero(-7,7),k=rng.int(2,6),shared=lin(L,p);
 if(v===0){
  const other=lin(L,-p);
  return question(MULTIPLY,`frac(${quadratic(1,0,-p*p,L)}, ${k}${L}) * frac(${L}, ${shared})`,other,k,[
   {math:`frac((${other})(${shared}), ${k}${L}) * frac(${L}, ${shared})`,note:'The first top is a difference of two squares. Factorise it.'},
   {math:`frac(${other}, ${k})`,note:`\`(${shared})\` cancels with \`(${shared})\`, and \`${L}\` cancels with \`${L}\`. Multiply what is left.`}],FACTOR_HINT,[
   {value:`frac(${shared}, ${k})`,why:`\`(${shared})\` is the bracket that cancels. The other bracket is the one that is left.`}]);
 }
 if(v===1){
  const m=rng.int(2,8),[m1,k1,g]=lowest(m,k),other=lin(L,-p),squares=quadratic(1,0,-p*p,L),first=`frac(${squares}, ${k}${L})`,top=times(m1,other),bottom=coef(k1,L);
  const steps=[
   {math:`${first} * frac(${m}, ${shared})`,note:FLIP},
   {math:`frac((${other})(${shared}), ${k}${L}) * frac(${m}, ${shared})`,note:'The first top is a difference of two squares. Factorise it.'},
   {math:`frac(${m}(${other}), ${k}${L})`,note:`\`(${shared})\` cancels. Multiply what is left.`}];
  if(g>1)steps.push({math:frac(top,bottom),note:`Divide the top and the bottom by ${g}.`});
  return question(DIVIDE,`${first} ÷ frac(${shared}, ${m})`,top,bottom,steps,FACTOR_HINT,[
   {value:`frac((${squares})(${shared}), ${k*m}${L})`,why:NO_FLIP}]);
 }
 const m=rng.int(2,8),divide=rng.chance(.5),[m1,k1,g]=lowest(m,k),square=terms([[1,L+'^2'],[p,L]]),first=`frac(${square}, ${k})`;
 const steps=[];
 if(divide)steps.push({math:`${first} * frac(${m}, ${shared})`,note:FLIP});
 steps.push({math:`frac(${L}(${shared}), ${k}) * frac(${m}, ${shared})`,note:`Take the common factor \`${L}\` out of the first top.`});
 steps.push({math:`frac(${m}${L}, ${k})`,note:`\`(${shared})\` cancels. Multiply what is left.`});
 if(g>1)steps.push({math:frac(coef(m1,L),k1),note:`Divide the top and the bottom by ${g}.`});
 return question(divide?DIVIDE:MULTIPLY,divide?`${first} ÷ frac(${shared}, ${m})`:`${first} * frac(${m}, ${shared})`,coef(m1,L),k1,steps,FACTOR_HINT,
  divide?[{value:`frac((${square})(${shared}), ${k*m})`,why:NO_FLIP}]:[]);
}
K.define({
 id:'multiply-divide-algebraic-fractions',title:'Multiply and divide algebraic fractions',strand:STRAND,lesson:'21-08',also:['21-09'],
 blurb:'Factorise, cancel matching factors, then multiply what is left. To divide, turn the second fraction upside down first.',
 levels:[
  {name:'Multiply',make(rng){return retry(()=>multiplySingle(rng))}},
  {name:'Divide',make(rng){return retry(()=>divideSingle(rng))}},
  {name:'Factorise first',make(rng){return retry(()=>factoriseFirst(rng))}}]
});

/* ---------- Add and subtract with letters below the line ---------- */
const SINGLE='Write as a single fraction in its simplest form.';
const TOPS='The bottoms changed, so the tops must change too. Multiply each top by the other bottom.';
const ADD_BOTH='Do not add the tops and add the bottoms. Write both fractions over a common denominator first.';
const common=D=>`The bottoms share no factor, so the common denominator is \`${D}\`. Multiply the top and the bottom of each fraction by the other bottom.`;
const PRODUCT_HINT='Multiply the two bottoms to get a common denominator. Then change each top to match.';
const MINUS='Write one fraction over the common denominator. Keep the second top in brackets, because the minus applies to all of it.';
function oneLetter(rng){
 const L=rng.pick(LETTERS),v=rng.int(0,2),plus=rng.chance(.6),op=plus?'+':'-',s=plus?1:-1,join=`The bottoms match now, so ${plus?'add':'subtract'} the tops.`;
 if(v===0){
  const a=rng.int(1,6),c=rng.int(2,5),b=rng.int(1,7),t=a*c+s*b,D=c+L;if(gcd(b,c)!==1||t<=0||a+s*b===0)return null;
  return question(SINGLE,`frac(${a}, ${L}) ${op} frac(${b}, ${D})`,t,D,[
   {math:`frac(${a*c}, ${D}) ${op} frac(${b}, ${D})`,note:`The common denominator is \`${D}\`. Multiply the top and the bottom of the first fraction by ${c}.`},
   {math:`frac(${t}, ${D})`,note:join}],`Both bottoms go into \`${D}\`. Write both fractions over \`${D}\`.`,[
   {value:`frac(${a+s*b}, ${D})`,why:`The first bottom was multiplied by ${c}, so its top must be multiplied by ${c} too.`},
   ...(plus?[{value:`frac(${a+b}, ${c+1}${L})`,why:ADD_BOTH}]:[])]);
 }
 if(v===1){
  const a=rng.int(1,6),b=rng.int(1,9),D=L+'^2',top=linear(a,L,s*b);if(a+s*b===0)return null;
  return question(SINGLE,`frac(${a}, ${L}) ${op} frac(${b}, ${D})`,top,D,[
   {math:`frac(${coef(a,L)}, ${D}) ${op} frac(${b}, ${D})`,note:`The common denominator is \`${D}\`. Multiply the top and the bottom of the first fraction by \`${L}\`.`},
   {math:`frac(${top}, ${D})`,note:join}],`Both bottoms go into \`${D}\`. Write both fractions over \`${D}\`.`,[
   {value:`frac(${a+s*b}, ${D})`,why:`The first bottom was multiplied by \`${L}\`, so its top must be multiplied by \`${L}\` too.`}]);
 }
 const a=rng.int(1,6),k=rng.int(2,6),b=rng.int(1,5),D=k+L;if(gcd(b,k)!==1||a+s*b===0)return null;
 const top=plus?linear(b,L,a*k):`${a*k} - ${coef(b,L)}`;
 return question(SINGLE,`frac(${a}, ${L}) ${op} frac(${b}, ${k})`,top,D,[
  {math:`frac(${a*k}, ${D}) ${op} frac(${coef(b,L)}, ${D})`,note:`The common denominator is \`${D}\`. Multiply the top and the bottom of the first fraction by ${k}, and of the second by \`${L}\`.`},
  {math:`frac(${top}, ${D})`,note:join}],`The common denominator is the two bottoms multiplied: \`${D}\`.`,[
  {value:`frac(${a+s*b}, ${D})`,why:'Both bottoms changed, so both tops must change too.'}]);
}
function twoBottoms(rng){
 const L=rng.pick(LETTERS),a=rng.int(1,6),b=rng.int(1,6);
 if(rng.chance(.5)){
  const p=rng.nonzero(-6,6),B=lin(L,p),D=`${L}(${B})`,top=linear(a+b,L,a*p);
  return question(SINGLE,`frac(${a}, ${L}) + frac(${b}, ${B})`,top,D,[
   {math:`frac(${times(a,B)}, ${D}) + frac(${coef(b,L)}, ${D})`,note:common(D)},
   {math:`frac(${linear(a,L,a*p)} + ${coef(b,L)}, ${D})`,note:a===1?'Write one fraction over the common denominator.':'Write one fraction over the common denominator, and multiply out the bracket on top.'},
   {math:`frac(${top}, ${D})`,note:'Collect the like terms on top. The bottom can stay in brackets.'}],PRODUCT_HINT,[
   {value:`frac(${a+b}, ${D})`,why:TOPS},
   {value:`frac(${a+b}, ${linear(2,L,p)})`,why:ADD_BOTH}]);
 }
 const [p,q]=rng.distinct(2,-6,6,[0]),P=lin(L,p),Q=lin(L,q),D=`(${P})(${Q})`,top=linear(a+b,L,a*q+b*p);
 return question(SINGLE,`frac(${a}, ${P}) + frac(${b}, ${Q})`,top,D,[
  {math:`frac(${times(a,Q)}, ${D}) + frac(${times(b,P)}, ${D})`,note:common(D)},
  {math:`frac(${linear(a,L,a*q)} + ${linear(b,L,b*p)}, ${D})`,note:a===1&&b===1?'Write one fraction over the common denominator.':'Write one fraction over the common denominator, and multiply out the brackets on top.'},
  {math:`frac(${top}, ${D})`,note:'Collect the like terms on top. The bottom can stay in brackets.'}],PRODUCT_HINT,[
  {value:`frac(${a+b}, ${D})`,why:TOPS},
  {value:`frac(${a+b}, ${linear(2,L,p+q)})`,why:ADD_BOTH}]);
}
function subtract(rng){
 const L=rng.pick(LETTERS),v=rng.int(0,2),a=rng.int(1,6),b=rng.int(1,6);if(a<b)return null;
 const listed=D=>a===b?[]:[{value:`frac(${a-b}, ${D})`,why:TOPS}];
 const whole=(B,p)=>`The minus applies to the whole of the second top: \`-${b===1?`(${B})`:times(b,B)}\` is \`${terms([[-b,L],[-b*p,'']])}\`.`;
 if(v===0){
  const [p,q]=rng.distinct(2,-6,6,[0]);if(a===b&&q<p)return null;
  const P=lin(L,p),Q=lin(L,q),D=`(${P})(${Q})`,top=linear(a-b,L,a*q-b*p);
  return question(SINGLE,`frac(${a}, ${P}) - frac(${b}, ${Q})`,top,D,[
   {math:`frac(${times(a,Q)}, ${D}) - frac(${times(b,P)}, ${D})`,note:common(D)},
   {math:`frac(${times(a,Q)} - ${b===1?`(${P})`:times(b,P)}, ${D})`,note:MINUS},
   {math:`frac(${terms([[a,L],[a*q,''],[-b,L],[-b*p,'']])}, ${D})`,note:'Multiply out. The minus changes the sign of every term in the second bracket.'},
   {math:`frac(${top}, ${D})`,note:'Collect the like terms on top.'}],PRODUCT_HINT,[
   {value:`frac(${linear(a-b,L,a*q+b*p)}, ${D})`,why:whole(P,p)},...listed(D)]);
 }
 const p=rng.nonzero(-6,6),B=lin(L,p),D=`${L}(${B})`;
 if(v===1){
  if(a===b&&p<0)return null;
  const top=linear(a-b,L,a*p);
  return question(SINGLE,`frac(${a}, ${L}) - frac(${b}, ${B})`,top,D,[
   {math:`frac(${times(a,B)}, ${D}) - frac(${coef(b,L)}, ${D})`,note:common(D)},
   {math:`frac(${linear(a,L,a*p)} - ${coef(b,L)}, ${D})`,note:a===1?'Write one fraction over the common denominator.':'Write one fraction over the common denominator, and multiply out the bracket on top.'},
   {math:`frac(${top}, ${D})`,note:'Collect the like terms on top.'}],PRODUCT_HINT,listed(D));
 }
 if(a===b&&p>0)return null;
 const top=linear(a-b,L,-b*p);
 return question(SINGLE,`frac(${a}, ${B}) - frac(${b}, ${L})`,top,D,[
  {math:`frac(${coef(a,L)}, ${D}) - frac(${times(b,B)}, ${D})`,note:common(D)},
  {math:`frac(${coef(a,L)} - ${b===1?`(${B})`:times(b,B)}, ${D})`,note:MINUS},
  {math:`frac(${terms([[a,L],[-b,L],[-b*p,'']])}, ${D})`,note:'Multiply out. The minus changes the sign of every term in the bracket.'},
  {math:`frac(${top}, ${D})`,note:'Collect the like terms on top.'}],PRODUCT_HINT,[
  {value:`frac(${linear(a-b,L,b*p)}, ${D})`,why:whole(B,p)},...listed(D)]);
}
K.define({
 id:'fractions-letters-below',title:'Add fractions with a letter on the bottom',strand:STRAND,lesson:'21-10',
 blurb:'Build a common denominator from both bottoms, change each top to match, then add or subtract the tops.',
 levels:[
  {name:'One letter below',make(rng){return retry(()=>oneLetter(rng))}},
  {name:'Two different bottoms',make(rng){return retry(()=>twoBottoms(rng))}},
  {name:'Subtract',make(rng){return retry(()=>subtract(rng))}}]
});
})();
