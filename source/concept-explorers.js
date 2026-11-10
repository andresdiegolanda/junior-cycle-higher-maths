/* Small, deterministic models. Controls change the mathematics, not decoration.
   No random scores, autoplay on entry, remote assets or student data are used. */
const conceptMemory={};
let conceptTimer=null;
const conceptSpecs={
 1:['Why every term meets every term','Length x',1,6,1,3,'Would (x + 2)(x + 3) contain just x² + 6?',['Yes, multiply the first and last terms','No, the two cross-products also count'],1],
 2:['Factorising is rebuilding a rectangle','Length x',1,6,1,3,'What do 4x and 8 have in common?',['A height of 4','A height of x'],0],
 3:['Who belongs in the answer?',null,0,2,1,0,'Does “A or B” include people in both?',['Yes, count them once','No, leave out the overlap'],0],
 4:['Can a rise and fall undo each other?','Percentage change',10,40,5,20,'After a 20% rise and then a 20% fall, is €100 restored?',['Yes, the changes cancel','No, the second percentage uses a new base'],1],
 5:['Who gets a chance to be heard?',null,0,2,1,0,'Would surveying one team represent a whole school fairly?',['A larger team always fixes it','Some school groups would still be excluded'],1],
 6:['Cut, slide, keep the area','Perpendicular height',2,5,1,3,'If you move a triangle without stretching it, does its area change?',['No, the same piece is moved','Yes, because it is in a new place'],0],
 7:['The mean is a fair share','Smallest starting stack',1,5,1,2,'If counters are moved between stacks, what stays fixed?',['The total number of counters','The height of every stack'],0],
 8:['Three corners, one straight turn','Angle A in degrees',30,80,5,50,'If one angle grows while another stays fixed, what must the third do?',['Grow by the same amount','Shrink by the same amount'],1],
 9:['Exactly one is not the same as at least one','Number of heads wanted',0,2,1,1,'Are HT and TH two possible outcomes?',['Yes, the order differs','No, one head is one outcome'],0],
 10:['Two conditions, one shared point','Total x + y',6,12,2,8,'At the intersection, which equation is true?',['Both equations','Only the steeper line'],0],
 11:['Slope is a journey across the grid','Height of point B',1,9,1,5,'With the same run, what makes a line steeper?',['A larger rise','A smaller rise'],0],
 12:['Eight equal boxes unlock the ratio','Value of one part (€)',1,20,1,10,'For a 3:5 share, how many equal parts make the whole?',['5 parts','8 parts'],1],
 13:['A share of the group becomes a share of the turn','People in this category (out of 12)',1,11,1,3,'If a category doubles while the total stays fixed, what happens to its angle?',['It doubles','It stays the same'],0],
 14:['Powers count repeated factors','Number of factors of 2',1,6,1,3,'Does 2³ mean 2 × 3?',['Yes, three times two','No, three factors of two'],1],
 15:['Two factors, two ways to make zero','First root',1,4,1,2,'Can two non-zero real numbers have product zero?',['No, at least one factor must be zero','Yes, if one is negative'],0],
 16:['Same shape, different size','Length scale factor',1,3,0.5,2,'If all lengths double, does the area only double?',['No, it becomes four times as large','Yes, everything doubles'],0],
 17:['Peel the label from the can','Cylinder height',2,6,1,4,'Which length becomes the width of the unrolled label?',['The diameter','The circumference'],1],
 18:['What does one more square really cost?','Number of squares',1,6,1,3,'Does each extra square need four new matchsticks?',['No, it shares one side','Yes, every square has four sides'],0],
 19:['Follow the number, then reverse the story','Input',-3,6,1,2,'To undo “multiply by 2, then add 3”, what comes first?',['Divide by 2','Subtract 3'],1],
 20:['Same unit price — but is it proportion?','Number of items',1,6,1,2,'If there is a fixed delivery fee, must twice the items cost twice as much?',['Yes, because the graph is straight','No, the fixed fee is not doubled'],1],
 21:['Make the pieces the same size',null,0,2,1,0,'Can halves and thirds be added by adding their denominators?',['No, first use equal-sized pieces','Yes, 1/2 + 1/3 = 2/5'],0],
 22:['An angle controls a side ratio','Angle in degrees',20,70,5,30,'As this angle grows with hypotenuse fixed, what happens to the opposite side?',['It grows','It stays fixed'],0],
 23:['One height, two moments','Time in seconds',0,4,0.25,1,'Can this ball be 15 metres high at two different times?',['Yes, once up and once down','No, a function allows only one time'],0],
 24:['Move the whole shape together','Horizontal movement',-3,3,1,2,'If just one vertex moves differently, is it still a translation?',['Yes, if the triangle still looks similar','No, every vertex needs the same move'],1]
};
const cxNum=n=>Number(n.toFixed(2)).toString();
const cxEquals=n=>Number(n.toFixed(2))===n?'=':'≈';
const cxText=(x,y,text,size=22,colour='#173349',anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${colour}">${E(text)}</text>`;
const cxRect=(id,x,y,w,h,fill='#dff1eb')=>`<rect id="${id}" x="${x}" y="${y}" width="${Math.max(0,w)}" height="${Math.max(0,h)}" rx="5" fill="${fill}" stroke="#173349" stroke-width="1.5"/>`;
const cxLine=(id,x1,y1,x2,y2,colour='#173349',width=3)=>`<line id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colour}" stroke-width="${width}"/>`;
const cxCircle=(id,x,y,r,fill='#087f75')=>`<circle id="${id}" cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="#173349" stroke-width="1.5"/>`;
function cxGraph(fn,xmax=10,ymax=10){
 const x=x=>80+x/xmax*520,y=y=>310-y/ymax*240;
 let svg=cxLine('axis-x',80,310,620,310)+cxLine('axis-y',80,310,80,55)+cxText(70,335,'0',17);
 for(let i=1;i<=5;i++)svg+=cxLine('grid-x'+i,x(i*xmax/5),70,x(i*xmax/5),310,'#d6e2e8',1)+cxText(x(i*xmax/5),335,cxNum(i*xmax/5),15)+cxLine('grid-y'+i,80,y(i*ymax/5),600,y(i*ymax/5),'#d6e2e8',1)+cxText(61,y(i*ymax/5)+5,cxNum(i*ymax/5),15);
 if(fn){const pts=Array.from({length:101},(_,i)=>{const a=i*xmax/100;return `${x(a)},${y(fn(a))}`}).join(' ');svg+=`<defs><clipPath id="concept-plot-clip"><rect x="80" y="70" width="520" height="240"/></clipPath></defs><polyline clip-path="url(#concept-plot-clip)" id="curve" points="${pts}" fill="none" stroke="#087f75" stroke-width="4"/>`}
 return {svg,x,y};
}
function cxSector(cx,cy,r,start,angle,fill){
 const p=a=>[cx+r*Math.cos(a*Math.PI/180),cy-r*Math.sin(a*Math.PI/180)];
 const a=p(start),b=p(start+angle);
 return `<path d="M${cx},${cy} L${a} A${r},${r} 0 ${angle>180?1:0} 0 ${b} Z" fill="${fill}" stroke="#173349" stroke-width="2"/>`;
}
function conceptScene(ch,n,step,variant='share'){
 let svg='',math='',explain='',title=['Picture it','Make one change','Connect it to the rule'][step];
 const green='#087f75',blue='#3175ba',gold='#b96a12';
 if(ch===1){
  const x=30*n,w=x+90,h=x+60,ox=110,oy=55;
  svg=cxRect('whole',ox,oy,w,h)+cxText(ox+w/2,35,`x + 3 = ${n+3}`)+cxText(ox+w+70,oy+h/2,`x + 2 = ${n+2}`);
  if(step>0)svg+=cxRect('xx',ox,oy,x,x,'#dff1eb')+cxRect('three-x',ox+x,oy,90,x,'#e3edfb')+cxRect('two-x',ox,oy+x,x,60,'#e3edfb')+cxRect('six',ox+x,oy+x,90,60,'#fff0cf')+cxText(ox+x/2,oy+x/2+7,'x²')+cxText(ox+x+45,oy+x/2+7,'3x')+cxText(ox+x/2,oy+x+38,'2x')+cxText(ox+x+45,oy+x+38,'6');
  math=step===2?'(x + 2)(x + 3) = x² + 3x + 2x + 6 = x² + 5x + 6':`Whole area = (${n} + 2) × (${n} + 3) = ${(n+2)*(n+3)}`;
  explain=step===0?'Think of each bracket as a side length. Predict how many smaller rectangles appear when both sides are split.':step===1?'There are four pieces, not two. The blue strips are the two cross-products that are easy to miss.':'Add all four areas. The two blue strips contain three x plus two x, so together they make five x.';
 }else if(ch===2){
  const w=35*n;svg=cxRect('a',100,100,w,140)+cxRect('b',step===0?150+w:100+w,100,70,140,'#fff0cf')+cxText(100+w/2,180,'4x')+cxText((step===0?150:100)+w+35,180,'8')+cxText(70,180,'4')+cxText(100+w/2,275,'x')+cxText((step===0?150:100)+w+35,275,'2');
  math='4x + 8 = 4(x + 2)';explain=step===0?'Both rectangles have height four. The second has area eight, so its width must be two.':step===1?'Slide the pieces together. Their widths add, while their shared height stays four.':'The same area can be written as four x plus eight, or as four times the whole width x plus two. Multiply back to check.';
 }else if(ch===3){
  svg=`<ellipse cx="270" cy="180" rx="140" ry="120" fill="#e3edfb" stroke="${blue}" stroke-width="3"/><ellipse cx="430" cy="180" rx="140" ry="120" fill="#dff1eb" fill-opacity=".7" stroke="${green}" stroke-width="3"/>`+cxText(195,70,'A')+cxText(505,70,'B');
  [[210,145,'1','a'],[225,225,'2','a'],[350,175,'3','both'],[470,145,'4','b'],[475,225,'5','b']].forEach(([x,y,t,part])=>{const on=step===0||step===1&&part==='both'||step===2&&part==='a';svg+=cxCircle('member'+t,x,y,24,on?green:'#edf1f4')+cxText(x,y+7,t,21,on?'#fff':'#607080')});
  math=['A ∪ B = {1, 2, 3, 4, 5}','A ∩ B = {3}','A ∖ B = {1, 2}'][step];explain=['Union keeps everybody in either circle. Member three is in both, but appears just once.','Intersection keeps only the shared middle. Read the symbol as “and”.','A minus B starts inside A, then removes the shared members. Read it as “A but not B”.'][step];
 }else if(ch===4){
  const up=100*(1+n/100),down=up*(1-n/100),vals=[100,up,down];
  vals.slice(0,step+1).forEach((v,i)=>{svg+=cxRect('bar'+i,100+i*175,310-v*1.6,100,v*1.6,i===2?'#fff0cf':'#dff1eb')+cxText(150+i*175,295-v*1.6,'€'+cxNum(v))+cxText(150+i*175,340,['Start','Rise '+n+'%','Fall '+n+'%'][i],18)});
  math=step===0?'Start = €100':step===1?`€100 × ${cxNum(1+n/100)} = €${cxNum(up)}`:`€${cxNum(up)} × ${cxNum(1-n/100)} = €${cxNum(down)}`;
  explain=step===0?'The starting hundred euro is the base for the rise.':step===1?`After the rise, the balance is ${cxNum(up)} euro. That is now the base for the fall.`:`The fall removes ${cxNum(up*n/100)} euro, more than the original rise. The percentages match but the bases do not.`;
 }else if(ch===5){
  for(let group=0;group<4;group++){svg+=cxText(125+group*145,65,'Year '+(group+1),19);for(let j=0;j<4;j++){const selected=step===0||step===1&&group===0||step===2&&j===0;svg+=cxCircle('p'+group+j,125+group*145,105+j*55,17,selected?green:'#e3e8ed')}}
  math=['Population: four year groups','One-group sample: three groups excluded','Proportional design: include each year group'][step];explain=['The population is everyone you want to describe. Each dot represents a student in this small model.','Asking only Year 1 leaves the other years unheard. Asking more Year 1 students does not fix that exclusion.','For this equal-sized population, choose the same number randomly within each year. Real groups may need different sample sizes to match their proportions.'][step];
 }else if(ch===6){
  const h=n*280/6,base=280,y=310;
  svg=`<polygon points="200,${y} 480,${y} 570,${y-h} 290,${y-h}" fill="#dff1eb" stroke="${green}" stroke-width="3"/>`;
  if(step>0){svg=`<polygon points="290,${y} 480,${y} 570,${y-h} 290,${y-h}" fill="#dff1eb" stroke="${green}" stroke-width="2"/>`;const dx=step===2?base:0;svg+=`<polygon id="cut-piece" points="${200+dx},${y} ${290+dx},${y} ${290+dx},${y-h}" fill="#fff0cf" stroke="${gold}" stroke-width="2"/>`}
  svg+=cxLine('height',step===2?590:180,y,step===2?590:180,y-h,blue)+cxText(step===2?625:145,y-h/2,n+' cm',19)+cxText(step===2?430:340,340,'base 6 cm');
  math=`Area = 6 × ${n} = ${6*n} cm²`;explain=['The perpendicular height goes straight between the parallel sides. It is not the sloping side.','Cut off the left triangle along a perpendicular. The pieces still contain exactly the same area.','Slide the triangle to the right. You now have a rectangle with the original base and height. That is why base times height works.'][step];
 }else if(ch===7){
  const vals=step===0?[n,n+2,n+4]:step===1?[n+1,n+2,n+3]:[n+2,n+2,n+2];
  vals.forEach((v,i)=>{for(let j=0;j<v;j++){const donor=i===0&&j>=n,id=donor?'counter-2-'+(n+3-(j-n)):'counter-'+i+'-'+j;svg+=cxRect(id,160+i*170,300-(j+1)*26,70,23,donor||i===2&&j>=n+2?'#fff0cf':'#dff1eb')}svg+=cxText(195+i*170,335,v)});
  math=`Mean = (${n} + ${n+2} + ${n+4}) ÷ 3 = ${n+2}`;explain=step===0?`The three stacks contain ${3*n+6} counters in total. Predict their height after equal sharing.`:step===1?'Move one counter from the tallest stack to the shortest. The total stays the same.':`Move one more. Now every stack has ${n+2}. The mean is the height of these equal stacks, not a new total.`;
 }else if(ch===8){
  const a=n,b=50,c=180-a-b;
  if(step<2){const ax=140,bx=550,base=410,tx=(base*Math.tan(b*Math.PI/180))/(Math.tan(a*Math.PI/180)+Math.tan(b*Math.PI/180)),height=tx*Math.tan(a*Math.PI/180);const scale=Math.min(1,220/height),cx=140+tx*scale,cy=300-height*scale,rx=140+base*scale;
   svg=`<polygon points="140,300 ${rx},300 ${cx},${cy}" fill="#e3edfb" stroke="${blue}" stroke-width="3"/>`+cxText(168,287,a+'°',18)+cxText(rx-35,287,b+'°',18)+cxText(cx,cy-16,step===0?'?':c+'°');
  }else svg=cxLine('straight',150,280,580,280)+cxSector(365,280,150,0,a,'#dff1eb')+cxSector(365,280,150,a,b,'#e3edfb')+cxSector(365,280,150,a+b,c,'#fff0cf')+cxText(365,65,`${a}° + ${b}° + ${c}° = 180°`);
  math=`Third angle = 180° − ${a}° − 50° = ${c}°`;explain=['Two angles are given. Before calculating, predict what happens to the missing angle if angle A grows.','The missing angle is whatever remains of the triangle’s 180-degree total.','The three angle pieces fill one straight turn. Changing one angle cannot change that total.'][step];
 }else if(ch===9){
  const outcomes=['HH','HT','TH','TT'],fav=outcomes.filter(t=>[...t].filter(x=>x==='H').length===n).length;
  outcomes.forEach((t,i)=>{const on=step===2&&[...t].filter(x=>x==='H').length===n;svg+=cxRect('coin'+i,170+(i%2)*200,75+Math.floor(i/2)*125,170,100,on?'#dff1eb':'#f0f4f7')+cxText(255+(i%2)*200,135+Math.floor(i/2)*125,step===0&&i>0?'?':t,32)});
  math=step===2?`P(exactly ${n} heads) = ${fav}/4`:'Two independent fair coins → four equally likely outcomes';explain=step===0?'List the first coin’s result, then the second. How many different ordered outcomes are possible?':step===1?'Heads then tails and tails then heads are separate outcomes. Each of the four has the same chance.':`Exactly ${n} heads matches ${fav} of the four equally likely outcomes. Change the target to compare zero, one and two heads.`;
 }else if(ch===10){
  const g=cxGraph(x=>n-x,14,14),ix=(n+2)/2,iy=(n-2)/2;svg=g.svg+cxText(355,30,'x + y = '+n,22);
  if(step>0)svg+=cxLine('second-line',g.x(2),g.y(0),g.x(14),g.y(12),blue,4);
  if(step===2)svg+=cxCircle('meeting',g.x(ix),g.y(iy),8,'#b96a12')+cxText(g.x(ix)+80,g.y(iy)-20,`(${ix}, ${iy})`);
  math=step===0?`x + y = ${n}`:step===1?`x + y = ${n}; x − y = 2`:`x = ${ix}, y = ${iy}; check: ${ix+iy} = ${n}, ${ix-iy} = 2`;
  explain=['Every point on the first line obeys the total. One equation still allows many pairs.','The blue line adds a second condition: x must be two more than y. Look for a pair on both lines.','Only the crossing satisfies both conditions. Change the total and watch the crossing move while the difference stays two.'][step];
 }else if(ch===11){
  const g=cxGraph(null,6,10);svg=g.svg+cxLine('slope-line',g.x(1),g.y(1),g.x(5),g.y(n),green,4)+cxCircle('a',g.x(1),g.y(1),7)+cxCircle('b',g.x(5),g.y(n),7)+cxText(g.x(1),g.y(1)-18,'A(1, 1)',18)+cxText(g.x(5),g.y(n)-18,`B(5, ${n})`,18);
  if(step>0)svg+=cxLine('run',g.x(1),g.y(1),g.x(5),g.y(1),blue,5)+cxText(g.x(3),g.y(1)-15,'run = 4',18);
  if(step===2)svg+=cxLine('rise',g.x(5),g.y(1),g.x(5),g.y(n),gold,5)+cxText(g.x(5)+40,(g.y(1)+g.y(n))/2,'rise '+(n-1),17);
  math=`Slope = (${n} − 1)/(5 − 1) = ${cxNum((n-1)/4)}`;explain=['Slope describes the change between two points. Move B up and down without changing its horizontal position.','The horizontal change is four. Keep the same point order for the vertical change.','Divide the rise by that run. A rise of zero gives a horizontal line with slope zero.'][step];
 }else if(ch===12){
  if(variant==='share'){
   if(step===0)svg=cxRect('money',200,90,300,170)+cxText(350,185,'€'+8*n,48)+cxText(350,305,'Share in the ratio 3 : 5',27);
   else {for(let i=0;i<8;i++){const x=step===1?70+i*75: i<3?80+i*75:85+(i-3)*75,y=step===1?140:i<3?85:220;svg+=cxRect('part'+i,x,y,63,65,i<3?'#dff1eb':'#e3edfb')+cxText(x+31,y+40,'€'+n,21)}if(step===2)svg+=cxText(545,128,'3 parts = €'+3*n)+cxText(545,263,'5 parts = €'+5*n);}
   math=step===0?`Whole = €${8*n}`:step===1?`3 + 5 = 8 equal parts; one part = €${8*n} ÷ 8 = €${n}`:`First share = 3 × €${n} = €${3*n}; second = 5 × €${n} = €${5*n}`;
   explain=step===0?'Imagine the money as eight identical envelopes. Three belong to one person, five to the other. Predict the value of each envelope.':step===1?`Divide the whole ${8*n} euro among all eight boxes. Each box is worth ${n} euro. The five in the ratio was only the second person’s count, not the whole.`:`Three boxes make ${3*n} euro; five make ${5*n} euro. They add back to ${8*n} euro. Change the total: every box changes by the same factor.`;
  }else {const inverse=variant==='inverse',a=n,b=inverse?120/n:3*n,max= inverse?120:60;svg=cxRect('left',140,310-a/20*220,130,a/20*220)+cxRect('right',430,310-b/max*220,130,b/max*220,'#e3edfb')+cxText(205,55,inverse?'Speed':'Tickets')+cxText(495,55,inverse?'Time':'Cost')+cxText(205,340,inverse?`${a} km/h`:String(a))+cxText(495,340,inverse?`${cxNum(b)} h`:`€${b}`);
   math=inverse?`Fixed distance: 120 km; time = 120 ÷ ${n} ${cxEquals(b)} ${cxNum(b)} h`:`Fixed price: €3 each; cost = ${n} × €3 = €${3*n}`;
   explain=inverse?'Keep the journey at 120 kilometres. Increase the speed and watch the time shrink. Speed times time stays 120: this is inverse proportion.':'Keep the price at three euro per ticket. More tickets means more cost by the same factor. Cost divided by ticket count stays three: this is direct proportion.';
  }
 }else if(ch===13){
  const angle=n*30;svg=step===0?Array.from({length:12},(_,i)=>cxCircle('person'+i,130+(i%6)*85,135+Math.floor(i/6)*90,25,i<n?green:'#e8edf2')).join(''):cxCircle('whole-pie',350,190,135,'#edf1f4')+cxSector(350,190,135,90,angle,'#8bd4c1')+cxText(350,190,step===2?angle+'°':n+'/12',28);
  math=`${n}/12 of the people → ${n}/12 × 360° = ${angle}°`;explain=['The highlighted people are one category. The total stays twelve while you change the category size.','Give the category the same fraction of a full turn. The whole circle stands for all twelve people.','Each person represents thirty degrees in this group. The angle changes in proportion to the count.'][step];
 }else if(ch===14){
  svg=cxText(350,120,Array.from({length:n},()=>2).join(' × '),36)+cxText(350,230,step===0?'How many factors?':step===1?'2'+['⁰','¹','²','³','⁴','⁵','⁶'][n]:String(2**n),56);
  math=step===2?`2^${n} = ${2**n}`:`2^${n} means ${n} factors of 2`;explain=['The exponent counts how many copies are multiplied together. It is not an instruction to multiply the base by the exponent.','The short power notation describes exactly the repeated product above.','Add one factor using the control: the value doubles. Remove one factor: divide by two.'][step];
 }else if(ch===15){
  const r=n,s=n+2;svg=cxRect('factor1',90,100,230,125)+cxRect('factor2',380,100,230,125,'#e3edfb')+cxText(205,155,`x − ${r}`,32)+cxText(495,155,`x − ${s}`,32)+cxText(350,170,'×',32);
  if(step>0)svg+=cxText(205,200,`0 when x = ${r}`,20);
  if(step===2)svg+=cxText(495,200,`0 when x = ${s}`,20)+cxText(350,300,`x = ${r} OR x = ${s}`,27);
  math=`(x − ${r})(x − ${s}) = 0`;explain=['The equation asks when this product is zero. You do not need both boxes to be zero together.','Choose x equal to the first root. The first box becomes zero, making the whole product zero.','There is a second route: make the other box zero. These are two alternative inputs, joined by “or”.'][step];
 }else if(ch===16){
  svg=`<polygon points="70,300 150,300 70,240" fill="#e3edfb" stroke="${blue}" stroke-width="3"/><polygon id="large-triangle" points="320,300 ${320+80*n},300 320,${300-60*n}" fill="#dff1eb" stroke="${green}" stroke-width="3"/>`+cxText(110,330,'4')+cxText(48,275,'3')+cxText(320+40*n,330,cxNum(4*n))+cxText(295,300-30*n,cxNum(3*n));
  math=step<2?`Lengths × ${n}: 3 → ${3*n}, 4 → ${4*n}`:`Area × ${n}²: 6 → ${cxNum(6*n*n)}`;explain=['Match the right angles and the corresponding sides. The larger drawing is the same shape.','Every matching length uses the same multiplier. Turning a shape would not change which sides correspond.','Area uses two lengths. Both scale, so area uses the square of the length factor.'][step];
 }else if(ch===17){
  if(step===0)svg=`<path d="M200 100 V280 A140 35 0 0 0 480 280 V100" fill="#dff1eb" stroke="${green}" stroke-width="3"/><ellipse cx="340" cy="100" rx="140" ry="35" fill="#e3edfb" stroke="${blue}" stroke-width="3"/>`+cxText(340,106,'radius 2',21)+cxText(545,200,'height '+n,21);
  else svg=cxRect('label',120,110,400,n*25)+cxText(320,85,'width = circumference = 4π',22)+cxText(575,110+n*12.5,'height '+n,20)+(step===2?cxCircle('end1',70,70,27,'#e3edfb')+cxCircle('end2',70,285,27,'#e3edfb'):'');
  math=step===0?'Curved surface = the label':step===1?`Label area = 4π × ${n} = ${4*n}π`:`Closed surface = ${4*n}π + 2 × 4π = ${4*n+8}π`;
  explain=['Imagine peeling off only the curved label. Predict its width when laid flat.','It becomes a rectangle. Its width travelled all the way around the can, so it equals the circumference.','A closed cylinder also has two circular ends. An open container may have only one. Count the faces before adding them.'][step];
 }else if(ch===18){
  const side=75,start=80;for(let i=0;i<n;i++)svg+=cxLine('top'+i,start+i*side,120,start+(i+1)*side,120,green,6)+cxLine('bottom'+i,start+i*side,195,start+(i+1)*side,195,green,6);for(let i=0;i<=n;i++)svg+=cxLine('edge'+i,start+i*side,120,start+i*side,195,i===0?gold:green,6);
  svg+=cxText(350,280,step===0?'Count the sticks, not four sides per square':step===1?'One starting stick + three for each square':`${n} squares use ${3*n+1} sticks`,24);
  math=`Tₙ = 1 + 3n; T${n} = 1 + 3(${n}) = ${3*n+1}`;explain=['Neighbouring squares share a complete side. A shared stick is only one stick.','Keep the first vertical stick fixed. Every square then contributes a top, a bottom and a new right edge.','That is one fixed stick plus three per square. Change the number of squares and check the rule visually.'][step];
 }else if(ch===19){
  const vals=[n,2*n,2*n+3];for(let i=0;i<3;i++){svg+=cxRect('machine'+i,60+i*220,120,170,110,i<=step?'#dff1eb':'#edf1f4')+cxText(145+i*220,180,i<=step?String(vals[i]):'?',38)+cxText(145+i*220,90,['Input','Multiply by 2','Add 3'][i],21);if(i<2)svg+=cxText(255+i*220,183,'→',30)}
  math=step===0?`Input = ${n}`:step===1?`${n} × 2 = ${2*n}`:`f(${n}) = 2(${n}) + 3 = ${2*n+3}`;explain=['Pick an input. The machine’s operations will stay the same, even if the input is negative.','Multiplication happens first. The result goes into the next box; it is not the final output yet.','Now add three. To reverse the trip, subtract three first, then divide by two. The last operation is undone first.'][step];
 }else if(ch===20){
  const fee=variant==='fee'?2:0,g=cxGraph(x=>3*x+fee,12,40);svg=g.svg+cxText(350,30,fee?'€3 per item + €2 fixed fee':'€3 per item, no fixed fee',23)+cxText(350,365,'Number of items',19)+cxText(40,40,'Cost €',18)+cxCircle('cost1',g.x(n),g.y(3*n+fee),8)+cxText(g.x(n),g.y(3*n+fee)-15,'€'+(3*n+fee),17);
  if(step>0)svg+=cxCircle('cost2',g.x(2*n),g.y(6*n+fee),8,blue)+cxText(g.x(2*n),g.y(6*n+fee)-15,'€'+(6*n+fee),17);
  if(step===2)svg+=cxCircle('origin-test',g.x(0),g.y(fee),9,gold);
  math=`C(${n}) = €${3*n+fee}; C(${2*n}) = €${6*n+fee}; C(0) = €${fee}`;explain=step===0?'The unit price is fixed. Turn the starting fee on or off and predict whether doubling the items will double the bill.':step===1?fee?'Doubling the items doubles only their cost. The fee is still paid once, so the total does not double.':'With no fee, twice the items costs twice as much. The cost per item is unchanged.':fee?'The graph is straight but starts above zero. It is linear, but not directly proportional.':'Zero items costs zero. The graph passes through the origin and the ratio of cost to non-zero quantity stays three.';
 }else if(ch===21){
  const counts=step===0?[2,3]:[6,6],filled=step===0?[1,1]:[3,2];
  if(step<2){for(let row=0;row<2;row++){for(let i=0;i<counts[row];i++)svg+=cxRect('fraction'+row+i,130+i*420/counts[row],75+row*135,420/counts[row]-3,80,i<filled[row]?(row?'#e3edfb':'#dff1eb'):'#fff');svg+=cxText(80,125+row*135,row?'1/3':'1/2',24)}}else{for(let i=0;i<6;i++)svg+=cxRect('sum'+i,130+i*70,130,67,95,i<3?'#dff1eb':i<5?'#e3edfb':'#fff');svg+=cxText(340,290,'3 sixths + 2 sixths = 5 sixths',25)}
  math=['1/2 + 1/3','3/6 + 2/6','(3 + 2)/6 = 5/6'][step];explain=['The shaded amounts use different-sized pieces. Adding the denominators would create a new size that describes neither.','Cut both wholes into sixths without changing their size. One half is three sixths; one third is two sixths.','Now the pieces match, so count them: five sixths. The common denominator names the size of each piece.'][step];
 }else if(ch===22){
  const rad=n*Math.PI/180,adj=10*Math.cos(rad),opp=10*Math.sin(rad),x0=130,y0=310,x1=x0+adj*30,y1=y0-opp*30;
  svg=`<polygon id="trig-triangle" points="${x0},${y0} ${x1},${y0} ${x1},${y1}" fill="#e3edfb" stroke="${blue}" stroke-width="3"/>`+cxText(x0+38,y0-15,n+'°',20)+cxText((x0+x1)/2-12,(y0+y1)/2-16,'H = 10',22)+cxText((x0+x1)/2,345,'A ≈ '+cxNum(adj),20)+cxText(x1+65,(y0+y1)/2,'O ≈ '+cxNum(opp),20)+`<path d="M${x1-14},${y0} v-14 h14" fill="none" stroke="#173349" stroke-width="2"/>`;
  math=step===0?'Mark the angle → label opposite, adjacent, hypotenuse':step===1?`sin ${n}° = O/10`:`O = 10 sin ${n}° ≈ ${cxNum(opp)}`;explain=['The hypotenuse faces the right angle. Opposite and adjacent are named from the selected acute angle. The drawing is illustrative; use the labels.','Sine compares the opposite side with the hypotenuse. Changing the angle changes that fraction.','Multiply the hypotenuse by the sine ratio. Try a larger angle: with the same hypotenuse, the opposite side gets longer.'][step];
 }else if(ch===23){
  const h=20*n-5*n*n,g=cxGraph(t=>20*t-5*t*t,4,22);svg=g.svg+cxText(350,30,'Height = 20t − 5t²',24)+cxText(350,365,'Time (seconds)',19)+cxText(45,40,'Height m',18)+cxCircle('ball',g.x(n),g.y(h),12,'#b96a12');
  if(step>0)svg+=cxLine('height-line',80,g.y(h),600,g.y(h),blue,2);
  if(step===2)svg+=cxCircle('other-time',g.x(4-n),g.y(h),8,blue);
  math=`At t = ${n} s, height ${cxEquals(h)} ${cxNum(h)} m`+(step===2?`; same height at t = ${cxNum(4-n)} s`:'');explain=['Move time through the four-second flight. The dot is one input-output pair on the graph, not a sideways flight path.','The horizontal line asks when the ball has this height. Look for every point where it meets the curve.','Below the maximum, the height occurs while rising and falling; at the maximum the times coincide. One time still has exactly one height, so this is a function.'][step];
 }else if(ch===24){
  const ox=280,oy=285,unit=35,p=[[0,0],[3,0],[1,2]],move=[n,2],coords=pts=>pts.map(([x,y])=>[ox+x*unit,oy-y*unit].join(',')).join(' ');
  svg=cxLine('x-axis',70,oy,630,oy,'#a8bac5',1)+cxLine('y-axis',ox,330,ox,40,'#a8bac5',1)+`<polygon points="${coords(p)}" fill="#e3edfb" stroke="${blue}" stroke-width="3"/>`;
  p.forEach(([x,y],i)=>{svg+=cxText(ox+x*unit,oy-y*unit+22,'ABC'[i],18);if(i<=step){svg+=cxLine('move'+i,ox+x*unit,oy-y*unit,ox+(x+n)*unit,oy-(y+2)*unit,gold,2)+cxCircle('image'+i,ox+(x+n)*unit,oy-(y+2)*unit,7)+cxText(ox+(x+n)*unit,oy-(y+2)*unit-13,'ABC'[i]+'′',18)}});
  if(step===2)svg+=`<polygon id="translated" points="${coords(p.map(([x,y])=>[x+n,y+2]))}" fill="#dff1eb" fill-opacity=".5" stroke="${green}" stroke-width="3"/>`;
  math=`(x, y) → (x ${n<0?'−':'+'} ${Math.abs(n)}, y + 2)`;explain=['Move the first vertex by the chosen horizontal amount and two units up.','Give the second vertex exactly the same movement. The joining segments must stay parallel and equally long.','Move the final vertex and join the images. The triangle has slid without turning, stretching or changing its angles.'][step];
 }
 return {svg:`<svg viewBox="0 0 700 385" role="img" aria-label="${E(explain)}" xmlns="http://www.w3.org/2000/svg"><title>${E(title)}</title>${svg}</svg>`,math,explain,title};
}
function stopConceptAnimation(){clearTimeout(conceptTimer);conceptTimer=null;const b=document.getElementById('concept-play');if(b){b.textContent='Watch the change';b.setAttribute('aria-pressed','false')}}
function conceptState(ch){return conceptMemory[ch]||(conceptMemory[ch]={step:0,value:conceptSpecs[ch][5],variant:ch===20?'no-fee':'share',prediction:null})}
function conceptExplorerHTML(ch){
 const spec=conceptSpecs[ch],state=conceptState(ch);
 return `<section class="concept-explorer" aria-labelledby="concept-title"><div class="concept-top"><div><p class="eyebrow">Try it. Notice it. Explain it.</p><h3 id="concept-title">${E(spec[0])}</h3></div><span class="concept-badge">Interactive model</span></div><fieldset class="concept-prediction"><legend>${E(spec[6])}</legend>${spec[7].map((v,i)=>`<button type="button" data-concept-predict="${i}" aria-pressed="${state.prediction===i}">${E(v)}</button>`).join('')}<p id="concept-prediction-feedback" role="status">${state.prediction===null?'Make a prediction, then explore. This is not marked.':state.prediction===spec[8]?'That is the key idea. Use the model to explain why.':'A useful guess to test. Watch the model and compare what actually stays the same.'}</p></fieldset>
 <div class="concept-controls">${ch===12?'<label>Compare <select id="concept-variant"><option value="share">Sharing in a ratio</option><option value="direct">Direct proportion: tickets</option><option value="inverse">Inverse proportion: journey</option></select></label>':ch===20?'<label>Pricing rule <select id="concept-variant"><option value="no-fee">No starting fee</option><option value="fee">Add a €2 fixed fee</option></select></label>':''}${spec[1]?`<label for="concept-value"><span id="concept-value-label">${E(spec[1])}</span> <output id="concept-value-output">${state.value}</output><input id="concept-value" type="range" min="${spec[2]}" max="${spec[3]}" step="${spec[4]}" value="${state.value}"></label>`:''}</div>
 <div id="concept-model"></div><nav class="concept-navigation" aria-label="Model stages"><button id="concept-back">← Back</button><span id="concept-stage-count"></span><button id="concept-next" class="primary">Next: see why →</button><button id="concept-play" aria-pressed="false">Watch the change</button><button id="concept-reset">Restart model</button></nav><p class="small-note">Change a value, predict what will happen, then explain the change in your own words. Drawings show the idea; labels give the measurements.</p></section>`;
}
function bindConceptExplorer(ch){
 const host=$('#concept-explorer-host');if(!host)return;
 host.closest('details').ontoggle=e=>{if(!e.target.open)stopConceptAnimation()};
 const state=conceptState(ch),spec=conceptSpecs[ch];
 const redraw=(motion=true)=>{
  const area=$('#concept-model');if(!area)return;
  const previous=new Map([...area.querySelectorAll('svg [id]')].map(el=>[el.id,el.getBoundingClientRect()]));
  const scene=conceptScene(ch,state.value,state.step,state.variant);
  area.innerHTML=`<div class="concept-drawing">${scene.svg}<button id="concept-enlarge" class="enlarge">Enlarge this model ↗</button></div><section class="concept-explanation audio-box" ${boxAttributes('concept-experiment',scene.explain,'Explore the idea')}><div class="box-heading"><strong>${E(scene.title)}</strong>${boxStatus()}${boxAudio('concept-experiment','Explore the idea')}</div><div class="readable-working">${workingMarkup(scene.math)}</div><p>${E(scene.explain)}</p></section>`;
  $('#concept-enlarge').onclick=()=>{stopAudio();$('#zoom-title').textContent=spec[0]+' · '+scene.title;$('#zoom-scene').innerHTML=scene.svg;$('#zoom-scale').value='100';$('#zoom-scene').style.width='760px';$('#diagram-dialog').showModal()};
  $('#concept-stage-count').textContent=`${state.step+1} of 3`;$('#concept-back').disabled=state.step===0;$('#concept-next').disabled=state.step===2;
  if($('#concept-value-output')){const value=ch===12&&state.variant==='share'?'€'+8*state.value+' total':String(state.value);$('#concept-value-output').textContent=value;$('#concept-value').setAttribute('aria-valuetext',value)}
  if($('#concept-value-label'))$('#concept-value-label').textContent=ch===12?(state.variant==='share'?'Total to share':state.variant==='direct'?'Number of tickets':'Speed (km/h)'):spec[1];
  if(motion&&!reducedMotion())area.querySelectorAll('svg [id]').forEach(el=>{const before=previous.get(el.id),after=el.getBoundingClientRect();if(before&&before.width&&before.height&&after.width&&after.height){const scale=area.querySelector('svg').getBoundingClientRect().width/700;el.animate([{transform:`translate(${(before.x-after.x)/scale}px,${(before.y-after.y)/scale}px) scale(${before.width/after.width},${before.height/after.height})`,transformOrigin:'0 0',transformBox:'fill-box'},{transform:'none',transformOrigin:'0 0',transformBox:'fill-box'}],{duration:650,easing:'ease-in-out'})}});
  bindBoxAudio(area);
 };
 const move=step=>{stopAudio();state.step=Math.max(0,Math.min(2,step));redraw();announce(`Model stage ${state.step+1}. ${conceptScene(ch,state.value,state.step,state.variant).explain}`)};
 host.querySelectorAll('[data-concept-predict]').forEach(b=>b.onclick=()=>{state.prediction=Number(b.dataset.conceptPredict);host.querySelectorAll('[data-concept-predict]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#concept-prediction-feedback').textContent=state.prediction===spec[8]?'That is the key idea. Use the model to explain why.':'A useful guess to test. Watch the model and compare what actually stays the same.'});
 $('#concept-back').onclick=()=>move(state.step-1);$('#concept-next').onclick=()=>move(state.step+1);
 $('#concept-reset').onclick=()=>{state.value=spec[5];state.variant=ch===20?'no-fee':'share';state.prediction=null;state.step=0;stopAudio();host.innerHTML=conceptExplorerHTML(ch);bindConceptExplorer(ch)};
 if($('#concept-value'))$('#concept-value').oninput=e=>{stopAudio();state.value=Number(e.target.value);redraw()};
 if($('#concept-variant')){$('#concept-variant').value=state.variant;$('#concept-variant').onchange=e=>{stopAudio();state.variant=e.target.value;state.step=0;redraw()}};
 $('#concept-play').onclick=()=>{if(conceptTimer){stopConceptAnimation();return}stopAudio();state.step=0;redraw();const button=$('#concept-play');button.textContent='Pause model';button.setAttribute('aria-pressed','true');const tick=()=>{if(!document.getElementById('concept-model')||currentChapter?.id!==ch||currentMode!=='learn'){stopConceptAnimation();return}state.step++;redraw();if(state.step<2)conceptTimer=setTimeout(tick,2400);else stopConceptAnimation()};conceptTimer=setTimeout(tick,2400)};
 redraw(false);
}
