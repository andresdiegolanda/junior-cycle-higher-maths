import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {webcrypto} from 'node:crypto';
const source=fs.readFileSync(new URL('../source/accounts.js',import.meta.url),'utf8');
function harness({storage=new Map(),fail=false}={}){
 const requests=[],intervals=[],listeners={},elements=new Map(),redirects=[];let broken=fail,wrongAccount=false;
 const ctx={console,crypto:webcrypto,URL,Date,Map,Set,JSON,Number,Object,Array,Error,Promise,
  location:{protocol:'http:',hostname:'127.0.0.1',reload(){},assign:u=>redirects.push(u)},
  localStorage:{get length(){return storage.size},key:i=>[...storage.keys()][i],getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
  document:{visibilityState:'visible',hasFocus:()=>true,getElementById:id=>{if(!elements.has(id))elements.set(id,{});return elements.get(id)},addEventListener:(k,f)=>listeners[k]=f},
  window:{addEventListener:(k,f)=>listeners[k]=f},setTimeout:()=>1,clearTimeout(){},setInterval:f=>intervals.push(f),
  storeKey:'junior-cycle-higher-maths-v1',progress:{},save(){},renderAccountBar(){},route(){},stopAudio(){},E:x=>x,confirm:()=>true,
  DATA:{contentVersion:'v1'},currentLesson:null,currentChapter:null,currentMode:'learn',currentStep:0,player:{paused:true,ended:true},
  fetch:async(url,opts)=>{requests.push({url,...opts});if(broken)throw new Error('offline');
   if(url==='/api/me')return Response.json({user:{id:'a',name:'A'},contentVersion:'v1',progress:[]});
   if(wrongAccount)return Response.json({error:'The signed-in account changed.'},{status:409});
   if(url==='/api/events')return Response.json({accepted:JSON.parse(opts.body).events.map(e=>({id:e.id,applied:true})),progress:[]});
   return Response.json({});
  }
 };
 vm.createContext(ctx);vm.runInContext(source+';this.account=MathsAccount;',ctx);
 return {ctx,storage,requests,intervals,listeners,redirects,account:ctx.account,setFail:v=>broken=v,setWrong:v=>wrongAccount=v};
}
test('logout drains more than one batch; every request guards the signed-in account',async()=>{
 const h=harness();await h.account.start();for(let i=0;i<13;i++)h.account.emit('active_interval',{start:1,end:2});
 await h.account.logout();assert.equal(h.account.queue().length,0);assert.equal(h.requests.filter(r=>r.url==='/api/events').length,4);
 for(const r of h.requests.filter(r=>r.url!=='/api/me'))assert.equal(r.headers['X-Maths-Account'],'a');
 assert.equal(h.redirects[0],'/cdn-cgi/access/logout');
});
test('offline queue survives reload, retries once and never adopts anonymous progress',async()=>{
 const storage=new Map([['junior-cycle-higher-maths-v1',JSON.stringify({lessons:{'01-01':{done:true}},answers:{q:1}})]]),h=harness({storage});await h.account.start();
 assert.equal(h.ctx.progress.lessons['01-01'],undefined);h.setFail(true);h.account.emit('active_interval',{start:1,end:2});await h.account.flush();assert.equal(h.account.queue().length,1);
 const next=harness({storage});await next.account.start();await next.account.flush();assert.equal(next.account.queue().length,0);assert.equal(next.requests.filter(r=>r.url==='/api/events').length,1);
});
test('account mismatch locks study without moving or discarding the pending record',async()=>{
 const h=harness();await h.account.start();h.setWrong(true);h.account.emit('active_interval',{start:1,end:2});await h.account.flush();assert.equal(h.account.ready,false);assert.equal(h.account.queue().length,1);assert.equal(h.requests.filter(r=>r.url==='/api/events').length,0);
});
test('timer activity cannot extend its own idle cutoff',async()=>{
 const h=harness();let time=Date.now();h.ctx.Date=class extends Date{static now(){return time}};await h.account.start();h.ctx.currentChapter={id:1};
 for(let i=0;i<6;i++){time+=30000;h.intervals[0]()}
 assert.equal(h.account.queue().length,3,'Only intervals while recent user interaction remains valid are counted.');
 h.listeners.pointerdown();time+=30000;h.intervals[0]();assert.equal(h.account.queue().length,4);
});
