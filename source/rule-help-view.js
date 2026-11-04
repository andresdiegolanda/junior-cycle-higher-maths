/* Rule text is shared; only local substitutions/reasons travel with a step. */
function ruleFormula(text) {
 return E(text).replace(/\{([ab])\}/g,(_,name)=>`<span class="rule-symbol rule-symbol-${name}">${name}</span>`).replace(/\n/g,'<br>');
}
function ruleHelpButton(help) {
 const rule=help&&DATA.ruleLibrary?.[help.id];if(!rule)return '';
 const label=rule.kind==='method'||help.reminder?'Method reminder':'Rule applied';
 return `<button type="button" class="step-rule-button" data-step-rule="${E(JSON.stringify(help))}" aria-label="${label}: ${E(rule.title)}" aria-expanded="false" aria-haspopup="dialog" aria-controls="step-rule-popover"><span class="step-rule-icon" aria-hidden="true">ƒ</span><span>${label}</span></button>`;
}
function ruleHelpMarkup(help) {
 const r=DATA.ruleLibrary[help.id];
 const base=DATA.standalone&&r.chapter!==DATA.chapters[0].id?'index.html':'';
 const href=`${base}#chapter=${r.chapter}&lesson=${encodeURIComponent(r.lesson)}&mode=reference&method=${r.method}`;
 return `<header class="step-rule-head"><div><p class="step-rule-kicker">${r.kind==='method'||help.reminder?'METHOD REMINDER':'WHY THIS STEP WORKS'}</p><h2 id="step-rule-title">${E(r.title)}</h2></div><button type="button" data-close-step-rule aria-label="Close rule explanation">×</button></header>
 <div class="step-rule-formula">${ruleFormula(r.formula)}</div>
 ${help.bindings?`<div class="step-rule-bindings" aria-label="Values in this step">${help.bindings.map(b=>`<span class="rule-binding rule-symbol-${E(b.symbol)}"><b>${E(b.symbol)}</b><span>=</span><strong>${E(b.value)}</strong></span>`).join('')}</div><p class="step-rule-caption">Replace the matching letters with these values.</p>`:''}
 ${help.application?`<div class="step-rule-application"><b>In this step</b><p>${E(help.application)}</p></div>`:''}
 ${r.diagram==='square'?`<div class="rule-square" role="img" aria-label="Four products: a squared, a times b, a times b, b squared. The two cross-products add to 2ab."><span class="rule-square-a">a²</span><span class="rule-square-cross">ab</span><span class="rule-square-cross">ab</span><span class="rule-square-b">b²</span></div>`:''}
 <p class="step-rule-reason" id="step-rule-description">${E(r.why)}</p>
 ${help.note&&!help.bindings?`<div class="step-rule-note"><b>Here</b><p>${E(help.note)}</p></div>`:''}
 <p class="step-rule-condition"><b>${r.kind==='method'?'Watch for':'Remember'}:</b> ${E(r.condition)}</p>
 <a class="step-rule-link" href="${href}">See the Toolkit explanation <span aria-hidden="true">→</span></a>
 <p class="step-rule-footnote">Hover to preview · click to keep open · Esc to close</p>`;
}
