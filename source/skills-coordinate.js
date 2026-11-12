/* Skill drills: coordinate geometry of the line (chapter 11).
   Midpoint and distance, slope, the equation of a line, points on a line and where lines meet. */
(()=>{'use strict';
const K=SkillKit,{Q,qStr,terms,linear,bracket,signed}=K;
const STRAND='Coordinate geometry';
const P=(x,y)=>`(${x}, ${y})`;
const num=q=>terms([[q,'']]);                      /* a fraction with its minus sign in front */
const top=(a,b)=>`${a} - ${bracket(b)}`;           /* "7 - (-2)" */
const wrap=q=>q.n<0||q.d!==1?`(${num(q)})`:num(q);  /* a factor that needs brackets gets them */
const tick=v=>Number(v)<0?'`'+v+'`':String(v);     /* a negative number inside a sentence */
/* mx + c with the slope kept in front of x: "frac(2, 3)x - 6", so the slope can be read off. */
const mxc=(m,c)=>{const q=typeof m==='object'?m:Q(m),lead=q.d===1?terms([[q,'x']]):`${q.n<0?'-':''}frac(${Math.abs(q.n)}, ${q.d})x`,rest=typeof c==='object'?c:Q(c);return rest.n===0?lead:`${lead} ${rest.n<0?'-':'+'} ${num(Q(Math.abs(rest.n),rest.d))}`};

/* ---------- Midpoint and distance ---------- */
const midpointMistakes=(a,b)=>[
 {value:[String(a[0]+b[0]),String(a[1]+b[1])],why:'You added the coordinates but did not halve them. The midpoint is the average of the two points.'},
 {value:[qStr(Q(a[0]-b[0],2)),qStr(Q(a[1]-b[1],2))],why:'You subtracted the coordinates. For a midpoint, add them and then halve.'},
 {value:[qStr(Q(b[0]-a[0],2)),qStr(Q(b[1]-a[1],2))],why:'You subtracted the coordinates. For a midpoint, add them and then halve.'}];
function midpoint(a,b){
 const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;
 return {
  prompt:`Find the midpoint of the line segment from \`A${P(...a)}\` to \`B${P(...b)}\`.`,
  answer:{type:'fields',fields:[{label:'x =',value:String(mx)},{label:'y =',value:String(my)}]},
  mistakes:midpointMistakes(a,b),
  hint:'Add the two x-coordinates and halve. Then do the same for the y-coordinates.',
  steps:[
   {math:`x = frac(${a[0]} + ${bracket(b[0])}, 2) = ${mx}`,note:'Add the x-coordinates and halve.'},
   {math:`y = frac(${a[1]} + ${bracket(b[1])}, 2) = ${my}`,note:'Add the y-coordinates and halve.'},
   {math:`M = ${P(mx,my)}`,note:'Write the midpoint as a point, with x first.'}],
  verify:[{op:'value',expr:`((${a[0]}) + (${b[0]}))/2`,equals:'ANSWER0'},{op:'value',expr:`((${a[1]}) + (${b[1]}))/2`,equals:'ANSWER1'}]
 };
}
K.define({
 id:'midpoint-and-distance',title:'Midpoint and distance',strand:STRAND,lesson:'11-01',
 blurb:'Find the point halfway between two points, and how far apart they are.',
 levels:[
  {name:'Midpoint',make(rng){
   for(;;){
    const x1=rng.int(0,9),y1=rng.int(0,9),x2=x1+2*rng.int(1,4),y2=y1+2*rng.nonzero(-4,4);
    if(y2<0)continue;
    return rng.chance(.5)?midpoint([x1,y1],[x2,y2]):midpoint([x2,y2],[x1,y1]);
   }
  }},
  {name:'Distance',make(rng){
   const [p,q]=rng.pick([[3,4],[4,3],[6,8],[8,6],[5,12],[12,5],[9,12],[8,15]]),dx=p*rng.sign(),dy=q*rng.sign(),x1=rng.int(-6,6),y1=rng.int(-6,6),x2=x1+dx,y2=y1+dy,d=Math.hypot(p,q);
   return {
    prompt:`Find the distance between \`A${P(x1,y1)}\` and \`B${P(x2,y2)}\`.`,
    answer:{type:'number',label:'|AB| =',value:String(d)},
    mistakes:[
     {value:String(p+q),why:'You added the two differences. Square each difference first, add the squares, then take the square root.'},
     {value:String(p*p+q*q),why:`${p*p+q*q} is the distance squared. Take the square root to finish.`}],
    hint:'Find the difference in x and the difference in y. They are the two short sides of a right-angled triangle.',
    steps:[
     {math:`${top(x2,x1)} = ${dx} and ${top(y2,y1)} = ${dy}`,note:'Find the difference in x and the difference in y.'},
     {math:`${bracket(dx)}^2 + ${bracket(dy)}^2 = ${p*p} + ${q*q} = ${p*p+q*q}`,note:'Square each difference and add. A square is never negative.'},
     {math:`sqrt(${p*p+q*q}) = ${d}`,note:'Take the square root. This is the theorem of Pythagoras.'}],
    verify:{op:'value',expr:`sqrt(((${x2}) - (${x1}))^2 + ((${y2}) - (${y1}))^2)`,equals:'ANSWER'}
   };
  }},
  {name:'Exam style',make(rng){
   const kind=rng.pick(['decimal','endpoint','endpoint','halves']);
   for(;;){
    const x1=rng.int(-7,7),y1=rng.int(-7,7);
    if(kind==='decimal'){
     const dx=rng.nonzero(-7,7),dy=rng.nonzero(-7,7),s=dx*dx+dy*dy,root=Math.sqrt(s),x2=x1+dx,y2=y1+dy;
     if(Number.isInteger(root)||root.toFixed(1).endsWith('0'))continue;
     return {
      prompt:`Find the distance between \`P${P(x1,y1)}\` and \`Q${P(x2,y2)}\`, correct to one decimal place.`,
      answer:{type:'number',label:'|PQ| =',value:root.toFixed(6),round:1},
      mistakes:[
       {value:String(s),why:`${s} is the distance squared. Take the square root to finish.`},
       {value:String(Math.abs(dx)+Math.abs(dy)),why:'You added the two differences. Square each difference first, add the squares, then take the square root.'}],
      hint:'Square the difference in x and the difference in y, add them, then take the square root.',
      steps:[
       {math:`${top(x2,x1)} = ${dx} and ${top(y2,y1)} = ${dy}`,note:'Find the difference in x and the difference in y.'},
       {math:`${bracket(dx)}^2 + ${bracket(dy)}^2 = ${dx*dx} + ${dy*dy} = ${s}`,note:'Square each difference and add.'},
       {math:`sqrt(${s}) ≈ ${root.toFixed(1)}`,note:`Take the square root. The calculator shows ${root.toFixed(4)}..., which is ${root.toFixed(1)} correct to one decimal place.`}],
      verify:{op:'value',expr:`sqrt(((${x2}) - (${x1}))^2 + ((${y2}) - (${y1}))^2)`,equals:'ANSWER',round:1}
     };
    }
    if(kind==='endpoint'){
     const mx=rng.int(-6,6),my=rng.int(-6,6),sx=mx-x1,sy=my-y1,bx=mx+sx,by=my+sy;
     if(!sx||!sy)continue;
     return {
      prompt:`\`M${P(mx,my)}\` is the midpoint of the line segment AB. A is the point \`${P(x1,y1)}\`. Find the coordinates of B.`,
      answer:{type:'fields',fields:[{label:'x =',value:String(bx)},{label:'y =',value:String(by)}]},
      mistakes:[
       {value:[qStr(Q(x1+mx,2)),qStr(Q(y1+my,2))],why:'You found the midpoint of A and M. M is already the midpoint, so take the step from A to M once more to reach B.'},
       {value:[String(sx),String(sy)],why:'That is the step from A to M. Add that step to M to reach B.'}],
      hint:'Find the step from A to M. Take the same step again, starting at M.',
      steps:[
       {math:`${top(mx,x1)} = ${sx} and ${top(my,y1)} = ${sy}`,note:'Find the step from A to M in x and in y.'},
       {math:`${mx} + ${bracket(sx)} = ${bx} and ${my} + ${bracket(sy)} = ${by}`,note:'Take the same step again from M.'},
       {math:`B = ${P(bx,by)}`,note:'Write B as a point, with x first.'},
       {math:`frac(${x1} + ${bracket(bx)}, 2) = ${mx} and frac(${y1} + ${bracket(by)}, 2) = ${my}`,note:'Check: the midpoint of A and B is M.'}],
      verify:[{op:'value',expr:`((${x1}) + ANSWER0)/2`,equals:String(mx)},{op:'value',expr:`((${y1}) + ANSWER1)/2`,equals:String(my)}]
     };
    }
    const x2=x1+2*rng.int(1,4)+1,y2=y1+2*rng.int(-4,3)+1;
    return midpoint([x1,y1],[x2,y2]);
   }
  }}]
});

/* ---------- Slope ---------- */
function slope(a,b){
 const rise=b[1]-a[1],run=b[0]-a[0],m=Q(rise,run);
 return {
  prompt:`Find the slope of the line through \`A${P(...a)}\` and \`B${P(...b)}\`.`,
  answer:{type:'number',label:'Slope =',value:qStr(m),simplest:true},
  mistakes:[
   {value:qStr(Q(run,rise)),why:'That is the change in x over the change in y. Slope is rise over run: the change in y goes on top.'},
   {value:qStr(Q(-rise,run)),why:'Check the order. If the top starts with the y of B, the bottom must start with the x of B.'},
   {value:String(rise),why:'That is the rise only. Divide it by the run, the change in x.'}],
  hint:'Slope is the change in y divided by the change in x. Keep the two points in the same order on the top and on the bottom.',
  steps:[
   {math:`frac(${top(b[1],a[1])}, ${top(b[0],a[0])})`,note:'Put the change in y on top and the change in x on the bottom, both as B minus A.'},
   {math:`frac(${rise}, ${run})${m.n===rise&&m.d===run&&run!==1?'':' = '+num(m)}`,note:'Work out the top and the bottom, and simplify if you can.'},
   {math:`m = ${num(m)}`,note:m.n===0?'The line is horizontal, so its slope is 0.':m.n>0?'The slope is positive: the line goes up from left to right.':'The slope is negative: the line goes down from left to right.'}],
  verify:{op:'value',expr:`((${b[1]}) - (${a[1]}))/((${b[0]}) - (${a[0]}))`,equals:'ANSWER'}
 };
}
K.define({
 id:'slope',title:'Slope of a line',strand:STRAND,lesson:'11-02',
 blurb:'Find how steep a line is from two points, and the slope of a parallel or perpendicular line.',
 levels:[
  {name:'Rise over run',make(rng){
   for(;;){
    const x1=rng.int(0,5),y1=rng.int(0,6),run=rng.int(1,4),rise=rng.int(1,8);
    if(rise===run)continue;
    return slope([x1,y1],[x1+run,y1+rise]);
   }
  }},
  {name:'Negative coordinates',make(rng){
   for(;;){
    const x1=rng.int(-6,4),y1=rng.int(-6,6),run=rng.int(1,6),rise=rng.nonzero(-8,8),a=[x1,y1],b=[x1+run,y1+rise];
    if(Math.abs(rise)===run||(x1>=0&&y1>=0&&rise>0))continue;
    return rng.chance(.5)?slope(a,b):slope(b,a);
   }
  }},
  {name:'Parallel and perpendicular',make(rng){
   for(;;){
    const kind=rng.pick(['perpendicular to points','perpendicular to equation','parallel to points']),run=rng.int(1,5),rise=rng.nonzero(-6,6),m=Q(rise,run),perp=Q(-run,rise);
    if(Math.abs(rise)===run)continue;
    const x1=rng.int(-5,4),y1=rng.int(-5,5),a=`A${P(x1,y1)}`,b=`B${P(x1+run,y1+rise)}`,c=rng.nonzero(-6,6),line=`y = ${mxc(m,c)}`;
    const parallel=kind==='parallel to points',answer=parallel?m:perp;
    const found=kind==='perpendicular to equation'?{math:`m = ${num(m)}`,note:'The slope of the given line is the number multiplying x.'}:{math:`frac(${top(y1+rise,y1)}, ${top(x1+run,x1)}) = ${num(m)}`,note:'Find the slope of the line through A and B: change in y over change in x.'};
    return {
     prompt:kind==='perpendicular to equation'?`Find the slope of a line that is perpendicular to the line \`${line}\`.`
      :`The line k passes through \`${a}\` and \`${b}\`. Find the slope of a line that is ${parallel?'parallel':'perpendicular'} to k.`,
     answer:{type:'number',label:'Slope =',value:qStr(answer),simplest:true},
     mistakes:parallel?[
       {value:qStr(perp),why:'That is the slope of a perpendicular line. Parallel lines have the same slope.'},
       {value:qStr(Q(run,rise)),why:'Parallel lines have exactly the same slope. Do not turn the fraction upside down.'}]
      :[
       {value:qStr(m),why:'That is the slope of the given line. For a perpendicular line, turn the fraction upside down and change its sign.'},
       {value:qStr(Q(run,rise)),why:'You turned the fraction upside down. Now change the sign as well.'},
       {value:qStr(Q(-rise,run)),why:'You changed the sign. Now turn the fraction upside down as well.'}],
     hint:parallel?'Parallel lines have the same slope. Find the slope of k.':'Find the slope of the given line. Then turn it upside down and change its sign.',
     steps:parallel?[found,{math:`m = ${num(m)}`,note:'Parallel lines have the same slope.'}]
      :[found,
        {math:`${num(perp)}`,note:`Turn \`${num(m)}\` upside down and change its sign.`},
        {math:`${wrap(m)} * ${wrap(perp)} = -1`,note:'Check: the slopes of perpendicular lines multiply to give -1.'}],
     verify:{op:'value',expr:parallel?`(${rise})/(${run})`:`-1/((${rise})/(${run}))`,equals:'ANSWER'}
    };
   }
  }}]
});

/* ---------- The equation of a line ---------- */
K.define({
 id:'equation-of-a-line',title:'Equation of a line',strand:STRAND,lesson:'11-03',
 blurb:'Read the slope and y-intercept from y = mx + c, and build the equation from a point and a slope or from two points.',
 levels:[
  {name:'Read y = mx + c',make(rng){
   for(;;){
    const m=rng.pick([Q(rng.nonzero(-6,6)),Q(rng.nonzero(-6,6)),Q(rng.pick([1,-1,3,-3]),2),Q(rng.pick([1,-1,2,-2]),3)]),c=rng.nonzero(-9,9),standard=mxc(m,c),turned=rng.chance(.4);
    if(m.d===1&&Math.abs(m.n)===Math.abs(c))continue;
    const shown=turned?`y = ${c} ${m.n<0?'-':'+'} ${mxc(Q(Math.abs(m.n),m.d),0)}`:`y = ${standard}`,claim=x=>`(${qStr(m)})*(${x}) + (${c})`;
    return {
     prompt:'Write down the slope and the y-intercept of this line.',math:shown,
     answer:{type:'fields',fields:[{label:'Slope =',value:qStr(m)},{label:'y-intercept =',value:String(c)}]},
     mistakes:[
      {value:[String(c),qStr(m)],why:'Those are the right numbers in the wrong boxes. The slope is the number multiplying x. The y-intercept is the number on its own.'},
      {value:[qStr(Q(Math.abs(m.n),m.d)),String(c)],why:'Keep the minus sign with the slope. The line goes down from left to right.'},
      {value:[qStr(m),String(-c)],why:'Keep the sign of the number on its own. It is part of the y-intercept.'}],
     hint:'In `y = mx + c`, m is the slope and c is the y-intercept.',
     steps:[
      {math:`y = ${standard}`,note:turned?'Write the x term first, so the line is in the form `y = mx + c`.':'The line is already in the form `y = mx + c`.'},
      {math:`m = ${num(m)}`,note:'The slope is the number multiplying x.'},
      {math:`c = ${c}`,note:'The y-intercept is the number on its own. It is the value of y when x is 0.'}],
     verify:[{op:'value',expr:`(${claim(1)}) - (${claim(0)})`,equals:'ANSWER0'},{op:'value',expr:claim(0),equals:'ANSWER1'}]
    };
   }
  }},
  {name:'From a point and a slope',make(rng){
   for(;;){
    const m=rng.pick([-4,-3,-2,2,3,4,5]),x1=rng.nonzero(-5,6),y1=rng.nonzero(-8,9),c=y1-m*x1;
    if(c===0||c===y1)continue;
    return {
     prompt:`Find the equation of the line through \`${P(x1,y1)}\` with slope ${m<0?'`'+m+'`':m}. Give your answer in the form \`y = mx + c\`.`,
     answer:{type:'expr',label:'y =',value:linear(m,'x',c)},
     mistakes:[
      {value:linear(m,'x',y1),why:`${tick(y1)} is the y-coordinate of the point, not the y-intercept. Start from \`y - ${bracket(y1)} = ${m}(x - ${bracket(x1)})\` and multiply out.`},
      {value:linear(m,'x',y1+m*x1),why:`Take care with the signs when you multiply out \`${m}(x - ${bracket(x1)})\`.`}],
     hint:`Start from \`y - ${bracket(y1)} = ${m}(x - ${bracket(x1)})\`. Then get y on its own.`,
     steps:[
      {math:`y - ${bracket(y1)} = ${m}(x - ${bracket(x1)})`,note:'Use the point and the slope: y minus the y-coordinate equals the slope times (x minus the x-coordinate).'},
      {math:`y ${signed(-y1)} = ${linear(m,'x',-m*x1)}`,note:'Multiply out the bracket.'},
      {math:`y = ${linear(m,'x',c)}`,note:`${y1>0?'Add '+y1+' to':'Subtract '+(-y1)+' from'} both sides.`},
      {math:`${m}(${x1}) ${signed(c)} = ${y1}`,note:'Check: the point fits the equation.'}],
     verify:{op:'identity',a:`(${m})*(x - (${x1})) + (${y1})`,b:'ANSWER'}
    };
   }
  }},
  {name:'Exam style',make(rng){
   for(;;){
    if(rng.chance(.6)){
     /* Through two points. The x-coordinates are multiples of the run, so c is a whole number. */
     const run=rng.pick([1,1,2,3]),rise=rng.nonzero(-5,5),k=rng.int(-3,3),t=rng.pick([1,2]),x1=run*k,y1=rng.int(-6,6),x2=x1+run*t,y2=y1+rise*t,m=Q(rise,run),c=y1-rise*k;
     if(c===0||Math.abs(rise)===run&&run>1)continue;
     const value=mxc(m,c),flip=rng.chance(.5),A=flip?[x2,y2]:[x1,y1],B=flip?[x1,y1]:[x2,y2];
     return {
      prompt:`Find the equation of the line through \`A${P(...A)}\` and \`B${P(...B)}\`. Give your answer in the form \`y = mx + c\`.`,
      answer:{type:'expr',label:'y =',value},
      mistakes:[
       {value:mxc(Q(run,rise),c),why:'Check the slope. The change in y goes on top and the change in x on the bottom.'},
       {value:mxc(m,A[1]),why:`${tick(A[1])} is the y-coordinate of A, not the y-intercept. Put A into \`y - ${bracket(A[1])} = m(x - ${bracket(A[0])})\` and multiply out.`}],
      hint:'Find the slope from the two points first. Then use one point and that slope.',
      steps:[
       {math:`m = frac(${top(B[1],A[1])}, ${top(B[0],A[0])}) = ${num(m)}`,note:'Find the slope: change in y over change in x.'},
       {math:`y - ${bracket(A[1])} = ${m.d===1?bracket(m.n):'('+num(m)+')'}(x - ${bracket(A[0])})`,note:'Use the point A and the slope.'},
       {math:`y = ${value}`,note:'Multiply out the bracket and get y on its own.'},
       {math:`${num(Q(rise*B[0],run))} ${signed(c)} = ${B[1]}`,note:`Check with the other point: put \`x = ${B[0]}\` into the equation.`}],
      verify:{op:'identity',a:`(((${y2}) - (${y1}))/((${x2}) - (${x1})))*(x - (${x1})) + (${y1})`,b:'ANSWER'}
     };
    }
    /* The slope of a line written as ax + by = c. */
    const a=rng.nonzero(-6,6),b=rng.pick([2,3,4,5,-2,-3]),c=rng.nonzero(-12,12),m=Q(-a,b),line=`${terms([[a,'x'],[b,'y']])} = ${c}`;
    if(Math.abs(a)===Math.abs(b))continue;
    return {
     prompt:'Find the slope of this line.',math:line,
     answer:{type:'number',label:'Slope =',value:qStr(m),simplest:true},
     mistakes:[
      {value:qStr(Q(a,b)),why:`When \`${terms([[a,'x']])}\` moves to the other side, its sign changes.`},
      {value:String(-a),why:`You moved the x term across. Now divide every term by ${tick(b)} to get y on its own.`},
      {value:qStr(Q(-b,a)),why:'Get y on its own first. The slope is then the number multiplying x.'}],
     hint:'Rearrange the equation into the form `y = mx + c`. The slope is the number multiplying x.',
     steps:[
      {math:`${terms([[b,'y']])} = ${terms([[-a,'x'],[c,'']])}`,note:`${a>0?'Subtract':'Add'} \`${terms([[Math.abs(a),'x']])}\` ${a>0?'from':'to'} both sides.`},
      {math:`y = ${mxc(m,Q(c,b))}`,note:`Divide every term by ${tick(b)}.`},
      {math:`m = ${num(m)}`,note:'The slope is the number multiplying x.'}],
     /* Two points on the line, at x = 0 and x = 1, give the slope independently. */
     verify:{op:'value',expr:`((${c}) - (${a})*1)/(${b}) - ((${c}) - (${a})*0)/(${b})`,equals:'ANSWER'}
    };
   }
  }}]
});

/* ---------- Points on a line, and where lines meet ---------- */
K.define({
 id:'points-and-lines',title:'Points on a line',strand:STRAND,lesson:'11-06',
 blurb:'Use the equation of a line to find a missing coordinate, where the line cuts the axes and where two lines meet.',
 levels:[
  {name:'A missing coordinate',make(rng){
   for(;;){
    const m=rng.pick([-4,-3,-2,2,3,4,5]),c=rng.nonzero(-9,9),x0=rng.nonzero(-5,6),y0=m*x0+c,line=`y = ${linear(m,'x',c)}`;
    if(rng.chance(.55))return {
     prompt:`The point \`(${x0}, k)\` is on the line \`${line}\`. Find k.`,
     answer:{type:'number',label:'k =',value:String(y0)},
     mistakes:[
      {value:qStr(Q(x0-c,m)),why:`${tick(x0)} is the x-coordinate, the first number of the point. Put it in place of x, not y.`},
      {value:String(m+x0+c),why:`\`${m}x\` means ${m} times x. Work out \`${m}(${x0})\` first.`},
      {value:String(m*x0-c),why:`Keep the sign of the number on its own: it is \`${signed(c)}\`.`}],
     hint:`A point on the line fits its equation. Put \`x = ${x0}\` into the equation.`,
     steps:[
      {math:`k = ${m}(${x0}) ${signed(c)}`,note:`Put ${tick(x0)} in place of x and k in place of y.`},
      {math:`k = ${m*x0} ${signed(c)} = ${y0}`,note:'Multiply first, then add or subtract.'}],
     verify:{op:'value',expr:`(${m})*(${x0}) + (${c})`,equals:'ANSWER'}
    };
    return {
     prompt:`The point \`(k, ${y0})\` is on the line \`${line}\`. Find k.`,
     answer:{type:'number',label:'k =',value:String(x0)},
     mistakes:[
      {value:String(m*y0+c),why:`${tick(y0)} is the y-coordinate, the second number of the point. Put it in place of y and solve for x.`},
      {value:qStr(Q(y0+c,m)),why:`To undo \`${signed(c)}\`, do the opposite on both sides.`}],
     hint:`Put \`y = ${y0}\` into the equation. Then solve for x.`,
     steps:[
      {math:`${y0} = ${linear(m,'k',c)}`,note:`Put ${tick(y0)} in place of y and k in place of x.`},
      {math:`${y0-c} = ${m}k`,note:`${c>0?'Subtract '+c+' from':'Add '+(-c)+' to'} both sides.`},
      {math:`k = ${x0}`,note:`Divide both sides by ${tick(m)}.`}],
     verify:{op:'solve',eq:`(${m})*k + (${c}) = ${y0}`,variable:'k',solutions:['ANSWER']}
    };
   }
  }},
  {name:'Where a line cuts the axes',make(rng){
   for(;;){
    const a=rng.pick([1,2,3,4,5,-2,-3]),b=rng.pick([1,2,3,4,5,-2,-4]);
    if(Math.abs(a)===Math.abs(b))continue;
    /* c is a multiple of a and of b, so both cuts are whole numbers. */
    const c=a*b*rng.pick([1,2,3,-1,-2]),xCut=c/a,yCut=c/b,line=`${terms([[a,'x'],[b,'y']])} = ${c}`;
    if(Math.abs(xCut)>12||Math.abs(yCut)>12)continue;
    return {
     prompt:'Find where this line cuts the x-axis and where it cuts the y-axis.',math:line,
     answer:{type:'fields',fields:[{label:'It cuts the x-axis at x =',value:String(xCut)},{label:'It cuts the y-axis at y =',value:String(yCut)}]},
     mistakes:[
      {value:[String(yCut),String(xCut)],why:'Those are the right numbers in the wrong boxes. On the x-axis y is 0, so solve for x there.'},
      {value:[String(-xCut),String(-yCut)],why:'Check your signs when you divide.'}],
     hint:'Every point on the x-axis has y = 0. Every point on the y-axis has x = 0.',
     steps:[
      {math:`${terms([[a,'x']])} = ${c}`,note:'On the x-axis y is 0, so the y term disappears.'},
      {math:`x = ${xCut}`,note:`Divide both sides by ${tick(a)}. The line cuts the x-axis at \`${P(xCut,0)}\`.`},
      {math:`${terms([[b,'y']])} = ${c}`,note:'On the y-axis x is 0, so the x term disappears.'},
      {math:`y = ${yCut}`,note:`Divide both sides by ${tick(b)}. The line cuts the y-axis at \`${P(0,yCut)}\`.`}],
     verify:[{op:'solve',eq:`(${a})*x + (${b})*0 = ${c}`,variable:'x',solutions:['ANSWER0']},{op:'solve',eq:`(${a})*0 + (${b})*y = ${c}`,variable:'y',solutions:['ANSWER1']}]
    };
   }
  }},
  {name:'Where two lines meet',make(rng){
   for(;;){
    const x0=rng.nonzero(-5,5),y0=rng.nonzero(-7,7),m1=rng.pick([-3,-2,2,3,4]),m2=rng.pick([-4,-2,3,5,6]),c1=y0-m1*x0,c2=y0-m2*x0;
    if(Math.abs(m1-m2)<2||!c1||!c2||Math.abs(c1)>16||Math.abs(c2)>16)continue;
    const first=`y = ${linear(m1,'x',c1)}`,second=`y = ${linear(m2,'x',c2)}`;
    return {
     prompt:'Find the point where these two lines meet.',math:`${first} and ${second}`,
     answer:{type:'fields',fields:[{label:'x =',value:String(x0)},{label:'y =',value:String(y0)}]},
     mistakes:[
      {value:[String(y0),String(x0)],why:'Those are the right numbers in the wrong boxes. x goes first.'},
      {value:[String(-x0),String(m1*-x0+c1)],why:'Check the signs when you move terms across the equals sign.'}],
     hint:'At the meeting point both lines have the same y. Put the two right-hand sides equal to each other.',
     steps:[
      {math:`${linear(m1,'x',c1)} = ${linear(m2,'x',c2)}`,note:'Both expressions equal y at the meeting point, so they equal each other.'},
      {math:`${linear(m1-m2,'x',0)} = ${c2-c1}`,note:'Collect the x terms on the left and the numbers on the right.'},
      {math:`x = ${x0}`,note:`Divide both sides by ${tick(m1-m2)}.`},
      {math:`y = ${m1}(${x0}) ${signed(c1)} = ${y0}`,note:'Put this x into the first equation to find y.'},
      {math:`${m2}(${x0}) ${signed(c2)} = ${y0}`,note:`Check with the second equation. The lines meet at \`${P(x0,y0)}\`.`}],
     verify:{op:'system',eqs:[`y = (${m1})*x + (${c1})`,`y = (${m2})*x + (${c2})`],solution:{x:'ANSWER0',y:'ANSWER1'}}
    };
   }
  }}]
});
})();
