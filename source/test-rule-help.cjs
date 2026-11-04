/* Behaviour checks without a browser dependency. Real layout is checked in-browser. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const DATA=JSON.parse(fs.readFileSync(__dirname+'/../site/index.html','utf8').match(/<script>const DATA=(.*?);<\/script>/s)[1]);
let context,observer,timerId=0;
const timers=new Map(),events={},windowEvents={};
class Element {
 constructor(){this.attrs={};this.dataset={};this.style={};this.events={};this.isConnected=true;this.hidden=false;this.innerHTML='';this.rect={left:120,top:200,bottom:240,width:160,height:40}}
 setAttribute(k,v){this.attrs[k]=v}
 getBoundingClientRect(){return this.rect}
 contains(el){return el===this||el?.parent===this}
 closest(selector){if(selector==='[data-step-rule]')return this.dataset.stepRule?this:null;if(selector==='[data-close-step-rule]')return this.closeButton?this:null;return null}
 addEventListener(k,fn){this.events[k]=fn}
 focus(){context.document.activeElement=this;emit('focusin',{target:this})}
}
const app=new Element(),body=new Element();let panel;
body.appendChild=el=>{panel=el;panel.rect={left:0,top:0,bottom:500,width:440,height:500}};
context={DATA,JSON,Math,console,window:{innerHeight:760,addEventListener:(k,fn)=>windowEvents[k]=fn},
 document:{body,documentElement:{clientWidth:1200},activeElement:body,createElement:()=>new Element(),getElementById:()=>app,addEventListener:(k,fn)=>events[k]=fn},
 MutationObserver:class {constructor(fn){observer=fn}observe(){}},
 setTimeout(fn){const id=++timerId;timers.set(id,fn);return id},clearTimeout(id){timers.delete(id)},
 E:s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')};
vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname+'/rule-help-view.js','utf8'),context);
vm.runInContext(fs.readFileSync(__dirname+'/rule-help.js','utf8'),context);
function emit(name,args={}){let prevented=false,stopped=false;events[name]({target:body,detail:1,preventDefault(){prevented=true},stopPropagation(){stopped=true},...args});return {prevented,stopped}}
function flush(){const tasks=[...timers.values()];timers.clear();tasks.forEach(fn=>fn())}
function button(id){const b=new Element();b.dataset.stepRule=JSON.stringify({id});return b}
const a=button('square-sum'),b=button('zero-product');
// Hover -> move across the gap into the card -> leave it: stays open only while needed.
emit('pointerover',{target:a,pointerType:'mouse'});assert.equal(panel.hidden,true);flush();
assert.equal(panel.hidden,false);assert.equal(a.attrs['aria-expanded'],'true');
emit('pointerout',{target:a,relatedTarget:body});panel.events.pointerenter();flush();assert.equal(panel.hidden,false);
panel.events.pointerleave();flush();assert.equal(panel.hidden,true);
// Leaving before the preview delay must never open a stale card.
emit('pointerover',{target:a,pointerType:'mouse'});emit('pointerout',{target:a,relatedTarget:body});flush();assert.equal(panel.hidden,true);
// Touch has no hover requirement; click pins, another click closes.
emit('pointerover',{target:a,pointerType:'touch'});flush();assert.equal(panel.hidden,true);
emit('click',{target:a});emit('pointerout',{target:a});flush();assert.equal(panel.hidden,false);
emit('click',{target:a});assert.equal(panel.hidden,true);
// Keyboard Enter focuses the card; Escape returns to the trigger without reopening it.
a.focus();assert.equal(panel.hidden,false);
emit('click',{target:a,detail:0});assert.equal(context.document.activeElement,panel);
assert.equal(emit('keydown',{target:panel,key:'ArrowRight'}).stopped,true);
const escape=emit('keydown',{target:panel,key:'Escape'});assert.equal(escape.prevented,true);assert.equal(escape.stopped,true);
assert.equal(panel.hidden,true);assert.equal(context.document.activeElement,a);flush();assert.equal(panel.hidden,true);
// Switching triggers and clicking away clear both state and stale explanation content.
emit('click',{target:a});emit('click',{target:b});assert.equal(a.attrs['aria-expanded'],'false');
assert.match(panel.innerHTML,/Zero-product rule/);emit('pointerdown',{target:body});assert.equal(panel.innerHTML,'');
// Navigating / covering a solution removes its explanation even if it was pinned.
emit('click',{target:a});windowEvents.hashchange();assert.equal(panel.hidden,true);
emit('click',{target:a});a.isConnected=false;observer();assert.equal(panel.hidden,true);a.isConnected=true;
// Constrain a card near the viewport edge, then close if its step scrolls away.
context.document.documentElement.clientWidth=390;context.window.innerHeight=600;
panel.rect={width:366,height:550};a.rect={left:340,top:560,bottom:590};
emit('click',{target:a});assert.equal(panel.style.left,'12px');assert.equal(panel.style.top,'12px');
a.rect={left:10,top:-100,bottom:-60};windowEvents.scroll({target:body});assert.equal(panel.hidden,true);
// Malformed / unknown metadata fails closed; authored text is escaped.
const bad=button('missing');emit('click',{target:bad});assert.equal(panel.hidden,true);
bad.dataset.stepRule='{broken';emit('click',{target:bad});assert.equal(panel.hidden,true);
const escaped=context.ruleHelpMarkup({id:'square-sum',note:'<img src=x onerror=bad()>',application:'<b>value</b>'});
assert.doesNotMatch(escaped,/<img|<b>value/);assert.match(escaped,/&lt;img/);assert.match(escaped,/&lt;b&gt;value/);
assert.match(context.ruleHelpButton({id:'square-sum'}),/aria-haspopup="dialog"/);
assert.match(context.ruleHelpButton({id:'method-19-3'}),/Method reminder/);
// Cross-chapter links in standalone files go through the complete guide.
context.DATA={...DATA,standalone:true,chapters:[DATA.chapters[18]]};
assert.match(context.ruleHelpMarkup({id:'square-sum'}),/href="index.html#chapter=1&lesson=01-03&mode=reference&method=1"/);
assert.match(context.ruleHelpMarkup({id:'substitute'}),/href="#chapter=19&lesson=19-03&mode=reference&method=3"/);
console.log('Rule UI passed: hover handoff, touch pin/toggle, keyboard focus/Escape, navigation cleanup, viewport clamp, escaped text and standalone Toolkit links.');
