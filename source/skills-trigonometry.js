/* Skill drills: right-angled triangles (chapter 22).
   The theorem of Pythagoras, naming and using sin, cos and tan, finding a side and finding an angle. */
(()=>{'use strict';
const K=SkillKit;
const STRAND='Trigonometry';
const TRIPLES=[[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15],[7,24,25],[12,16,20],[10,24,26],[15,20,25],[20,21,29],[9,40,41],[12,35,37]];
const rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI;
const one=v=>v.toFixed(1);                          /* one decimal place, as it is written in an answer */
const tidy=v=>String(Math.round(v*100)/100);        /* 6.25, not 6.250000000001 */
/* The three ratios: which two sides each one uses, in words and from the triangle {opposite, adjacent, hypotenuse}. */
const RATIOS={
 sin:{name:'Sine',top:'opposite',bottom:'hypotenuse',says:'opposite over hypotenuse'},
 cos:{name:'Cosine',top:'adjacent',bottom:'hypotenuse',says:'adjacent over hypotenuse'},
 tan:{name:'Tangent',top:'opposite',bottom:'adjacent',says:'opposite over adjacent'}};
const value=(fn,angle)=>Math[fn](rad(angle));
const sideName=s=>s==='hypotenuse'?'the hypotenuse':`the ${s} side`;

/* ---------- The theorem of Pythagoras ---------- */
K.define({
 id:'pythagoras',title:'Theorem of Pythagoras',strand:STRAND,lesson:'22-01',
 blurb:'Find a missing side of a right-angled triangle from the other two.',
 levels:[
  {name:'Find the hypotenuse',make(rng){
   const [p,q,c]=rng.pick(TRIPLES),[a,b]=rng.chance(.5)?[p,q]:[q,p],u=rng.pick(['cm','m','mm']);
   return {
    prompt:'Find the length of the side marked x in this right-angled triangle.',
    figure:K.triangleFigure({opposite:`${a} ${u}`,adjacent:`${b} ${u}`,hypotenuse:'x'}),
    answer:{type:'number',label:'x =',value:String(c),unit:u},
    mistakes:[
     {value:String(a+b),why:'You added the two sides. Square each side first, add the squares, then take the square root.'},
     {value:String(a*a+b*b),why:`${a*a+b*b} is \`x^2\`. Take the square root to find x.`}],
    hint:'x is the hypotenuse, the side facing the right angle. Its square is the sum of the squares of the other two sides.',
    steps:[
     {math:`x^2 = ${a}^2 + ${b}^2`,note:'x is the hypotenuse, so its square equals the sum of the squares of the other two sides.'},
     {math:`x^2 = ${a*a} + ${b*b} = ${a*a+b*b}`,note:'Square each side and add.'},
     {math:`x = sqrt(${a*a+b*b}) = ${c}`,note:'Take the square root.'}],
    verify:{op:'value',expr:`sqrt(${a}^2 + ${b}^2)`,equals:'ANSWER'}
   };
  }},
  {name:'Find a shorter side',make(rng){
   const [p,q,c]=rng.pick(TRIPLES),[known,x]=rng.chance(.5)?[p,q]:[q,p],upright=rng.chance(.5),u=rng.pick(['cm','m','mm']);
   return {
    prompt:'Find the length of the side marked x in this right-angled triangle.',
    figure:K.triangleFigure(upright?{opposite:'x',adjacent:`${known} ${u}`,hypotenuse:`${c} ${u}`}:{opposite:`${known} ${u}`,adjacent:'x',hypotenuse:`${c} ${u}`}),
    answer:{type:'number',label:'x =',value:String(x),unit:u},
    mistakes:[
     {value:Math.sqrt(c*c+known*known).toFixed(4),why:`You added the squares. x is one of the shorter sides, so subtract: \`x^2 = ${c}^2 - ${known}^2\`.`},
     {value:String(c-known),why:'You subtracted the lengths. Square them first, subtract, then take the square root.'},
     {value:String(c*c-known*known),why:`${c*c-known*known} is \`x^2\`. Take the square root to find x.`}],
    hint:`The hypotenuse is ${c}, the longest side. The square of a shorter side is the square of the hypotenuse minus the square of the other side.`,
    steps:[
     {math:`${c}^2 = ${known}^2 + x^2`,note:`The hypotenuse faces the right angle. Here it is ${c}.`},
     {math:`x^2 = ${c*c} - ${known*known} = ${c*c-known*known}`,note:`Subtract \`${known}^2\` from both sides.`},
     {math:`x = sqrt(${c*c-known*known}) = ${x}`,note:'Take the square root. A shorter side must come out less than the hypotenuse.'}],
    verify:{op:'value',expr:`sqrt(${c}^2 - ${known}^2)`,equals:'ANSWER'}
   };
  }},
  {name:'Exam style',make(rng){
   for(;;){
    const kind=rng.pick(['ladder height','ladder foot','diagonal','ship']);
    if(kind==='diagonal'||kind==='ship'){
     const a=rng.int(3,15),b=rng.int(3,15),s=a*a+b*b,root=Math.sqrt(s);
     if(a===b||Number.isInteger(root))continue;
     return {
      prompt:kind==='diagonal'?`A rectangle is ${Math.max(a,b)} cm long and ${Math.min(a,b)} cm wide. Find the length of its diagonal, correct to one decimal place.`
       :`A ship sails ${a} km due north and then ${b} km due east. How far is it from its starting point, correct to one decimal place?`,
      answer:{type:'number',value:root.toFixed(6),round:1,unit:kind==='diagonal'?'cm':'km'},
      mistakes:[
       {value:String(a+b),why:'You added the two lengths. They are the shorter sides of a right-angled triangle: square them, add, then take the square root.'},
       {value:String(s),why:`${s} is the square of the distance. Take the square root to finish.`}],
      hint:kind==='diagonal'?'The diagonal cuts the rectangle into two right-angled triangles. It is their hypotenuse.':'North and east are at right angles. The distance from the start is the hypotenuse.',
      steps:[
       {math:`d^2 = ${a}^2 + ${b}^2`,note:kind==='diagonal'?'The diagonal is the hypotenuse of a right-angled triangle with the length and the width as its shorter sides.':'The two legs of the journey are at right angles, so the distance d from the start is the hypotenuse.'},
       {math:`d^2 = ${a*a} + ${b*b} = ${s}`,note:'Square each side and add.'},
       {math:`d = sqrt(${s}) ≈ ${one(root)}`,note:`Take the square root. The calculator shows ${root.toFixed(4)}..., which is ${one(root)} correct to one decimal place.`}],
      verify:{op:'value',expr:`sqrt(${a}^2 + ${b}^2)`,equals:'ANSWER',round:1}
     };
    }
    const L=rng.int(4,10),other=rng.pick([1.5,2,2.5,3,3.5,4]),s=L*L-other*other,root=Math.sqrt(s),height=kind==='ladder height';
    if(other>=L-1||Number.isInteger(root))continue;
    return {
     prompt:height?`A ladder ${L} m long leans against a vertical wall. The foot of the ladder is ${other} m from the wall. How high up the wall does the ladder reach, correct to one decimal place?`
      :`A ladder ${L} m long leans against a vertical wall and reaches ${other} m up the wall. How far is the foot of the ladder from the wall, correct to one decimal place?`,
     answer:{type:'number',value:root.toFixed(6),round:1,unit:'m'},
     mistakes:[
      {value:Math.sqrt(L*L+other*other).toFixed(4),why:'The ladder is the hypotenuse, the longest side. Subtract the squares: the answer must be less than the length of the ladder.'},
      {value:tidy(L-other),why:'You subtracted the lengths. Square them first, subtract, then take the square root.'}],
     hint:'The ladder, the wall and the ground make a right-angled triangle. The ladder is its hypotenuse.',
     steps:[
      {math:`${L}^2 = ${other}^2 + x^2`,note:'The wall meets the ground at a right angle, so the ladder is the hypotenuse. Call the missing side x.'},
      {math:`x^2 = ${L*L} - ${tidy(other*other)} = ${tidy(s)}`,note:`Subtract \`${other}^2\` from both sides.`},
      {math:`x = sqrt(${tidy(s)}) ≈ ${one(root)}`,note:`Take the square root. The calculator shows ${root.toFixed(4)}..., which is ${one(root)} correct to one decimal place.`}],
     verify:{op:'value',expr:`sqrt(${L}^2 - (${other})^2)`,equals:'ANSWER',round:1}
    };
   }
  }}]
});

/* ---------- Naming the ratios and finding an angle ---------- */
/* An angle question from two known sides; `sides` gives the two lengths the ratio needs. */
function findAngle(fn,topLength,bottomLength,frame){
 const r=RATIOS[fn],angle=deg(Math[`a${fn}`](topLength/bottomLength)),whole=Math.round(angle),other=fn==='sin'?'cos':fn==='cos'?'sin':null;
 return {
  ...frame,
  answer:{type:'number',label:'A =',value:angle.toFixed(6),round:0,unit:'°'},
  mistakes:[
   ...(other?[{value:(90-angle).toFixed(6),why:`Check which sides you have. The ${r.top} side and ${sideName(r.bottom)} go with ${r.name.toLowerCase()}, so use the inverse ${fn} key.`}]:[{value:deg(Math.atan(bottomLength/topLength)).toFixed(6),why:'The opposite side goes on top of the fraction and the adjacent side on the bottom.'}]),
   {value:(topLength/bottomLength).toFixed(6),why:`That is the value of \`${fn} A\`. Use the inverse key, shift then ${fn}, to turn it into an angle.`}],
  hint:`Name the two sides you know from the angle A. ${r.name} is ${r.says}. Then use the inverse ${fn} key.`,
  steps:[
   {math:`${fn} A = frac(${topLength}, ${bottomLength})`,note:`From the angle A you know the ${r.top} side and ${sideName(r.bottom)}. ${r.name} is ${r.says}.`},
   {math:`A = ${fn}^{-1}(frac(${topLength}, ${bottomLength}))`,note:`Use the inverse ${fn} key, shift then ${fn}, to go from the ratio back to the angle.`},
   {math:`A ≈ ${whole}°`,note:`The calculator, in degree mode, shows ${angle.toFixed(2)}..., which is ${whole}° to the nearest degree.`}],
  verify:{op:'value',expr:`a${fn}((${topLength})/(${bottomLength}))*180/pi`,equals:'ANSWER',round:0}
 };
}
const goodAngle=a=>a>12&&a<78&&Math.abs(a-Math.round(a))<.42;   /* not so close to a half that rounding is in doubt */
K.define({
 id:'trig-ratios',title:'Sin, cos and tan',strand:STRAND,lesson:'22-02',
 blurb:'Name the sides from an angle, write sin, cos or tan as a fraction, and find an angle from two sides.',
 levels:[
  {name:'Write the ratio',make(rng){
   const [p,q,c]=rng.pick(TRIPLES),[a,b]=rng.chance(.5)?[p,q]:[q,p],fn=rng.pick(['sin','cos','tan']),side={opposite:a,adjacent:b,hypotenuse:c},r=RATIOS[fn];
   const ratio=f=>K.qStr(K.Q(side[RATIOS[f].top],side[RATIOS[f].bottom])),raw=`frac(${side[r.top]}, ${side[r.bottom]})`,simple=K.fmt(K.Q(side[r.top],side[r.bottom]));
   return {
    prompt:`Write \`${fn} A\` as a fraction in its simplest form.`,
    figure:K.triangleFigure({angle:'A',opposite:String(a),adjacent:String(b),hypotenuse:String(c)}),
    answer:{type:'number',label:`${fn} A =`,value:ratio(fn),simplest:true},
    mistakes:[
     ...['sin','cos','tan'].filter(f=>f!==fn).map(f=>({value:ratio(f),why:`That is \`${f} A\`: ${RATIOS[f].says}. ${r.name} is ${r.says}.`})),
     {value:K.qStr(K.Q(side[r.bottom],side[r.top])),why:`That fraction is upside down. ${r.name} is ${r.says}.`}],
    hint:'Name the three sides from the angle A first: opposite, adjacent and hypotenuse. Then SOH CAH TOA tells you which two to use.',
    steps:[
     {note:`From the angle A: the opposite side is ${a}, the adjacent side is ${b}, and the hypotenuse, facing the right angle, is ${c}.`},
     {math:`${fn} A = ${raw}${simple===raw?'':' = '+simple}`,note:`${r.name} is ${r.says}.`}],
    verify:{op:'value',expr:`(${side[r.top]})/(${side[r.bottom]})`,equals:'ANSWER'}
   };
  }},
  {name:'Find an angle',make(rng){
   for(;;){
    const fn=rng.pick(['sin','cos','tan']),r=RATIOS[fn],short=rng.int(3,14),long=rng.int(5,20);
    if(short>=long&&fn!=='tan'||short===long)continue;
    const [topLength,bottomLength]=fn==='tan'&&rng.chance(.5)?[long,short]:[short,long];
    if(!goodAngle(deg(Math[`a${fn}`](topLength/bottomLength))))continue;
    return findAngle(fn,topLength,bottomLength,{
     prompt:'Find the angle A, correct to the nearest degree.',
     figure:K.triangleFigure({angle:'A',[r.top]:String(topLength),[r.bottom]:String(bottomLength)})});
   }
  }},
  {name:'Exam style',make(rng){
   for(;;){
    const kind=rng.pick(['ramp','ladder','kite']);
    if(kind==='ramp'){
     const rise=rng.pick([0.5,0.8,1,1.2,1.5,2]),run=rng.int(4,12);
     if(!goodAngle(deg(Math.atan(rise/run))))continue;
     return findAngle('tan',rise,run,{prompt:`A ramp rises ${rise} m over a horizontal distance of ${run} m. Find the angle A that the ramp makes with the ground, correct to the nearest degree.`});
    }
    if(kind==='ladder'){
     const L=rng.int(4,9),h=rng.pick([2.5,3,3.5,4,4.5,5,5.5,6,7]);
     if(h>=L||!goodAngle(deg(Math.asin(h/L))))continue;
     return findAngle('sin',h,L,{prompt:`A ladder ${L} m long reaches ${h} m up a vertical wall. Find the angle A between the ladder and the ground, correct to the nearest degree.`});
    }
    const string=rng.pick([20,25,30,40,50,60]),along=rng.int(8,45);
    if(along>=string||!goodAngle(deg(Math.acos(along/string))))continue;
    return findAngle('cos',along,string,{prompt:`A kite flies on a straight string ${string} m long. The kite is directly above a point ${along} m along the level ground from the person holding the string. Find the angle A between the string and the ground, correct to the nearest degree.`});
   }
  }}]
});

/* ---------- Finding a side ---------- */
/* One angle and one side are known. `want` and `have` are side names; the ratio that links them is found here. */
function findSide(angle,have,length,want,unit,frame){
 const fn=Object.keys(RATIOS).find(f=>[RATIOS[f].top,RATIOS[f].bottom].sort().join()===[have,want].sort().join()),r=RATIOS[fn],onTop=r.top===want,ratio=value(fn,angle);
 const answer=onTop?length*ratio:length/ratio,wrong=onTop?length/ratio:length*ratio,otherFn=fn==='sin'?'cos':fn==='cos'?'sin':'sin',swapped=onTop?length*value(otherFn,angle):length/value(otherFn,angle);
 return {
  ...frame,
  answer:{type:'number',label:'x =',value:answer.toFixed(6),round:1,unit},
  mistakes:[
   {value:wrong.toFixed(6),why:onTop?`x is on the top of the fraction, so multiply: \`x = ${length} * ${fn} ${angle}°\`.`:`x is on the bottom of the fraction, so divide: \`x = frac(${length}, ${fn} ${angle}°)\`.`},
   {value:swapped.toFixed(6),why:`Check the sides. From the ${angle}° angle, x is ${sideName(want)} and ${length} is ${sideName(have)}, so the ratio to use is ${fn}: ${r.says}.`}],
  hint:`Name the two sides from the ${angle}° angle: x is ${sideName(want)} and ${length} is ${sideName(have)}. Choose the ratio that uses those two.`,
  steps:[
   {math:`${fn} ${angle}° = ${onTop?`frac(x, ${length})`:`frac(${length}, x)`}`,note:`From the ${angle}° angle, x is ${sideName(want)} and ${length} is ${sideName(have)}. ${r.name} is ${r.says}.`},
   ...(onTop?[{math:`x = ${length} * ${fn} ${angle}°`,note:`Multiply both sides by ${length}.`}]
    :[{math:`x * ${fn} ${angle}° = ${length}`,note:'Multiply both sides by x.'},{math:`x = frac(${length}, ${fn} ${angle}°)`,note:`Divide both sides by \`${fn} ${angle}°\`.`}]),
   {math:`x ≈ ${one(answer)}`,note:`Use the calculator in degree mode. It shows ${answer.toFixed(4)}..., which is ${one(answer)} correct to one decimal place.`}],
  verify:{op:'value',expr:onTop?`${length}*${fn}(${angle}*pi/180)`:`${length}/${fn}(${angle}*pi/180)`,equals:'ANSWER',round:1}
 };
}
const PAIRS={top:[['hypotenuse','opposite'],['hypotenuse','adjacent'],['adjacent','opposite']],bottom:[['opposite','hypotenuse'],['adjacent','hypotenuse'],['opposite','adjacent']]};
function drawnSide(rng,where){
 for(;;){
  const [have,want]=rng.pick(PAIRS[where]),angle=rng.int(18,72),length=rng.int(4,25),unit=rng.pick(['cm','m']);
  if(angle%5===0&&rng.chance(.5))continue;
  const q=findSide(angle,have,length,want,unit,{
   prompt:'Find the length of the side marked x, correct to one decimal place.',
   figure:K.triangleFigure({angle:`${angle}°`,[have]:`${length} ${unit}`,[want]:'x'})});
  if(one(Number(q.answer.value)).endsWith('.0'))continue;
  return q;
 }
}
K.define({
 id:'trig-sides',title:'Find a side with sin, cos or tan',strand:STRAND,lesson:'22-04',
 blurb:'Use an angle and one side of a right-angled triangle to find another side.',
 levels:[
  {name:'x on the top',make(rng){return drawnSide(rng,'top')}},
  {name:'x on the bottom',make(rng){return drawnSide(rng,'bottom')}},
  {name:'Exam style',make(rng){
   for(;;){
    const kind=rng.pick(['tree','ladder','ramp','kite']),angle=rng.int(20,70);
    let q;
    if(kind==='tree'){const d=rng.int(10,40),thing=rng.pick(['a tree','a flagpole','a tower','a mast']);
     q=findSide(angle,'adjacent',d,'opposite','m',{prompt:`From a point on level ground ${d} m from the foot of ${thing}, the angle of elevation of its top is ${angle}°. Find the height x of ${thing.replace(/^a /,'the ')}, correct to one decimal place.`})}
    else if(kind==='ladder'){const h=rng.int(3,8);if(angle<50)continue;
     q=findSide(angle,'opposite',h,'hypotenuse','m',{prompt:`A ladder leans against a vertical wall and makes an angle of ${angle}° with the ground. It reaches ${h} m up the wall. Find the length x of the ladder, correct to one decimal place.`})}
    else if(kind==='ramp'){const L=rng.int(5,20),low=rng.int(6,25);
     q=findSide(low,'hypotenuse',L,'opposite','m',{prompt:`A straight ramp is ${L} m long and makes an angle of ${low}° with the level ground. Find the height x of the top of the ramp above the ground, correct to one decimal place.`})}
    else{const string=rng.pick([20,25,30,40,50,60]);
     q=findSide(angle,'hypotenuse',string,'adjacent','m',{prompt:`A kite flies on a straight string ${string} m long. The string makes an angle of ${angle}° with the level ground. Find the distance x along the ground from the person holding the string to the point directly below the kite, correct to one decimal place.`})}
    if(one(Number(q.answer.value)).endsWith('.0'))continue;
    return q;
   }
  }}]
});
})();
