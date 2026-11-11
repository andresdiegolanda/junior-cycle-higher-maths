/* Skill drills: algebraic expressions. Each level's make(rng) returns one question. */
(()=>{
'use strict';
const K=SkillKit,{terms,linear,quadratic,expand,fmt,Q,qStr}=K;

/* The coefficient written in front of a letter or bracket: 1 and -1 are hidden. */
const cf=n=>n===1?'':n===-1?'-':String(n);
/* Joins two expressions with the right sign between them. */
const join=(a,b)=>b.startsWith('-')?`${a} - ${b.slice(1)}`:`${a} + ${b}`;
/* The question as shown, with every product written out, for the independent check. */
const claim=s=>s.replace(/(\d)(?=[a-z(])/g,'$1*').replace(/([a-z])(?=[a-z(])/g,'$1*').replace(/\)(?=[a-z\d(])/g,')*');
/* Drops a listed mistake whose value repeats an earlier one. */
const unique=list=>list.filter((m,i)=>!list.slice(0,i).some(o=>K.sameValue(String(o.value),String(m.value))));
/* True when two different slips would give the same wrong answer, so the explanation could be the wrong one. */
const clash=q=>unique(q.mistakes).length!==q.mistakes.length;
const LETTERS=['x','y','a','n','p','t'];
const PAIRS=[['a','b'],['x','y'],['p','q'],['m','n']];

/* ---------- Collect like terms ---------- */
function collect(list,hint){
 const math=terms(list),answer=expand(math),order=[];
 for(const [,l]of list)if(!order.includes(l))order.push(l);
 const grouped=terms(order.flatMap(l=>list.filter(t=>t[1]===l)));
 const name=l=>l?`\`${l}\` terms`:'number terms';
 const mistakes=[];
 const neg=list.findIndex((t,i)=>i>0&&t[0]<0);
 if(neg>0)mistakes.push({value:expand(terms(list.map((t,i)=>i===neg?[-t[0],t[1]]:t))),why:`Each term keeps the sign in front of it. Here \`- ${terms([[-list[neg][0],list[neg][1]]])}\` is taken away, not added.`});
 const total=list.reduce((sum,t)=>sum+t[0],0);
 if(order.length>1&&total!==0)mistakes.push({value:terms([[total,order[0]||order[1]]]),why:order.length===2?`You joined the ${name(order[0])} and the ${name(order[1])} together. Only terms with exactly the same letter part can be combined.`:'You joined terms with different letter parts into one term. Only terms with exactly the same letter part can be combined.'});
 const one=list.find(t=>Math.abs(t[0])===1&&t[1]);
 if(one)mistakes.push({value:expand(terms(list.filter(t=>t!==one))),why:one[0]>0?`\`${one[1]}\` on its own means one \`${one[1]}\`. Count it as 1 when you collect.`:`\`- ${one[1]}\` takes away one \`${one[1]}\`. Count it as -1 when you collect.`});
 return {
  prompt:'Simplify by collecting like terms.',math,
  answer:{type:'expr',value:answer},mistakes,hint,
  steps:[
   {math,note:'Look for terms with exactly the same letter part.'},
   ...(grouped===math?[]:[{math:grouped,note:'Put like terms side by side. Each term keeps the sign in front of it.'}]),
   {math:answer,note:'Add or subtract the numbers in front. The letter part does not change.'}],
  verify:{op:'identity',a:claim(math),b:'ANSWER'}
 };
}
function minusBracket(first,inner){
 const math=`${terms(first)} - (${terms(inner)})`,answer=expand(math);
 return {
  prompt:'Remove the bracket and simplify.',math,
  answer:{type:'expr',value:answer},
  mistakes:[
   {value:expand(terms(first.concat(inner.map(([c,l],i)=>[i===0?-c:c,l])))),why:'The minus in front of the bracket changes the sign of every term inside, not only the first one.'},
   {value:expand(terms(first.concat(inner))),why:'The bracket is being taken away. Change the sign of each term inside when you remove the bracket.'}],
  hint:'Remove the bracket first. The minus in front changes the sign of every term inside.',
  steps:[
   {math,note:'The whole bracket is being subtracted.'},
   {math:terms(first.concat(inner.map(([c,l])=>[-c,l]))),note:'Remove the bracket and change the sign of every term inside it.'},
   {math:answer,note:'Collect the like terms.'}],
  verify:{op:'identity',a:claim(math),b:'ANSWER'}
 };
}
const complete=(list)=>K.poly(terms(list)).size===new Set(list.map(t=>t[1])).size;

K.define({
 id:'like-terms',
 title:'Collect like terms',
 strand:'Algebra',
 lesson:'01-01',
 blurb:'Add or subtract terms that have exactly the same letter part.',
 levels:[
  {name:'One letter',make(rng){
   for(;;){
    const L=rng.pick(LETTERS),v=rng.int(0,2);let list;
    if(v===0){
     const a=rng.int(2,9),b=rng.int(1,9),c=rng.int(1,8);
     if(a<=c)continue;
     list=rng.chance(.5)?[[a,L],[b,L],[-c,L]]:[[a,L],[-c,L],[b,L]];
    }else if(v===1){
     list=[[rng.int(2,9),L],[rng.int(1,9),''],[rng.int(1,9),L],[rng.int(1,9),'']];
    }else{
     const a=rng.int(3,9),b=rng.int(3,9),c=rng.int(1,8),d=rng.int(1,8);
     if(rng.chance(.5)){if(a<=c)continue;list=[[a,L],[b,''],[-c,L],[d,'']]}
     else{if(b<=d)continue;list=[[a,L],[b,''],[c,L],[-d,'']]}
    }
    if(!complete(list))continue;
    return collect(list,v===0?`All three terms are \`${L}\` terms. Add or subtract the numbers in front.`:`Collect the \`${L}\` terms together and the plain numbers together.`);
   }
  }},
  {name:'Two letters and negatives',make(rng){
   for(;;){
    const v=rng.int(0,2),[A,B]=rng.pick(PAIRS);let list;
    const n=()=>rng.nonzero(-9,9);
    if(v===0)list=[[rng.int(1,9),A],[n(),B],[n(),A],[n(),B]];
    else if(v===1)list=[[rng.int(1,9),A],[n(),''],[n(),A],[n(),'']];
    else list=[[rng.int(1,9),A],[n(),B],[n(),''],[n(),A],[n(),B]];
    if(!complete(list)||list.every(t=>t[0]>0))continue;
    return collect(list,'Group the terms with the same letter part. Each term takes the sign in front of it.');
   }
  }},
  {name:'Squares and brackets',make(rng){
   for(;;){
    const v=rng.int(0,3),L=rng.pick(['x','y','a','n']),S=L+'^2';
    const n=()=>rng.nonzero(-9,9);
    if(v===0){
     const list=rng.chance(.5)?[[rng.int(1,9),S],[n(),L],[n(),S],[n(),L]]:[[rng.int(1,9),S],[n(),L],[n(),''],[n(),S],[n(),L]];
     if(!complete(list)||list.every(t=>t[0]>0))continue;
     return collect(list,`\`${S}\` terms and \`${L}\` terms are not like terms. Collect each kind on its own.`);
    }
    if(v===1){
     const [A,B]=rng.pick(PAIRS),list=[[rng.int(1,9),A+B],[n(),A],[n(),A+B],[n(),B],[n(),A]];
     if(!complete(list)||list.every(t=>t[0]>0))continue;
     return collect(list,`\`${A+B}\` terms are a kind of their own. They do not combine with \`${A}\` terms or \`${B}\` terms.`);
    }
    if(v===2){
     const first=[[rng.int(2,9),L],[n(),'']],inner=[[rng.int(1,8),L],[-rng.int(1,9),'']];
     if(K.poly(`${terms(first)} - (${terms(inner)})`).size!==2)continue;
     return minusBracket(first,inner);
    }
    const first=[[rng.int(2,9),S],[n(),L],[n(),'']],inner=[[rng.int(1,8),S],[-rng.int(1,9),L],[n(),'']];
    if(K.poly(`${terms(first)} - (${terms(inner)})`).size!==3)continue;
    return minusBracket(first,inner);
   }
  }}
 ]
});

/* ---------- Multiply out one bracket ---------- */
function oneBracket(n,ol,inner){
 const out=ol?cf(n)+ol:n===-1?'-':String(n),outB=n<0?`(${ol?cf(n)+ol:n})`:out;
 const math=`${out}(${terms(inner)})`,answer=expand(math),last=inner[inner.length-1];
 const product=t=>`${outB}(${terms([t])})`,lastProduct=expand(product(last));
 const firstOnly=`${product(inner[0])}`;
 const mistakes=[
  {value:expand(`${firstOnly} + (${terms(inner.slice(1))})`),why:ol||Math.abs(n)!==1?`\`${out}\` multiplies every term inside the bracket, not only the first one.`:'The minus outside changes the sign of every term inside the bracket, not only the first one.'},
  {value:expand(`${inner.slice(0,-1).map(product).join(' + ')} - ${product(last)}`),why:`Check the sign of the last term: \`${product(last)} = ${lastProduct}\`.`}];
 if(!ol&&n>0&&!last[1]&&inner.length===2)mistakes.push({value:terms([[n*inner[0][0],inner[0][1]],[n+last[0],'']]),why:`Multiply, do not add: \`${product(last)} = ${lastProduct}\`.`});
 return {
  prompt:'Multiply out the bracket.',math,
  answer:{type:'expr',value:answer},mistakes:unique(mistakes),
  hint:n<0?'Multiply every term inside by the negative outside. Every sign inside changes.':'Multiply each term inside the bracket by what is outside.',
  steps:[
   {math,note:ol||Math.abs(n)!==1?`\`${out}\` multiplies every term inside the bracket.`:'The minus outside stands for `-1`. It multiplies every term inside.'},
   {math:inner.map(product).join(' + '),note:'Write out each product.'},
   {math:answer,note:(ol&&inner.some(t=>t[1]===ol)?`\`${ol}\` times \`${ol}\` is \`${ol}^2\`. `:'')+(n>0?'Work out each product and keep its sign.':inner.some(t=>t[0]<0)?'Work out each product. A negative times a negative gives a positive.':'Work out each product. A negative times a positive gives a negative.')}],
  verify:{op:'identity',a:claim(math),b:'ANSWER'}
 };
}
function twoSingles(one,two){
 const outside=(n,ol)=>ol?cf(Math.abs(n))+ol:Math.abs(n)===1?'':String(Math.abs(n));
 const math=`${outside(one.n,one.ol)}(${terms(one.inner)}) ${two.n<0?'-':'+'} ${outside(two.n,two.ol)}(${terms(two.inner)})`;
 const part=(p,inner)=>`(${p.n})${p.ol}(${terms(inner)})`;
 const e1=expand(part(one,one.inner)),e2=expand(part(two,two.inner)),answer=expand(math);
 const lastTwo=two.inner.slice(1),shown=`${two.n<0?'- ':''}${outside(two.n,two.ol)||'1'}`;
 const mistakes=[];
 if(two.n<0)mistakes.push({value:expand(`${e1} + ${part(two,[two.inner[0]])} - ${part(two,lastTwo)}`),why:`The minus in front of the second bracket reaches both of its terms: \`${part(two,lastTwo)} = ${expand(part(two,lastTwo))}\`.`});
 else mistakes.push({value:expand(`${e1} + ${part(two,[two.inner[0]])} - ${part(two,lastTwo)}`),why:`Check the sign of the last product: \`${part(two,lastTwo)} = ${expand(part(two,lastTwo))}\`.`});
 mistakes.push({value:expand(`${part(one,[one.inner[0]])} + (${terms(one.inner.slice(1))}) + ${part(two,[two.inner[0]])} + (${terms(lastTwo)})`),why:'What is outside a bracket multiplies both terms inside it, not only the first.'});
 return {
  prompt:'Multiply out the brackets and simplify.',math,
  answer:{type:'expr',value:answer},mistakes,
  hint:two.n<0?'Multiply out each bracket on its own. The minus goes with the second bracket, so it changes both signs there.':'Multiply out each bracket on its own. Then collect the like terms.',
  steps:[
   {math,note:'Multiply out each bracket on its own.'},
   {math:join(e1,e2),note:two.n<0?`The second bracket is multiplied by \`${two.n===-1&&!two.ol?'-1':'-'+outside(two.n,two.ol)}\`, so both of its signs change.`:'What is outside each bracket multiplies both terms inside it.'},
   {math:answer,note:'Collect the like terms.'}],
  verify:{op:'identity',a:claim(math),b:'ANSWER'}
 };
}

K.define({
 id:'expand-one-bracket',
 title:'Multiply out one bracket',
 strand:'Algebra',
 lesson:'01-02',
 blurb:'What is outside the bracket multiplies every term inside it.',
 levels:[
  {name:'A number outside',make(rng){
   const L=rng.pick(LETTERS),v=rng.int(0,2);
   if(v===0)return oneBracket(rng.int(2,9),'',[[1,L],[rng.nonzero(-9,9),'']]);
   if(v===1)return oneBracket(rng.int(2,7),'',[[rng.int(2,6),L],[rng.nonzero(-9,9),'']]);
   const [A,B]=rng.pick(PAIRS);
   return oneBracket(rng.int(2,6),'',[[rng.int(1,5),A],[rng.nonzero(-6,6),B]]);
  }},
  {name:'Negatives and letters outside',make(rng){
   const L=rng.pick(LETTERS),v=rng.int(0,2),c=rng.int(1,9)*(rng.chance(.65)?-1:1);
   if(v===0)return oneBracket(-rng.int(2,9),'',[[rng.int(1,5),L],[c,'']]);
   if(v===1)return rng.chance(.5)?oneBracket(-1,'',[[rng.int(1,6),L],[c,'']]):oneBracket(-1,'',[[1,L+'^2'],[rng.nonzero(-6,6),L],[c,'']]);
   const n=rng.int(1,5)*(c>0||rng.chance(.5)?-1:1);
   return oneBracket(n,L,[[rng.int(1,5),L],[c,'']]);
  }},
  {name:'Two brackets, then simplify',make(rng){
   for(;;){
    const L=rng.pick(['x','y','a','n']),v=rng.int(0,3),b=rng.nonzero(-7,7),d=rng.nonzero(-7,7);let q;
    if(v===0)q=twoSingles({n:rng.int(2,7),ol:'',inner:[[1,L],[b,'']]},{n:-rng.int(2,6),ol:'',inner:[[1,L],[d,'']]});
    else if(v===1)q=twoSingles({n:rng.int(2,5),ol:'',inner:[[rng.int(1,4),L],[b,'']]},{n:rng.int(2,5)*rng.sign(),ol:'',inner:[[rng.int(1,4),L],[d,'']]});
    else if(v===2)q=twoSingles({n:rng.int(1,3),ol:L,inner:[[1,L],[b,'']]},{n:-rng.int(2,6),ol:'',inner:[[1,L],[d,'']]});
    else q=twoSingles({n:rng.int(2,7),ol:'',inner:[[rng.int(1,3),L],[b,'']]},{n:-1,ol:'',inner:[[1,L],[-rng.int(1,9),'']]});
    if(K.poly(q.answer.value).size<2||clash(q))continue;
    return q;
   }
  }}
 ]
});

/* ---------- Multiply two brackets ---------- */
function twoBinomials(L,p,q,r,s){
 const first=linear(p,L,q),second=linear(r,L,s),math=`(${first})(${second})`,answer=expand(math),S=L+'^2';
 const split=`${cf(p)}${L}(${second}) ${q<0?'-':'+'} ${Math.abs(q)===1?'':Math.abs(q)}(${second})`;
 const four=join(expand(`${cf(p)}${L}(${second})`),expand(`(${q})(${second})`)),middle=p*s+q*r;
 const mistakes=[];
 if(middle!==0)mistakes.push({value:terms([[p*r,S],[q*s,'']]),why:'You multiplied the first terms and the last terms only. Each term in the first bracket multiplies each term in the second, which gives four products.'});
 if(q+s!==q*s)mistakes.push({value:terms([[p*r,S],[middle,L],[q+s,'']]),why:`The last terms are multiplied, not added: \`(${q})(${s}) = ${q*s}\`.`});
 if(q<0||s<0){
  mistakes.push({value:terms([[p*r,S],[middle,L],[-q*s,'']]),why:`Check the sign of the last term: \`(${q})(${s}) = ${q*s}\`.`});
  if(middle!==0)mistakes.push({value:terms([[p*r,S],[-middle,L],[q*s,'']]),why:`Check the signs of the two middle terms before you add them: \`${terms([[p*s,L],[q*r,L]])}\`.`});
 }
 return {
  prompt:'Multiply out the brackets and simplify.',math,
  answer:{type:'expr',value:answer},mistakes,
  hint:'Multiply each term in the first bracket by each term in the second. Then collect the like terms.',
  steps:[
   {math,note:'Each term in the first bracket multiplies each term in the second.'},
   {math:split,note:'Split the first bracket into its two terms. Each one multiplies the whole second bracket.'},
   {math:four,note:'Multiply out each part. Watch the signs.'},
   ...(four===answer?[]:[{math:answer,note:middle===0?`The two \`${L}\` terms cancel.`:`Collect the two \`${L}\` terms.`}])],
  verify:{op:'identity',a:claim(math),b:'ANSWER'}
 };
}

K.define({
 id:'expand-two-brackets',
 title:'Multiply two brackets',
 strand:'Algebra',
 lesson:'01-02',
 blurb:'Each term in the first bracket multiplies each term in the second.',
 levels:[
  {name:'Simple brackets',make(rng){
   for(;;){
    const L=rng.pick(LETTERS),a=rng.int(1,9),b=rng.int(1,9);
    if(a===b)continue;
    if(rng.chance(.3))return rng.chance(.5)?twoBinomials(L,1,a,1,-b):twoBinomials(L,1,-a,1,b);
    return twoBinomials(L,1,a,1,b);
   }
  }},
  {name:'Coefficients and negatives',make(rng){
   for(;;){
    const L=rng.pick(['x','y','a','n']),v=rng.int(0,2),b=rng.nonzero(-7,7),d=rng.nonzero(-7,7);
    let q;
    if(v===0){if(b>0&&d>0||b===-d)continue;q=twoBinomials(L,rng.int(2,5),b,1,d)}
    else if(v===1){const p=rng.int(2,4),r=rng.int(2,3);if(b>0&&d>0||p*d+b*r===0||K.gcd(p,b)>1||K.gcd(r,d)>1)continue;q=twoBinomials(L,p,b,r,d)}
    else{if(b===d)continue;q=twoBinomials(L,1,-Math.abs(b),1,-Math.abs(d))}
    if(clash(q))continue;
    return q;
   }
  }},
  {name:'Squares and three terms',make(rng){
   const L=rng.pick(['x','y','a','n']),S=L+'^2',v=rng.int(0,2);
   if(v===0){
    const a=rng.pick([1,1,2,3,4,5]),b=rng.nonzero(-9,9),inside=linear(a,L,b),math=`(${inside})^2`,answer=expand(math);
    const mistakes=[
     {value:terms([[a*a,S],[b*b,'']]),why:`Squaring a bracket means multiplying it by itself, so there is a middle term as well: \`(${inside})(${inside})\`.`},
     {value:terms([[a*a,S],[a*b,L],[b*b,'']]),why:`There are two middle products, \`${terms([[a*b,L]])}\` and \`${terms([[a*b,L]])}\`. Add them both.`}];
    if(a>1)mistakes.push({value:terms([[a,S],[2*a*b,L],[b*b,'']]),why:`Square the whole first term: \`(${a}${L})^2 = ${a*a}${S}\`.`});
    if(b<0)mistakes.push({value:terms([[a*a,S],[2*a*b,L],[-b*b,'']]),why:`A negative times a negative is positive: \`(${b})(${b}) = ${b*b}\`.`});
    return {
     prompt:'Multiply out and simplify.',math,
     answer:{type:'expr',value:answer},mistakes,
     hint:'Write the bracket twice and multiply the two brackets.',
     steps:[
      {math,note:'Squaring means multiplying the bracket by itself.'},
      {math:`(${inside})(${inside})`,note:'Write the bracket twice.'},
      {math:join(expand(`${cf(a)}${L}(${inside})`),expand(`(${b})(${inside})`)),note:'Each term in the first bracket multiplies each term in the second.'},
      {math:answer,note:`Collect the two \`${L}\` terms.`}],
     verify:{op:'identity',a:claim(math),b:'ANSWER'}
    };
   }
   if(v===1){
    const a=rng.int(1,4),b=rng.int(1,9);
    return twoBinomials(L,a,b,a,-b);
   }
   const p=rng.pick([1,1,2]),a=rng.nonzero(-5,5),b=rng.nonzero(-6,6),c=rng.nonzero(-7,7);
   const first=linear(p,L,a),tri=quadratic(1,b,c,L),math=`(${first})(${tri})`,answer=expand(math);
   const partA=expand(`${cf(p)}${L}(${tri})`),partB=expand(`(${a})(${tri})`);
   return {
    prompt:'Multiply out the brackets and simplify.',math,
    answer:{type:'expr',value:answer},
    mistakes:[
     {value:expand(`${partA} + (${a*c})`),why:`The \`${a}\` multiplies all three terms of the second bracket, not only the last one.`},
     {value:expand(`${partA} - (${partB})`),why:`Check the signs when you multiply by \`${a}\`: \`(${a})(${tri}) = ${partB}\`.`}],
    hint:'Each term in the first bracket multiplies all three terms in the second. That gives six products.',
    steps:[
     {math,note:'Each term in the first bracket multiplies all three terms in the second.'},
     {math:`${cf(p)}${L}(${tri}) ${a<0?'-':'+'} ${Math.abs(a)===1?'':Math.abs(a)}(${tri})`,note:'Split the first bracket into its two terms.'},
     {math:join(partA,partB),note:'Multiply out each part. That gives six terms.'},
     {math:answer,note:`Collect the \`${S}\` terms together and the \`${L}\` terms together.`}],
    verify:{op:'identity',a:claim(math),b:'ANSWER'}
   };
  }}
 ]
});

/* ---------- Substitution ---------- */
const retry=draw=>{for(;;){const q=draw();if(q)return q}};
/* A term is {c, f:[[letter, power], ...]}; the expression is the sum of the terms. */
function substitute(list,values,{prompt,label,lhs,unit}={}){
 const letters=t=>(t.f||[]).map(([l,p])=>p>1?`${l}^${p}`:l).join('');
 const expression=terms(list.map(t=>[t.c,letters(t)]));
 const power=(l,p)=>values[l]**p,inner=t=>(t.f||[]).reduce((v,[l,p])=>v*power(l,p),1),value=t=>t.c*inner(t);
 const front=t=>(t.f||[]).length&&Math.abs(t.c)===1?'':String(Math.abs(t.c));
 const line=body=>list.map((t,i)=>(i===0?(t.c<0?'-':''):(t.c<0?' - ':' + '))+body(t)).join('');
 const lone=t=>!front(t)&&(t.f||[]).length===1;
 const subbed=t=>lone(t)&&t.f[0][1]===1?K.bracket(values[t.f[0][0]]):front(t)+(t.f||[]).map(([l,p])=>`(${values[l]})`+(p>1?`^${p}`:'')).join('');
 const powered=t=>lone(t)?K.bracket(power(...t.f[0])):front(t)+(t.f||[]).map(([l,p])=>`(${power(l,p)})`).join('');
 const total=list.reduce((sum,t)=>sum+value(t),0),exact=K.evalAt(expression,values);
 if(exact.d!==1||exact.n!==total)throw new Error('substitution does not agree');
 const s1=line(subbed),s2=line(powered),s3=terms(list.map(t=>[value(t),'']));
 const powers=[];
 for(const t of list)for(const [l,p]of t.f||[])if(p>1&&!powers.some(o=>o[0]===l&&o[1]===p))powers.push([l,p]);
 const withLhs=text=>lhs?`${lhs} = ${text}`:text;
 const names=Object.keys(values),given=names.map(l=>`\`${l} = ${values[l]}\``),when=given.length>1?given.slice(0,-1).join(', ')+' and '+given[given.length-1]:given[0];
 const mistakes=[];
 const trap=list.filter(t=>(t.f||[]).some(([l,p])=>p%2===0&&values[l]<0));
 if(trap.length){const [l]=trap[0].f.find(([l,p])=>p%2===0&&values[l]<0),v=values[l];
  mistakes.push({value:String(total-2*trap.reduce((sum,t)=>sum+value(t),0)),why:`\`(${v})^2\` means \`(${v})(${v})\`, which is ${v*v}, not ${-v*v}. A negative number squared is positive. Any sign in front of the term is applied after that.`})}
 const minusNeg=list.find((t,i)=>i>0&&t.c<0&&inner(t)<0);
 if(minusNeg)mistakes.push({value:String(total-2*value(minusNeg)),why:`Subtracting a negative number adds: \`- ${subbed(minusNeg)}\` is \`+ ${value(minusNeg)}\`.`});
 const product=list.find(t=>t.c>0&&inner(t)<0&&(t.f||[]).every(([,p])=>p===1)&&(t.c>1||t.f.length>1));
 if(product)mistakes.push({value:String(total-2*value(product)),why:`Check the sign: \`${subbed(product)} = ${value(product)}\`. One negative number in a product makes the answer negative.`});
 const single=list.find(t=>t.c>1&&(t.f||[]).length===1&&t.f[0][1]===1&&values[t.f[0][0]]>1);
 if(single){const l=single.f[0][0];mistakes.push({value:String(total-value(single)+single.c+values[l]),why:`\`${single.c}${l}\` means ${single.c} times \`${l}\`, so work out \`${single.c}(${values[l]}) = ${single.c*values[l]}\`.`});
  if(single.c<10&&values[l]<10)mistakes.push({value:String(total-value(single)+single.c*10+values[l]),why:`\`${single.c}${l}\` means ${single.c} times \`${l}\`. It is not the digits ${single.c} and ${values[l]} side by side: \`${single.c}(${values[l]}) = ${single.c*values[l]}\`.`})}
 const doubled=list.find(t=>(t.f||[]).length===1&&t.f[0][1]===2);
 if(doubled){const l=doubled.f[0][0],v=values[l];mistakes.push({value:String(total-value(doubled)+doubled.c*2*v),why:`\`${l}^2\` means \`${l}\` times \`${l}\`, not 2 times \`${l}\`: \`(${v})^2 = ${v*v}\`.`});
  if(doubled.c>1&&v>0)mistakes.push({value:String(total-value(doubled)+doubled.c*doubled.c*v*v),why:`Only \`${l}\` is squared, not the ${doubled.c}. Work out \`(${v})^2 = ${v*v}\` first, then multiply by ${doubled.c}.`})}
 const pair=list.find(t=>(t.f||[]).length===2&&t.f.every(([l,p])=>p===1&&values[l]>0));
 if(pair){const [[l1],[l2]]=pair.f;mistakes.push({value:String(total-value(pair)+pair.c*(values[l1]+values[l2])),why:`\`${l1}${l2}\` means \`${l1}\` times \`${l2}\`: \`${subbed(pair)} = ${value(pair)}\`.`})}
 /* Two different slips that land on the same number would get the wrong explanation: draw again. */
 if(unique(mistakes).length!==mistakes.length||mistakes.some(m=>m.value===String(total)))return null;
 const steps=[{math:withLhs(s1),note:'Write each value in place of its letter. Brackets show a multiplication and keep a negative sign with its number.'}];
 if(s2!==s1)steps.push({math:withLhs(s2),note:`Powers first: ${[...new Set(powers.map(([l,p])=>`\`(${values[l]})^${p} = ${power(l,p)}\``))].join(' and ')}.`});
 if(list.length>1&&withLhs(s3)!==steps[steps.length-1].math)steps.push({math:withLhs(s3),note:'Next do each multiplication. Watch the signs.'});
 steps.push({math:withLhs(String(total)),note:list.length>1?'Add and subtract from left to right.':'Multiply to finish.'});
 return {
  prompt:prompt||`Find the value of the expression when ${when}.`,math:lhs?`${lhs} = ${expression}`:expression,
  answer:{type:'number',value:String(total),...(label?{label}:{}),...(unit?{unit}:{})},mistakes:unique(mistakes),
  hint:Object.values(values).some(v=>v<0)?'Put each value in brackets where its letter was. Brackets keep a negative sign attached to its number.':'Replace each letter with its value. A number next to a letter means multiply.',
  steps,
  verify:{op:'value',expr:claim(expression),subs:Object.fromEntries(names.map(l=>[l,String(values[l])])),equals:'ANSWER'}
 };
}

K.define({
 id:'substitution',
 title:'Substitute into expressions',
 strand:'Algebra',
 lesson:'01-04',
 blurb:'Replace each letter with its value, in brackets, then work it out in the right order.',
 levels:[
  {name:'Positive values',make(rng){return retry(()=>{
   const L=rng.pick(['x','y','a','n','p']),v=rng.int(0,3),[A,B]=rng.pick(PAIRS);
   if(v===0)return substitute([{c:rng.int(2,9),f:[[L,1]]},{c:rng.nonzero(-9,9)}],{[L]:rng.int(2,9)});
   if(v===1){const a=rng.int(2,6),b=rng.int(2,6),x=rng.int(2,9),y=rng.int(1,6);return substitute([{c:a,f:[[A,1]]},{c:rng.chance(.5)&&a*x>b*y?-b:b,f:[[B,1]]}],{[A]:x,[B]:y})}
   if(v===2)return rng.chance(.5)?substitute([{c:1,f:[[L,2]]},{c:rng.int(2,6),f:[[L,1]]}],{[L]:rng.int(3,7)}):substitute([{c:rng.int(2,5),f:[[L,2]]},{c:rng.int(1,9)}],{[L]:rng.int(3,5)});
   return substitute([{c:rng.int(1,4),f:[[A,1],[B,1]]},{c:rng.nonzero(-9,9)}],{[A]:rng.int(2,6),[B]:rng.int(2,6)});
  })}},
  {name:'Negative values',make(rng){return retry(()=>{
   const L=rng.pick(['x','y','a','n','p']),v=rng.int(0,3),[A,B]=rng.pick(PAIRS),neg=()=>-rng.int(2,6);
   if(v===0)return rng.chance(.5)?substitute([{c:rng.int(2,9),f:[[L,1]]},{c:rng.nonzero(-9,9)}],{[L]:neg()}):substitute([{c:rng.int(3,12)},{c:-rng.int(2,6),f:[[L,1]]}],{[L]:neg()});
   if(v===1)return substitute([{c:1,f:[[L,2]]},{c:rng.int(2,6)*rng.sign(),f:[[L,1]]},{c:rng.nonzero(-9,9)}],{[L]:neg()});
   if(v===2)return substitute([{c:rng.int(2,6),f:[[A,1]]},{c:-rng.int(2,6),f:[[B,1]]}],rng.chance(.5)?{[A]:rng.int(2,7),[B]:neg()}:{[A]:neg(),[B]:neg()});
   return substitute([{c:rng.int(5,30)},{c:-1,f:[[L,2]]}],{[L]:neg()});
  })}},
  {name:'Exam style',make(rng){return retry(()=>{
   const L=rng.pick(['x','y','a','n']),v=rng.int(0,3),[A,B]=rng.pick(PAIRS),neg=()=>-rng.int(2,5);
   if(v===0)return substitute([{c:rng.pick([2,3,4,-1,-2,-3]),f:[[L,2]]},{c:rng.nonzero(-7,7),f:[[L,1]]},{c:rng.nonzero(-9,9)}],{[L]:neg()});
   if(v===1){const x=rng.nonzero(-5,5,[1,-1]),y=x>0?neg():rng.nonzero(-5,5,[1,-1]);return substitute([{c:rng.pick([1,2,3]),f:[[A,2]]},{c:rng.nonzero(-4,4),f:[[A,1],[B,1]]},{c:rng.pick([1,-1,2]),f:[[B,2]]}],{[A]:x,[B]:y})}
   if(v===2)return substitute([{c:1,f:[[L,3]]},{c:rng.nonzero(-5,5),f:[[L,2]]},{c:rng.nonzero(-9,9)}],{[L]:-rng.int(2,4)});
   if(rng.chance(.5)){
    const u=rng.int(5,30),a=-rng.int(2,6),t=rng.int(2,6);
    if(u+a*t<=0)return null;
    return substitute([{c:1,f:[['u',1]]},{c:1,f:[['a',1],['t',1]]}],{u,a,t},{prompt:`The formula \`v = u + at\` gives the final speed of a moving object. Find \`v\` when \`u = ${u}\`, \`a = ${a}\` and \`t = ${t}\`.`,label:'v =',lhs:'v'});
   }
   const t=rng.int(2,4),u=rng.pick([15,20,25,30,35,40].filter(n=>n>5*t));
   return substitute([{c:u,f:[['t',1]]},{c:-5,f:[['t',2]]}],{t},{prompt:`A ball is launched straight up. Its height in metres after \`t\` seconds is \`h = ${u}t - 5t^2\`. Find the height when \`t = ${t}\`.`,label:'h =',lhs:'h',unit:'m'});
  })}}
 ]
});

/* ---------- Take out the highest common factor ---------- */
function commonFactor(g,gl,inner){
 const F=gl?cf(g)+gl:String(g),part=t=>expand(`${F}(${terms([t])})`);
 const expression=inner.map(part).reduce(join),answer=`${F}(${terms(inner)})`,last=inner[inner.length-1];
 const numbers=inner.map(t=>Math.abs(g*t[0]));
 const mistakes=[
  {value:`${F}(${terms([inner[0]])}) + ${F}(${inner.slice(1).map(part).reduce(join)})`,why:'Divide every term by the common factor, not only the first one.'},
  {value:`${F}(${terms(inner.map((t,i)=>i===inner.length-1?[-t[0],t[1]]:t))})`,why:`Check the sign inside the bracket. Multiply your answer out: the last term should be \`${part(last)}\`.`}];
 const unit=inner.find(t=>Math.abs(t[0])===1&&!t[1]);
 if(unit)mistakes.unshift({value:`${F}(${terms(inner.filter(t=>t!==unit))})`,why:unit[0]<0?`When a whole term is taken out, -1 is left in its place: \`-${F} = ${F}(-1)\`.`:`When a whole term is taken out, a 1 is left in its place: \`${F} = ${F}(1)\`.`});
 return {
  prompt:'Factorise fully.',math:expression,
  answer:{type:'expr',value:answer,form:'factorised'},mistakes:unique(mistakes),
  hint:!gl?'Find the biggest number that divides every term.':g===1?'Find the letter that appears in every term.':'Find the biggest number that divides every term, and the letters that appear in every term.',
  steps:[
   {math:expression,note:!gl?(new Set(numbers).size===1?`Every term can be divided by ${g}.`:`The biggest number that divides ${numbers.slice(0,-1).join(', ')} and ${numbers[numbers.length-1]} is ${g}.`):g===1?`Every term contains \`${gl}\`, so \`${gl}\` is the common factor.`:`The biggest number that divides every term is ${g}, and every term contains \`${gl}\`. The highest common factor is \`${F}\`.`},
   {math:inner.map(t=>`${F}(${terms([t])})`).join(' + '),note:'Write each term as the common factor times what is left.'},
   {math:answer,note:'Put the common factor outside one bracket.'},
   {math:`${answer} = ${expression}`,note:'Check by multiplying out. You should get the expression you started with.'}],
  verify:{op:'factorised',expr:claim(expression),answer:'ANSWER'}
 };
}
const coprime=(...n)=>n.reduce((a,b)=>K.gcd(a,b))===1;

K.define({
 id:'common-factor',
 title:'Take out a common factor',
 strand:'Algebra',
 lesson:'02-01',
 blurb:'Find the highest common factor of the terms and put it outside a bracket.',
 levels:[
  {name:'A number factor',make(rng){
   for(;;){
    const L=rng.pick(LETTERS),[A,B]=rng.pick(PAIRS),v=rng.int(0,2),g=rng.int(2,9),p=rng.int(1,5),q=rng.nonzero(-7,7),r=rng.nonzero(-5,5);
    if(v===0){if(!coprime(p,q))continue;return commonFactor(g,'',[[p,L],[q,'']])}
    if(v===1){if(!coprime(p,q))continue;return commonFactor(g,'',[[p,A],[q,B]])}
    if(!coprime(p,q,r)||g>6)continue;
    return commonFactor(g,'',[[p,A],[q,B],[r,'']]);
   }
  }},
  {name:'A letter factor',make(rng){
   for(;;){
    const L=rng.pick(LETTERS),[A,B,C]=rng.pick([['a','b','c'],['x','y','z'],['p','q','r']]),v=rng.int(0,2),p=rng.int(1,5),q=rng.nonzero(-7,7);
    if(!coprime(p,q))continue;
    if(v===0)return commonFactor(1,L,[[p,L],[q,'']]);
    if(v===1)return commonFactor(1,A,[[p,B],[q,C]]);
    return commonFactor(1,L+'^2',[[p,L],[q,'']]);
   }
  }},
  {name:'Numbers and letters',make(rng){
   for(;;){
    const L=rng.pick(['x','y','a','n']),[A,B]=rng.pick(PAIRS),v=rng.int(0,3),g=rng.int(2,6),p=rng.int(1,5),q=rng.nonzero(-7,7),r=rng.nonzero(-5,5);
    if(!coprime(p,q))continue;
    if(v===0)return commonFactor(g,L,[[p,L],[q,'']]);
    if(v===1)return rng.chance(.5)?commonFactor(g,A,[[p,A],[q,B]]):commonFactor(g,A+B,[[p,A],[q,B]]);
    if(v===2)return commonFactor(g,A,[[p,A],[q,B],[r,'']]);
    return commonFactor(g,L+'^2',[[p,L],[q,'']]);
   }
  }}
 ]
});

/* ---------- Factorise quadratics ---------- */
const bk=K.bracket;
const pairsOf=n=>{const out=[];for(let u=1;u*u<=Math.abs(n);u++)if(n%u===0)out.push([u,Math.abs(n)/u]);return out};
/* Another pair with the same product and the same pattern of signs but a different sum. */
function otherPair(p,q){
 for(const [u,v]of pairsOf(p*q)){
  const pair=p*q>0?(p<0?[-u,-v]:[u,v]):(p+q>0?[-u,v]:[u,-v]);
  if(pair[0]+pair[1]!==p+q)return pair;
 }
 return null;
}
const signNote=(p,q)=>p*q<0?'The product is negative, so one number is positive and the other is negative.':p<0?'The product is positive and the sum is negative, so both numbers are negative.':'Both numbers are positive.';
function monic(L,p,q){
 const expression=quadratic(1,p+q,p*q,L),B=n=>`(${linear(1,L,n)})`,answer=p===q?`${B(p)}^2`:B(p)+B(q);
 const wrong=m=>`Multiply out to check: your brackets give \`${expand(m)}\`.`;
 const mistakes=[{value:B(-p)+B(-q),why:wrong(B(-p)+B(-q))+' The signs of the numbers need to change.'}];
 const other=otherPair(p,q);
 if(other)mistakes.push({value:B(other[0])+B(other[1]),why:`${other[0]} and ${other[1]} multiply to ${p*q}, but they add to ${other[0]+other[1]}, not ${p+q}.`});
 if(p*q<0)mistakes.push({value:B(Math.abs(p))+B(Math.abs(q)),why:wrong(B(Math.abs(p))+B(Math.abs(q)))+' The last term is negative, so the two numbers have different signs.'});
 else mistakes.push({value:B(p)+B(-q),why:wrong(B(p)+B(-q))+' The last term is positive, so the two numbers have the same sign.'});
 return {
  prompt:'Factorise.',math:expression,
  answer:{type:'expr',value:answer,form:'factorised'},mistakes:unique(mistakes),
  hint:`Find two numbers that multiply to ${p*q} and add to ${p+q}.`,
  steps:[
   {math:expression,note:`Look for two numbers that multiply to ${p*q} and add to ${p+q}. ${signNote(p,q)}`},
   {math:`${bk(p)} * ${bk(q)} = ${p*q} and ${bk(p)} + ${bk(q)} = ${p+q}`,note:`The numbers are ${p} and ${q}.`},
   {math:p===q?`${B(p)}${B(q)} = ${answer}`:answer,note:p===q?`Put one number in each bracket with \`${L}\`. The two brackets are the same, so the answer is a square.`:`Put one number in each bracket with \`${L}\`.`},
   {math:`${p===q?B(p)+B(q):answer} = ${terms([[1,L+'^2'],[q,L],[p,L],[p*q,'']])}`,note:'Check by multiplying out. The two middle terms collect to give the middle term of the question.'}],
  verify:{op:'factorised',expr:claim(expression),answer:'ANSWER'}
 };
}
function nonMonic(L,a,p,c,q){
 const S=L+'^2',A=a*c,m=a*q,n=p*c,B=m+n,C=p*q,expression=quadratic(A,B,C,L);
 const second=linear(c,L,q),answer=`(${linear(a,L,p)})(${second})`;
 const wrong=v=>`Multiply out to check: your brackets give \`${expand(v)}\`.`;
 const mistakes=[{value:`(${linear(a,L,-p)})(${linear(c,L,-q)})`,why:wrong(`(${linear(a,L,-p)})(${linear(c,L,-q)})`)+' The signs of the numbers need to change.'}];
 if(a!==c)mistakes.push({value:`(${linear(a,L,q)})(${linear(c,L,p)})`,why:wrong(`(${linear(a,L,q)})(${linear(c,L,p)})`)+' Try the two numbers the other way round.'});
 mistakes.push({value:`(${linear(1,L,p)})(${linear(1,L,q)})`,why:`The first terms of the brackets must multiply to \`${A}${S}\`. Multiply out to check your answer.`});
 return {
  prompt:'Factorise.',math:expression,
  answer:{type:'expr',value:answer,form:'factorised'},mistakes:unique(mistakes),
  hint:`Multiply ${A} by ${C}. Find two numbers with that product that add to ${B}, and use them to split the middle term.`,
  steps:[
   {math:expression,note:`Multiply the first number by the last: \`${A} * ${bk(C)} = ${A*C}\`. Look for two numbers that multiply to ${A*C} and add to ${B}.`},
   {math:terms([[A,S],[m,L],[n,L],[C,'']]),note:`The numbers are ${m} and ${n}. Use them to split the middle term.`},
   {math:`${cf(a)}${L}(${second}) ${p<0?'-':'+'} ${Math.abs(p)===1?'':Math.abs(p)}(${second})`,note:'Factorise the first two terms, then the last two. The same bracket appears twice.'},
   {math:answer,note:'Take out the common bracket.'},
   {math:`${answer} = ${expression}`,note:'Check by multiplying out.'}],
  verify:{op:'factorised',expr:claim(expression),answer:'ANSWER'}
 };
}

K.define({
 id:'factorise-quadratics',
 title:'Factorise a quadratic',
 strand:'Algebra',
 lesson:'02-04',
 blurb:'Find two numbers that multiply to the last term and add to the middle one.',
 levels:[
  {name:'All positive',make(rng){
   for(;;){
    const L=rng.pick(['x','x','y','a','n','t']),p=rng.int(1,9),q=rng.int(1,9),v=rng.int(0,9);
    if(p===q&&v!==0)continue;
    if(v===0)return monic(L,p,p);
    if(p>q)continue;
    if(v>3)return monic(L,p,q);
    const other=otherPair(p,q),product=p*q,sum=p+q;
    if(!other)continue;
    return {
     prompt:`Two whole numbers multiply to give ${product} and add to give ${sum}. Find the two numbers.`,
     answer:{type:'fields',fields:[{value:String(p)},{label:'and',value:String(q)}],unordered:true},
     mistakes:[
      {value:[String(other[0]),String(other[1])],why:`${other[0]} and ${other[1]} multiply to ${product}, but they add to ${other[0]+other[1]}, not ${sum}.`},
      ...(other[0]===other[1]?[]:[{value:[String(other[1]),String(other[0])],why:`${other[0]} and ${other[1]} multiply to ${product}, but they add to ${other[0]+other[1]}, not ${sum}.`}])],
     hint:`List the pairs of numbers that multiply to ${product}. Then test which pair adds to ${sum}.`,
     steps:[
      {math:`${product} = ${pairsOf(product).map(([u,w])=>`${u} * ${w}`).join(' = ')}`,note:`List the pairs of whole numbers that multiply to ${product}.`},
      {math:`${p} + ${q} = ${sum}`,note:`Pick the pair that adds to ${sum}.`},
      {math:`${quadratic(1,sum,product,L)} = (${linear(1,L,p)})(${linear(1,L,q)})`,note:'This is the search you do every time you factorise a quadratic. The two numbers go in the brackets.'}],
     verify:[{op:'value',expr:'ANSWER0*ANSWER1',equals:String(product)},{op:'value',expr:'ANSWER0 + ANSWER1',equals:String(sum)}]
    };
   }
  }},
  {name:'Negative numbers',make(rng){
   for(;;){
    const L=rng.pick(['x','x','y','a','n','t']),p=rng.int(1,9),q=rng.int(1,9),v=rng.int(0,2);
    if(p===q)continue;
    if(v===0)return monic(L,-p,-q);
    return v===1?monic(L,Math.max(p,q),-Math.min(p,q)):monic(L,Math.min(p,q),-Math.max(p,q));
   }
  }},
  {name:'Number before the square',make(rng){
   for(;;){
    const L=rng.pick(['x','x','y','a','n']),v=rng.int(0,2),p=rng.nonzero(-7,7),q=rng.nonzero(-7,7);
    const a=v===2?rng.pick([2,3]):rng.pick([2,3,5,2,3,4,6]),c=v===2?rng.pick([2,3]):1;
    if(a*c>6||!coprime(a,p)||!coprime(c,q)||a*q+p*c===0||a===c&&p===q)continue;
    if(v===0&&(p<0||q<0))continue;
    if(v===1&&p>0&&q>0)continue;
    return nonMonic(L,a,p,c,q);
   }
  }}
 ]
});

/* ---------- Difference of two squares ---------- */
/* first and second are [number, letter]: the two things being squared. F is a common factor such as '2' or 'x'. */
function squares(first,second,F=''){
 const root=([n,l])=>l?cf(n)+l:String(n),square=([n,l])=>l?cf(n*n)+l+'^2':String(n*n);
 const asSquare=([n,l])=>l&&n===1?`${l}^2`:l?`(${n}${l})^2`:`${n}^2`;
 const r1=root(first),r2=root(second),s1=square(first),s2=square(second);
 const t1=F?expand(`${F}(${s1})`):s1,t2=F?expand(`${F}(${s2})`):s2,expression=`${t1} - ${t2}`;
 const pair=(a,b)=>`(${a} - ${b})(${a} + ${b})`,answer=F+pair(r1,r2),cross=expand(`(${r1})(${r2})`);
 const mistakes=[{value:`${F}(${r1} - ${r2})^2`,why:`\`(${r1} - ${r2})^2\` multiplies out to \`${s1} - ${expand(`2(${r1})(${r2})`)} + ${s2}\`, which has a middle term. Use one bracket with a minus and one with a plus.`}];
 if(second[0]>1)mistakes.push({value:F+pair(r1,s2),why:`Use the square root of each term. \`${s2}\` is \`${asSquare(second)}\`, so \`${r2}\` goes in the brackets.`});
 if(first[0]>1)mistakes.push({value:F+pair(first[1]?first[0]*first[0]+first[1]:s1,r2),why:`Use the square root of each term. \`${s1}\` is \`${asSquare(first)}\`, so \`${r1}\` goes in the brackets.`});
 if(F)mistakes.push({value:pair(r1,r2),why:`Keep the common factor \`${F}\` in front of the brackets.`});
 mistakes.push({value:F+pair(r2,r1),why:`Your brackets multiply out to \`${s2} - ${s1}\`, which is the question with both signs changed. The term that is taken away goes second in each bracket: \`(${r1} - ${r2})\`.`});
 return {
  prompt:F?'Factorise fully.':'Factorise.',math:expression,
  answer:{type:'expr',value:answer,form:'factorised'},mistakes:unique(mistakes),
  hint:F?'Take out the common factor first. What is left in the bracket is a difference of two squares.':'Write each term as something squared. Then use `a^2 - b^2 = (a - b)(a + b)`.',
  steps:[
   ...(F?[{math:`${F}(${s1} - ${s2})`,note:`Take out the common factor \`${F}\` first.`}]:[]),
   {math:F?`${F}(${asSquare(first)} - ${asSquare(second)})`:`${asSquare(first)} - ${asSquare(second)}`,note:'Write each term as a square.'},
   {math:answer,note:'Use the rule `a^2 - b^2 = (a - b)(a + b)`.'},
   {math:`${pair(r1,r2)} = ${s1} + ${cross} - ${cross} - ${s2}`,note:'Check by multiplying out the two brackets. The middle terms cancel.'}],
  verify:{op:'factorised',expr:claim(expression),answer:'ANSWER'}
 };
}
/* The rule is quoted with a and b, so the questions use other letters. */
const SQ_LETTERS=['x','y','n','p','t','k'],SQ_PAIRS=[['x','y'],['p','q'],['m','n']];

K.define({
 id:'difference-of-squares',
 title:'Difference of two squares',
 strand:'Algebra',
 lesson:'02-03',
 blurb:'A square minus a square factorises into a minus bracket and a plus bracket.',
 levels:[
  {name:'Simple squares',make(rng){
   const L=rng.pick(SQ_LETTERS),b=rng.int(1,12);
   if(rng.chance(.3))return squares([rng.int(2,12),''],[1,L]);
   return squares([1,L],[b,'']);
  }},
  {name:'Squares with coefficients',make(rng){
   for(;;){
    const L=rng.pick(SQ_LETTERS),[A,B]=rng.pick(SQ_PAIRS),v=rng.int(0,2),a=rng.int(2,9),b=rng.int(1,11);
    if(!coprime(a,b))continue;
    if(v===0)return squares([a,L],[b,'']);
    if(v===1)return rng.chance(.5)?squares([a,A],[b,B]):squares([1,A],[a,B]);
    return squares([b===1?a+1:b,''],[a,L]);
   }
  }},
  {name:'Common factor first',make(rng){
   for(;;){
    const L=rng.pick(SQ_LETTERS),[A,B]=rng.pick(SQ_PAIRS),v=rng.int(0,3),k=rng.pick([2,3,5,2,3,4,6,7]),a=rng.int(1,4),b=rng.int(1,9);
    if(!coprime(a,b))continue;
    if(v===0)return squares([1,L],[b,''],String(k));
    if(v===1){if(b===1)continue;return squares([a,A],[b,B],String(k))}
    if(v===2)return squares([1,L],[b===1?5:b,''],rng.chance(.4)?k+L:L);
    const m=rng.int(2,9)*10+rng.pick([0,0,5]),d=rng.int(1,4),big=m+d,small=m-d,value=(big-small)*(big+small);
    return {
     prompt:'Use the difference of two squares to find the value, without a calculator.',math:`${big}^2 - ${small}^2`,
     answer:{type:'number',value:String(value)},
     mistakes:unique([
      {value:String((big-small)**2),why:`\`${big}^2 - ${small}^2\` is not \`(${big} - ${small})^2\`. Use \`(${big} - ${small})(${big} + ${small})\`.`},
      {value:String(big+small),why:`Multiply the two brackets: \`(${big-small})(${big+small})\`.`},
      {value:String(2*(big-small)),why:`Squaring is not doubling. Use \`a^2 - b^2 = (a - b)(a + b)\` with \`a = ${big}\` and \`b = ${small}\`.`}]),
     hint:'Use `a^2 - b^2 = (a - b)(a + b)`. The two brackets are easy numbers.',
     steps:[
      {math:`${big}^2 - ${small}^2 = (${big} - ${small})(${big} + ${small})`,note:'Use the rule `a^2 - b^2 = (a - b)(a + b)`.'},
      {math:`(${big-small})(${big+small})`,note:'Work out each bracket.'},
      {math:String(value),note:'Multiply.'}],
     verify:{op:'value',expr:`${big}^2 - ${small}^2`,equals:'ANSWER'}
    };
   }
  }}
 ]
});

/* ---------- Factorise by grouping ---------- */
/* The answer is (first)(second); the four terms are shown as first[0]*second then first[1]*second. */
function grouping(first,second,shuffled=false){
 const one=t=>terms([t]),times=(a,b)=>expand(`(${one(a)})(${one(b)})`);
 const four=[times(first[0],second[0]),times(first[0],second[1]),times(first[1],second[0]),times(first[1],second[1])];
 const ordered=four.reduce(join),expression=shuffled?[four[0],four[3],four[1],four[2]].reduce(join):ordered;
 const S=terms(second),answer=`(${terms(first)})(${S})`,Y=one([Math.abs(first[1][0]),first[1][1]]),negative=first[1][0]<0;
 const paired=`${one(first[0])==='1'?'':one(first[0])}(${S}) ${negative?'-':'+'} ${Y==='1'?'':Y}(${S})`;
 const flipSecond=`(${terms(first)})(${terms([second[0],[-second[1][0],second[1][1]]])})`,flipFirst=`(${terms([first[0],[-first[1][0],first[1][1]]])})(${S})`;
 const neg=t=>t.startsWith('-')?t.slice(1):'-'+t;
 const wrong=v=>`Multiply out to check: your brackets give \`${(v===flipFirst?[four[0],four[1],neg(four[2]),neg(four[3])]:[four[0],neg(four[1]),four[2],neg(four[3])]).reduce(join)}\`.`;
 return {
  prompt:'Factorise by grouping.',math:expression,
  answer:{type:'expr',value:answer,form:'factorised'},
  mistakes:[
   {value:flipFirst,why:negative?`${wrong(flipFirst)} The second pair starts with a minus, so take out \`-${Y}\`.`:`${wrong(flipFirst)} Check the sign in the first bracket.`},
   {value:flipSecond,why:negative?`When you take a negative out of the second pair, both signs change: \`${join(four[2],four[3])} = -${Y==='1'?'':Y}(${S})\`.`:`${wrong(flipSecond)} Check the sign in the second bracket.`}],
  hint:shuffled?'Rearrange the terms so that each pair has a common factor. Then factorise each pair.':negative?'Factorise the first two terms and the last two terms. Take a negative out of the second pair so that the two brackets match.':'Factorise the first two terms, then the last two terms. Look for the same bracket twice.',
  steps:[
   ...(shuffled?[{math:ordered,note:'The first two terms have no letter in common. Change the order so that each pair has a common factor.'}]:[]),
   {math:paired,note:negative?'Take the common factor out of each pair. Taking out a negative from the second pair changes both of its signs.':'Take the common factor out of each pair. The two brackets are the same.'},
   {math:answer,note:`The bracket \`(${S})\` is a common factor of both parts. Take it out.`},
   {math:`${answer} = ${ordered}`,note:'Check by multiplying out.'}],
  verify:{op:'factorised',expr:claim(expression),answer:'ANSWER'}
 };
}
const QUADS=[['a','b','x','y'],['p','q','x','y'],['a','b','c','d'],['m','n','x','y'],['p','q','r','s']];

K.define({
 id:'factorise-grouping',
 title:'Factorise by grouping',
 strand:'Algebra',
 lesson:'02-02',
 blurb:'Factorise four terms in two pairs, then take out the bracket they share.',
 levels:[
  {name:'Four positive terms',make(rng){
   for(;;){
    const [A,B,X,Y]=rng.pick(QUADS),v=rng.int(0,9),p=rng.int(2,9),q=rng.int(2,9);
    if(v===0)return grouping([[1,A],[1,B]],[[1,X],[1,Y]]);
    if(v<=3)return grouping([[1,A],[p,'']],[[1,X],[1,Y]]);
    if(v<=6){if(p===q)continue;return grouping([[1,X],[p,'']],[[1,Y],[q,'']])}
    return grouping([[1,X],[1,Y]],[[1,X],[q,'']]);
   }
  }},
  {name:'With negatives',make(rng){
   for(;;){
    const [A,B,X,Y]=rng.pick(QUADS),v=rng.int(0,2),p=rng.int(2,9),q=rng.int(2,9);
    if(v===0)return rng.chance(.5)?grouping([[1,A],[p,'']],[[1,X],[-1,Y]]):grouping([[1,A],[1,B]],[[1,X],[-q,'']]);
    if(v===1)return rng.chance(.5)?grouping([[1,A],[-p,'']],[[1,X],[1,Y]]):grouping([[1,X],[-p,'']],[[1,Y],[q,'']]);
    if(p===q)continue;
    return rng.chance(.5)?grouping([[1,X],[-p,'']],[[1,Y],[-q,'']]):grouping([[1,A],[-1,B]],[[1,X],[-1,Y]]);
   }
  }},
  {name:'Coefficients and reordering',make(rng){
   for(;;){
    const [A,B,X,Y]=rng.pick(QUADS),v=rng.int(0,2),p=rng.int(2,5),q=rng.nonzero(-5,5),r=rng.int(1,4),t=rng.nonzero(-7,7);
    if(!coprime(p,q)||!coprime(r,t))continue;
    if(v===0)return grouping([[p,A],[q,B]],[[r,X],[t,'']]);
    if(v===1){if(r===1)continue;return grouping([[p,X],[q,'']],[[r,Y],[t,'']])}
    return rng.chance(.5)?grouping([[1,A],[q,B]],[[1,X],[t,Y]],true):grouping([[p,A],[q,'']],[[1,X],[t,Y]],true);
   }
  }}
 ]
});

/* ---------- Add and subtract algebraic fractions ---------- */
function fractions(n1,d1,sign,n2,d2){
 const L=d1*d2/K.gcd(d1,d2),m1=L/d1,m2=L/d2,op=sign>0?'+':'-',T1=terms(n1),T2=terms(n2);
 const scaled=(m,n)=>m===1?terms(n):n.length===1?expand(`${m}(${terms(n)})`):`${m}(${terms(n)})`;
 const top=`${scaled(m1,n1)} ${op} ${m2===1&&n2.length>1&&sign<0?`(${T2})`:scaled(m2,n2)}`;
 const e1=expand(`${m1}(${T1})`),e2=expand(`${sign*m2}(${T2})`),opened=join(e1,e2),numerator=expand(top);
 const content=text=>[...K.poly(text).values()].reduce((g,q)=>K.gcd(g,q.n),0);
 /* Draw again if a fraction in the question, or the answer, would cancel down, or the answer starts with a minus. */
 if(K.gcd(content(numerator),L)>1||K.gcd(content(T1),d1)>1||K.gcd(content(T2),d2)>1||K.poly(numerator).size<n1.length||numerator.startsWith('-'))return null;
 const math=`frac(${T1}, ${d1}) ${op} frac(${T2}, ${d2})`,answer=`frac(${numerator}, ${L})`;
 const mistakes=[{value:`frac(${expand(`${T1} ${op} (${T2})`)}, ${L})`,why:`When a denominator is multiplied to make ${L}, the top is multiplied by the same number.`}];
 if(m1>1&&m2>1)mistakes.push({value:`frac(${expand(`${m1}(${T1}) ${op} (${T2})`)}, ${L})`,why:`The bottom of the second fraction was multiplied by ${m2}, so its top is multiplied by ${m2} as well.`});
 if(sign>0)mistakes.unshift({value:`frac(${expand(`${T1} + ${T2}`)}, ${d1+d2})`,why:'Fractions need a common denominator before you add them. The denominators are not added.'});
 if(sign<0&&n2.length>1)mistakes.unshift({value:`frac(${expand(`${m1}(${T1}) - ${m2}(${terms([n2[0]])}) + ${m2}(${terms(n2.slice(1))})`)}, ${L})`,why:'The minus applies to the whole of the second top. Keep that top in brackets so that every term in it changes sign.'});
 if(K.poly(numerator).size>1)mistakes.push({value:`${numerator}/${L}`,why:'The way you typed it, only the last term is over the bottom. Put the whole top in brackets before the division sign.'});
 /* Draw again if a slip would land on the right answer, or two slips on the same wrong one. */
 if(mistakes.some(m=>K.sameValue(m.value,answer))||unique(mistakes).length!==mistakes.length)return null;
 const steps=[
  {math,note:`The lowest common denominator of ${d1} and ${d2} is ${L}.`},
  {math:`frac(${scaled(m1,n1)}, ${L}) ${op} frac(${scaled(m2,n2)}, ${L})`,note:`Write each fraction over ${L}. Multiply the top by the same number as the bottom.`},
  {math:`frac(${top}, ${L})`,note:sign<0&&n2.length>1?'Write one fraction. Keep the second top in brackets, because all of it is subtracted.':'The denominators match, so put the tops over one denominator.'}];
 if(opened!==top&&opened!==numerator)steps.push({math:`frac(${opened}, ${L})`,note:sign<0&&n2.length>1?'Multiply out the brackets. The minus changes the sign of every term in the second bracket.':'Multiply out the brackets on top.'});
 if(numerator!==top)steps.push({math:answer,note:'Collect the like terms on top.'});
 return {
  prompt:'Write as a single fraction in its simplest form.',math,
  answer:{type:'expr',value:answer,form:'fraction'},mistakes,
  hint:sign<0&&n2.length>1?'Write both fractions over a common denominator. Keep the second top in brackets, because the minus applies to all of it.':`Find the lowest common denominator of ${d1} and ${d2}. Write both fractions over it before you combine the tops.`,
  steps,
  verify:{op:'identity',a:`(${claim(T1)})/${d1} ${op} (${claim(T2)})/${d2}`,b:'ANSWER'}
 };
}

K.define({
 id:'algebraic-fractions',
 title:'Add and subtract algebraic fractions',
 strand:'Algebra',
 lesson:'21-01',
 blurb:'Write both fractions over a common denominator, then combine the tops.',
 levels:[
  {name:'Single terms on top',make(rng){return retry(()=>{
   const L=rng.pick(['x','y','a','n']),v=rng.int(0,2),[d1,d2]=rng.distinct(2,2,6);
   if(v===0)return fractions([[1,L]],d1,1,[[1,L]],d2);
   if(v===1){const a=rng.int(2,5);if(!coprime(a,d1)||a*d2<=d1)return null;return fractions([[a,L]],d1,-1,[[1,L]],d2)}
   const b=rng.int(1,5);if(!coprime(b,d2))return null;
   return fractions([[1,L]],d1,1,[[b,'']],d2);
  })}},
  {name:'A sum on top',make(rng){return retry(()=>{
   const L=rng.pick(['x','y','a','n']),v=rng.int(0,2),[d1,d2]=rng.distinct(2,2,6),a=rng.int(1,7),b=rng.int(1,7);
   if(v===0)return rng.chance(.5)?fractions([[1,L],[a,'']],d1,1,[[1,L]],d2):fractions([[1,L]],d1,1,[[1,L],[a,'']],d2);
   if(v===1)return fractions([[1,L],[a,'']],d1,1,[[1,L],[b,'']],d2);
   return fractions([[rng.int(2,4),L],[a,'']],d1,1,[[1,L],[-b,'']],d2);
  })}},
  {name:'Subtracting a fraction',make(rng){return retry(()=>{
   const L=rng.pick(['x','y','a','n']),v=rng.int(0,2),a=rng.nonzero(-7,7),b=rng.int(1,7);
   const [d1,d2]=v===2?rng.pick([[4,6],[6,4],[2,6],[6,3],[3,6],[2,4],[4,2],[6,9],[4,8],[10,4]]):rng.distinct(2,2,7);
   if(v===0)return fractions([[rng.int(2,5),L],[a,'']],d1,-1,[[1,L],[-b,'']],d2);
   if(v===1)return fractions([[1,L],[a,'']],d1,-1,[[rng.int(2,4),L],[rng.chance(.5)?b:-b,'']],d2);
   return fractions([[rng.int(1,3),L],[a,'']],d1,-1,[[1,L],[rng.chance(.6)?-b:b,'']],d2);
  })}}
 ]
});

})();
