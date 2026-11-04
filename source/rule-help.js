/* A non-modal, hoverable explanation: one panel, keyboard/touch parity. */
function installStepRules() {
 const panel=document.createElement('section');
 panel.id='step-rule-popover';panel.className='step-rule-popover';panel.hidden=true;
 panel.setAttribute('role','dialog');panel.setAttribute('aria-labelledby','step-rule-title');
 panel.setAttribute('aria-describedby','step-rule-description');panel.tabIndex=-1;
 document.body.appendChild(panel);
 let trigger=null,pinned=false,hovered=false,hideTimer=null,showTimer=null,ignoreFocus=false;
 function cancelTimers(){clearTimeout(hideTimer);clearTimeout(showTimer)}
 function close(restore=false){
  cancelTimers();const old=trigger;
  if(old)old.setAttribute('aria-expanded','false');
  panel.hidden=true;trigger=null;pinned=false;hovered=false;
  // Remove the previous explanation, including its Toolkit link, on navigation.
  panel.innerHTML='';
  if(restore&&old?.isConnected){ignoreFocus=true;old.focus({preventScroll:true});ignoreFocus=false}
 }
 function place(){
  if(!trigger||panel.hidden)return;
  if(!trigger.isConnected){close();return}
  const rect=trigger.getBoundingClientRect(),gap=10,edge=12;
  const width=document.documentElement.clientWidth,height=window.innerHeight;
  if(rect.bottom<0||rect.top>height){close();return}
  panel.style.maxHeight=Math.max(120,height-edge*2)+'px';
  panel.style.maxWidth=Math.max(0,width-edge*2)+'px';
  const box=panel.getBoundingClientRect();
  const top=rect.bottom+gap+box.height<=height-edge?rect.bottom+gap:Math.max(edge,rect.top-gap-box.height);
  panel.style.left=Math.max(edge,Math.min(rect.left,width-box.width-edge))+'px';
  panel.style.top=Math.min(top,Math.max(edge,height-box.height-edge))+'px';
 }
 function open(button,pin=false){
  cancelTimers();let help;
  try{help=JSON.parse(button.dataset.stepRule)}catch(e){return}
  if(!DATA.ruleLibrary?.[help.id])return;
  if(trigger!==button){if(trigger)trigger.setAttribute('aria-expanded','false');pinned=false;hovered=false}
  trigger=button;pinned=pin;panel.innerHTML=ruleHelpMarkup(help);panel.hidden=false;
  button.setAttribute('aria-expanded','true');place();
 }
 function scheduleClose(){
  clearTimeout(hideTimer);
  hideTimer=setTimeout(()=>{
   const active=document.activeElement;
   if(!pinned&&!hovered&&active!==trigger&&!panel.contains(active))close();
  },220);
 }
 document.addEventListener('pointerover',e=>{
  const button=e.target.closest?.('[data-step-rule]');
  if(!button||e.pointerType==='touch'||pinned||button.contains(e.relatedTarget))return;
  cancelTimers();showTimer=setTimeout(()=>open(button),140);
 });
 document.addEventListener('pointerout',e=>{
  const button=e.target.closest?.('[data-step-rule]');
  if(button&&!button.contains(e.relatedTarget)){clearTimeout(showTimer);scheduleClose()}
 });
 panel.addEventListener('pointerenter',()=>{hovered=true;clearTimeout(hideTimer)});
 panel.addEventListener('pointerleave',()=>{hovered=false;scheduleClose()});
 document.addEventListener('focusin',e=>{
  if(ignoreFocus)return;
  const button=e.target.closest?.('[data-step-rule]');
  if(button&&trigger!==button)open(button);
  else if(trigger&&!panel.contains(e.target)&&e.target!==trigger)close();
 });
 document.addEventListener('focusout',()=>{if(trigger)scheduleClose()});
 document.addEventListener('click',e=>{
  const button=e.target.closest?.('[data-step-rule]');
  if(button){
   if(button===trigger&&pinned)close();
   else{open(button,true);if(e.detail===0)panel.focus({preventScroll:true})}
  }else if(e.target.closest?.('[data-close-step-rule]'))close(true);
 });
 document.addEventListener('pointerdown',e=>{
  if(trigger&&!panel.contains(e.target)&&!e.target.closest?.('[data-step-rule]'))close();
 });
 document.addEventListener('keydown',e=>{
  if(panel.hidden)return;
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(panel.contains(document.activeElement))}
  else if(panel.contains(e.target)&&['ArrowLeft','ArrowRight'].includes(e.key))e.stopPropagation();
 },true);
 window.addEventListener('resize',place);
 window.addEventListener('scroll',e=>{if(!panel.contains(e.target))place()},true);
 window.addEventListener('hashchange',()=>close());
 new MutationObserver(()=>{if(trigger&&!trigger.isConnected)close()}).observe(document.getElementById('app'),{childList:true,subtree:true});
 return {close,place};
}
const stepRuleController=installStepRules();
