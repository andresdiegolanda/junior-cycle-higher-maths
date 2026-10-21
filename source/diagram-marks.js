/* SVG teaching marks share their target's coordinates and actual font metrics. */
function alignDiagramMarks(root=document){
 const marks=root.querySelectorAll('[data-cancel-target],[data-highlight-target]');
 for(const mark of marks){
  const svg=mark.closest('svg'),id=mark.dataset.cancelTarget||mark.dataset.highlightTarget;
  const target=svg?.querySelector(`[id="${id}"]`);
  if(!target||!target.getClientRects().length)continue;
  const b=target.getBBox();if(!b.width||!b.height)continue;
  const attrs=mark.dataset.cancelTarget
   ?{x1:b.x-2,y1:b.y+b.height*.82,x2:b.x+b.width+2,y2:b.y+b.height*.15}
   :{x:b.x-10,y:b.y-6,width:b.width+20,height:b.height+12};
  for(const [key,value] of Object.entries(attrs))mark.setAttribute(key,String(value));
 }
}
function gridInput(id,x,y,label,active,colour='#087f75',size=27){
 return `${active?`<rect data-highlight-target="${id}" x="${x-42}" y="${y-32}" width="84" height="44" rx="8" fill="#fff3dd" stroke="#b96a12" stroke-width="2" aria-hidden="true"/>`:''}<text id="${id}" x="${x}" y="${y}" text-anchor="middle" fill="${active?'#80500c':colour}" font-family="Segoe UI, Arial, sans-serif" font-size="${size}">${E(label)}</text>`;
}
let annotationFrame=0;
function scheduleDiagramMarks(){
 if(annotationFrame)return;
 annotationFrame=requestAnimationFrame(()=>{annotationFrame=0;alignDiagramMarks()});
}
new MutationObserver(scheduleDiagramMarks).observe(document.body,{childList:true,subtree:true});
new MutationObserver(scheduleDiagramMarks).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','style']});
window.addEventListener('resize',scheduleDiagramMarks);
window.addEventListener('beforeprint',()=>alignDiagramMarks());
document.addEventListener('toggle',scheduleDiagramMarks,true);
if(document.fonts){document.fonts.ready.then(scheduleDiagramMarks);document.fonts.addEventListener?.('loadingdone',scheduleDiagramMarks)}
scheduleDiagramMarks();
