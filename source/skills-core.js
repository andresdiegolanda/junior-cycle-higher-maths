/* Skill drills: generated questions, exact answer checking and maths display.

   A skill has an id, a title, the lesson it belongs to and three levels. Each
   level has a make(rng) function that returns one question. The same seed always
   gives the same question, so a round can be replayed and tested.

   Text fields may contain inline maths between backticks. Maths is written in a
   small plain notation: x^2, x^{10}, frac(3x + 1, 4), sqrt(20), * for
   multiplication, - for minus, <= and >=. Unicode signs (−, ×, ÷, ², ≤) also work. */
const SkillKit=(()=>{
'use strict';

/* ---------- Random numbers: small, seeded and repeatable ---------- */
function makeRng(seed){
 let a=(seed>>>0)||1;
 const next=()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296};
 const rng={
  next,
  int:(lo,hi)=>lo+Math.floor(next()*(hi-lo+1)),
  pick:list=>list[Math.floor(next()*list.length)],
  chance:p=>next()<p,
  sign:()=>next()<.5?-1:1,
  /* A whole number in [lo, hi] that is not zero (and not in the optional avoid list). */
  nonzero(lo,hi,avoid=[]){for(let i=0;i<200;i++){const v=rng.int(lo,hi);if(v!==0&&!avoid.includes(v))return v}throw new Error('nonzero: no value in range')},
  shuffle(list){const out=[...list];for(let i=out.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out},
  /* n different whole numbers in [lo, hi]. */
  distinct(n,lo,hi,avoid=[]){const pool=[];for(let v=lo;v<=hi;v++)if(!avoid.includes(v))pool.push(v);if(pool.length<n)throw new Error('distinct: range too small');return rng.shuffle(pool).slice(0,n)}
 };
 return rng;
}

/* ---------- Exact fractions ---------- */
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a};
function Q(n,d=1){
 if(!Number.isFinite(n)||!Number.isFinite(d)||d===0)throw new Error('Invalid fraction');
 if(!Number.isInteger(n)||!Number.isInteger(d)){const scale=1e9;n=Math.round(n*scale);d=Math.round(d*scale)}
 if(d<0){n=-n;d=-d}
 const g=gcd(n,d)||1;return {n:n/g,d:d/g};
}
const qAdd=(a,b)=>Q(a.n*b.d+b.n*a.d,a.d*b.d),qSub=(a,b)=>Q(a.n*b.d-b.n*a.d,a.d*b.d),qMul=(a,b)=>Q(a.n*b.n,a.d*b.d),qDiv=(a,b)=>{if(b.n===0)throw new Error('Division by zero');return Q(a.n*b.d,a.d*b.n)};
const qEq=(a,b)=>a.n===b.n&&a.d===b.d,qNum=a=>a.n/a.d,qNeg=a=>Q(-a.n,a.d),qZero=a=>a.n===0;
const qStr=a=>a.d===1?String(a.n):a.n+'/'+a.d;
function clean(text){
 return String(text??'').replace(/[−–—]/g,'-').replace(/[×·∙]/g,'*').replace(/÷/g,'/').replace(/≤/g,'<=').replace(/≥/g,'>=').replace(/≠/g,'!=').replace(/[   ]/g,' ').trim();
}
const UNIT_WORD=/\s*(°c|degrees?|mm|cm|km|m|kg|g|ml|l|litres?|metres?|kilometres?|grams?|s|secs?|seconds?|mins?|minutes?|h|hrs?|hours?|days?|weeks?|years?|cents?|c|dollars?|pounds?|km\/h|m\/s|marks?)(²|³)?$/;
/* Reads what a student types for a number: 7, -3, 3.5, 7/2, 1 1/2, €12.50, 40%. */
function parseNumber(text,{units=[]}={}){
 let s=clean(text).toLowerCase();
 s=s.replace(/^[a-z]\s*=\s*/,'').replace(/^\+\s*/,'').replace(/^(-?)\s*frac\(\s*(-?\d+)\s*,\s*(\d+)\s*\)$/,'$1$2/$3');
 for(const unit of [...units].sort((a,b)=>b.length-a.length)){const u=String(unit).toLowerCase();if(u&&s.endsWith(u)){s=s.slice(0,-u.length).trim();break}}
 s=s.replace(/^[€£$]\s*/,'').replace(/\s*(%|°|€|euro|euros)$/,'').trim();
 /* A box that shows its unit accepts the number with any unit word typed after it: "45 minutes". */
 if(units.length&&/^-?[\d.,/ ]*\d\s*[a-z°²³]+(\s*(\/|per)\s*[a-z]+)?$/.test(s))s=s.replace(/\s*[a-z°²³]+(\s*(\/|per)\s*[a-z]+)?$/,'').trim();
 /* Any other box still accepts a common unit after the number: "20 m", "−3°C", "10 min". */
 else if(/^-?[\d.,/ ]*\d\s*[a-z°]/.test(s))s=s.replace(UNIT_WORD,'').trim();
 if(/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s))s=s.replace(/,/g,'');
 let m=s.match(/^(-?)\s*(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
 if(m&&+m[4]!==0){const whole=Q(+m[2]),part=Q(+m[3],+m[4]),v=qAdd(whole,part);return {q:m[1]?qNeg(v):v,form:'mixed',raw:{n:+m[3],d:+m[4]}}}
 m=s.match(/^(-?)\s*(\d+)\s*\/\s*(-?)\s*(\d+)$/);
 if(m&&+m[4]!==0){const negative=(m[1]==='-')!==(m[3]==='-');return {q:Q(negative?-m[2]:+m[2],+m[4]),form:'fraction',raw:{n:+m[2],d:+m[4]}}}
 m=s.match(/^-?\s*(\d+\.?\d*|\.\d+)$/);
 if(m){const v=Number(s.replace(/\s/g,''));if(!Number.isFinite(v))return null;const decimals=(s.split('.')[1]||'').length;return {q:Q(Math.round(v*10**decimals),10**decimals),form:decimals?'decimal':'integer',decimals}}
 return null;
}

/* ---------- Polynomials with exact coefficients ---------- */
const SUPERS={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
function tokenize(text){
 let s=clean(text).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g,m=>'^'+[...m].map(c=>SUPERS[c]).join(''));
 s=s.replace(/\^\{([^{}]*)\}/g,'^($1)');
 /* frac(a, b) is the display notation for (a)/(b). */
 for(let at=s.indexOf('frac(');at>=0;at=s.indexOf('frac(')){const [parts,end]=callParts(s,at+4);if(!parts||parts.length!==2)throw new Error('I could not read that fraction.');s=s.slice(0,at)+'(('+parts[0]+')/('+parts[1]+'))'+s.slice(end)}
 const tokens=[];let i=0;
 while(i<s.length){
  const c=s[i];
  if(c===' '){i++;continue}
  if(/\d|\./.test(c)){let j=i;while(j<s.length&&/[\d.]/.test(s[j]))j++;const text=s.slice(i,j);if(!/^(\d+\.?\d*|\.\d+)$/.test(text))throw new Error('I could not read the number "'+text+'".');tokens.push({t:'num',v:text,start:i,end:j});i=j;continue}
  if(/[a-zA-Z]/.test(c)){tokens.push({t:'var',v:c,start:i,end:i+1});i++;continue}
  if('+-*/^()'.includes(c)){tokens.push({t:c,start:i,end:i+1});i++;continue}
  throw new Error('I could not read the symbol "'+c+'".');
 }
 return tokens;
}
/* Grammar: sum of terms; a term is a product of factors (written with * or side by side);
   a factor may carry a whole-number power. A letter followed directly by a digit, as in
   x2, is read as a power, because that is how it is usually typed on a phone. */
function parseExpr(text){
 const tokens=tokenize(text);let pos=0;
 const peek=()=>tokens[pos],take=()=>tokens[pos++];
 function expression(){
  const items=[];let sign=1;
  if(peek()?.t==='-'){take();sign=-1}else if(peek()?.t==='+')take();
  items.push({sign,node:term()});
  while(peek()&&(peek().t==='+'||peek().t==='-')){const s=take().t==='-'?-1:1;items.push({sign:s,node:term()})}
  return items.length===1&&items[0].sign===1?items[0].node:{t:'add',items};
 }
 function term(){
  const parts=[factor()];
  for(;;){
   const next=peek();
   if(!next)break;
   if(next.t==='*'){take();parts.push(factor());continue}
   if(next.t==='/'){take();const divisor=factor();const left=parts.length===1?parts[0]:{t:'mul',items:[...parts]};parts.length=0;parts.push({t:'div',a:left,b:divisor});continue}
   if(next.t==='num'||next.t==='var'||next.t==='('){parts.push(factor());continue}
   break;
  }
  return parts.length===1?parts[0]:{t:'mul',items:parts};
 }
 function factor(){
  const base=atom();
  if(peek()?.t==='^'){take();let negative=false;if(peek()?.t==='-'){take();negative=true}
   let exponent;
   if(peek()?.t==='('){take();if(peek()?.t==='-'){take();negative=!negative}const n=take();if(n?.t!=='num'||take()?.t!==')')throw new Error('A power here must be a whole number.');exponent=n.v}
   else{const n=take();if(n?.t!=='num')throw new Error('A power here must be a whole number.');exponent=n.v}
   if(negative||!/^\d+$/.test(exponent)||+exponent>12)throw new Error('A power here must be a whole number from 0 to 12.');
   return {t:'pow',base,exp:+exponent};
  }
  if(base.t==='var'&&base.adjacent&&peek()?.t==='num'&&/^[2-9]$/.test(peek().v))return {t:'pow',base,exp:+take().v};
  return base;
 }
 function atom(){
  const token=take();
  if(!token)throw new Error('The expression stops too early.');
  if(token.t==='num'){const decimals=(token.v.split('.')[1]||'').length;return {t:'num',q:Q(Math.round(Number(token.v)*10**decimals),10**decimals)}}
  if(token.t==='var'){const next=peek();return {t:'var',name:token.v,adjacent:next?.t==='num'&&token.end===next.start}}
  if(token.t==='('){const inner=expression();if(take()?.t!==')')throw new Error('A bracket is not closed.');return {t:'group',a:inner}}
  if(token.t==='-')return {t:'neg',a:factor()};
  if(token.t==='+')return factor();
  throw new Error('I could not read that expression.');
 }
 if(!tokens.length)throw new Error('Type an answer first.');
 const tree=expression();
 if(pos<tokens.length)throw new Error(tokens[pos].t===')'?'There is a closing bracket without an opening one.':'I could not read that expression.');
 return tree;
}
/* A polynomial is a Map from a monomial key such as "x^2*y" ("" for a constant) to a fraction. */
const monoKey=powers=>Object.keys(powers).filter(v=>powers[v]).sort().map(v=>powers[v]===1?v:v+'^'+powers[v]).join('*');
const monoPowers=key=>Object.fromEntries(key?key.split('*').map(part=>{const [v,e]=part.split('^');return [v,e?+e:1]}):[]);
const monoDegree=key=>Object.values(monoPowers(key)).reduce((a,b)=>a+b,0);
function pAddTerm(poly,key,q){const sum=poly.has(key)?qAdd(poly.get(key),q):q;if(qZero(sum))poly.delete(key);else poly.set(key,sum);return poly}
const pConst=q=>pAddTerm(new Map(),'',q);
function pAdd(a,b,sign=1){const out=new Map(a);for(const [k,q]of b)pAddTerm(out,k,sign===1?q:qNeg(q));return out}
function pMul(a,b){const out=new Map();for(const [ka,qa]of a)for(const [kb,qb]of b){const powers=monoPowers(ka);for(const [v,e]of Object.entries(monoPowers(kb)))powers[v]=(powers[v]||0)+e;pAddTerm(out,monoKey(powers),qMul(qa,qb))}return out}
function pEq(a,b){if(a.size!==b.size)return false;for(const [k,q]of a){const other=b.get(k);if(!other||!qEq(q,other))return false}return true}
const pIsConst=p=>p.size===0||p.size===1&&p.has('');
function toPoly(node){
 switch(node.t){
  case 'num':return pConst(node.q);
  case 'var':return pAddTerm(new Map(),node.name,Q(1));
  case 'group':return toPoly(node.a);
  case 'neg':return pMul(pConst(Q(-1)),toPoly(node.a));
  case 'add':return node.items.reduce((sum,item)=>pAdd(sum,toPoly(item.node),item.sign),new Map());
  case 'mul':return node.items.reduce((product,item)=>pMul(product,toPoly(item)),pConst(Q(1)));
  case 'pow':{let out=pConst(Q(1));const base=toPoly(node.base);for(let i=0;i<node.exp;i++)out=pMul(out,base);return out}
  case 'div':{const divisor=toPoly(node.b);if(!pIsConst(divisor)||divisor.size===0)throw new Error('I can only divide by a number here.');return pMul(toPoly(node.a),pConst(qDiv(Q(1),divisor.get(''))))}
 }
 throw new Error('Unknown expression');
}
/* An expression with letters below the line, as one fraction of two polynomials. */
function toRational(node){
 const one=pConst(Q(1));
 switch(node.t){
  case 'num':return {n:pConst(node.q),d:one};
  case 'var':return {n:pAddTerm(new Map(),node.name,Q(1)),d:one};
  case 'group':return toRational(node.a);
  case 'neg':{const r=toRational(node.a);return {n:pMul(pConst(Q(-1)),r.n),d:r.d}}
  case 'add':return node.items.reduce((sum,item)=>{const r=toRational(item.node);return {n:pAdd(pMul(sum.n,r.d),pMul(r.n,sum.d),item.sign),d:pMul(sum.d,r.d)}},{n:new Map(),d:one});
  case 'mul':return node.items.reduce((product,item)=>{const r=toRational(item);return {n:pMul(product.n,r.n),d:pMul(product.d,r.d)}},{n:one,d:one});
  case 'pow':{let out={n:one,d:one};const base=toRational(node.base);for(let i=0;i<node.exp;i++)out={n:pMul(out.n,base.n),d:pMul(out.d,base.d)};return out}
  case 'div':{const a=toRational(node.a),b=toRational(node.b);if(b.n.size===0)throw new Error('You cannot divide by zero.');return {n:pMul(a.n,b.d),d:pMul(a.d,b.n)}}
 }
 throw new Error('Unknown expression');
}
const rational=text=>toRational(parseExpr(text));
const rEq=(a,b)=>pEq(pMul(a.n,b.d),pMul(b.n,a.d));
const pDegree=p=>Math.max(0,...[...p.keys()].map(monoDegree));
/* Equal as expressions, with or without letters below the line. */
function sameExpr(a,b){try{return pEq(poly(a),poly(b))}catch{try{return rEq(rational(a),rational(b))}catch{return false}}}
/* Terms in a fixed order: highest total power first, then alphabetical. */
function sortedTerms(poly){return [...poly.entries()].sort((a,b)=>monoDegree(b[0])-monoDegree(a[0])||a[0].localeCompare(b[0]))}
function polyStr(poly){
 const terms=sortedTerms(poly);if(!terms.length)return '0';
 return terms.map(([key,q],i)=>{
  const negative=q.n<0,size=Q(Math.abs(q.n),q.d),letters=key.replace(/\*/g,'');
  let body;
  if(!key)body=qStr(size);
  else if(size.d!==1)body=(size.n===1?'':size.n)+letters+'/'+size.d;
  else body=(size.n===1?'':size.n)+letters;
  return i===0?(negative?'-':'')+body:(negative?' - ':' + ')+body;
 }).join('');
}
const poly=text=>toPoly(parseExpr(text));
const expand=text=>polyStr(poly(text));
function evalAt(text,values){
 let total=Q(0);
 for(const [key,q]of poly(text)){let term=q;for(const [v,e]of Object.entries(monoPowers(key))){if(!(v in values))throw new Error('No value for '+v);const value=typeof values[v]==='object'?values[v]:parseNumber(String(values[v])).q;for(let i=0;i<e;i++)term=qMul(term,value)}total=qAdd(total,term)}
 return total;
}

/* ---------- The shape of a typed expression ---------- */
const unwrap=node=>{while(node.t==='group')node=node.a;return node};
const isSum=node=>{const n=unwrap(node);return n.t==='add'&&n.items.length>1};
function isConstant(node){try{return pIsConst(toPoly(node))}catch{return false}}
/* True when a bracket holding a sum is still multiplied, divided, subtracted or raised to a power. */
function hasBracketedSum(node){
 const n=unwrap(node);
 switch(n.t){
  case 'add':return n.items.some(item=>item.sign===-1&&isSum(item.node)||hasBracketedSum(item.node));
  case 'mul':return n.items.some(item=>isSum(item)||hasBracketedSum(item));
  case 'pow':return isSum(n.base)||hasBracketedSum(n.base);
  case 'neg':return isSum(n.a)||hasBracketedSum(n.a);
  case 'div':return isSum(n.a)||isSum(n.b)||hasBracketedSum(n.a)||hasBracketedSum(n.b);
 }
 return false;
}
/* A tidy term has at most one number in front and each letter once: 6x^2, not 2*3x or x*x. */
function termIsTidy(node){
 let numbers=0;const letters={};
 const walk=item=>{const n=unwrap(item);
  if(n.t==='num')numbers++;
  else if(n.t==='var')letters[n.name]=(letters[n.name]||0)+1;
  else if(n.t==='pow'&&unwrap(n.base).t==='var')letters[unwrap(n.base).name]=(letters[unwrap(n.base).name]||0)+1;
  else if(n.t==='neg')walk(n.a);
  else if(n.t==='mul')n.items.forEach(walk);
  else if(n.t==='div'&&isConstant(n.b))walk(n.a);
  else if(n.t==='add'&&n.items.length===1)walk(n.items[0].node);
  else numbers+=2};
 walk(node);
 return numbers<=1&&Object.values(letters).every(count=>count===1);
}
function topTerms(node){const n=unwrap(node);return n.t==='add'&&n.items.length>1?n.items.flatMap(item=>topTerms(item.node)):[n]}
/* Content (a number) and the list of non-constant factors of a typed product. */
function factorList(node){
 const n=unwrap(node);
 const merge=lists=>lists.reduce((a,b)=>({content:qMul(a.content,b.content),factors:[...a.factors,...b.factors],raw:[...a.raw,...b.raw]}),{content:Q(1),factors:[],raw:[]});
 if(n.t==='neg'){const inner=factorList(n.a);return {...inner,content:qNeg(inner.content)}}
 if(n.t==='add'&&n.items.length===1){const inner=factorList(n.items[0].node);return n.items[0].sign===-1?{...inner,content:qNeg(inner.content)}:inner}
 if(n.t==='mul')return merge(n.items.map(factorList));
 if(n.t==='pow'){const inner=factorList(n.base);let out={content:Q(1),factors:[],raw:[]};for(let i=0;i<n.exp;i++)out=merge([out,inner]);return out}
 if(n.t==='div'&&isConstant(n.b)){const inner=factorList(n.a),divisor=toPoly(n.b).get('');return {...inner,content:qDiv(inner.content,divisor)}}
 const p=toPoly(n);
 if(pIsConst(p))return {content:p.get('')||Q(0),factors:[],raw:[]};
 if(p.size===1){const [[key,q]]=[...p.entries()];const factors=[];for(const [v,e]of Object.entries(monoPowers(key)))for(let i=0;i<e;i++)factors.push(v);return {content:q,factors,raw:[]}}
 const {scale,primitive}=primitivePart(p);
 return {content:scale,factors:[polyStr(primitive)],raw:[{text:polyStr(p),scale}]};
}
/* Divide out the common numerical factor and make the leading coefficient positive. */
function primitivePart(p){
 const terms=sortedTerms(p);let numerator=0,denominator=1;
 for(const [,q]of terms){numerator=gcd(numerator,q.n);denominator=denominator*q.d/gcd(denominator,q.d)}
 let scale=Q(numerator,denominator);if(terms[0][1].n<0)scale=qNeg(scale);
 const primitive=new Map();for(const [k,q]of p)primitive.set(k,qDiv(q,scale));
 return {scale,primitive};
}
function sameFactors(a,b){const x=[...a].sort(),y=[...b].sort();return x.length===y.length&&x.every((v,i)=>v===y[i])}

/* ---------- Checking answers ---------- */
const FORM_HELP={
 simplified:'That has the right value, but it is not finished. Multiply out any brackets and collect the like terms.',
 factorised:'That has the right value, but it is not fully factorised. Write it as a product of brackets, with any common factor taken out.',
 unfactored:'That is equal to the expression, but the question asks you to factorise it. Write it as factors multiplied together.',
 oneFraction:'That has the right value, but it is not one fraction yet. Write one top over one bottom.',
 tidyTop:'That has the right value. Now tidy the top: multiply out any brackets and collect the like terms.',
 brackets:'Check your brackets. Put the whole top in brackets and the whole bottom in brackets, like (top)/(bottom). The line under the box shows how your answer was read.'
};
/* Where the only / outside brackets is in a typed answer, or -1 when there is none or more than one. */
function topSlash(text){
 let depth=0,at=-1;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='(')depth++;else if(c===')')depth--;else if(c==='/'&&depth===0){if(at>=0)return -1;at=i}}
 return at;
}
/* The top and bottom of a typed single fraction, or null when it is more than one fraction. */
function singleFraction(tree){
 let n=unwrap(tree),divisions=0;
 while(n.t==='neg'||n.t==='add'&&n.items.length===1)n=unwrap(n.t==='neg'?n.a:n.items[0].node);
 const count=node=>{const m=unwrap(node);
  if(m.t==='div'){divisions++;count(m.a);count(m.b)}
  else if(m.t==='neg')count(m.a);
  else if(m.t==='pow')count(m.base);
  else if(m.t==='mul')m.items.forEach(count);
  else if(m.t==='add')m.items.forEach(item=>count(item.node))};
 count(n);
 if(isSum(n)||divisions>1)return null;
 return n.t==='div'?{top:n.a,bottom:n.b}:{top:n,bottom:null};
}
/* An answer with letters below the line: equal in value, one fraction, nothing left to cancel. */
function checkRational(answer,input){
 let tree,typed;
 try{tree=parseExpr(input);typed=toRational(tree)}catch(e){return {correct:false,invalid:true,feedback:e.message}}
 const target=rational(answer.value);
 if(typed.d.size===0)return {correct:false,invalid:true,feedback:'You cannot divide by zero.'};
 if(!rEq(typed,target)){
  /* The right fraction typed without brackets round its top or its bottom is read as something else: say so, without using up a try. */
  const at=topSlash(input);
  if(at>0){try{if(rEq(rational(`(${input.slice(0,at)})/(${input.slice(at+1)})`),target))return {correct:false,close:true,feedback:FORM_HELP.brackets}}catch{}}
  return {correct:false};
 }
 /* When no letter is left below the line, the answer is an ordinary expression: a simplified one, or one fraction over a number. */
 if(pIsConst(target.d)){
  try{toPoly(tree)}catch{return {correct:false,close:true,feedback:'Right value. Now cancel the factor that the top and the bottom share.'}}
  const whole=target.d.get('');
  return checkExpr({...answer,form:whole.n===1&&whole.d===1?'simplified':'fraction'},input);
 }
 const parts=singleFraction(tree);
 if(!parts)return {correct:false,close:true,feedback:FORM_HELP.oneFraction};
 let top,bottom;
 try{top=toPoly(parts.top);bottom=parts.bottom?toPoly(parts.bottom):pConst(Q(1))}catch{return {correct:false,close:true,feedback:FORM_HELP.oneFraction}}
 /* A sum on the top or the bottom must be collected; a product of brackets is fine as it is. */
 const collected=(node,p)=>{if(!isSum(node))return true;const list=topTerms(node);return list.length===p.size&&list.every(termIsTidy)&&!hasBracketedSum(node)};
 if(!collected(parts.top,top)||parts.bottom&&!collected(parts.bottom,bottom))return {correct:false,close:true,feedback:'That has the right value. Now collect the like terms on the top and on the bottom.'};
 if(pDegree(top)>pDegree(target.n)||pDegree(bottom)>pDegree(target.d))return {correct:false,close:true,feedback:'Right value. Now cancel the factor that the top and the bottom share.'};
 const key=[...target.n.keys()][0];
 if(key!==undefined&&top.has(key)){const scale=qDiv(top.get(key),target.n.get(key));if(scale.d===1&&Math.abs(scale.n)>1)return {correct:false,close:true,feedback:'Right value. Now divide the top and the bottom by '+Math.abs(scale.n)+'.'}}
 return {correct:true};
}
function checkExpr(answer,input){
 if(answer.form==='rational')return checkRational(answer,input);
 let tree,typed;
 try{tree=parseExpr(input);typed=toPoly(tree)}catch(e){return {correct:false,invalid:true,feedback:e.message}}
 const target=poly(answer.value);
 if(!pEq(typed,target)){
  /* (x + 7)2 typed for a squared bracket: say how to type the power, without using up a try. */
  const powered=clean(input).replace(/\)\s*([23])(?![\d.^])/g,')^$1');
  if(powered!==clean(input)){try{if(pEq(poly(powered),target))return {correct:false,close:true,feedback:'To write a power on a bracket, use the x² key or type ^2 straight after the bracket.'}}catch{}}
  return {correct:false};
 }
 const form=answer.form||'simplified';
 if(form==='any')return {correct:true};
 if(form==='fraction'){
  const parts=singleFraction(tree);
  if(!parts||!parts.bottom&&hasBracketedSum(parts.top))return {correct:false,close:true,feedback:FORM_HELP.oneFraction};
  const terms=topTerms(parts.top);let top;
  try{top=toPoly(parts.top)}catch{return {correct:false,close:true,feedback:FORM_HELP.oneFraction}}
  if(hasBracketedSum(parts.top)||terms.length!==top.size||!terms.every(termIsTidy))return {correct:false,close:true,feedback:FORM_HELP.tidyTop};
  if(parts.bottom&&isConstant(parts.bottom)){
   const bottom=toPoly(parts.bottom).get('')||Q(1);let common=bottom.d===1?Math.abs(bottom.n):1;
   for(const [,q]of top)common=q.d===1?gcd(common,q.n):1;
   if(common>1)return {correct:false,close:true,feedback:'Right value. Now divide the top and the bottom by '+common+' to write the fraction in its simplest form.'};
  }
  return {correct:true};
 }
 if(form==='simplified'){
  const terms=topTerms(tree);
  if(hasBracketedSum(tree)||terms.length!==typed.size&&!(typed.size===0&&terms.length===1)||!terms.every(termIsTidy))return {correct:false,close:true,feedback:FORM_HELP.simplified};
  return {correct:true};
 }
 if(form==='factorised'){
  const wanted=factorList(parseExpr(answer.value)),got=factorList(tree);
  if(got.factors.length===1&&got.raw.length===1&&wanted.factors.length>=2&&!['mul','neg','pow'].includes(unwrap(tree).t))return {correct:false,close:true,feedback:FORM_HELP.unfactored};
  const leftover=got.raw.some(f=>!(f.scale.n===1&&f.scale.d===1)&&!(f.scale.n===-1&&f.scale.d===1));
  if(leftover||!sameFactors(got.factors,wanted.factors))return {correct:false,close:true,feedback:FORM_HELP.factorised};
  return {correct:true};
 }
 return {correct:true};
}
function roundTo(value,places){const scale=10**places;return Math.round((value+Number.EPSILON*Math.sign(value))*scale)/scale}
function checkNumber(answer,input){
 const parsed=parseNumber(input,{units:answer.unit?[answer.unit,...(answer.units||[])]:answer.units||[]});
 if(!parsed)return {correct:false,invalid:true,feedback:'Type a number, such as 7, −3, 2.5 or 3/4.'};
 const target=parseNumber(String(answer.value)).q;
 if(Number.isInteger(answer.round)){
  const wanted=roundTo(qNum(target),answer.round),typed=qNum(parsed.q);
  if(Math.abs(typed-wanted)<1e-9)return {correct:true};
  if(Math.abs(typed-qNum(target))<=10**-answer.round)return {correct:false,close:true,near:true,feedback:'Very close. Check the rounding: the answer should be '+(answer.round===0?'correct to the nearest whole number':'correct to '+answer.round+' decimal place'+(answer.round===1?'':'s'))+'.'};
  return {correct:false};
 }
 if(!qEq(parsed.q,target))return {correct:false};
 if(answer.simplest&&parsed.form==='fraction'&&gcd(parsed.raw.n,parsed.raw.d)>1)return {correct:false,close:true,feedback:'Right value. Now write the fraction in its simplest form.'};
 return {correct:true};
}
function checkFields(answer,inputs){
 const fields=answer.fields,values=[],parsedFields=[];
 for(let i=0;i<fields.length;i++){const p=parseNumber(inputs[i]??'',{units:fields[i].unit?[fields[i].unit]:[]});if(!p)return {correct:false,invalid:true,feedback:'Fill in every box with a number.'};values.push(p.q);parsedFields.push(p)}
 const targets=fields.map(f=>parseNumber(String(f.value)).q);
 const lowest=()=>answer.simplest&&parsedFields.some(p=>p.form==='fraction'&&gcd(p.raw.n,p.raw.d)>1)?{correct:false,close:true,feedback:'Right value. Now write each fraction in its simplest form.'}:{correct:true};
 if(answer.unordered){
  const left=[...targets];
  for(const v of values){const i=left.findIndex(t=>qEq(t,v));if(i<0)return {correct:false};left.splice(i,1)}
  return lowest();
 }
 if(values.every((v,i)=>qEq(v,targets[i])))return lowest();
 if(answer.ratio&&values.every(v=>!qZero(v))){
  const k=qDiv(values[0],targets[0]);
  if(values.every((v,i)=>qEq(qDiv(v,targets[i]),k)))return {correct:false,close:true,feedback:'That ratio is equivalent, but it is not in its simplest form. Divide every part by their highest common factor.'};
 }
 return {correct:false};
}
const FLIP={'<':'>','>':'<','<=':'>=','>=':'<='};
function checkInequality(answer,input){
 const parsed=parseNumber(input?.value??'');
 if(!parsed||!FLIP[input?.op])return {correct:false,invalid:true,feedback:'Choose a sign and type a number.'};
 const target=parseNumber(String(answer.value)).q,same=qEq(parsed.q,target);
 if(same&&input.op===answer.op)return answer.simplest&&parsed.form==='fraction'&&gcd(parsed.raw.n,parsed.raw.d)>1?{correct:false,close:true,feedback:'Right value. Now write the fraction in its simplest form.'}:{correct:true};
 if(same&&input.op===FLIP[answer.op])return {correct:false,close:true,feedback:'The number is right but the sign points the wrong way. The sign turns around only when you multiply or divide both sides by a negative number. Check what you divided by.'};
 if(same)return {correct:false,close:true,feedback:'The number is right. Check whether the endpoint itself is included: < and > leave it out, ≤ and ≥ include it.'};
 return {correct:false};
}
/* Returns {correct, close?, invalid?, feedback?}. A matching known mistake adds its explanation. */
function check(question,input){
 const answer=question.answer;let result;
 /* A phone keyboard often starts with a capital: X + 3 is read as x + 3 unless the answer itself uses capitals. */
 if(answer.type==='expr'&&typeof input==='string'&&!/[A-Z]/.test(answer.value))input=input.toLowerCase();
 /* "y = 3x - 1" typed into a box that already says "y =": read what follows the equals sign. */
 if(answer.type==='expr'&&typeof input==='string'&&answer.label)input=input.replace(/^\s*([a-z])\s*=\s*/i,(all,letter)=>answer.label.trim().toLowerCase().startsWith(letter.toLowerCase())?'':all);
 if(answer.type==='choice'){const option=answer.options[input];if(!option)return {correct:false,invalid:true,feedback:'Choose an answer.'};return {correct:!!option.correct,feedback:option.correct?null:option.why||null}}
 if(answer.type==='expr')result=checkExpr(answer,input);
 else if(answer.type==='number')result=checkNumber(answer,input);
 else if(answer.type==='fields')result=checkFields(answer,input);
 else if(answer.type==='inequality')result=checkInequality(answer,input);
 else throw new Error('Unknown answer type '+answer.type);
 if(!result.correct&&!result.invalid&&(!result.feedback||result.near)){
  for(const mistake of question.mistakes||[]){
   let hit=false;
   try{
    if(answer.type==='expr')hit=sameExpr(input,mistake.value);
    else if(answer.type==='number'){
     const read=parseNumber(input,{units:answer.unit?[answer.unit,...(answer.units||[])]:answer.units||[]}),typed=read.q,slip=parseNumber(String(mistake.value)).q;
     /* A slip is also recognised from its rounded value: to the places asked for, or to the places typed. */
     hit=qEq(typed,slip)||Number.isInteger(answer.round)&&Math.abs(qNum(typed)-roundTo(qNum(slip),answer.round))<1e-9
      ||read.form==='decimal'&&slip.d!==1&&Math.abs(qNum(typed)-qNum(slip))<=.5*10**-read.decimals+1e-12;
    }
    else if(answer.type==='fields')hit=[].concat(mistake.value).every((v,i)=>qEq(parseNumber(input[i]).q,parseNumber(String(v)).q));
    else if(answer.type==='inequality')hit=(mistake.op===undefined||mistake.op===input.op)&&qEq(parseNumber(input.value).q,parseNumber(String(mistake.value)).q);
   }catch{hit=false}
   if(hit){result.feedback=mistake.why;if(result.near){delete result.near;delete result.close}break}
  }
 }
 return result;
}

/* ---------- Showing and reading maths ---------- */
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* Splits "frac(a, b)" style calls, respecting nested brackets. Returns [inside parts, index after]. */
function callParts(s,start){
 let depth=0,part='';const parts=[];
 for(let i=start;i<s.length;i++){
  const c=s[i];
  if(c==='('||c==='{'){if(depth++)part+=c;continue}
  if(c===')'||c==='}'){if(--depth===0){parts.push(part.trim());return [parts,i+1]}part+=c;continue}
  if(c===','&&depth===1){parts.push(part.trim());part='';continue}
  part+=c;
 }
 return [null,start];
}
function transformMaths(source,build){
 let s=String(source??''),out='';
 for(let i=0;i<s.length;){
  if(s.startsWith('frac(',i)){const [parts,end]=callParts(s,i+4);if(parts&&parts.length===2){out+=build.frac(transformMaths(parts[0],build),transformMaths(parts[1],build));i=end;continue}}
  if(s.startsWith('sqrt(',i)){const [parts,end]=callParts(s,i+4);if(parts&&parts.length===1){out+=build.sqrt(transformMaths(parts[0],build));i=end;continue}}
  if(s[i]==='^'){
   if(s[i+1]==='{'||s[i+1]==='('){const [parts,end]=callParts(s,i+1);if(parts){out+=build.power(transformMaths(parts.join(', '),build),parts.join(', '));i=end;continue}}
   const m=s.slice(i+1).match(/^-?[A-Za-z0-9.]+/);
   if(m){out+=build.power(transformMaths(m[0],build),m[0]);i+=1+m[0].length;continue}
  }
  const two=s.slice(i,i+2);
  if(two==='<='||two==='>='||two==='!='){out+=build.symbol({'<=':'≤','>=':'≥','!=':'≠'}[two]);i+=2;continue}
  if(s[i]==='*'){out+=build.symbol('×');i++;continue}
  if(s[i]==='-'){out+=build.symbol('−');i++;continue}
  out+=build.text(s[i]);i++;
 }
 return out;
}
const HTML_BUILD={frac:(a,b)=>`<span class="sk-frac"><span class="sk-num">${a}</span><span class="sk-den">${b}</span></span>`,sqrt:a=>`<span class="sk-sqrt">√<span class="sk-radicand">${a}</span></span>`,power:a=>`<sup>${a}</sup>`,symbol:c=>c,text:c=>esc(c)};
const POWER_WORDS={'2':' squared','3':' cubed'};
const SPEECH_BUILD={frac:(a,b)=>/^\s*\d+\s*$/.test(a)&&/^\s*\d+\s*$/.test(b)?` ${a} over ${b} `:` the fraction ${a} over ${b} `,sqrt:a=>` the square root of ${a} `,power:(a,raw)=>POWER_WORDS[raw]||` to the power of ${a} `,symbol:c=>({'×':' times ','−':' minus ','≤':' is less than or equal to ','≥':' is greater than or equal to ','≠':' is not equal to '}[c]),text:c=>({'+':' plus ','=':' equals ','<':' is less than ','>':' is greater than ','(':' open bracket ',')':' close bracket ','÷':' divided by ','×':' times ','−':' minus ','²':' squared','³':' cubed','√':' the square root of ','≤':' is less than or equal to ','≥':' is greater than or equal to ','π':' pi ','°':' degrees','%':' percent','/':' over ','±':' plus or minus ','≈':' is approximately ','≠':' is not equal to '}[c]??c)};
/* Implied products are spoken: 3x is "3 x", 2(x + 1) is "2 times open bracket". */
const WORDS=new Set('cm mm km kg ml min max sin cos tan per or and to of the is if so by in at on for are was has had not but all any one two six ten new old sum mean mode no yes it as an be we he up day days hr hrs sec yen eur usd gbp bag box car bus run ran got get out off its his her him you our who how why now then than that this with from each'.split(' '));
/* Spoken forms that the symbol-by-symbol reading gets wrong: f(3), an inverse ratio, a point, T_n. */
const spokenForms=text=>text.replace(/(sin|cos|tan)\^\{-1\}\s*\(/g,'inverse $1 of (').replace(/(\d)([fg])\(([^()]*)\)/g,'$1 times $2 of $3').replace(/(?<![\w)])([fg])\(([^()]*)\)/g,'$1 of $2').replace(/(?<![\w)])([fg])\(([^()]*)\)/g,'$1 of $2')
 .replace(/(?<![a-z])\((-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?)\)/g,' $1 comma $2 ').replace(/([A-Za-z])_([a-z0-9])/g,'$1 $2');
const mathSpeech=source=>transformMaths(spokenForms(String(source??'')).replace(/(\d)frac\(/g,'$1 and frac(').replace(/(\d)\(/g,'$1 times (').replace(/\)\(/g,') times (').replace(/(\d)([a-zA-Z])/g,'$1 $2').replace(/(?<![A-Za-z])[a-z]{2,3}(?![A-Za-z])/g,run=>WORDS.has(run)?run:[...run].join(' ')),SPEECH_BUILD).replace(/\s+/g,' ').trim();
/* In a displayed block, "A and B" (two equations) is set on two lines. */
const mathHTML=(source,block=false)=>`<span class="sk-math${block?' sk-block':''}" role="math" aria-label="${esc(mathSpeech(source))}">${block&&/=.* and .*=/.test(source)?String(source).split(' and ').map(line=>`<span class="sk-line">${transformMaths(line,HTML_BUILD)}</span>`).join(''):transformMaths(source,HTML_BUILD)}</span>`;
/* Prose with inline maths between backticks. */
const richHTML=text=>String(text??'').split('`').map((part,i)=>i%2?mathHTML(part):esc(part)).join('');
const richSpeech=text=>String(text??'').split('`').map((part,i)=>i%2?mathSpeech(part):part).join(' ').replace(/\s+/g,' ').trim();

/* ---------- Writing algebra neatly (for question writers) ---------- */
/* terms([[3,'x^2'],[-5,'x'],[2,'']]) gives "3x^2 - 5x + 2". Zero terms are dropped;
   a coefficient of 1 or -1 is hidden in front of a letter. Coefficients may be fractions "3/4". */
function terms(list){
 const parts=[];
 for(const [value,letters=''] of list){
  const q=typeof value==='object'?value:parseNumber(String(value)).q;if(qZero(q))continue;
  const negative=q.n<0,size=Q(Math.abs(q.n),q.d);
  let body;
  if(!letters)body=size.d===1?String(size.n):`frac(${size.n}, ${size.d})`;
  else if(size.d!==1)body=`frac(${size.n===1?'':size.n}${letters}, ${size.d})`;
  else body=(size.n===1?'':size.n)+letters;
  parts.push(parts.length?(negative?' - ':' + ')+body:(negative?'-':'')+body);
 }
 return parts.join('')||'0';
}
const linear=(a,letter,b)=>terms([[a,letter],[b,'']]);
const quadratic=(a,b,c,letter='x')=>terms([[a,letter+'^2'],[b,letter],[c,'']]);
/* A number in brackets when negative, for substitution lines: 3(-2) not 3-2. */
const bracket=n=>Number(n)<0?`(${n})`:String(n);
/* "+ 5" or "- 5" for joining onto an expression. */
const signed=n=>(Number(n)<0?'- ':'+ ')+Math.abs(Number(n));
const fmt=value=>{const q=typeof value==='object'?value:parseNumber(String(value)).q;return q.d===1?String(q.n):`frac(${q.n}, ${q.d})`};
const decimal=(value,places)=>String(roundTo(Number(value),places));

/* ---------- Figures: small drawings that go with a question ---------- */
/* Each returns {svg, alt}. The colours come from the page (classes fig-*), and alt says in
   words what the drawing shows, for the narration and for readers who cannot see it. */
function journeyFigure({points,xLabel='Time (hours)',yLabel='Distance from home (km)',xStep=1,yStep=10}){
 const W=440,H=300,left=58,right=18,top=16,bottom=48;
 const xMax=Math.ceil(Math.max(...points.map(p=>p[0]))/xStep)*xStep,yMax=Math.ceil(Math.max(...points.map(p=>p[1]))/yStep)*yStep||yStep;
 const X=x=>left+(W-left-right)*x/xMax,Y=y=>H-bottom-(H-top-bottom)*y/yMax,r=v=>Math.round(v*10)/10;
 let g='';
 for(let x=0;x<=xMax+1e-9;x+=xStep)g+=`<line class="fig-grid" x1="${r(X(x))}" y1="${top}" x2="${r(X(x))}" y2="${H-bottom}"/><text class="fig-text" x="${r(X(x))}" y="${H-bottom+18}" text-anchor="middle">${roundTo(x,2)}</text>`;
 for(let y=0;y<=yMax+1e-9;y+=yStep)g+=`<line class="fig-grid" x1="${left}" y1="${r(Y(y))}" x2="${W-right}" y2="${r(Y(y))}"/><text class="fig-text" x="${left-8}" y="${r(Y(y)+4)}" text-anchor="end">${roundTo(y,2)}</text>`;
 g+=`<path class="fig-axis" d="M${left} ${top}V${H-bottom}H${W-right}"/><polyline class="fig-line" points="${points.map(p=>r(X(p[0]))+','+r(Y(p[1]))).join(' ')}"/>`;
 g+=points.map(p=>`<circle class="fig-point" cx="${r(X(p[0]))}" cy="${r(Y(p[1]))}" r="4"/>`).join('');
 g+=`<text class="fig-text" x="${(left+W-right)/2}" y="${H-8}" text-anchor="middle">${esc(xLabel)}</text><text class="fig-text" transform="rotate(-90 14 ${(top+H-bottom)/2})" x="14" y="${(top+H-bottom)/2}" text-anchor="middle">${esc(yLabel)}</text>`;
 return {svg:`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${g}</svg>`,alt:`A graph of ${yLabel.toLowerCase()} against ${xLabel.toLowerCase()}. Straight lines join the points ${points.map(p=>`(${roundTo(p[0],2)}, ${roundTo(p[1],2)})`).join(', ')}.`};
}
/* A right-angled triangle: the angle sits at the bottom left, the right angle at the bottom right.
   Give the labels to show; leave one out to hide it. The drawing is not to scale. */
function triangleFigure({angle,opposite,adjacent,hypotenuse,topAngle}){
 const A=[40,186],C=[270,186],B=[270,52];
 let g=`<path class="fig-shape" d="M${A}L${C}L${B}Z"/><path class="fig-axis" d="M${C[0]-16} ${C[1]}v-16h16"/>`;
 if(angle!==undefined)g+=`<path class="fig-axis" d="M${A[0]+44} ${A[1]}A44 44 0 0 0 ${A[0]+38} ${A[1]-22}"/><text class="fig-text" x="${A[0]+52}" y="${A[1]-8}">${esc(angle)}</text>`;
 if(topAngle!==undefined)g+=`<text class="fig-text" x="${B[0]-14}" y="${B[1]+44}" text-anchor="end">${esc(topAngle)}</text>`;
 if(adjacent!==undefined)g+=`<text class="fig-text" x="${(A[0]+C[0])/2}" y="${A[1]+24}" text-anchor="middle">${esc(adjacent)}</text>`;
 if(opposite!==undefined)g+=`<text class="fig-text" x="${C[0]+10}" y="${(B[1]+C[1])/2+5}">${esc(opposite)}</text>`;
 if(hypotenuse!==undefined)g+=`<text class="fig-text" x="${(A[0]+B[0])/2-12}" y="${(A[1]+B[1])/2-12}" text-anchor="end">${esc(hypotenuse)}</text>`;
 const said=[angle!==undefined?`the marked angle is ${angle}`:'',opposite!==undefined?`the side opposite the marked angle is ${opposite}`:'',adjacent!==undefined?`the side next to the marked angle is ${adjacent}`:'',hypotenuse!==undefined?`the hypotenuse is ${hypotenuse}`:''].filter(Boolean);
 return {svg:`<svg viewBox="0 0 340 222" xmlns="http://www.w3.org/2000/svg">${g}</svg>`,alt:`A right-angled triangle, not to scale: ${said.join(', ')}.`};
}

/* ---------- The skill register ---------- */
const skills=[],byId=new Map();
const STRANDS=['Algebra','Coordinate geometry','Functions and graphs','Trigonometry','Number','Ratio and proportion','Statistics'];
function define(skill){
 if(!/^[a-z0-9-]{3,40}$/.test(skill.id||''))throw new Error('Bad skill id '+skill.id);
 if(byId.has(skill.id))throw new Error('Duplicate skill '+skill.id);
 if(!STRANDS.includes(skill.strand))throw new Error(skill.id+': unknown strand');
 if(!Array.isArray(skill.levels)||skill.levels.length!==3)throw new Error(skill.id+': a skill needs exactly three levels');
 for(const key of ['title','blurb','lesson'])if(typeof skill[key]!=='string'||!skill[key])throw new Error(skill.id+': missing '+key);
 /* Other lessons the skill also practises: its drill is offered under those lessons too. */
 if(skill.also!==undefined&&!(Array.isArray(skill.also)&&skill.also.every(id=>/^\d\d-\d\d$/.test(id)&&id!==skill.lesson)))throw new Error(skill.id+': "also" must list other lesson ids');
 skills.push(skill);byId.set(skill.id,skill);return skill;
}
/* True when two answers would look the same to a student: equal numbers or equal expressions. */
function sameValue(a,b){
 if(clean(a).replace(/\s+/g,'')===clean(b).replace(/\s+/g,''))return true;
 const x=parseNumber(String(a)),y=parseNumber(String(b));if(x&&y)return qEq(x.q,y.q);
 if(/sqrt|[=<>≤≥]/.test(String(a)+String(b)))return false;
 return sameExpr(String(a),String(b));
}
const optionValue=o=>String(o.value??o.math??o.text??'');
/* Checks the shape of a question and that its own answer passes its own check. Throws on any fault. */
function validate(q){
 const fail=message=>{throw new Error(`${q.skill} level ${q.level+1} seed ${q.seed}: ${message}`)};
 if(typeof q.prompt!=='string'||!q.prompt.trim())fail('missing prompt');
 if(typeof q.hint!=='string'||!q.hint.trim())fail('missing hint');
 if(!Array.isArray(q.steps)||q.steps.length<2||q.steps.some(s=>!s.math&&!s.note))fail('needs at least two worked steps');
 if(!q.verify)fail('missing verify');
 const a=q.answer;
 if(a.type==='choice'){
  if(a.options.length<2||a.options.length>5)fail('a choice needs 2 to 5 options');
  if(a.options.filter(o=>o.correct).length!==1)fail('a choice needs exactly one correct option');
  for(const o of a.options){if(!o.math&&!o.text)fail('empty option');if(!o.correct&&!o.why)fail('each wrong option needs a "why"')}
  for(let i=0;i<a.options.length;i++)for(let j=i+1;j<a.options.length;j++)if(sameValue(optionValue(a.options[i]),optionValue(a.options[j])))fail('two options are the same: '+optionValue(a.options[i]));
 }else if(a.type==='number'){
  if(!parseNumber(String(a.value)))fail('answer value is not a number: '+a.value);
  if(!check(q,String(a.value)).correct&&!Number.isInteger(a.round))fail('the answer does not pass its own check');
 }else if(a.type==='expr'){
  if(!check(q,a.value).correct)fail('the answer does not pass its own check: '+a.value+' '+JSON.stringify(check(q,a.value)));
 }else if(a.type==='fields'){
  if(!a.fields?.length||a.fields.some(f=>!parseNumber(String(f.value))))fail('every field needs a numeric value');
  if(!check(q,a.fields.map(f=>String(f.value))).correct)fail('the answer does not pass its own check');
 }else if(a.type==='inequality'){
  if(!FLIP[a.op]||!parseNumber(String(a.value)))fail('bad inequality answer');
 }else fail('unknown answer type '+a.type);
 for(const m of q.mistakes||[]){if(!m.why)fail('a mistake needs a "why"')}
 return q;
}
function normalise(question,rng,meta){
 const q={...question,...meta};
 if(!q.answer)throw new Error(meta.skill+': question has no answer');
 if(q.answer.type==='choice'){
  const options=q.answer.options.map(o=>typeof o==='string'?{text:o}:{...o});
  q.answer={...q.answer,options:q.answer.fixedOrder?options:rng.shuffle(options)};
  q.answer.correctIndex=q.answer.options.findIndex(o=>o.correct);
 }
 q.steps=(q.steps||[]).map(s=>typeof s==='string'?{math:s}:s);
 /* A listed mistake that happens to equal the right answer for these numbers is dropped. */
 if(q.mistakes&&['number','expr'].includes(q.answer.type))q.mistakes=q.mistakes.filter((m,i)=>!sameValue(String(m.value),String(q.answer.value))&&!q.mistakes.slice(0,i).some(o=>sameValue(String(o.value),String(m.value))));
 if(q.mistakes&&q.answer.type==='number'&&Number.isInteger(q.answer.round)){
  const rounded=v=>{const p=parseNumber(String(v));return p?roundTo(qNum(p.q),q.answer.round):NaN},wanted=rounded(q.answer.value);
  q.mistakes=q.mistakes.filter(m=>Math.abs(rounded(m.value)-wanted)>1e-9);
 }
 if(q.mistakes&&q.answer.type==='fields'){
  const targets=q.answer.fields.map(f=>String(f.value)),same=values=>values.length===targets.length&&(q.answer.unordered?[...values].sort().join('|')===[...targets].sort().join('|')||values.every(v=>targets.some(t=>sameValue(v,t)))&&targets.every(t=>values.some(v=>sameValue(v,t))):values.every((v,i)=>sameValue(v,targets[i])));
  q.mistakes=q.mistakes.filter(m=>!same([].concat(m.value).map(String)));
 }
 if(q.mistakes&&q.answer.type==='inequality')q.mistakes=q.mistakes.filter(m=>!((m.op===undefined||m.op===q.answer.op)&&sameValue(String(m.value),String(q.answer.value))));
 return q;
}
function build(skillId,level,seed){
 const skill=byId.get(skillId);if(!skill)throw new Error('Unknown skill '+skillId);
 const rng=makeRng((seed>>>0)*7919+level*104729+hash(skillId));
 return validate(normalise(skill.levels[level].make(rng),rng,{skill:skillId,level,seed}));
}
/* One question. The seed fixes everything about it. A seed that produces a faulty
   question is skipped, so a student never sees one. */
function make(skillId,level,seed){
 let fault;
 for(let attempt=0;attempt<30;attempt++){try{return build(skillId,level,(seed>>>0)+attempt*1000003)}catch(e){fault=e}}
 throw fault;
}
function hash(text){let h=2166136261;for(const c of text){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
/* The canonical answer as text, used for worked answers and for independent checks. */
function answerText(q){
 const a=q.answer;
 if(a.type==='choice')return optionValue(a.options[a.correctIndex]);
 if(a.type==='expr')return a.value;
 if(a.type==='number')return String(a.value);
 if(a.type==='fields')return a.fields.map(f=>String(f.value));
 if(a.type==='inequality')return `${a.variable||'x'} ${a.op} ${a.value}`;
 return '';
}
return {define,make,build,validate,check,sameValue,skills,byId,STRANDS,makeRng,
 Q,qAdd,qSub,qMul,qDiv,qEq,qNum,qStr,gcd,parseNumber,
 parseExpr,poly,polyStr,expand,evalAt,pEq,factorList,
 mathHTML,mathSpeech,richHTML,richSpeech,esc,
 terms,linear,quadratic,bracket,signed,fmt,decimal,roundTo,answerText,
 rational,sameExpr,journeyFigure,triangleFigure};
})();
if(typeof module!=='undefined')module.exports=SkillKit;
