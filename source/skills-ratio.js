/* Skill drills: ratio and proportion. Each level's make(rng) returns one question. */
(()=>{
'use strict';
const K=SkillKit,{Q,qStr,gcd}=K;
const STRAND='Ratio and proportion';
const NAMES=['Aoife','Conor','Niamh','Sean','Ciara','Darragh','Emma','Tom','Maya','Ali','Kasia','Ben','Orla','Jack'];
const people=rng=>rng.shuffle(NAMES).slice(0,3);
const hcf=(...n)=>n.reduce((a,b)=>gcd(a,b));
const same=(a,b)=>a.length===b.length&&a.every((v,i)=>String(v)===String(b[i]));
const frac=(n,d)=>qStr(Q(n,d));
const money=v=>'€'+(Number.isInteger(v)?v:v.toFixed(2));
/* Wrong answers for a question with several boxes: drop any that equal the right answer or repeat. */
function fieldMistakes(right,list){
 const out=[];
 for(const m of list){if(!m||same(m.value,right)||out.some(o=>same(o.value,m.value)))continue;out.push({value:m.value.map(String),why:m.why})}
 return out;
}
/* Wrong answers for a single box: drop any that equal the right answer or repeat. */
function numberMistakes(right,list){
 const out=[];
 /* A slip that would give nothing or less than nothing of a real quantity is left out. */
 const size=v=>{const p=K.parseNumber(String(v));return p?p.q.n:1};
 for(const m of list){if(!m||K.sameValue(String(m.value),String(right))||out.some(o=>K.sameValue(o.value,String(m.value)))||size(right)>0&&size(m.value)<=0)continue;out.push({value:String(m.value),why:m.why})}
 return out;
}
/* The independent claim for a ratio answer: the same ratio as the raw parts, with no common factor left. */
function ratioClaims(raw){
 const claims=[];
 for(let i=0;i+1<raw.length;i++)claims.push({op:'value',expr:`ANSWER${i}*(${raw[i+1]})`,equals:`ANSWER${i+1}*(${raw[i]})`});
 claims.push({op:'value',expr:raw.length===3?'gcd(gcd(ANSWER0, ANSWER1), ANSWER2)':'gcd(ANSWER0, ANSWER1)',equals:'1'});
 return claims;
}
const ratioAnswer=parts=>({type:'fields',ratio:true,fields:parts.map((p,i)=>i?{label:':',value:String(p)}:{value:String(p)})});
const colon=parts=>parts.join(' : ');

/* ---------- Simplify a ratio ---------- */
const PAIRS=[
 (a,b)=>[`A school has ${a} boys and ${b} girls.`,'boys','girls'],
 (a,b)=>[`A bag holds ${a} red counters and ${b} blue counters.`,'red counters','blue counters'],
 (a,b)=>[`A recipe uses ${a} g of sugar and ${b} g of butter.`,'sugar','butter'],
 (a,b)=>[`A team won ${a} matches and lost ${b} matches.`,'wins','losses'],
 (a,b)=>[`A car park holds ${a} cars and ${b} vans.`,'cars','vans'],
 (a,b)=>[`A farmer has ${a} sheep and ${b} cows.`,'sheep','cows']];
const TRIPLES=[
 (a,b,c)=>[`A fruit bowl holds ${a} apples, ${b} oranges and ${c} bananas.`,'apples to oranges to bananas'],
 (a,b,c)=>[`A team won ${a} matches, drew ${b} and lost ${c}.`,'wins to draws to losses'],
 (a,b,c)=>[`A box holds ${a} red pens, ${b} blue pens and ${c} black pens.`,'red to blue to black pens'],
 (a,b,c)=>[`A garden centre sells ${a} oak trees, ${b} ash trees and ${c} birch trees.`,'oak to ash to birch trees']];
const UNITS=[
 {small:'cm',big:'m',one:'m',f:100,vals:[20,25,40,50,60,75,80,120,150,250]},
 {small:'mm',big:'cm',one:'cm',f:10,vals:[2,4,5,6,8,15,25,35]},
 {small:'g',big:'kg',one:'kg',f:1000,vals:[200,250,400,500,600,750,800,1500]},
 {small:'ml',big:'litres',one:'litre',f:1000,vals:[200,250,300,400,500,600,750,1500]},
 {small:'m',big:'km',one:'km',f:1000,vals:[200,250,400,500,600,750,800,1500]},
 {small:'minutes',big:'hours',one:'hour',f:60,vals:[10,15,20,24,30,40,45,50,90]},
 {small:'cent',big:'€',one:'€',f:100,vals:[20,25,40,50,60,75,80,150]}];
const bigQty=(n,u)=>u.big==='€'?'€'+n:n+' '+(n===1?u.one:u.big);
/* A ratio of a small unit to a big unit, in either order. */
function unitRatio(rng,u,big,bigRaw){
 const small=rng.pick(u.vals),converted=Math.round(big*u.f);
 if(small===converted)return null;
 const h=hcf(small,converted),right=[small/h,converted/h];
 if(Math.max(...right)>24)return null;
 const smallFirst=rng.chance(.5),order=x=>smallFirst?x:[x[1],x[0]];
 const shown=order([`${small} ${u.small}`,bigQty(big,u)]),numbers=order([small,converted]),answer=order(right);
 const plainH=Number.isInteger(big)?hcf(small,big):0;
 return {
  prompt:'Write the ratio in its simplest form.',math:colon(shown),
  answer:ratioAnswer(answer),
  mistakes:fieldMistakes(answer,[
   plainH?{value:order([small/plainH,big/plainH]),why:`The two parts are in different units. Change \`${bigQty(big,u)}\` into ${u.small} before you simplify.`}:null,
   {value:[answer[1],answer[0]],why:'The parts are in the wrong order. Keep each part in the same position as in the question.'}]),
  hint:`The units are different. Change \`${bigQty(big,u)}\` into ${u.small} first, then simplify.`,
  steps:[
   {math:`${bigQty(big,u)} = ${big} * ${u.f} = ${converted} ${u.small}`,note:`Both parts must be in the same unit. There are ${u.f} ${u.small} in 1 ${u.one==='€'?'euro':u.one}.`},
   {math:colon(numbers),note:`Now both parts are in ${u.small}, so the units can be left out.`},
   {math:`${numbers[0]} ÷ ${h} : ${numbers[1]} ÷ ${h}`,note:`Divide both parts by ${h}, their highest common factor.`},
   {math:colon(answer),note:'No number bigger than 1 divides into both parts, so this is the simplest form.'}],
  verify:ratioClaims(order([String(small),`(${bigRaw})*${u.f}`]))
 };
}
K.define({
 id:'simplify-ratios',title:'Simplify a ratio',strand:STRAND,lesson:'12-01',
 blurb:'Divide every part of a ratio by the same number until no common factor is left.',
 levels:[
  {name:'Two whole numbers',make(rng){
   for(;;){
    const [p,q]=rng.distinct(2,1,9),g=rng.pick([2,3,4,5,6,7,8,10,12]);
    if(gcd(p,q)!==1)continue;
    let a=p*g,b=q*g;if(a>96||b>96)continue;
    const style=rng.pick(['plain','plain','context','reversed']);
    let prompt='Write the ratio in its simplest form.',orderWhy='The parts are in the wrong order. Keep each part in the same position as in the question.',orderNote='Keep the parts in the order given.';
    if(style!=='plain'){
     let [text,x,y]=rng.pick(PAIRS)(a,b);
     if(style==='reversed'){[a,b]=[b,a];[x,y]=[y,x]}
     prompt=`${text} Write the ratio of ${x} to ${y} in its simplest form.`;
     orderWhy=`The order matters. The question asks for ${x} to ${y}, so the number for ${x} goes first.`;
     orderNote=`Write the ratio in the order the question asks: ${x} first, then ${y}.`;
    }
    const right=[a/g,b/g];
    return {
     prompt,...(style==='plain'?{math:`${a} : ${b}`}:{}),
     answer:ratioAnswer(right),
     mistakes:fieldMistakes(right,[
      {value:[right[1],right[0]],why:orderWhy},
      {value:[a/g,b],why:`Only the first part was divided. Divide both parts by ${g}.`},
      {value:[a,b/g],why:`Only the second part was divided. Divide both parts by ${g}.`}]),
     hint:`Find the biggest number that divides exactly into both ${a} and ${b}. Divide both parts by it.`,
     steps:[
      {math:`${a} : ${b}`,note:orderNote},
      {math:`${a} ÷ ${g} : ${b} ÷ ${g}`,note:`${g} is the highest common factor of ${a} and ${b}. Divide both parts by it.`},
      {math:colon(right),note:'No number bigger than 1 divides into both parts, so this is the simplest form.'}],
     verify:ratioClaims([a,b])
    };
   }
  }},
  {name:'Three parts and units',make(rng){
   for(;;){
    if(rng.chance(.45)){
     const u=rng.pick(UNITS),big=rng.int(1,4),q=unitRatio(rng,u,big,String(big));
     if(q)return q;continue;
    }
    const base=[rng.int(1,9),rng.int(1,9),rng.int(1,9)],g=rng.pick([2,3,4,5,6,8,10]);
    if(hcf(...base)!==1||new Set(base).size<2)continue;
    const parts=base.map(v=>v*g);if(Math.max(...parts)>72)continue;
    const context=rng.chance(.45),[text,order]=rng.pick(TRIPLES)(...parts);
    return {
     prompt:context?`${text} Write the ratio of ${order} in its simplest form.`:'Write the ratio in its simplest form.',
     ...(context?{}:{math:colon(parts)}),
     answer:ratioAnswer(base),
     mistakes:fieldMistakes(base,[
      {value:[base[0],base[1],parts[2]],why:`Divide all three parts by the same number. The last part was left as ${parts[2]}.`},
      {value:[parts[0],base[1],base[2]],why:`Divide all three parts by the same number. The first part was left as ${parts[0]}.`},
      {value:[base[2],base[1],base[0]],why:'The parts are in the wrong order. Keep each part in the same position as in the question.'}]),
     hint:'Find the biggest number that divides exactly into all three parts. Divide every part by it.',
     steps:[
      {math:colon(parts),note:context?'Write the three numbers in the order the question asks.':'A ratio with three parts is simplified the same way as one with two parts.'},
      {math:parts.map(v=>`${v} ÷ ${g}`).join(' : '),note:`${g} is the highest common factor of ${parts[0]}, ${parts[1]} and ${parts[2]}. Divide every part by it.`},
      {math:colon(base),note:'No number bigger than 1 divides into all three parts, so this is the simplest form.'}],
     verify:ratioClaims(parts)
    };
   }
  }},
  {name:'Fractions and decimals',make(rng){
   for(;;){
    const style=rng.pick(['decimal','fraction','fraction','units']);
    if(style==='units'){
     const u=rng.pick(UNITS.filter(x=>x.big!=='€')),big=rng.pick(u.f===60?[0.5,1.5,2.5,0.25,0.75,1.25]:[0.5,1.5,2.5,0.2,0.4,1.2]);
     const q=unitRatio(rng,u,big,`${Math.round(big*100)}/100`);
     if(q)return q;continue;
    }
    if(style==='decimal'){
     const [p,q]=rng.distinct(2,1,9),k=rng.pick([1,2,3,4,5,6,8,12,15,25]);
     if(gcd(p,q)!==1)continue;
     const tenths=[p*k,q*k],shown=tenths.map(v=>String(v/10));
     if(tenths.every(v=>v%10===0)||Math.max(...tenths)>120)continue;
     const right=[p,q],whole=tenths.findIndex(v=>v%10===0);
     const slip=whole<0?null:tenths.map((v,i)=>i===whole?v/10:v),slipH=slip?hcf(...slip):1;
     return {
      prompt:'Write the ratio in its simplest form, using whole numbers.',math:colon(shown),
      answer:ratioAnswer(right),
      mistakes:fieldMistakes(right,[
       slip?{value:slip.map(v=>v/slipH),why:'Multiply both parts by 10, not only the decimal. Whatever is done to one part must be done to the other.'}:null,
       {value:[q,p],why:'The parts are in the wrong order. Keep each part in the same position as in the question.'}]),
      hint:'Multiply both parts by 10 to clear the decimals. Then simplify as usual.',
      steps:[
       {math:colon(shown),note:'A ratio in its simplest form uses whole numbers only.'},
       {math:`${shown[0]} * 10 : ${shown[1]} * 10`,note:'Multiply both parts by 10 to clear the decimals.'},
       {math:colon(tenths),note:'Now both parts are whole numbers.'},
       ...(k===1?[]:[{math:colon(right),note:`Divide both parts by ${k}, their highest common factor.`}])],
      verify:ratioClaims(tenths.map(v=>`${v}/10`))
     };
    }
    /* fraction : fraction, or whole number : fraction */
    const d1=rng.pick([1,2,3,4,5,6,8]),d2=rng.pick([2,3,4,5,6,8,10]),n1=d1===1?rng.int(1,4):rng.int(1,d1-1),n2=rng.int(1,d2-1);
    if(gcd(n1,d1)!==1||gcd(n2,d2)!==1)continue;
    const lcd=d1*d2/gcd(d1,d2),cleared=[n1*lcd/d1,n2*lcd/d2],h=hcf(...cleared),right=cleared.map(v=>v/h);
    if(right[0]===right[1]||Math.max(...right)>20||lcd>40)continue;
    const show=(n,d)=>d===1?String(n):`frac(${n}, ${d})`,shown=[show(n1,d1),show(n2,d2)];
    const tops=[n1/gcd(n1,n2),n2/gcd(n1,n2)];
    return {
     prompt:'Write the ratio in its simplest form, using whole numbers.',math:colon(shown),
     answer:ratioAnswer(right),
     mistakes:fieldMistakes(right,[
      d1!==1&&d1!==d2?{value:tops,why:'The denominators are different, so the top numbers cannot be compared directly. Multiply both parts by a common denominator first.'}:null,
      d1===1?{value:[n1/gcd(n1,n2),n2/gcd(n1,n2)],why:`Multiply both parts by ${d2}, including the whole number ${n1}.`}:null,
      {value:[right[1],right[0]],why:n1===n2?'Those are the denominators. A bigger denominator means a smaller part. Multiply both parts by a common denominator first.':'The parts are in the wrong order. Keep each part in the same position as in the question.'}]),
     hint:`Multiply both parts by ${lcd}${d1===1?', the denominator of the fraction':', the lowest common denominator'}. That clears the fractions.`,
     steps:[
      {math:colon(shown),note:'A ratio in its simplest form uses whole numbers only.'},
      {math:`${shown[0]} * ${lcd} : ${shown[1]} * ${lcd}`,note:d1===1?`Multiply both parts by ${lcd} to clear the fraction.`:`${lcd} is the lowest number that ${d1} and ${d2} both divide into. Multiply both parts by it.`},
      {math:colon(cleared),note:'Now both parts are whole numbers.'},
      ...(h===1?[]:[{math:colon(right),note:`Divide both parts by ${h}, their highest common factor.`}])],
     verify:ratioClaims([`${n1}/${d1}`,`${n2}/${d2}`])
    };
   }
  }}
 ]
});

/* ---------- Share a total in a ratio ---------- */
const PART_VALUES=[2,3,4,5,6,8,10,12,15,20,25,30,40,50];
const MIXES=[
 {intro:(p,q)=>`A drink is made from juice and water in the ratio ${p} : ${q}.`,names:['juice','water'],unit:'ml',whole:t=>`${t} ml of the drink`,box:'jug',scale:10},
 {intro:(p,q)=>`A potting mix is made from compost and sand in the ratio ${p} : ${q}.`,names:['compost','sand'],unit:'kg',whole:t=>`${t} kg of the mix`,box:'batch',scale:1},
 {intro:(p,q)=>`Green paint is made from blue paint and yellow paint in the ratio ${p} : ${q}.`,names:['blue paint','yellow paint'],unit:'litres',whole:t=>`${t} litres of green paint`,box:'batch',scale:1},
 {intro:(p,q)=>`A crumble topping is made from flour and sugar in the ratio ${p} : ${q}.`,names:['flour','sugar'],unit:'g',whole:t=>`${t} g of the topping`,box:'bowl',scale:10}];
const nParts=n=>n===1?'1 part':n+' parts';
const cap=s=>s[0].toUpperCase()+s.slice(1);
K.define({
 id:'share-in-a-ratio',title:'Share in a ratio',strand:STRAND,lesson:'12-01',
 blurb:'Find the value of one equal part, then give each share its number of parts.',
 levels:[
  {name:'Share a total',make(rng){
   for(;;){
    const [p,q]=rng.distinct(2,1,9),style=rng.pick(['money','money','mix','each']),mix=rng.pick(MIXES);
    const part=rng.pick(PART_VALUES)*(style==='mix'?mix.scale:1),parts=[p,q],n=p+q;
    if(gcd(p,q)!==1||part===p||part===q||part===n)continue;
    const total=n*part,shares=[p*part,q*part];
    if(total>(style!=='mix'?900:mix.scale===10?2000:100))continue;
    const [A,B]=people(rng),i=rng.int(0,1),o=1-i,own=parts[i];
    const start=[
     {math:`${p} + ${q} = ${n}`,note:`Add the parts of the ratio. The total is split into ${n} equal parts.`},
     {math:`${total} ÷ ${n} = ${part}`,note:`Divide the total by ${n} to find the value of one part.`}];
    const check={math:`${shares[0]} + ${shares[1]} = ${total}`,note:'Check: the two shares add up to the total.'};
    if(style==='each')return {
     prompt:`${A} and ${B} share ${money(total)} in the ratio ${p} : ${q}. How much does each person get?`,
     answer:{type:'fields',fields:[{label:`${A}: €`,value:String(shares[0])},{label:`${B}: €`,value:String(shares[1])}]},
     mistakes:fieldMistakes(shares,[
      {value:[shares[1],shares[0]],why:`The shares are the wrong way round. ${A} is named first, so ${A} has ${nParts(p)} and ${B} has ${nParts(q)}.`},
      p>1&&q>1?{value:[frac(total,p),frac(total,q)],why:`Do not divide the total by each number in the ratio. Add the parts first: \`${p} + ${q} = ${n}\`. Then divide by ${n} to find one part.`}:null]),
     hint:`How many equal parts are there altogether? Find the value of one part first.`,
     steps:[...start,
      {math:`${p} * ${part} = ${shares[0]}`,note:`${A} has ${nParts(p)}.`},
      {math:`${q} * ${part} = ${shares[1]}`,note:`${B} has ${nParts(q)}.`},check],
     verify:[{op:'value',expr:`${total}*${p}/(${p} + ${q})`,equals:'ANSWER0'},{op:'value',expr:`${total}*${q}/(${p} + ${q})`,equals:'ANSWER1'}]
    };
    const isMoney=style==='money',who=isMoney?[A,B][i]:'the '+mix.names[i],other=isMoney?[A,B][o]:'the '+mix.names[o];
    const has=isMoney?`${who} has ${nParts(own)}`:`${who} is ${nParts(own)} of the mix`;
    return {
     prompt:isMoney?`${A} and ${B} share ${money(total)} in the ratio ${p} : ${q}. How much does ${who} get?`:`${mix.intro(p,q)} How much ${mix.names[i]} is in ${mix.whole(total)}?`,
     answer:isMoney?{type:'number',label:'€',value:String(shares[i])}:{type:'number',value:String(shares[i]),unit:mix.unit},
     mistakes:numberMistakes(shares[i],[
      {value:shares[o],why:isMoney?`That is ${other}'s share. Read the question again: it asks for ${who}, who has ${nParts(own)}.`:`That is the amount of ${mix.names[o]}. Read the question again: it asks for ${who}, which is ${nParts(own)}.`},
      own>1?{value:part,why:`That is the value of one part. ${cap(has)}, so multiply by ${own}.`}:null,
      own>1?{value:frac(total,own),why:`You divided by ${own} only. Add the parts first: \`${p} + ${q} = ${n}\`. The total is split into ${n} equal parts.`}:null,
      own<parts[o]?{value:frac(total*own,parts[o]),why:`The ratio \`${p} : ${q}\` is not the fraction \`frac(${own}, ${parts[o]})\`. There are ${n} parts altogether, so the fraction needed is \`frac(${own}, ${n})\`.`}:null]),
     hint:`Add the parts of the ratio first. Then find the value of one part.`,
     steps:[...start,{math:`${own} * ${part} = ${shares[i]}`,note:`${cap(has)}, so multiply one part by ${own}.`},check],
     verify:{op:'value',expr:`${total}*${own}/(${p} + ${q})`,equals:'ANSWER'}
    };
   }
  }},
  {name:'One share is known',make(rng){
   for(;;){
    const [p,q]=rng.distinct(2,1,9),isMoney=rng.chance(.55),mix=rng.pick(MIXES),parts=[p,q],n=p+q;
    const one=rng.pick(PART_VALUES)*(isMoney?1:mix.scale),k=rng.int(0,1),o=1-k,pk=parts[k],po=parts[o];
    if(gcd(p,q)!==1||pk===1||one===pk||one===po)continue;
    const known=pk*one,otherShare=po*one,total=n*one,shares=k===0?[known,otherShare]:[otherShare,known];
    if(total>(isMoney?900:mix.scale===10?2000:100))continue;
    const [A,B]=people(rng),K1=isMoney?[A,B][k]:'the '+mix.names[k],O=isMoney?[A,B][o]:'the '+mix.names[o],askTotal=rng.chance(.35);
    const shown=isMoney?money(known):`${known} ${mix.unit}`;
    const oHas=isMoney?`${O} has ${nParts(po)}`:`${cap(O)} is ${nParts(po)}`,oAmount=isMoney?`${O}'s share`:`the amount of ${mix.names[o]}`;
    const prompt=isMoney
     ?`${A} and ${B} share some money in the ratio ${p} : ${q}. ${K1} gets ${shown}. ${askTotal?'How much money is shared altogether?':`How much does ${O} get?`}`
     :`${mix.intro(p,q)} A ${mix.box} contains ${shown} of ${mix.names[k]}. ${askTotal?`What is the total amount in the ${mix.box}?`:`How much ${mix.names[o]} does it contain?`}`;
    const right=askTotal?total:otherShare;
    return {
     prompt,
     answer:isMoney?{type:'number',label:'€',value:String(right)}:{type:'number',value:String(right),unit:mix.unit},
     mistakes:numberMistakes(right,[
      askTotal?{value:otherShare,why:`That is ${oAmount}. The question asks for the total, so add the two amounts.`}:{value:total,why:`That is the total. The question asks only for ${oAmount}, which is ${nParts(po)}.`},
      {value:one,why:`That is the value of one part. ${askTotal?`There are ${n} parts altogether`:oHas}, so multiply by ${askTotal?n:po}.`},
      askTotal?null:{value:frac(known*po,n),why:`${shown} is not the total. It is only ${nParts(pk)}, so start with \`${known} ÷ ${pk}\` to find one part.`},
      askTotal?{value:known*n,why:`${shown} is not one part. It is ${nParts(pk)}, so divide it by ${pk} first.`}:{value:known*po,why:`${shown} is not one part. It is ${nParts(pk)}, so divide it by ${pk} first.`}]),
     hint:`${shown} stands for ${nParts(pk)} of the ratio. Use it to find the value of one part.`,
     steps:[
      {math:`${known} ÷ ${pk} = ${one}`,note:`${isMoney?`${K1}'s ${shown}`:`The ${shown} of ${mix.names[k]}`} is ${nParts(pk)}. Divide by ${pk} to find the value of one part.`},
      {math:`${po} * ${one} = ${otherShare}`,note:`${oHas}.`},
      ...(askTotal?[{math:`${known} + ${otherShare} = ${total}`,note:'Add the two amounts to find the total.'}]:[]),
      {math:`${shares[0]} : ${shares[1]} = ${p} : ${q}`,note:'Check: the two amounts simplify to the ratio in the question.'}],
     verify:{op:'value',expr:askTotal?`${known}/${pk}*(${p} + ${q})`:`${known}/${pk}*${po}`,equals:'ANSWER'}
    };
   }
  }},
  {name:'Differences and three parts',make(rng){
   for(;;){
    const one=rng.pick(PART_VALUES),names=people(rng);
    if(rng.chance(.4)){
     /* The difference between two shares is known. */
     const [p,q]=rng.distinct(2,1,9),d=Math.abs(p-q),n=p+q,parts=[p,q];
     if(gcd(p,q)!==1||d<2||one===d||one===p||one===q)continue;
     const b=p>q?0:1,s=1-b,diff=d*one,shares=[p*one,q*one],total=n*one,ask=rng.pick(['small','big','total']);
     const i=ask==='big'?b:s,own=parts[i],right=ask==='total'?total:shares[i];
     return {
      prompt:`${names[0]} and ${names[1]} share some money in the ratio ${p} : ${q}. ${names[b]} gets ${money(diff)} more than ${names[s]}. ${ask==='total'?'How much money is shared altogether?':`How much does ${names[i]} get?`}`,
      answer:{type:'number',label:'€',value:String(right)},
      mistakes:numberMistakes(right,[
       ask==='total'?{value:n*diff,why:`${money(diff)} is not one part. It is the difference between the shares, which is \`${parts[b]} - ${parts[s]} = ${d}\` parts.`}:{value:own*diff,why:`${money(diff)} is not one part. It is the difference between the shares, which is \`${parts[b]} - ${parts[s]} = ${d}\` parts.`},
       ask==='total'?{value:shares[b],why:`That is ${names[b]}'s share. The question asks for the total, so add both shares.`}:{value:shares[1-i],why:`That is ${names[1-i]}'s share. Read the question again: it asks for ${names[i]}.`},
       ask==='total'?null:{value:frac(diff*own,n),why:`${money(diff)} is not the total. It is the difference between the shares, which is ${d} parts.`},
       {value:one,why:`That is the value of one part. ${ask==='total'?`There are ${n} parts altogether`:`${names[i]} has ${nParts(own)}`}.`}]),
      hint:`The difference between the shares is \`${parts[b]} - ${parts[s]}\` parts. Those parts are worth ${money(diff)}.`,
      steps:[
       {math:`${parts[b]} - ${parts[s]} = ${d}`,note:`${names[b]} has ${d} more parts than ${names[s]}.`},
       {math:`${diff} ÷ ${d} = ${one}`,note:`Those ${d} parts are worth ${money(diff)}. Divide to find the value of one part.`},
       ask==='total'?{math:`(${p} + ${q}) * ${one} = ${total}`,note:`There are ${n} parts altogether.`}:{math:`${own} * ${one} = ${right}`,note:`${names[i]} has ${nParts(own)}.`},
       {math:`${shares[b]} - ${shares[s]} = ${diff}`,note:'Check: the difference between the two shares matches the question.'}],
      verify:{op:'value',expr:ask==='total'?`${diff}/(${parts[b]} - ${parts[s]})*(${p} + ${q})`:`${diff}/(${parts[b]} - ${parts[s]})*${own}`,equals:'ANSWER'}
     };
    }
    /* Three people. */
    const parts=rng.distinct(3,1,9),n=parts[0]+parts[1]+parts[2],total=n*one,shares=parts.map(v=>v*one);
    if(hcf(...parts)!==1||parts.includes(one)||one===n||total>1500)continue;
    const ratio=colon(parts),sumText=`${parts.join(' + ')} = ${n}`,style=rng.pick(['share','gap','reverse']);
    const list=`${names[0]}, ${names[1]} and ${names[2]}`;
    if(style==='reverse'){
     const [k,o]=rng.distinct(2,0,2),pk=parts[k],po=parts[o],askTotal=rng.chance(.4),right=askTotal?total:shares[o];
     if(pk===1)continue;
     return {
      prompt:`${list} share some money in the ratio ${ratio}. ${names[k]} gets ${money(shares[k])}. ${askTotal?'How much money is shared altogether?':`How much does ${names[o]} get?`}`,
      answer:{type:'number',label:'€',value:String(right)},
      mistakes:numberMistakes(right,[
       {value:one,why:`That is the value of one part. ${askTotal?`There are ${n} parts altogether`:`${names[o]} has ${nParts(po)}`}, so multiply by ${askTotal?n:po}.`},
       askTotal?{value:shares[k]*n,why:`${money(shares[k])} is not one part. It is ${nParts(pk)}, so divide it by ${pk} first.`}:{value:frac(shares[k]*po,n),why:`${money(shares[k])} is not the total. It is ${names[k]}'s ${nParts(pk)}, so start with \`${shares[k]} ÷ ${pk}\`.`},
       askTotal?null:{value:total,why:`That is the total. The question asks only for ${names[o]}'s share.`}]),
      hint:`${names[k]}'s ${money(shares[k])} stands for ${nParts(pk)}. Use it to find the value of one part.`,
      steps:[
       {math:`${shares[k]} ÷ ${pk} = ${one}`,note:`${names[k]}'s ${money(shares[k])} is ${nParts(pk)}. Divide by ${pk} to find the value of one part.`},
       askTotal?{math:sumText,note:'Add the parts of the ratio to find how many parts there are altogether.'}:{math:`${po} * ${one} = ${right}`,note:`${names[o]} has ${nParts(po)}.`},
       ...(askTotal?[{math:`${n} * ${one} = ${total}`,note:`The total is ${n} parts.`}]:[]),
       {math:`${colon(shares)} = ${ratio}`,note:'Check: the three shares simplify to the ratio in the question.'}],
      verify:{op:'value',expr:askTotal?`${shares[k]}/${pk}*(${parts.join(' + ')})`:`${shares[k]}/${pk}*${po}`,equals:'ANSWER'}
     };
    }
    const start=[
     {math:sumText,note:`Add the parts of the ratio. The total is split into ${n} equal parts.`},
     {math:`${total} ÷ ${n} = ${one}`,note:`Divide the total by ${n} to find the value of one part.`}];
    const check={math:`${shares.join(' + ')} = ${total}`,note:'Check: the three shares add up to the total.'};
    if(style==='gap'){
     const hi=parts.indexOf(Math.max(...parts)),lo=parts.indexOf(Math.min(...parts)),gap=shares[hi]-shares[lo];
     return {
      prompt:`${list} share ${money(total)} in the ratio ${ratio}. How much more does ${names[hi]} get than ${names[lo]}?`,
      answer:{type:'number',label:'€',value:String(gap)},
      mistakes:numberMistakes(gap,[
       {value:shares[hi],why:`That is ${names[hi]}'s share. The question asks how much more ${names[hi]} gets than ${names[lo]}, so subtract ${names[lo]}'s share.`},
       {value:shares[lo],why:`That is ${names[lo]}'s share. The question asks for the difference between two shares.`},
       {value:one,why:`That is the value of one part. ${names[hi]} has \`${parts[hi]} - ${parts[lo]} = ${parts[hi]-parts[lo]}\` more parts than ${names[lo]}.`},
       {value:parts[hi]-parts[lo],why:`That is the difference in parts. Multiply it by the value of one part, ${money(one)}.`}]),
      hint:'Find the value of one part. Then work out both shares and subtract.',
      steps:[...start,
       {math:`${parts[hi]} * ${one} = ${shares[hi]}`,note:`${names[hi]} has ${nParts(parts[hi])}.`},
       {math:`${parts[lo]} * ${one} = ${shares[lo]}`,note:`${names[lo]} has ${nParts(parts[lo])}.`},
       {math:`${shares[hi]} - ${shares[lo]} = ${gap}`,note:'Subtract to find how much more.'}],
      verify:{op:'value',expr:`${total}*(${parts[hi]} - ${parts[lo]})/(${parts.join(' + ')})`,equals:'ANSWER'}
     };
    }
    const i=rng.int(0,2),own=parts[i],others=[0,1,2].filter(x=>x!==i);
    return {
     prompt:`${list} share ${money(total)} in the ratio ${ratio}. How much does ${names[i]} get?`,
     answer:{type:'number',label:'€',value:String(shares[i])},
     mistakes:numberMistakes(shares[i],[
      ...others.map(x=>({value:shares[x],why:`That is ${names[x]}'s share. Read the question again: it asks for ${names[i]}, who has ${nParts(own)}.`})),
      own>1?{value:one,why:`That is the value of one part. ${names[i]} has ${nParts(own)}, so multiply by ${own}.`}:null,
      own>1?{value:frac(total,own),why:`You divided by ${own} only. Add all the parts first: \`${sumText}\`. The total is split into ${n} equal parts.`}:null]),
     hint:'Add all three parts of the ratio first. Then find the value of one part.',
     steps:[...start,{math:`${own} * ${one} = ${shares[i]}`,note:`${names[i]} has ${nParts(own)}, so multiply one part by ${own}.`},check],
     verify:{op:'value',expr:`${total}*${own}/(${parts.join(' + ')})`,equals:'ANSWER'}
    };
   }
  }}
 ]
});

/* ---------- Direct proportion: the unitary method ---------- */
const d2=v=>Number.isInteger(v)?String(v):v.toFixed(2);
/* The most one of each could cost, in euro. */
const DEAREST={pen:3,copy:3,ticket:12,notebook:4,apple:2,folder:5,'bus ticket':4,marker:3};
const ITEMS=[['pens','pen'],['copies','copy'],['tickets','ticket'],['notebooks','notebook'],['apples','apple'],['folders','folder'],['bus tickets','bus ticket'],['markers','marker']];
const RATES=[
 {text:(n,v)=>`A printer prints ${v} pages in ${n} minutes.`,ask:m=>`How many pages does it print in ${m} minutes?`,unit:'pages',per:'minute',units:[8,12,15,20,25,30]},
 {text:(n,v)=>`A car travels ${v} km on ${n} litres of petrol.`,ask:m=>`How far does it travel on ${m} litres?`,unit:'km',per:'litre',units:[12,14,15,16,18,20]},
 {text:(n,v)=>`A tap fills ${v} litres in ${n} minutes.`,ask:m=>`How many litres does it fill in ${m} minutes?`,unit:'litres',per:'minute',units:[6,8,9,12,15]},
 {text:(n,v)=>`${n} identical boxes weigh ${v} kg.`,ask:m=>`What do ${m} of these boxes weigh?`,unit:'kg',per:'box',units:[3,4,6,7,8,12]},
 {text:(n,v)=>`A machine fills ${v} bottles in ${n} minutes.`,ask:m=>`How many bottles does it fill in ${m} minutes?`,unit:'bottles',per:'minute',units:[15,24,30,40,45]}];
const FOODS=[['flour','g',[25,30,40,50,60,75]],['sugar','g',[10,15,20,25,30]],['milk','ml',[50,60,75,100,125]],['rice','g',[40,50,60,75]],['butter','g',[10,15,20,25]],['stock','ml',[100,125,150]],['pasta','g',[60,75,80,90]]];
const GOODS=[['rice','g','pack'],['pasta','g','pack'],['coffee','g','pack'],['cereal','g','box'],['washing powder','g','box'],['orange juice','ml','bottle'],['shampoo','ml','bottle'],['olive oil','ml','bottle']];
const plural=word=>word==='box'?'boxes':word+'s';
K.define({
 id:'direct-proportion',title:'Direct proportion',strand:STRAND,lesson:'12-01',
 blurb:'Find the value of one, then multiply to get the value of any number.',
 levels:[
  {name:'Unitary method',make(rng){
   for(;;){
    const n=rng.int(2,9),m=rng.int(2,12),style=rng.pick(['cost','cost','rate','count']);
    if(m===n)continue;
    if(style==='rate'){
     const r=rng.pick(RATES),u=rng.pick(r.units),v=n*u,right=m*u;
     if(u===n||u===m)continue;
     return {
      prompt:`${r.text(n,v)} ${r.ask(m)}`,
      answer:{type:'number',value:String(right),unit:r.unit},
      mistakes:numberMistakes(right,[
       {value:v*m,why:`That multiplies the amount for ${n} by ${m}. Find the amount for 1 ${r.per} first: \`${v} ÷ ${n}\`.`},
       {value:u,why:`That is the amount for 1 ${r.per}. Multiply it by ${m}.`},
       {value:v+(m-n),why:`${m>n?'Adding':'Subtracting'} ${Math.abs(m-n)} does not keep the same rate. Find the amount for 1 ${r.per} first.`}]),
      hint:`Find the amount for 1 ${r.per} first. Then multiply by ${m}.`,
      steps:[
       {math:`${v} ÷ ${n} = ${u}`,note:`Divide by ${n} to find the amount for 1 ${r.per}.`},
       {math:`${m} * ${u} = ${right}`,note:`Multiply by ${m} to find the amount for ${m} ${plural(r.per)}.`}],
      verify:{op:'value',expr:`${v}/${n}*${m}`,equals:'ANSWER'}
     };
    }
    const [items,item]=rng.pick(ITEMS),u=rng.pick(style==='count'?[2,3,4,5,6,7,8,9,12]:[0.5,1.5,2,2.5,3,4,5,6,7,8,9,12]),c=n*u,target=m*u;
    if(u===n||u===m||u>DEAREST[item])continue;
    if(style==='count')return {
     prompt:`${n} ${items} cost ${money(c)}. How many ${items} can be bought for ${money(target)}?`,
     answer:{type:'number',value:String(m),unit:items},
     mistakes:numberMistakes(m,[
      {value:u,why:`That is the cost of one ${item} in euro. Divide ${money(target)} by it to find how many ${items}.`},
      {value:frac(target,n),why:`Dividing by ${n} does not give the number of ${items}. Find the cost of one ${item} first: \`${c} ÷ ${n} = ${u}\`.`},
      {value:n+(target-c),why:`That treats each extra euro as one more ${item}. Find the real cost of one ${item} first.`}]),
     hint:`Find the cost of one ${item} first. Then see how many times it goes into ${money(target)}.`,
     steps:[
      {math:`${c} ÷ ${n} = ${u}`,note:`Divide by ${n} to find the cost of 1 ${item}.`},
      {math:`${target} ÷ ${u} = ${m}`,note:`Each ${item} costs ${money(u)}. Divide the money by the cost of one.`},
      {math:`${m} * ${u} = ${target}`,note:'Check: multiply back to get the money spent.'}],
     verify:{op:'value',expr:`${target}/(${c}/${n})`,equals:'ANSWER'}
    };
    return {
     prompt:`${n} ${items} cost ${money(c)}. How much do ${m} ${items} cost?`,
     answer:{type:'number',label:'€',value:String(target)},
     mistakes:numberMistakes(target,[
      {value:c*m,why:`That is ${m} times the cost of ${n} ${items}. Find the cost of one ${item} first: \`${d2(c)} ÷ ${n}\`.`},
      {value:u,why:`That is the cost of one ${item}. Multiply it by ${m}.`},
      {value:c+(m-n),why:`${m>n?'Adding':'Subtracting'} ${Math.abs(m-n)} treats each ${item} as costing €1. Find the real cost of one ${item} first.`}]),
     hint:`Find the cost of one ${item} first. Then multiply by ${m}.`,
     steps:[
      {math:`${d2(c)} ÷ ${n} = ${d2(u)}`,note:`Divide by ${n} to find the cost of 1 ${item}.`},
      {math:`${m} * ${d2(u)} = ${d2(target)}`,note:`Multiply by ${m} to find the cost of ${m} ${items}.`}],
     verify:{op:'value',expr:`(${Math.round(c*100)}/100)/${n}*${m}`,equals:'ANSWER'}
    };
   }
  }},
  {name:'Recipes and scaling',make(rng){
   for(;;){
    const n=rng.pick([2,3,4,5,6,8,10,12]),m=rng.int(2,16),style=rng.pick(['recipe','recipe','table','people']);
    if(m===n)continue;
    const foods=rng.shuffle(FOODS).slice(0,3),units=foods.map(f=>rng.pick(f[2])),j=style==='table'?rng.int(0,2):0;
    const [food,unit]=foods[j],u=units[j],amount=n*u,right=m*u;
    if(u===n||u===m)continue;
    if(style==='people'){
     const who=rng.pick(NAMES);
     return {
      prompt:`A recipe for ${n} people uses ${amount} ${unit} of ${food}. ${who} has ${right} ${unit} of ${food}. How many people can ${who} cook for?`,
      answer:{type:'number',value:String(m),unit:'people'},
      mistakes:numberMistakes(m,[
       {value:u,why:`That is the amount of ${food} for one person. Divide the ${right} ${unit} by it to find the number of people.`},
       {value:frac(right,n),why:`Dividing by ${n} does not give the number of people. Find the amount for one person first: \`${amount} ÷ ${n} = ${u}\`.`},
       m%n===0?{value:m/n,why:`That is how many times the recipe fits. Each recipe feeds ${n} people, so multiply by ${n}.`}:null]),
      hint:`Find how much ${food} one person needs. Then see how many times it goes into ${right} ${unit}.`,
      steps:[
       {math:`${amount} ÷ ${n} = ${u}`,note:`Divide by ${n} to find the amount for 1 person.`},
       {math:`${right} ÷ ${u} = ${m}`,note:`Each person needs ${u} ${unit}. Divide the amount available by the amount for one person.`},
       {math:`${m} * ${u} = ${right}`,note:'Check: multiply back to get the amount used.'}],
      verify:{op:'value',expr:`${right}/(${amount}/${n})`,equals:'ANSWER'}
     };
    }
    return {
     prompt:style==='table'?`The table shows a recipe for ${n} people. How much ${food} is needed for ${m} people?`:`A recipe for ${n} people uses ${amount} ${unit} of ${food}. How much ${food} is needed for ${m} people?`,
     ...(style==='table'?{table:{head:['Ingredient',`Amount for ${n} people`],rows:foods.map((f,i)=>[cap(f[0]),`${n*units[i]} ${f[1]}`])}}:{}),
     answer:{type:'number',value:String(right),unit},
     mistakes:numberMistakes(right,[
      {value:amount*m,why:`That multiplies the amount for ${n} people by ${m}. Find the amount for 1 person first: \`${amount} ÷ ${n}\`.`},
      {value:u,why:`That is the amount for 1 person. Multiply it by ${m}.`},
      {value:amount+(m-n),why:`${m>n?'Adding':'Subtracting'} ${Math.abs(m-n)} does not scale the recipe. Find the amount for 1 person, then multiply.`},
      {value:frac(amount*n,m),why:`${m>n?'More':'Fewer'} people need ${m>n?'more':'less'} ${food}, not ${m>n?'less':'more'}. Divide by ${n} and multiply by ${m}.`}]),
     hint:`Find the amount of ${food} for 1 person first. Then multiply by ${m}.`,
     steps:[
      {math:`${amount} ÷ ${n} = ${u}`,note:`Divide by ${n} to find the amount of ${food} for 1 person.`},
      {math:`${m} * ${u} = ${right}`,note:`Multiply by ${m} to find the amount for ${m} people.`}],
     verify:{op:'value',expr:`${amount}/${n}*${m}`,equals:'ANSWER'}
    };
   }
  }},
  {name:'Best value and money',make(rng){
   for(;;){
    if(rng.chance(.5)){
     /* Two packs: compare the price for the same amount. */
     const [good,unit,box]=rng.pick(GOODS),[k1,k2]=rng.shuffle([2,3,4,5,6,8,10]).slice(0,2).sort((a,b)=>a-b),u1=rng.int(24,98),u2=u1+rng.pick([-12,-9,-8,-6,-5,-4,-3,3,4,5,6,8,9,12]);
     if(u2<20||k2*u2<=k1*u1+20)continue;
     const packs=[{size:k1*100,lots:k1,cents:k1*u1,u:u1},{size:k2*100,lots:k2,cents:k2*u2,u:u2}];
     const best=u1<u2?0:1,worse=1-best,price=p=>'€'+(p.cents/100).toFixed(2),label=p=>`The ${p.size} ${unit} ${box}`;
     return {
      prompt:`A shop sells the same ${good} in two sizes. Which ${box} is better value?`,
      table:{head:['Size','Price'],rows:packs.map(p=>[`${p.size} ${unit}`,price(p)])},
      answer:{type:'choice',options:[
       {text:label(packs[best]),value:frac(packs[best].cents,packs[best].size),correct:true},
       {text:label(packs[worse]),value:frac(packs[worse].cents,packs[worse].size),why:`This ${box} costs ${packs[worse].u} cent for each 100 ${unit}. The other ${box} costs ${packs[best].u} cent for each 100 ${unit}, which is less. ${worse===1?`A bigger ${box} is not always better value.`:'A lower price on the label is not always better value.'}`},
       {text:'They are equally good value',why:`Work out the price of 100 ${unit} in each ${box}: ${u1} cent and ${u2} cent. They are not equal.`}]},
      hint:`Compare the price for the same amount. Find the price of 100 ${unit} in each ${box}.`,
      steps:[
       {math:`${(packs[0].cents/100).toFixed(2)} ÷ ${k1} = ${(u1/100).toFixed(2)}`,note:`${packs[0].size} ${unit} is ${k1} lots of 100 ${unit}. Divide the price by ${k1} to find the price of 100 ${unit}.`},
       {math:`${(packs[1].cents/100).toFixed(2)} ÷ ${k2} = ${(u2/100).toFixed(2)}`,note:`${packs[1].size} ${unit} is ${k2} lots of 100 ${unit}. Divide the price by ${k2}.`},
       {math:`${(packs[best].u/100).toFixed(2)} < ${(packs[worse].u/100).toFixed(2)}`,note:`${label(packs[best])} costs less for the same amount, so it is better value.`}],
      verify:{op:'value',expr:`Min(${packs[0].cents}/${packs[0].size}, ${packs[1].cents}/${packs[1].size})`,equals:'ANSWER'}
     };
    }
    const n=rng.int(3,9),m=rng.int(2,15),u=rng.int(7,79)*5,[items,item]=rng.pick(ITEMS.filter(x=>x[1]!=='apple')),more=rng.chance(.4);
    if(m===n||u%100===0||(more&&m<=n+1))continue;
    const c=n*u/100,each=u/100,costM=m*u/100,right=more?(m-n)*u/100:costM;
    return {
     prompt:more?`${n} ${items} cost ${money(c)}. How much more do ${m} ${items} cost than ${n} ${items}?`:`${n} ${items} cost ${money(c)}. Find the cost of ${m} ${items}.`,
     answer:{type:'number',label:'€',value:right.toFixed(2)},
     mistakes:numberMistakes(right.toFixed(2),[
      more?{value:costM.toFixed(2),why:`That is the cost of ${m} ${items}. The question asks how much more they cost than ${n} ${items}, so subtract ${money(c)}.`}:null,
      {value:each.toFixed(2),why:`That is the cost of one ${item}. ${more?`The extra ${m-n} ${items} cost ${m-n} times as much.`:`Multiply it by ${m}.`}`},
      more?null:{value:(c*m).toFixed(2),why:`That is ${m} times the cost of ${n} ${items}. Find the cost of one ${item} first: \`${d2(c)} ÷ ${n}\`.`},
      more?null:{value:(c+(m-n)).toFixed(2),why:`${m>n?'Adding':'Subtracting'} ${Math.abs(m-n)} treats each ${item} as costing €1. Find the real cost of one ${item} first.`}]),
     hint:more?`Find the cost of one ${item}. How many extra ${items} are there?`:`Find the cost of one ${item} first. Then multiply by ${m}.`,
     steps:[
      {math:`${d2(c)} ÷ ${n} = ${each.toFixed(2)}`,note:`Divide by ${n} to find the cost of 1 ${item}.`},
      ...(more?[
       {math:`${m} - ${n} = ${m-n}`,note:`There are ${m-n} extra ${items}.`},
       {math:`${m-n} * ${each.toFixed(2)} = ${right.toFixed(2)}`,note:`Multiply the cost of one ${item} by the number of extra ${items}.`}]
      :[{math:`${m} * ${each.toFixed(2)} = ${right.toFixed(2)}`,note:`Multiply by ${m} to find the cost of ${m} ${items}.`}])],
     verify:{op:'value',expr:more?`(${n*u}/100)/${n}*(${m} - ${n})`:`(${n*u}/100)/${n}*${m}`,equals:'ANSWER'}
    };
   }
  }}
 ]
});

/* ---------- Speed, distance and time ---------- */
const MOVERS=[['A car',[50,60,80,90,100]],['A cyclist',[12,15,18,20,24]],['A train',[80,90,100,120]],['A bus',[40,45,50,60]],['A walker',[4,5,6]],['A runner',[8,10,12]],['A ferry',[20,24,30,36]]];
const ROAD=[['A car',[50,60,70,80,90,100]],['A van',[40,50,60,70,80]],['A coach',[40,45,50,60,75]],['A train',[60,80,90,100,120]]];
K.define({
 id:'speed-distance-time',title:'Speed, distance and time',strand:STRAND,lesson:'12-03',
 blurb:'Use two of speed, distance and time to find the third, with matching units.',
 levels:[
  {name:'Find the missing one',make(rng){
   for(;;){
    const [who,speeds]=rng.pick(MOVERS),v=rng.pick(speeds),t=rng.int(2,6),d=v*t,ask=rng.pick(['d','s','t']);
    if(t===v||t>3&&(who==='A runner'||who==='A walker'))continue;
    if(ask==='d')return {
     prompt:`${who} travels at ${v} km/h for ${t} hours. What distance is covered?`,
     answer:{type:'number',value:String(d),unit:'km'},
     mistakes:numberMistakes(d,[
      {value:frac(v,t),why:'You divided. To find the distance, multiply the speed by the time.'},
      {value:v+t,why:'Multiply the speed by the time. Adding them mixes km/h with hours.'}]),
     hint:`${v} km/h means ${v} km in every hour. How many km in ${t} hours?`,
     steps:[
      {math:'Distance = Speed * Time',note:'To find the distance, multiply the speed by the time.'},
      {math:`${v} * ${t} = ${d}`,note:`${v} km in each hour, for ${t} hours, gives ${d} km.`}],
     verify:{op:'value',expr:`${v}*${t}`,equals:'ANSWER'}
    };
    if(ask==='s')return {
     prompt:`${who} travels ${d} km in ${t} hours. Find the average speed.`,
     answer:{type:'number',value:String(v),unit:'km/h'},
     mistakes:numberMistakes(v,[
      {value:d*t,why:'You multiplied. Speed is the distance divided by the time.'},
      {value:frac(t,d),why:'That is time divided by distance. Speed is distance divided by time.'},
      {value:d-t,why:'Divide the distance by the time. Subtracting mixes km with hours.'}]),
     hint:'Speed is the distance covered in one hour. Share the distance equally over the hours.',
     steps:[
      {math:'Speed = Distance ÷ Time',note:'To find the speed, divide the distance by the time.'},
      {math:`${d} ÷ ${t} = ${v}`,note:`${d} km shared equally over ${t} hours gives ${v} km in each hour.`},
      {math:`${v} * ${t} = ${d}`,note:'Check: speed multiplied by time gives the distance.'}],
     verify:{op:'value',expr:`${d}/${t}`,equals:'ANSWER'}
    };
    return {
     prompt:`${who} travels ${d} km at ${v} km/h. How long does the journey take?`,
     answer:{type:'number',value:String(t),unit:'hours'},
     mistakes:numberMistakes(t,[
      {value:d*v,why:'You multiplied. Time is the distance divided by the speed.'},
      {value:frac(v,d),why:'That is speed divided by distance. Time is distance divided by speed.'},
      {value:d-v,why:'Divide the distance by the speed. Subtracting does not give a time.'}]),
     hint:`Each hour covers ${v} km. How many times does ${v} go into ${d}?`,
     steps:[
      {math:'Time = Distance ÷ Speed',note:'To find the time, divide the distance by the speed.'},
      {math:`${d} ÷ ${v} = ${t}`,note:`Each hour covers ${v} km, and ${v} goes into ${d} exactly ${t} times.`},
      {math:`${v} * ${t} = ${d}`,note:'Check: speed multiplied by time gives the distance.'}],
     verify:{op:'value',expr:`${d}/${v}`,equals:'ANSWER'}
    };
   }
  }},
  {name:'Minutes and hours',make(rng){
   for(;;){
    const [who,speeds]=rng.pick(MOVERS),v=rng.pick(speeds),min=rng.pick([10,12,15,20,24,30,36,40,45,48,50,75,80,90]),d=v*min/60,ask=rng.pick(['d','s','t']);
    if(!Number.isInteger(d)||d<2||d===min)continue;
    const hours=K.fmt(Q(min,60)),wrong=min/100;
    if(ask==='d')return {
     prompt:`${who} travels at ${v} km/h for ${min} minutes. What distance is covered?`,
     answer:{type:'number',value:String(d),unit:'km'},
     mistakes:numberMistakes(d,[
      {value:v*min,why:`The speed is in km for each hour, so the time must be in hours. Change ${min} minutes to hours first: \`${min} ÷ 60\`.`},
      {value:frac(v*min,100),why:`${min} minutes is not ${wrong} hours. There are 60 minutes in an hour, so divide the minutes by 60.`},
      {value:frac(v*60,min),why:'You divided the speed by the time. To find the distance, multiply the speed by the time in hours.'}]),
     hint:`The speed is in km/h, so change ${min} minutes to hours before you multiply.`,
     steps:[
      {math:`${min} ÷ 60 = ${hours}`,note:'The speed is in km/h, so change the minutes to hours. Divide by 60.'},
      {math:`${v} * ${hours} = ${d}`,note:'Multiply the speed by the time in hours to get the distance in km.'}],
     verify:{op:'value',expr:`${v}*${min}/60`,equals:'ANSWER'}
    };
    if(ask==='s')return {
     prompt:`${who} travels ${d} km in ${min} minutes. Find the average speed in km/h.`,
     answer:{type:'number',value:String(v),unit:'km/h'},
     mistakes:numberMistakes(v,[
      {value:frac(d,min),why:'That is the distance covered in one minute. Multiply it by 60 to get the distance covered in one hour.'},
      {value:frac(d*100,min),why:`${min} minutes is not ${wrong} hours. There are 60 minutes in an hour, so divide the minutes by 60.`},
      {value:d*min,why:'You multiplied. Speed is the distance divided by the time in hours.'}]),
     hint:`The answer must be in km/h, so change ${min} minutes to hours first.`,
     steps:[
      {math:`${min} ÷ 60 = ${hours}`,note:'Change the minutes to hours so that the speed comes out in km/h.'},
      {math:`${d} ÷ ${hours} = ${v}`,note:`Divide the distance by the time in hours. Dividing by \`${hours}\` is the same as multiplying by \`${K.fmt(Q(60,min))}\`.`},
      {math:`${v} * ${hours} = ${d}`,note:'Check: speed multiplied by time gives the distance.'}],
     verify:{op:'value',expr:`${d}/(${min}/60)`,equals:'ANSWER'}
    };
    return {
     prompt:`${who} travels ${d} km at ${v} km/h. How many minutes does the journey take?`,
     answer:{type:'number',value:String(min),unit:'minutes'},
     mistakes:numberMistakes(min,[
      {value:frac(d,v),why:'That is the time in hours. Multiply it by 60 to change it to minutes.'},
      {value:frac(d*100,v),why:'There are 60 minutes in an hour, not 100. Multiply the time in hours by 60.'},
      {value:frac(v,d),why:'That is speed divided by distance. Time is distance divided by speed.'}]),
     hint:'Find the time in hours first. Then change it to minutes.',
     steps:[
      {math:`${d} ÷ ${v} = ${hours}`,note:'Divide the distance by the speed. This gives the time in hours.'},
      {math:`${hours} * 60 = ${min}`,note:'Multiply by 60 to change hours to minutes.'}],
     verify:{op:'value',expr:`${d}/${v}*60`,equals:'ANSWER'}
    };
   }
  }},
  {name:'Exam style',make(rng){
   for(;;){
    const [who,speeds]=rng.pick(ROAD),style=rng.pick(['times','speeds','clock','clock']);
    if(style==='clock'){
     /* A time given in hours and minutes. */
     const v=rng.pick(speeds),h=rng.int(1,4),min=rng.pick([6,12,15,24,30,36,45,48]),total=(h*60+min)/60,d=v*(h*60+min)/60,findSpeed=rng.chance(.5);
     if(!Number.isInteger(d))continue;
     const slip=`${h}.${min<10?'0'+min:min}`,right=findSpeed?v:d;
     return {
      prompt:findSpeed?`${who} travels ${d} km in ${h} ${h===1?'hour':'hours'} ${min} minutes. Find the average speed.`:`${who} travels at ${v} km/h for ${h} ${h===1?'hour':'hours'} ${min} minutes. What distance is covered?`,
      answer:{type:'number',value:String(right),unit:findSpeed?'km/h':'km'},
      mistakes:numberMistakes(right,[
       findSpeed?{value:frac(d*100,h*100+min),why:`${h} ${h===1?'hour':'hours'} ${min} minutes is not ${slip} hours. Change the minutes to hours: \`${min} ÷ 60 = ${min/60}\`.`}:{value:frac(v*(h*100+min),100),why:`${h} ${h===1?'hour':'hours'} ${min} minutes is not ${slip} hours. Change the minutes to hours: \`${min} ÷ 60 = ${min/60}\`.`},
       findSpeed?{value:frac(d,h),why:`The ${min} minutes are part of the journey too. Use the whole time, ${total} hours.`}:{value:v*h,why:`The ${min} minutes are part of the journey too. Use the whole time, ${total} hours.`}]),
      hint:`Write ${h} ${h===1?'hour':'hours'} ${min} minutes as a decimal number of hours first.`,
      steps:[
       {math:`${min} ÷ 60 = ${min/60}`,note:'Change the minutes to hours. Divide by 60.'},
       {math:`${h} + ${min/60} = ${total}`,note:`The whole journey takes ${total} hours.`},
       findSpeed?{math:`${d} ÷ ${total} = ${v}`,note:'Divide the distance by the time in hours to get the speed in km/h.'}:{math:`${v} * ${total} = ${d}`,note:'Multiply the speed by the time in hours to get the distance in km.'}],
      verify:{op:'value',expr:findSpeed?`${d}/(${h} + ${min}/60)`:`${v}*(${h} + ${min}/60)`,equals:'ANSWER'}
     };
    }
    /* A journey in two parts. */
    const [v1,v2]=rng.shuffle(speeds).slice(0,2),t1=rng.pick(style==='times'?[1,2,3,4]:[0.5,1,1.5,2,2.5,3]),t2=rng.pick(style==='times'?[1,2,3,4]:[0.5,1,1.5,2,2.5,3]);
    const d1=v1*t1,d2=v2*t2,avg=(d1+d2)/(t1+t2),naive=(v1+v2)/2;
    if(t1===t2||!Number.isInteger(avg)||!Number.isInteger(d1)||!Number.isInteger(d2))continue;
    const hrs=t=>t===1?'1 hour':t+' hours';
    return {
     prompt:style==='times'
      ?`${who} travels ${d1} km in ${hrs(t1)} and then ${d2} km in ${hrs(t2)}. Find the average speed for the whole journey.`
      :`${who} travels ${d1} km at ${v1} km/h and then ${d2} km at ${v2} km/h. Find the average speed for the whole journey.`,
     answer:{type:'number',value:String(avg),unit:'km/h'},
     mistakes:numberMistakes(avg,[
      {value:naive,why:`That is the average of the two speeds, ${v1} km/h and ${v2} km/h. The two parts take different times, so use total distance divided by total time.`},
      {value:v1,why:'That is the speed for the first part only. Use the total distance and the total time.'},
      {value:v2,why:'That is the speed for the second part only. Use the total distance and the total time.'},
      {value:d1+d2,why:'That is the total distance. Divide it by the total time to get the average speed.'}]),
     hint:'Average speed is the total distance divided by the total time. Find both totals first.',
     steps:[
      ...(style==='speeds'?[
       {math:`${d1} ÷ ${v1} = ${t1}`,note:'Find the time for the first part: distance divided by speed.'},
       {math:`${d2} ÷ ${v2} = ${t2}`,note:'Find the time for the second part.'}]:[]),
      {math:`${d1} + ${d2} = ${d1+d2}`,note:'Add the two distances to get the total distance in km.'},
      {math:`${t1} + ${t2} = ${t1+t2}`,note:'Add the two times to get the total time in hours.'},
      {math:`${d1+d2} ÷ ${t1+t2} = ${avg}`,note:'Divide the total distance by the total time.'}],
     verify:{op:'value',expr:style==='times'?`(${d1} + ${d2})/(${Math.round(t1*2)}/2 + ${Math.round(t2*2)}/2)`:`(${d1} + ${d2})/(${d1}/${v1} + ${d2}/${v2})`,equals:'ANSWER'}
    };
   }
  }}
 ]
});

/* ---------- Clock time: elapsed time and arrival time ---------- */
const pad=n=>String(n).padStart(2,'0');
const clock=m=>{m=((m%1440)+1440)%1440;return pad(Math.floor(m/60))+':'+pad(m%60)};
const dur=m=>{const h=Math.floor(m/60),r=m%60;return h&&r?`${h} h ${r} min`:h?`${h} h`:`${r} min`};
const durWords=m=>{const h=Math.floor(m/60),r=m%60,H=h===1?'1 hour':h+' hours',R=r===1?'1 minute':r+' minutes';return h&&r?`${H} ${R}`:h?H:R};
const raw=m=>`(${Math.floor(m/60)%24}*60 + ${m%60})`;
const durationAnswer=m=>({type:'fields',fields:[{value:String(Math.floor(m/60)),unit:'h'},{value:String(m%60),unit:'min'}]});
const clockAnswer=m=>({type:'fields',fields:[{value:String(Math.floor(m/60)%24)},{label:':',value:String(m%60)}]});
const hm=m=>[Math.floor(m/60),m%60];
/* Counting on from a start time s to an end time e, both in minutes after midnight (e may be on the next day). */
function elapsedSteps(s,e){
 const total=e-s,sm=s%60,em=e%60;
 if(e>1440){
  const a=1440-s,b=e-1440;
  return [
   {math:`${clock(s)} to 00:00 = ${dur(a)}`,note:'Count on to midnight first.'},
   {math:`00:00 to ${clock(e)} = ${dur(b)}`,note:'Then count on from midnight to the end time.'},
   {math:`${dur(a)} + ${dur(b)} = ${dur(total)}`,note:a%60+b%60>=60?'Add the two pieces. 60 minutes make 1 hour.':'Add the two pieces.'}];
 }
 if(em>=sm){
  const h=Math.floor(total/60),mid=s+h*60;
  return [
   {math:`${clock(s)} to ${clock(mid)} = ${dur(h*60)}`,note:'Count on in full hours for as long as you can.'},
   {math:`${clock(mid)} to ${clock(e)} = ${dur(total%60)}`,note:'Count on the minutes that are left.'},
   {math:`${dur(h*60)} + ${dur(total%60)} = ${dur(total)}`,note:'Put the two pieces together.'}];
 }
 const a=60-sm,next=s+a,last=e-em,hours=(last-next)/60,pieces=[`${a} min`,...(hours?[`${hours} h`]:[]),...(em?[`${em} min`]:[])];
 return [
  {math:`${clock(s)} to ${clock(next)} = ${a} min`,note:'Count on to the next full hour.'},
  ...(hours?[{math:`${clock(next)} to ${clock(last)} = ${hours} h`,note:'Count the full hours.'}]:[]),
  ...(em?[{math:`${clock(last)} to ${clock(e)} = ${em} min`,note:'Count on the minutes after the last full hour.'}]:[]),
  {math:`${pieces.join(' + ')} = ${dur(total)}`,note:'Add the pieces.'}];
}
/* Adding a length of time d to a clock time s. */
function arriveSteps(s,d){
 const h=Math.floor(d/60),m=d%60,steps=[];let t=s;
 if(h){const past=Math.floor((t+h*60)/1440)>Math.floor(t/1440);steps.push({math:`${clock(t)} + ${h} h = ${clock(t+h*60)}`,note:past?'Add the full hours first. After 23:59 the clock starts again at 00:00.':'Add the full hours first.'});t+=h*60}
 if(m){
  const toHour=(60-t%60)%60;
  if(toHour&&m>toHour){
   steps.push({math:`${clock(t)} + ${toHour} min = ${clock(t+toHour)}`,note:`Use ${toHour} of the ${m} minutes to reach the next full hour.`});t+=toHour;
   steps.push({math:`${clock(t)} + ${m-toHour} min = ${clock(t+m-toHour)}`,note:`Add the ${m-toHour} minutes that are left.`});
  }else steps.push({math:`${clock(t)} + ${m} min = ${clock(t+m)}`,note:'Then add the minutes.'});
 }
 return steps;
}
/* Going back a length of time d from a clock time a. */
function backSteps(a,d){
 const h=Math.floor(d/60),m=d%60,steps=[];let t=a;
 if(h){steps.push({math:`${clock(t)} - ${h} h = ${clock(t-h*60)}`,note:'Go back the full hours first.'});t-=h*60}
 if(m){
  const past=t%60;
  if(past&&m>past){
   steps.push({math:`${clock(t)} - ${past} min = ${clock(t-past)}`,note:`Go back ${past} of the ${m} minutes to reach the full hour.`});t-=past;
   steps.push({math:`${clock(t)} - ${m-past} min = ${clock(t-(m-past))}`,note:`Go back the ${m-past} minutes that are left.`});
  }else steps.push({math:`${clock(t)} - ${m} min = ${clock(t-m)}`,note:'Then go back the minutes.'});
 }
 return steps;
}
const elapsedClaims=(s,e)=>{const E=raw(e)+(e>=1440?' + 24*60':''),S=raw(s);return [{op:'value',expr:`floor((${E} - ${S})/60)`,equals:'ANSWER0'},{op:'value',expr:`Mod(${E} - ${S}, 60)`,equals:'ANSWER1'}]};
const clockClaims=total=>[{op:'value',expr:`Mod(floor((${total})/60), 24)`,equals:'ANSWER0'},{op:'value',expr:`Mod(${total}, 60)`,equals:'ANSWER1'}];
const SPANS=[['A film starts at','and ends at','How long is the film?'],['A train leaves at','and arrives at','How long is the journey?'],['A match starts at','and ends at','How long is the match?'],['A school trip leaves at','and returns at','How long is the trip?'],['A coach tour leaves at','and returns at','How long is the tour?'],['A flight takes off at','and lands at','How long is the flight?']];
const NIGHTS=[['A night bus leaves at','and arrives at','How long is the journey?'],['A ferry leaves at','and docks at','How long is the crossing?'],['A night shift starts at','and ends at','How long is the shift?'],['A flight takes off at','and lands at','How long is the flight?']];
const TRIPS=[['A bus leaves at','The journey takes','At what time does it arrive?'],['A film starts at','It lasts','At what time does it end?'],['A train leaves at','The journey takes','At what time does it arrive?'],['A walk starts at','It takes','At what time does it end?'],['A radio show starts at','It lasts','At what time does it end?']];
const OVERNIGHT=[['A ferry leaves at','The crossing takes','At what time does it arrive?'],['An overnight coach leaves at','The journey takes','At what time does it arrive?'],['A flight takes off at','The flight takes','At what time does it land?'],['A night train leaves at','The journey takes','At what time does it arrive?']];
const IN_HM=' Give your answer in hours and minutes.',ON_24=' Give the time on the 24-hour clock.';
const five=(rng,lo,hi)=>rng.int(lo/5,hi/5)*5;
/* A span from s to e on the same day, answered in hours and minutes. */
function spanQuestion(rng,s,e){
 const total=e-s,[a,b,ask]=rng.pick(total>150?SPANS.filter(x=>!/film|match/.test(x[0])):SPANS),[sh,sm]=hm(s),[eh,em]=hm(e),right=hm(total),borrow=em<sm;
 return {
  prompt:`${a} ${clock(s)} ${b} ${clock(e)}. ${ask}${IN_HM}`,
  answer:durationAnswer(total),
  mistakes:fieldMistakes(right,[
   borrow?{value:[eh-sh,sm-em],why:`The minutes were subtracted the wrong way round. From ${clock(s)} to ${clock(s+(eh-sh)*60)} would be ${eh-sh} full hours, and that is past ${clock(e)}. Count on to the next full hour instead.`}:null,
   borrow?{value:[eh-sh-1,em+100-sm],why:'There are 60 minutes in an hour, not 100, so clock times cannot be subtracted like decimals. Count on in pieces instead.'}:null,
   {value:[0,total],why:'That is the right length of time in minutes. Now write it in hours and minutes: 60 minutes make 1 hour.'},
   {value:[right[1],right[0]],why:'The hours go in the first box and the minutes in the second box.'}]),
  hint:borrow?`Count on from ${clock(s)} to the next full hour. Then count the full hours, then the minutes that are left.`:`Count on from ${clock(s)} in full hours. Then count the minutes that are left.`,
  steps:elapsedSteps(s,e),
  verify:elapsedClaims(s,e)
 };
}
/* A start time s and a length of time d, answered as a clock time. */
function arrivalQuestion(rng,s,d,carry,trips=TRIPS){
 const [a,b,ask]=rng.pick(trips),end=s+d,[sh,sm]=hm(s),[dh,dm]=hm(d),right=hm(end%1440),overnight=end>=1440;
 return {
  prompt:`${a} ${clock(s)}. ${b} ${durWords(d)}. ${ask}${ON_24}`,
  answer:clockAnswer(end),
  mistakes:fieldMistakes(right,[
   carry?{value:[sh+dh,sm+dm],why:`${sm+dm} minutes is more than an hour. Take 60 minutes out and add 1 to the hours.`}:null,
   carry?{value:[(sh+dh)%24,sm+dm-60],why:'The minutes went past 60, so one more hour must be added to the hours.'}:null,
   overnight?{value:[Math.floor(end/60),end%60],why:'After 23:59 the clock starts again at 00:00. Subtract 24 from the hours.'}:null,
   {value:[(sh+dh)%24,sm],why:`The ${dm} minutes must be added too, not only the hours.`},
   {value:hm(((s-d)%1440+1440)%1440),why:'That goes back in time. The end time comes after the start time, so add.'}]),
  hint:carry?'Add the hours first. Then add the minutes in two pieces: up to the next full hour, then the rest.':'Add the hours first, then the minutes.',
  steps:arriveSteps(s,d),
  verify:clockClaims(`${sh}*60 + ${sm} + ${dh}*60 + ${dm}`)
 };
}
K.define({
 id:'time-calculations',title:'Clock time calculations',strand:STRAND,lesson:'12-02',
 blurb:'Count on in pieces to find how long something takes or when it ends.',
 levels:[
  {name:'Within one day',make(rng){
   for(;;){
    const style=rng.pick(['span','span','minutes','arrive']),s=rng.int(7,19)*60+five(rng,0,55),sm=s%60;
    if(style==='span'){
     const d=rng.int(1,4)*60+five(rng,5,55);
     if(sm+d%60>=60)continue;
     return spanQuestion(rng,s,s+d);
    }
    if(style==='arrive'){
     const d=rng.int(1,3)*60+five(rng,10,50);
     if(sm+d%60>=60||(sm+d%60)<10)continue;
     return arrivalQuestion(rng,s,d,false);
    }
    /* A short span that crosses the hour, answered in minutes. */
    const d=five(rng,25,110),a=60-sm,rest=d-a,e=s+d;
    if(sm===0||rest<=0||d===60)continue;
    const [what,word]=rng.pick([['A lesson','lesson'],['A swimming session','session'],['A bus journey','journey'],['A music practice','practice']]);
    const [sh]=hm(s),[eh,em]=hm(e);
    return {
     prompt:`${what} starts at ${clock(s)} and ends at ${clock(e)}. How many minutes long is the ${word}?`,
     answer:{type:'number',value:String(d),unit:'min'},
     mistakes:numberMistakes(d,[
      {value:(eh*100+em)-(sh*100+sm),why:`There are 60 minutes in an hour, not 100, so the times cannot be subtracted like ordinary numbers. Count on from ${clock(s)} to ${clock(s+a)} first.`},
      {value:Math.abs(em-sm),why:`The two times are in different hours. Count on from ${clock(s)} to ${clock(s+a)}, then on to ${clock(e)}.`},
      {value:rest,why:`That is only the time after ${clock(s+a)}. Add the ${a} minutes from ${clock(s)} to ${clock(s+a)}.`}]),
     hint:`Count on from ${clock(s)} to ${clock(s+a)}. Then count on to ${clock(e)}.`,
     steps:[
      {math:`${clock(s)} to ${clock(s+a)} = ${a} min`,note:'Count on to the next full hour.'},
      {math:`${clock(s+a)} to ${clock(e)} = ${rest} min`,note:rest>=60?'One full hour is 60 minutes. Add any minutes after that.':'Count on the minutes after the full hour.'},
      {math:`${a} + ${rest} = ${d}`,note:'Add the two pieces.'}],
     verify:{op:'value',expr:`${raw(e)} - ${raw(s)}`,equals:'ANSWER'}
    };
   }
  }},
  {name:'Carrying and midnight',make(rng){
   for(;;){
    const style=rng.pick(['borrow','borrow','midnight','carry']);
    if(style==='midnight'){
     const s=rng.int(20,23)*60+five(rng,5,55),e=1440+rng.int(0,6)*60+five(rng,5,55),total=e-s,[a,b,ask]=rng.pick(NIGHTS),right=hm(total);
     if(total%60===0)continue;
     const back=hm(s-(e-1440));
     return {
      prompt:`${a} ${clock(s)} ${b} ${clock(e)} the next day. ${ask}${IN_HM}`,
      answer:durationAnswer(total),
      mistakes:fieldMistakes(right,[
       {value:back,why:`That subtracts the end time from the start time. The clock goes past midnight, so count on from ${clock(s)} to 00:00, then on to ${clock(e)}.`},
       {value:[0,total],why:'That is the right length of time in minutes. Now write it in hours and minutes: 60 minutes make 1 hour.'},
       {value:hm(1440-s),why:`That is only the time up to midnight. Add the time from 00:00 to ${clock(e)}.`}]),
      hint:`Split the time at midnight. Count on from ${clock(s)} to 00:00, then from 00:00 to ${clock(e)}.`,
      steps:elapsedSteps(s,e),
      verify:elapsedClaims(s,e)
     };
    }
    const s=rng.int(6,19)*60+five(rng,15,55),sm=s%60;
    if(style==='carry'){
     const d=rng.int(1,2)*60+five(rng,15,55);
     if(sm+d%60<70)continue;
     return arrivalQuestion(rng,s,d,true);
    }
    const e=s+rng.int(1,4)*60+five(rng,10,55);
    if(e%60>=sm||e>=1440)continue;
    return spanQuestion(rng,s,e);
   }
  }},
  {name:'Exam style',make(rng){
   for(;;){
    const style=rng.pick(['overnight','backwards','match']);
    if(style==='overnight'){
     const s=rng.int(19,23)*60+five(rng,5,55),d=rng.int(2,8)*60+five(rng,5,55),end=s+d;
     if(end<1440||end%60<10)continue;
     const q=arrivalQuestion(rng,s,d,s%60+d%60>=60,OVERNIGHT);
     return {...q,prompt:q.prompt.replace(ON_24,' The answer is a time on the next day. Give it on the 24-hour clock.')};
    }
    if(style==='backwards'){
     const a=rng.int(9,22)*60+five(rng,0,55),d=rng.int(1,4)*60+five(rng,10,55),s=a-d,[ah,am]=hm(a),[dh,dm]=hm(d),right=hm(s);
     if(s<300||s%60<10||am>=dm)continue;
     const [what,took]=rng.pick([['A train arrives at','The journey took'],['A flight lands at','The flight took'],['A film ends at','The film lasted'],['A coach arrives at','The journey took']]);
     const borrow=am<dm,forward=hm((a+d)%1440);
     return {
      prompt:`${what} ${clock(a)}. ${took} ${durWords(d)}. At what time did it ${what.includes('film')?'start':what.includes('flight')?'take off':'leave'}?${ON_24}`,
      answer:clockAnswer(s),
      mistakes:fieldMistakes(right,[
       {value:forward,why:'That adds the time on. The start comes before the end, so go back in time.'},
       borrow?{value:[ah-dh,dm-am],why:`The minutes were subtracted the wrong way round. Going back ${dm} minutes from ${clock(a-dh*60)} passes the full hour, so the hour drops by one more.`}:null,
       borrow?{value:[ah-dh-1,am+100-dm],why:'There are 60 minutes in an hour, not 100, so clock times cannot be subtracted like decimals. Go back in pieces instead.'}:null]),
      hint:'Go back the full hours first. Then go back the minutes, stopping at the full hour on the way if you pass it.',
      steps:[...backSteps(a,d),{math:`${clock(s)} + ${dur(d)} = ${clock(a)}`,note:'Check: add the time back on to reach the end time.'}],
      verify:clockClaims(`${ah}*60 + ${am} - (${dh}*60 + ${dm})`)
     };
    }
    /* Several lengths of time added to a start time. */
    const [game,half]=rng.pick([['A hurling match',35],['A camogie match',30],['A rugby match',40],['A soccer match',45]]),brk=rng.pick([10,15,20]),s=rng.int(10,19)*60+five(rng,0,55),d=2*half+brk,end=s+d,right=hm(end),[sh,sm]=hm(s);
    if(end%60<10)continue;
    return {
     prompt:`${game} has two halves of ${half} minutes each, with a break of ${brk} minutes between them. It starts at ${clock(s)}. At what time does it end?${ON_24}`,
     answer:clockAnswer(end),
     mistakes:fieldMistakes(right,[
      {value:hm(s+half+brk),why:`There are two halves, so ${half} minutes is counted twice.`},
      {value:hm(s+2*half),why:`The break of ${brk} minutes is part of the time too.`},
      sm+d%60>=60?{value:[sh+Math.floor(d/60),sm+d%60],why:`${sm+d%60} minutes is more than an hour. Take 60 minutes out and add 1 to the hours.`}:null,
      {value:[sh,sm+d],why:`${d} minutes is more than an hour. Write it as ${dur(d)} before you add it on.`}]),
     hint:'Find the total time in minutes first. Then write it in hours and minutes and add it to the start time.',
     steps:[
      {math:`2 * ${half} + ${brk} = ${d}`,note:'Add two halves and the break to get the total time in minutes.'},
      {math:`${d} min = ${dur(d)}`,note:'60 minutes make 1 hour.'},
      ...arriveSteps(s,d)],
     verify:clockClaims(`${sh}*60 + ${sm} + 2*${half} + ${brk}`)
    };
   }
  }}
 ]
});

/* ---------- Currency exchange ---------- */
/* Rates are held in hundredths so that every amount is exact to the cent. */
const CURS=[
 {name:'US dollars',short:'dollars',sym:'$',city:'New York',rates:[105,108,110,112,115,120,125]},
 {name:'pounds sterling',short:'pounds',sym:'£',city:'London',rates:[80,84,85,86,88,90]},
 {name:'Hungarian forint',short:'forint',sym:'',city:'Budapest',rates:[38000,39000,40000,41000]},
 {name:'Polish zloty',short:'zloty',sym:'',city:'Krakow',rates:[420,425,430,450]},
 {name:'Swiss francs',short:'francs',sym:'',city:'Zurich',rates:[94,95,96,98]},
 {name:'Canadian dollars',short:'Canadian dollars',sym:'',city:'Toronto',rates:[145,150,155,160]},
 {name:'Australian dollars',short:'Australian dollars',sym:'',city:'Sydney',rates:[160,165,170,175]}];
const cents=v=>Number.isInteger(v/100)?String(v/100):(v/100).toFixed(2);
const show=(c,v)=>c.sym?c.sym+cents(v):`${cents(v)} ${c.short}`;
const curAnswer=(c,v)=>c.sym?{type:'number',label:c.sym,value:cents(v)}:{type:'number',value:cents(v),unit:c.short};
const THINGS=['jacket','watch','guitar','tent','pair of boots','rucksack','camera'];
K.define({
 id:'currency-exchange',title:'Currency exchange',strand:STRAND,lesson:'04-05',
 blurb:'Multiply by the rate to leave euro, divide by the rate to come back.',
 levels:[
  {name:'Euro to another currency',make(rng){
   for(;;){
    const others=rng.shuffle(CURS).slice(0,3),c=others[rng.int(0,2)],rates=others.map(x=>rng.pick(x.rates)),r=rates[others.indexOf(c)];
    const euros=rng.pick([20,40,50,60,80,100,150,200,250,300,400,500]),who=rng.pick(NAMES),style=rng.pick(['cash','cash','price','table']),out=euros*r,thing=rng.pick(THINGS);
    const rate=`€1 = ${show(c,r)}`;
    return {
     prompt:style==='table'?`The table shows what €1 buys. ${who} changes €${euros} into ${c.name}. How much does ${who} get?`
      :style==='price'?`A ${thing} costs €${euros} in Dublin. The exchange rate is ${rate}. What is the price in ${c.name}?`
      :`${who} changes €${euros} into ${c.name}. The exchange rate is ${rate}. How much does ${who} get?`,
     ...(style==='table'?{table:{head:['Currency','€1 buys'],rows:others.map((x,i)=>[cap(x.name),show(x,rates[i])])}}:{}),
     answer:curAnswer(c,out),
     mistakes:numberMistakes(cents(out),[
      {value:frac(euros*100,r),why:`You divided by the rate. Each euro becomes ${show(c,r)}, so multiply the number of euro by ${cents(r)}.`},
      {value:cents(euros*100+r),why:`Adding the rate changes only one euro. Every one of the ${euros} euro becomes ${show(c,r)}, so multiply.`}]),
     hint:`Each euro becomes ${show(c,r)}. There are ${euros} euro.`,
     steps:[
      {math:rate,note:`The rate says what one euro is worth in ${c.short}.`},
      {math:`${euros} * ${cents(r)} = ${cents(out)}`,note:`There are ${euros} euro, so multiply the rate by ${euros}.`}],
     verify:{op:'value',expr:`${euros}*${r}/100`,equals:'ANSWER'}
    };
   }
  }},
  {name:'Back to euro',make(rng){
   for(;;){
    const who=rng.pick(NAMES),style=rng.pick(['back','back','price','flipped']);
    if(style==='flipped'){
     /* The rate is given for one unit of the other currency. */
     const [c,r]=rng.pick([[CURS[1],115],[CURS[1],116],[CURS[1],118],[CURS[1],120],[CURS[1],125],[CURS[0],80],[CURS[0],90],[CURS[0],92],[CURS[0],95]]),amount=rng.pick([20,40,50,60,80,100,150,200,250,300,400,500]),out=amount*r;
     return {
      prompt:`The exchange rate is ${c.sym}1 = €${cents(r)}. ${who} changes ${c.sym}${amount} into euro. How many euro does ${who} get?`,
      answer:{type:'number',label:'€',value:cents(out)},
      mistakes:numberMistakes(cents(out),[
       {value:frac(amount*100,r),why:`You divided. This rate already says what ${c.sym}1 is worth in euro, so multiply ${amount} by ${cents(r)}.`},
       {value:cents(amount*100+r),why:`Adding the rate changes only one of the ${c.short}. Every one becomes €${cents(r)}, so multiply.`}]),
      hint:`Read the rate carefully. It tells you what ${c.sym}1 is worth in euro.`,
      steps:[
       {math:`${c.sym}1 = €${cents(r)}`,note:`This rate is written for ${c.sym}1, not for €1. Each of the ${c.short} becomes €${cents(r)}.`},
       {math:`${amount} * ${cents(r)} = ${cents(out)}`,note:`There are ${amount} ${c.short}, so multiply the rate by ${amount}.`}],
      verify:{op:'value',expr:`${amount}*${r}/100`,equals:'ANSWER'}
     };
    }
    const c=rng.pick(CURS),r=rng.pick(c.rates),euros=rng.pick([20,40,50,60,80,100,150,200,250,300,400,500]),foreign=euros*r,rate=`€1 = ${show(c,r)}`,thing=rng.pick(THINGS);
    return {
     prompt:style==='price'?`A ${thing} costs ${show(c,foreign)} in ${c.city}. The exchange rate is ${rate}. What is the price in euro?`
      :`${who} comes home from ${c.city} with ${show(c,foreign)}. The exchange rate is ${rate}. How many euro does ${who} get for it?`,
     answer:{type:'number',label:'€',value:String(euros)},
     mistakes:numberMistakes(euros,[
      {value:frac(foreign*r,10000),why:`You multiplied. The rate ${rate} turns euro into ${c.short}. To go back from ${c.short} to euro, divide by ${cents(r)}.`},
      {value:frac(foreign-r,100),why:`Subtracting the rate does not change the currency. Divide the ${c.short} by ${cents(r)} to count how many euro they are worth.`}]),
     hint:`Every ${show(c,r)} is worth one euro. How many lots of ${cents(r)} are in ${cents(foreign)}?`,
     steps:[
      {math:rate,note:`Every ${show(c,r)} is worth one euro.`},
      {math:`${cents(foreign)} ÷ ${cents(r)} = ${euros}`,note:`Divide by the rate to count how many lots of ${cents(r)} are in ${cents(foreign)}.`},
      {math:`${euros} * ${cents(r)} = ${cents(foreign)}`,note:`Check: changing €${euros} at this rate gives the amount you started with.`}],
     verify:{op:'value',expr:`(${foreign}/100)/(${r}/100)`,equals:'ANSWER'}
    };
   }
  }},
  {name:'Offers and commission',make(rng){
   for(;;){
    const c=rng.pick(CURS.slice(0,2)),who=rng.pick(NAMES),style=rng.pick(['commission','offers','leftover']),euros=rng.pick([200,300,400,500,600,800,1000]),r=rng.pick(c.rates),rate=`€1 = ${show(c,r)}`;
    if(style==='commission'){
     const pc=rng.pick([1,2,3,4,5]),fee=euros*pc/100,left=euros-fee,out=left*r;
     return {
      prompt:`A bank changes euro into ${c.name} at ${rate}. It charges ${pc}% commission on the euro amount first. ${who} changes €${euros}. How much does ${who} get in ${c.short}?`,
      answer:curAnswer(c,out),
      mistakes:numberMistakes(cents(out),[
       {value:cents(euros*r),why:`That ignores the commission. The bank keeps ${pc}% of the €${euros} before it changes the rest.`},
       {value:cents((euros+fee)*r),why:`The commission is taken away from the euro amount, not added to it.`},
       {value:cents(fee*r),why:`That changes only the commission. Subtract the commission from €${euros} and change what is left.`},
       {value:String(left),why:`That is the euro amount after commission. Now change it into ${c.short}: multiply by ${cents(r)}.`}]),
      hint:`Work in two stages. First take ${pc}% off the euro amount. Then change what is left.`,
      steps:[
       {math:`${euros} * frac(${pc}, 100) = ${fee}`,note:`Find the commission: ${pc}% of €${euros}.`},
       {math:`${euros} - ${fee} = ${left}`,note:'Subtract the commission. This is the euro amount that gets changed.'},
       {math:`${left} * ${cents(r)} = ${cents(out)}`,note:`Each euro becomes ${show(c,r)}, so multiply by ${cents(r)}.`}],
      verify:{op:'value',expr:`(${euros} - ${euros}*${pc}/100)*${r}/100`,equals:'ANSWER'}
     };
    }
    if(style==='offers'){
     /* A better rate with a fee against a lower rate with no fee. */
     const fee=rng.pick([5,8,10,12,15,20]),r2=r-rng.pick([1,2,3,4]),a=(euros-fee)*r,b=euros*r2;
     if(a===b)continue;
     const best=a>b?'Bank A':'Bank B',worse=a>b?'Bank B':'Bank A';
     return {
      prompt:`${who} wants to change €${euros} into ${c.name}. Bank A offers ${rate} but first takes a fee of €${fee} out of the €${euros}. Bank B offers €1 = ${show(c,r2)} with no fee. Which bank gives ${who} more ${c.short}?`,
      answer:{type:'choice',options:[
       {text:best,value:frac(Math.max(a,b),100),correct:true},
       {text:worse,value:frac(Math.min(a,b),100),why:`Bank A gives ${show(c,a)} and Bank B gives ${show(c,b)}. ${a>b?'The fee costs less than the lower rate loses.':'The better rate does not make up for the fee.'} Work out both amounts before choosing.`},
       {text:'They give the same amount',why:`Work out both amounts. Bank A gives ${show(c,a)} and Bank B gives ${show(c,b)}.`}]},
      hint:'Work out how much each bank gives. For Bank A, take the fee off the euro amount first.',
      steps:[
       {math:`${euros} - ${fee} = ${euros-fee}`,note:'Bank A takes its fee first. This is the euro amount that gets changed.'},
       {math:`${euros-fee} * ${cents(r)} = ${cents(a)}`,note:`Bank A gives ${show(c,a)}.`},
       {math:`${euros} * ${cents(r2)} = ${cents(b)}`,note:`Bank B changes the full €${euros} and gives ${show(c,b)}.`},
       {math:`${cents(Math.max(a,b))} > ${cents(Math.min(a,b))}`,note:`${best} gives more ${c.short}.`}],
      verify:{op:'value',expr:`Max((${euros} - ${fee})*${r}/100, ${euros}*${r2}/100)`,equals:'ANSWER'}
     };
    }
    /* Change, spend, change the rest back. */
    const back=rng.pick([20,30,40,50,60,80,100]),got=euros*r,spent=(euros-back)*r,rest=back*r;
    return {
     prompt:`${who} changes €${euros} into ${c.name} at ${rate}. On holiday ${who} spends ${show(c,spent)}. The rest is changed back into euro at the same rate. How many euro does ${who} get back?`,
     answer:{type:'number',label:'€',value:String(back)},
     mistakes:numberMistakes(back,[
      {value:cents(rest),why:`That is the amount left in ${c.short}. Divide it by ${cents(r)} to change it back into euro.`},
      {value:frac(euros*100-spent,100),why:`€${euros} and ${show(c,spent)} are in different currencies, so they cannot be subtracted. Change the euro into ${c.short} first.`},
      {value:frac(rest*r,10000),why:`To go back from ${c.short} to euro, divide by ${cents(r)}. Multiplying changes euro into ${c.short}.`}]),
     hint:`Three stages: change the euro into ${c.short}, subtract what was spent, then change the rest back.`,
     steps:[
      {math:`${euros} * ${cents(r)} = ${cents(got)}`,note:`Change the euro into ${c.short}: multiply by the rate.`},
      {math:`${cents(got)} - ${cents(spent)} = ${cents(rest)}`,note:`Subtract what was spent. This is what is left, in ${c.short}.`},
      {math:`${cents(rest)} ÷ ${cents(r)} = ${back}`,note:'Divide by the rate to change the rest back into euro.'}],
     verify:{op:'value',expr:`(${euros}*${r}/100 - ${spent}/100)/(${r}/100)`,equals:'ANSWER'}
    };
   }
  }}
 ]
});

/* ---------- Inverse proportion ---------- */
const JOBS=[
 {n:'workers',one:'worker',task:'build a wall',unit:'days'},
 {n:'painters',one:'painter',task:'paint a school',unit:'days'},
 {n:'pumps',one:'pump',task:'empty a pool',unit:'hours'},
 {n:'taps',one:'tap',task:'fill a tank',unit:'minutes'},
 {n:'machines',one:'machine',task:'print an order of posters',unit:'hours'},
 {n:'pickers',one:'picker',task:'pick a field of strawberries',unit:'days'}];
const SITUATIONS=[
 ['The number of copies bought and the total cost.','direct','more copies cost more'],
 ['The time a tap runs and the amount of water in the bath.','direct','a longer time gives more water'],
 ['The hours worked and the pay, at a fixed hourly rate.','direct','more hours earn more pay'],
 ['The number of people a recipe feeds and the amount of flour needed.','direct','more people need more flour'],
 ['The distance driven and the petrol used, at a steady speed.','direct','a longer distance uses more petrol'],
 ['The number of tickets sold and the money taken in, at a fixed price.','direct','more tickets bring in more money'],
 ['The number of workers and the time to paint a fence.','inverse','more workers need less time'],
 ['The speed of a car and the time for a fixed journey.','inverse','a faster speed means less time'],
 ['The number of taps and the time to fill a tank.','inverse','more taps need less time'],
 ['The number of people sharing a prize and the amount each gets.','inverse','more people means a smaller share each'],
 ['The number of animals and the number of days a bag of feed lasts.','inverse','more animals finish the feed sooner'],
 ['The number of pages read each day and the number of days to finish a book.','inverse','more pages a day means fewer days']];
/* a things take t; how long do b things take? All the wording is passed in. */
function inverseQuestion({a,t,b,prompt,answer,things,one,label,up='more time',down='less time'}){
 const work=a*t,right=work/b,more=b>a;
 return {
  prompt,answer:answer(right),
  mistakes:numberMistakes(right,[
   {value:frac(t*b,a),why:`${more?'More':'Fewer'} ${things} means ${more?down:up}, not ${more?up:down}. This is inverse proportion: multiply ${a} by ${t} first, then divide by ${b}.`},
   {value:work,why:`That is the ${label} for 1 ${one}. Divide it by ${b}.`},
   t-(b-a)>0?{value:t-(b-a),why:`Changing the number of ${things} by ${Math.abs(b-a)} does not change the ${label} by ${Math.abs(b-a)}. Find the ${label} for 1 ${one} first.`}:null]),
  hint:`Find the ${label} for 1 ${one} first. Would that be more or less than for ${a} ${things}?`,
  steps:[
   {math:`${a} * ${t} = ${work}`,note:`With only 1 ${one} the ${label} is ${a} times as much, so multiply.`},
   {math:`${work} ÷ ${b} = ${right}`,note:`With ${b} ${things} the ${label} is shared out, so divide by ${b}.`},
   {math:`${b} * ${right} = ${work}`,note:`Check: the two numbers multiply to give ${work}, the same as \`${a} * ${t}\`.`}],
  verify:{op:'value',expr:`${a}*${t}/${b}`,equals:'ANSWER'}
 };
}
K.define({
 id:'inverse-proportion',title:'Inverse proportion',strand:STRAND,lesson:'12-01',
 blurb:'When one amount goes up the other goes down: multiply first, then divide.',
 levels:[
  {name:'More workers, less time',make(rng){
   for(;;){
    if(rng.chance(.25)){
     const [text,kind,because]=rng.pick(SITUATIONS),inverse=kind==='inverse';
     return {
      prompt:`Is this direct proportion or inverse proportion? ${text}`,
      answer:{type:'choice',options:[
       {text:inverse?'Inverse proportion':'Direct proportion',correct:true},
       {text:inverse?'Direct proportion':'Inverse proportion',why:inverse?`In direct proportion both amounts rise together. Here ${because}, so one rises as the other falls.`:`In inverse proportion one amount rises as the other falls. Here ${because}, so both rise together.`},
       {text:'Neither',why:`The two amounts are linked: ${because}. Decide whether they move the same way or opposite ways.`}]},
      hint:'Imagine the first amount doubles. Does the second amount double, or does it halve?',
      steps:[
       {note:`Ask what happens to the second amount when the first one gets bigger. Here ${because}.`},
       {note:inverse?'One amount goes up as the other goes down, so this is inverse proportion.':'Both amounts go up together, so this is direct proportion.'}],
      verify:{op:'none',reason:'The answer names the type of proportion in a described situation.'}
     };
    }
    const job=rng.pick(JOBS),a=rng.int(2,8),b=rng.int(2,12),t=rng.int(2,20);
    if(a===b||a*t%b!==0||a*t>160||a*t/b<2||t===a||t===b)continue;
    return inverseQuestion({a,t,b,things:job.n,one:job.one,label:'time',
     prompt:`${a} ${job.n} take ${t} ${job.unit} to ${job.task}. How long would ${b} ${job.n} take, working at the same rate?`,
     answer:v=>({type:'number',value:String(v),unit:job.unit})});
   }
  }},
  {name:'Speed, supplies and shares',make(rng){
   for(;;){
    const style=rng.pick(['speed','supplies','share','needed']);
    if(style==='speed'){
     const [v1,v2]=rng.shuffle([30,40,45,50,60,75,80,90,100,120]).slice(0,2),t1=rng.int(2,6),d=v1*t1,t2=d/v2;
     if(!Number.isInteger(t2*2)||t2<1)continue;
     const faster=v2>v1;
     return {
      prompt:`At ${v1} km/h a journey takes ${t1} hours. How long does the same journey take at ${v2} km/h?`,
      answer:{type:'number',value:String(t2),unit:'hours'},
      mistakes:numberMistakes(t2,[
       {value:frac(t1*v2,v1),why:`A ${faster?'faster':'slower'} speed means ${faster?'less':'more'} time, not ${faster?'more':'less'}. This is inverse proportion: find the distance first, then divide by the new speed.`},
       {value:d,why:`That is the distance in km. Divide it by ${v2} to get the time.`},
       {value:frac(v2,t1),why:'Find the distance first: multiply the first speed by the first time.'},
       Number.isInteger(t2)?null:{value:(Math.floor(t2)+.3).toFixed(1),why:`${Math.floor(t2)} hours 30 minutes is ${t2} hours, not ${Math.floor(t2)}.30 hours. Half an hour is 0.5 of an hour.`}]),
      hint:'The distance does not change. Find it from the first speed and time.',
      steps:[
       {math:`${v1} * ${t1} = ${d}`,note:'The distance is the same for both journeys. Multiply speed by time to find it.'},
       {math:`${d} ÷ ${v2} = ${t2}`,note:'Divide the distance by the new speed to get the new time.'},
       {math:`${v2} * ${t2} = ${d}`,note:`Check: the new speed and time give the same distance, ${d} km.`}],
      verify:{op:'value',expr:`${v1}*${t1}/${v2}`,equals:'ANSWER'}
     };
    }
    const a=rng.int(2,12),b=rng.int(2,15),t=rng.int(2,24);
    if(a===b||a*t%b!==0||a*t>240||a*t/b<2||t===a||t===b)continue;
    if(style==='supplies'){
     const [things,one,stuff]=rng.pick([['cows','cow','feed'],['horses','horse','hay'],['hens','hen','grain'],['campers','camper','food'],['dogs','dog','dog food']]);
     return inverseQuestion({a,t,b,things,one,label:'number of days',up:'more days',down:'fewer days',
      prompt:`There is enough ${stuff} to last ${a} ${things} for ${t} days. How many days would it last ${b} ${things}?`,
      answer:v=>({type:'number',value:String(v),unit:'days'})});
    }
    if(style==='share'){
     const x=t*5;
     return inverseQuestion({a,t:x,b,things:'winners',one:'winner',label:'amount',up:'a bigger amount each',down:'a smaller amount each',
      prompt:`A prize is shared equally among ${a} winners and each gets ${money(x)}. How much would each get if there were ${b} winners?`,
      answer:v=>({type:'number',label:'€',value:String(v)})});
    }
    /* How many are needed to finish in a different time? Here b is the new time. */
    const job=rng.pick(JOBS),need=a*t/b;
    return {
     prompt:`${a} ${job.n} take ${t} ${job.unit} to ${job.task}. How many ${job.n} are needed to do it in ${b} ${job.unit}?`,
     answer:{type:'number',value:String(need),unit:job.n},
     mistakes:numberMistakes(need,[
      {value:frac(a*b,t),why:`${b<t?'Less':'More'} time means ${b<t?'more':'fewer'} ${job.n}, not ${b<t?'fewer':'more'}. This is inverse proportion: multiply ${a} by ${t} first, then divide by ${b}.`},
      {value:a*t,why:`That is the number of ${job.n} needed to finish in 1 ${job.unit.slice(0,-1)}. Divide it by ${b}.`}]),
     hint:`Find the total amount of work first: ${a} ${job.n} for ${t} ${job.unit}.`,
     steps:[
      {math:`${a} * ${t} = ${a*t}`,note:`The job needs ${a*t} ${job.one}-${job.unit} of work in total.`},
      {math:`${a*t} ÷ ${b} = ${need}`,note:`Share that work over ${b} ${job.unit}: divide by ${b}.`},
      {math:`${need} * ${b} = ${a*t}`,note:'Check: the new numbers multiply to give the same total work.'}],
     verify:{op:'value',expr:`${a}*${t}/${b}`,equals:'ANSWER'}
    };
   }
  }},
  {name:'Exam style',make(rng){
   for(;;){
    const style=rng.pick(['extra','saved','decide']);
    if(style==='saved'){
     const [v1,v2]=rng.shuffle([40,45,50,60,75,80,90,100,120]).slice(0,2).sort((x,y)=>x-y),t1=rng.int(2,6),d=v1*t1,t2=d/v2,saved=(t1-t2)*60;
     if(!Number.isInteger(t2*4)||t2*2===t1)continue;
     return {
      prompt:`At ${v1} km/h a journey takes ${t1} hours. How many minutes are saved by travelling at ${v2} km/h instead?`,
      answer:{type:'number',value:String(saved),unit:'minutes'},
      mistakes:numberMistakes(saved,[
       {value:t2*60,why:'That is the new journey time in minutes. The question asks how much time is saved, so subtract it from the first time.'},
       {value:frac(d,v2),why:'That is the new journey time in hours. Subtract it from the first time, then change the answer to minutes.'},
       {value:frac(saved,60),why:'That is the time saved in hours. Multiply by 60 to change it to minutes.'},
       {value:frac(t1*v2*60,v1),why:'A faster speed means less time, not more. Find the distance first, then divide by the new speed.'}]),
      hint:'Find the distance, then the new time. The time saved is the difference between the two times.',
      steps:[
       {math:`${v1} * ${t1} = ${d}`,note:'The distance is the same for both journeys. Multiply speed by time to find it.'},
       {math:`${d} ÷ ${v2} = ${t2}`,note:'Divide the distance by the new speed to get the new time in hours.'},
       {math:`${t1} - ${t2} = ${t1-t2}`,note:'Subtract to find the time saved, in hours.'},
       {math:`${t1-t2} * 60 = ${saved}`,note:'Multiply by 60 to change hours to minutes.'}],
      verify:{op:'value',expr:`(${t1} - ${v1}*${t1}/${v2})*60`,equals:'ANSWER'}
     };
    }
    const job=rng.pick(JOBS),a=rng.int(2,12),t=rng.int(3,24),b=rng.int(2,20);
    if(style==='extra'){
     /* Here b is the shorter time allowed. */
     const need=a*t/b,extra=need-a;
     if(b>=t||!Number.isInteger(need)||a*t>300||extra<1||b===a)continue;
     return {
      prompt:`${a} ${job.n} take ${t} ${job.unit} to ${job.task}. The job must be done in ${b} ${job.unit}. How many extra ${job.n} are needed?`,
      answer:{type:'number',value:String(extra),unit:job.n},
      mistakes:numberMistakes(extra,[
       {value:need,why:`That is the total number of ${job.n} needed. The question asks for the extra ones, so subtract the ${a} already there.`},
       {value:frac(a*b,t),why:`Less time means more ${job.n}, not fewer. This is inverse proportion: multiply ${a} by ${t} first, then divide by ${b}.`},
       {value:t-b,why:`That is the number of ${job.unit} saved, not the number of ${job.n}. Find the total work first.`}]),
      hint:`Find the total work first. Then find how many ${job.n} are needed altogether, and compare with ${a}.`,
      steps:[
       {math:`${a} * ${t} = ${a*t}`,note:`The job needs ${a*t} ${job.one}-${job.unit} of work in total.`},
       {math:`${a*t} ÷ ${b} = ${need}`,note:`Share that work over ${b} ${job.unit}. This is the total number of ${job.n} needed.`},
       {math:`${need} - ${a} = ${extra}`,note:`There are ${a} ${job.n} already, so subtract to find the extra ones.`}],
      verify:{op:'value',expr:`${a}*${t}/${b} - ${a}`,equals:'ANSWER'}
     };
    }
    /* Decide first: direct or inverse? */
    if(a===b||t===a||t===b)continue;
    if(rng.chance(.5)){
     const made=a*t*5,right=b*t*5,item=rng.pick(['posters','boxes','bottles','parts']);
     return {
      prompt:`${a} machines make ${made} ${item} in one hour. How many ${item} do ${b} machines make in one hour, working at the same rate?`,
      answer:{type:'number',value:String(right),unit:item},
      mistakes:numberMistakes(right,[
       {value:frac(a*made,b),why:`${b>a?'More':'Fewer'} machines make ${b>a?'more':'fewer'} ${item} in the same time. This is direct proportion: divide by ${a}, then multiply by ${b}.`},
       {value:t*5,why:`That is what 1 machine makes. Multiply it by ${b}.`},
       {value:made*b,why:`That multiplies the amount for ${a} machines by ${b}. Find the amount for 1 machine first.`}]),
      hint:'Decide first: do more machines make more in an hour, or fewer? Then find the amount for 1 machine.',
      steps:[
       {note:'More machines make more in the same time. Both amounts rise together, so this is direct proportion.'},
       {math:`${made} ÷ ${a} = ${t*5}`,note:'Divide to find what 1 machine makes in one hour.'},
       {math:`${b} * ${t*5} = ${right}`,note:`Multiply by ${b} to find what ${b} machines make.`}],
      verify:{op:'value',expr:`${made}/${a}*${b}`,equals:'ANSWER'}
     };
    }
    if(a*t%b!==0||a*t>240||a*t/b<2)continue;
    const q=inverseQuestion({a,t,b,things:'machines',one:'machine',label:'time',
     prompt:`${a} machines take ${t} hours to fill an order. How long do ${b} machines take to fill the same order, working at the same rate?`,
     answer:v=>({type:'number',value:String(v),unit:'hours'})});
    return {...q,hint:'Decide first: do more machines take more time, or less? Then find the time for 1 machine.',
     steps:[{note:'More machines take less time for the same order. One amount rises as the other falls, so this is inverse proportion.'},...q.steps]};
   }
  }}
 ]
});
})();
