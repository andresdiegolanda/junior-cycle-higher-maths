/* Pure rendering and search helpers; no browser state or learner data. */
const FORMULA_GROUPS=['Algebra','Number','Shape & space','Graphs & patterns','Data & chance'];
function formulaWords(s){return String(s).normalize('NFKD').toLowerCase().replace(/factoriz/g,'factoris').replace(/[^a-z0-9]+/g,' ').trim()}
function formulaSymbols(s){return String(s).normalize('NFKD').toLowerCase().replace(/[−–]/g,'-').replace(/[×·]/g,'*').replace(/[\s^]/g,'')}
function findFormulas(query='',group='All',cards=DATA.formulas){
 const words=formulaWords(query).split(' ').filter(Boolean),symbolic=/[+−=²³^*/()]/.test(query)||/^[a-z0-9]{1,3}-[a-z0-9]{1,3}$/i.test(query.trim()),symbols=formulaSymbols(query);
 return cards.map((f,index)=>{
  const names=[f.title,...f.aliases],short=names.map(formulaWords).join(' '),all=formulaWords([short,f.notation,f.when,...f.letters.map(x=>x.meaning)].join(' '));
  const notation=[f.notation,...f.aliases].map(formulaSymbols);
  const match=!query.trim()||(symbolic?notation.some(s=>s.includes(symbols)):words.length&&words.every(w=>all.split(' ').some(t=>t.startsWith(w))));
  const score=!query.trim()?0:names.some(n=>formulaWords(n)===formulaWords(query))?100:words.every(w=>short.includes(w))?50:10;
  return {f,index,match,score};
 }).filter(x=>x.match&&(group==='All'||x.f.group===group)).sort((a,b)=>b.score-a.score||a.index-b.index).map(x=>x.f);
}
function formulaMathNode(node){
 if(typeof node==='string')return `<mtext>${E(node)}</mtext>`;
 const [kind,...parts]=node;
 if(kind==='row')return `<mrow>${parts.map(formulaMathNode).join('')}</mrow>`;
 if(kind==='frac')return `<mfrac>${parts.map(formulaMathNode).join('')}</mfrac>`;
 if(kind==='sqrt')return `<msqrt>${formulaMathNode(parts[0])}</msqrt>`;
 if(kind==='var')return `<mi class="formula-var formula-var-${['a','b','c'].includes(parts[0])?parts[0]:'other'}">${E(parts[0])}</mi>`;
 throw new Error('Unknown formula node: '+kind);
}
function formulaMathText(node){if(typeof node==='string')return node;const [kind,...p]=node;return kind==='frac'?`(${formulaMathText(p[0])})/(${formulaMathText(p[1])})`:kind==='sqrt'?`√(${formulaMathText(p[0])})`:p.map(formulaMathText).join('')}
function formulaEquation(node){
 // Prose labels wrap normally; mathematical fractions retain their structure.
 if(typeof node==='string'&&/[a-z]{4}/i.test(node))return `<p class="formula-word-row">${E(node)}</p>`;
 return `<div class="formula-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block" aria-label="${E(formulaMathText(node))}"><mstyle displaystyle="true">${formulaMathNode(node)}</mstyle></math></div>`;
}
function formulaToolkitLink(f){return (DATA.standalone&&f.chapter!==DATA.initialChapter?'index.html':'')+'#chapter='+f.chapter+'&lesson='+encodeURIComponent(f.lesson)+'&mode=reference&method='+f.method}
function formulaIllustration(f){
 const text=(x,y,s,cls='')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="middle">${E(s)}</text>`;
 const line=(x1,y1,x2,y2,cls='')=>`<path d="M${x1} ${y1}L${x2} ${y2}" class="${cls}"/>`;
 let art='',caption='';
 switch(f.visual){
 case 'quadratic':
  // Diagram matches this card's example exactly, with a shared scalable plot.
  const coeff=f.id==='quadratic'?[2,-5,-3]:f.id==='intercepts'?[1,1,-6]:[1,-4,3];
  const [a,b,c]=coeff,xmin=-4,xmax=5,ymin=-8,ymax=8,X=x=>42+(x-xmin)*356/(xmax-xmin),Y=y=>202-(y-ymin)*166/(ymax-ymin);
  let points=[];for(let x=xmin;x<=xmax;x+=.04){const y=a*x*x+b*x+c;if(y>=ymin&&y<=ymax)points.push([X(x),Y(y)]);else if(points.length)break}
  art=line(35,Y(0),410,Y(0),'axis')+line(X(0),218,X(0),23,'axis')+text(416,Y(0)-9,'x')+text(X(0)+15,23,'y')+`<path class="accent" d="${points.map((p,i)=>(i?'L':'M')+p.map(v=>v.toFixed(1)).join(' ')).join(' ')}"/>`;
  if(f.id==='quadratic-vertex'){art+=`<circle cx="${X(2)}" cy="${Y(-1)}" r="5"/>`+text(X(2)+5,Y(-1)+29,'(2, −1)');caption='The turning point is the lowest point of this example.'}
  else{const roots=[(-b-Math.sqrt(b*b-4*a*c))/(2*a),(-b+Math.sqrt(b*b-4*a*c))/(2*a)];roots.forEach(x=>{art+=`<circle cx="${X(x)}" cy="${Y(0)}" r="5"/>`+text(X(x),Y(0)-13,String(x).replace('-','−'))});caption='At an x-intercept, the output is zero. These are the roots.'}
  break;
 case 'square':
  art=`<rect x="125" y="40" width="120" height="120" class="fill-a"/><rect x="245" y="40" width="60" height="120" class="fill-b"/><rect x="125" y="160" width="120" height="60" class="fill-b"/><rect x="245" y="160" width="60" height="60" class="fill-a"/>`+text(185,108,'a²')+text(275,108,'ab')+text(185,198,'ab')+text(275,198,'b²')+text(185,28,'a')+text(275,28,'b')+text(105,108,'a')+text(105,198,'b');caption='Four areas make one square. The two ab regions give 2ab.';break;
 case 'fractions':
  for(let i=0;i<6;i++)art+=`<rect x="${70+i*50}" y="70" width="50" height="60" class="${i<3?'fill-a':i<5?'fill-b':'unfilled'}"/>`;
  art+=text(145,165,'3 sixths')+text(270,165,'2 sixths')+text(220,213,'3/6 + 2/6 = 5/6');caption='Half is 3 sixths. A third is 2 sixths. Add equal-sized pieces.';break;
 case 'percentage':
  if(f.id==='percentage'){
   for(let i=0;i<4;i++)art+=`<rect x="${60+i*80}" y="75" width="80" height="62" class="${i===0?'fill-a':'unfilled'}"/>`+text(100+i*80,115,'20');
   art+=text(220,185,'20 out of 80 = 1/4 = 25%');caption='One of four equal parts is 25% of the whole.';
  }else{
   for(let i=0;i<10;i++)art+=`<rect x="${60+i*32}" y="75" width="32" height="62" class="${i<8?'fill-a':'fill-b'}"/>`;
   art+=text(188,173,'80% kept')+text(348,173,'20% off');caption='A 20% decrease leaves 80% of the original: multiply by 0.8.';
  }break;
 case 'ratio':
  for(let i=0;i<5;i++)art+=`<rect x="${65+i*62}" y="65" width="62" height="72" class="${i<2?'fill-a':'fill-b'}"/>`+text(96+i*62,110,'12');
  art+=text(127,175,'2 parts = 24')+text(282,175,'3 parts = 36');caption='60 ÷ 5 equal parts = 12 per part. The ratio is 2 : 3.';break;
 case 'rectangle':
  art=`<rect x="90" y="55" width="260" height="130" class="fill-a"/>`+text(220,217,'length l')+text(220,125,'A = l × w')+text(52,128,'w');caption='Area covers the inside. Perimeter measures the boundary.';break;
 case 'triangle':case 'trapezium':
  art=`<path d="${f.visual==='triangle'?'M90 185L195 45L355 185Z':'M85 185L150 55L290 55L355 185Z'}" class="fill-a"/>`+line(195,55,195,185,'dash')+`<path d="M195 171h14v14" class="axis"/>`+text(215,127,'h')+text(220,218,'base b');
  if(f.visual==='trapezium')art+=text(220,40,'a');caption='Height is perpendicular to the base, not the sloping side.';break;
 case 'circle':case 'sphere':case 'sector':
  art=`<circle cx="220" cy="125" r="85" class="unfilled"/>`;
  if(f.visual==='sector'){art+=`<path d="M220 125L220 40A85 85 0 0 1 305 125Z" class="fill-a"/>`+text(242,108,'θ');caption='The sector is θ/360 of a full circle.'}
  else if(f.visual==='sphere'){art+=`<ellipse cx="220" cy="125" rx="85" ry="25" class="dash"/>`;caption='A sphere’s radius runs from its centre to its surface.'}
  else caption='The radius is half the diameter. Circumference is the curved boundary.';
  art+=line(220,125,305,125,'accent')+`<circle cx="220" cy="125" r="3"/>`+text(263,148,'r');break;
 case 'prism':
  art=`<path d="M115 100L265 100L265 205L115 205Z" class="fill-a"/><path d="M115 100L180 45L330 45L265 100M330 45L330 150L265 205" class="axis"/>`+text(190,162,'area A')+text(325,190,'length ℓ');caption='Repeat the constant cross-section through the length.';break;
 case 'cylinder':
  art=`<path d="M140 65V190A80 25 0 0 0 300 190V65" class="fill-a"/><ellipse cx="220" cy="65" rx="80" ry="25" class="unfilled"/>`+line(220,65,300,65,'accent')+text(260,57,'r')+line(330,65,330,190,'axis')+text(350,135,'h');caption='The circular base has area πr². Stack it through height h.';break;
 case 'similarity':
  art=`<rect x="65" y="115" width="70" height="70" class="fill-a"/><rect x="205" y="45" width="140" height="140" class="fill-b"/>`+line(275,45,275,185,'axis')+line(205,115,345,115,'axis')+text(100,218,'side 1')+text(275,218,'side 2');caption='Double the sides of a square: four small squares fit inside.';break;
 case 'angles':case 'pythagoras':case 'trig':
  art=`<path d="M90 195L350 195L350 50Z" class="fill-a"/><path d="M335 195v-15h15" class="axis"/>`;
  if(f.visual==='angles'){art+=text(140,185,'α')+text(338,100,'β')+text(322,169,'90°');caption='The three interior angles total 180°; this example has one right angle.'}
  else if(f.visual==='trig'){art+=`<path d="M135 195A45 45 0 0 0 130 173" class="accent"/>`+text(153,183,'θ')+text(218,224,'adjacent (A)')+text(390,130,'O')+text(207,104,'hypotenuse (H)');caption='O is opposite θ. H is opposite the right angle. A is the remaining side.'}
  else{art+=text(219,223,'a')+text(372,130,'b')+text(210,105,'c');caption='a and b meet at 90°. The hypotenuse c lies opposite 90°.'}break;
 case 'slope':
  art=line(55,210,405,210,'axis')+line(55,210,55,25,'axis')+line(90,190,360,55,'accent')+line(110,180,310,180,'dash')+line(310,180,310,80,'dash')+text(210,205,'run: change in x')+text(360,137,'rise')+`<circle cx="110" cy="180" r="4"/><circle cx="310" cy="80" r="4"/>`;caption='Gradient = rise ÷ run. A rising line has positive gradient.';break;
 case 'machine':
  art=`<rect x="135" y="75" width="170" height="85" rx="12" class="fill-a"/>`+text(60,123,'−3')+text(220,125,'square, then −1')+text(380,123,'8')+line(85,118,125,118,'accent')+line(315,118,350,118,'accent');caption='Input −3 → (−3)² − 1 → output 8.';break;
 case 'sequence':
  const quad=f.id==='quadratic-sequence',values=quad?['2','6','12','20']:['4','7','10','13'];
  values.forEach((v,i)=>{art+=`<circle cx="${70+i*100}" cy="75" r="26" class="fill-a"/>`+text(70+i*100,82,v);if(i<3)art+=text(120+i*100,136,quad?['+4','+6','+8'][i]:'+3')});
  if(quad)art+=text(170,192,'+2')+text(270,192,'+2');caption=quad?'First differences grow by 2 each time. Second differences stay at 2.':'Add the same difference, 3, each time.';break;
 case 'sets':
  art=`<circle cx="170" cy="120" r="85" class="fill-a"/><circle cx="270" cy="120" r="85" class="venn-b"/>`+text(130,125,'13')+text(220,125,'5')+text(310,125,'7')+text(130,225,'rugby only')+text(310,225,'swim only');caption='13 only + 5 both + 7 only = 25. Count the overlap once.';break;
 case 'probability':
  if(f.id==='complement'){
   for(let i=0;i<10;i++)art+=`<rect x="${60+i*32}" y="75" width="32" height="62" class="${i<3?'fill-a':'fill-b'}"/>`;
   art+=text(108,173,'0.3')+text(268,173,'0.7');caption='Rain and no rain cover all possibilities: 0.3 + 0.7 = 1.';
  }else{for(let i=1;i<=6;i++)art+=`<rect x="${38+i*50}" y="80" width="42" height="55" rx="6" class="${i%2?'unfilled':'fill-a'}"/>`+text(59+i*50,116,String(i));caption='Even on a fair die: 3 favourable outcomes out of 6.'}break;
 }
 if(!art)return '';
 return `<figure class="formula-visual"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 250" role="img" aria-label="${E(caption)}"><g>${art}</g></svg><figcaption>${E(caption)}</figcaption></figure>`;
}
function formulaDetailHTML(f){
 const colored=f.math.some(row=>JSON.stringify(row).includes('"var"'));
 return `<header class="formula-card-head"><p class="eyebrow">${E(f.group)} · FORMULA CARD</p><h3 id="formula-card-title" tabindex="-1">${E(f.title)}</h3><p class="formula-when"><b>Use when</b> ${E(f.when)}</p></header>
 <div class="formula-display" aria-label="Formula">${f.math.map(formulaEquation).join('')}</div><p class="formula-overflow-note" hidden>Slide the formula sideways to see it all.</p>
 <div class="formula-explain"><section class="formula-symbols"><h4>What the symbols mean</h4><dl>${f.letters.map(v=>`<div><dt${colored&&['a','b','c'].includes(v.symbol)?` class="formula-var-${v.symbol}"`:''}>${E(v.symbol)}</dt><dd>${E(v.meaning)}</dd></div>`).join('')}</dl></section>${formulaIllustration(f)}</div>
 <section class="formula-example"><h4>Try it with numbers</h4><p>${E(f.example.question)}</p><ol>${f.example.steps.map((s,i)=>`<li><span class="formula-step-number" aria-hidden="true">${i+1}</span>${E(s)}</li>`).join('')}</ol></section>
 <p class="formula-remember"><b>Remember</b> ${E(f.condition)}</p>
 <footer class="formula-card-footer"><a class="formula-toolkit" href="${formulaToolkitLink(f)}">Open the Toolkit method →<small>Chapter ${f.chapter} · ${E(f.chapterTitle)}</small></a><div class="formula-voice"><button data-formula-listen>Listen to this card</button><button data-formula-pause disabled>Pause</button><button data-formula-stop disabled>Stop</button></div><p id="formula-speech-status" class="small-note" role="status"></p></footer>`;
}
