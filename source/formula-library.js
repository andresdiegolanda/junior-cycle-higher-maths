/* The library is a modal reference: opening it never changes the lesson route. */
function installFormulaLibrary(){
 const button=document.getElementById('formulas-button');if(!button)return;
 document.body.insertAdjacentHTML('beforeend',`<dialog id="formula-dialog" class="resource-dialog formula-dialog" aria-labelledby="formula-heading"><div class="formula-mobile-tools"><button data-formula-back>← Search</button><button data-formula-close aria-label="Close formulas">Close ×</button></div><header class="dialog-head"><div><p class="eyebrow">FIND IT · UNDERSTAND IT · USE IT</p><h2 id="formula-heading">Formulas</h2><p class="formula-intro">A clear rule. A worked example. The conditions that matter.</p></div><button data-formula-close aria-label="Close formulas">Close ×</button></header><div class="formula-layout"><aside class="formula-sidebar"><div class="formula-controls"><div class="dialog-search"><label for="formula-search">Find a formula or an idea</label><input id="formula-search" type="search" placeholder="quadratic, ax2+bx+c…" autocomplete="off" spellcheck="false"></div><fieldset class="formula-filters"><legend>Browse by subject</legend>${['All',...FORMULA_GROUPS].map(g=>`<button data-formula-group="${E(g)}" aria-pressed="${g==='All'}">${E(g)}</button>`).join('')}</fieldset><div class="formula-results-heading"><p id="formula-count" role="status"></p><div><button data-formula-read>Read selected card ↓</button><button data-formula-reset>Reset</button></div></div></div><nav id="formula-list" aria-label="Formula results"></nav></aside><article id="formula-detail" tabindex="0" aria-labelledby="formula-card-title"></article></div><footer class="formula-library-footer"><span>Need a full method? Chapter Toolkits have more.</span><button data-formula-terms>Search all chapter content →</button></footer></dialog>`);
 const dialog=document.getElementById('formula-dialog'),input=dialog.querySelector('#formula-search'),list=dialog.querySelector('#formula-list'),detail=dialog.querySelector('#formula-detail');
 let group='All',active='quadratic',visible=[];
 function fit(){if(!dialog.open)return;const over=[...detail.querySelectorAll('.formula-equation')].some(e=>e.scrollWidth>e.clientWidth+2);const hint=detail.querySelector('.formula-overflow-note');if(hint)hint.hidden=!over}
 function renderDetail(){
  const f=visible.find(f=>f.id===active);
  detail.innerHTML=f?formulaDetailHTML(f):`<div class="formula-empty"><h3 id="formula-card-title">No formulas found</h3><p>Try a shorter term or choose All subjects.</p><button data-formula-reset>Show all formulas</button></div>`;
  detail.scrollTop=0;
  if(f){const listen=detail.querySelector('[data-formula-listen]');listen.disabled=!player.supported;if(!player.supported)detail.querySelector('#formula-speech-status').textContent='Browser speech is unavailable. All explanations are written above.'}
  requestAnimationFrame(fit);
 }
 function update(){
  visible=findFormulas(input.value,group);
  if(!visible.some(f=>f.id===active))active=visible[0]?.id||'';
  dialog.querySelector('#formula-count').textContent=visible.length+' '+(visible.length===1?'formula':'formulas')+(group==='All'?'':' in '+group);
  list.innerHTML=visible.map(f=>`<button data-formula-id="${E(f.id)}" aria-current="${f.id===active?'true':'false'}"><strong>${E(f.title)}</strong><span aria-hidden="true">${E(f.notation.split(';')[0])}</span></button>`).join('');
  list.hidden=!visible.length;
  dialog.querySelectorAll('[data-formula-group]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.formulaGroup===group)));
  renderDetail();
 }
 function reset(){stopAudio();group='All';input.value='';active='quadratic';update();input.focus();dialog.scrollTop=0;list.scrollTop=0}
 function close(){stopAudio();dialog.close();button.focus({preventScroll:true})}
 function status(){
  if(!dialog.open)return;
  const p=detail.querySelector('#formula-speech-status');if(!p||!player.supported)return;
  const own=clipContext?.kind==='formula',running=own&&!player.ended;
  p.textContent=own?(player.error||(!player.paused?player.position:player.ended?'Ready to listen.':'Paused; continue repeats the current sentence.')):'';
  const pause=detail.querySelector('[data-formula-pause]'),stop=detail.querySelector('[data-formula-stop]');pause.disabled=!running;stop.disabled=!running;pause.textContent=player.paused?'Continue':'Pause';
 }
 input.addEventListener('input',()=>{stopAudio();update();list.scrollTop=0});
 dialog.addEventListener('click',e=>{
  const target=e.target.closest('button,a');
  if(target?.hasAttribute('data-formula-close'))close();
  else if(target?.hasAttribute('data-formula-reset'))reset();
  else if(target?.hasAttribute('data-formula-back')){input.focus({preventScroll:true});dialog.scrollTop=0}
  else if(target?.hasAttribute('data-formula-read')){detail.focus({preventScroll:true});if(matchMedia('(max-width:760px)').matches)detail.scrollIntoView({block:'start',behavior:'instant'})}
  else if(target?.hasAttribute('data-formula-group')){stopAudio();group=target.dataset.formulaGroup;update();list.scrollTop=0}
  else if(target?.hasAttribute('data-formula-id')){
   stopAudio();active=target.dataset.formulaId;list.querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',String(b===target)));renderDetail();
   if(matchMedia('(max-width: 760px)').matches){detail.querySelector('h3').focus({preventScroll:true});detail.scrollIntoView({block:'start',behavior:'instant'})}
  }
  else if(target?.hasAttribute('data-formula-listen')){const f=visible.find(f=>f.id===active);if(f)playNarration(f.speech,{kind:'formula'});status()}
  else if(target?.hasAttribute('data-formula-pause')){if(clipContext?.kind==='formula'){if(player.paused)player.play();else player.pause()}status()}
  else if(target?.hasAttribute('data-formula-stop')){stopAudio();status()}
  else if(target?.classList.contains('formula-toolkit'))close();
  else if(target?.hasAttribute('data-formula-terms')){const q=input.value;close();document.getElementById('term-search').value=q;renderTermResults();openModal('term-dialog')}
  else if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}
 });
 dialog.addEventListener('cancel',()=>stopAudio());dialog.addEventListener('close',()=>stopAudio());
 ['play','pause','ended','error'].forEach(type=>player.addEventListener(type,status));
 window.addEventListener('resize',fit);
 button.addEventListener('click',()=>{stopAudio();stepRuleController.close();update();dialog.showModal();dialog.scrollTop=0;input.focus();requestAnimationFrame(fit)});
}
installFormulaLibrary();
