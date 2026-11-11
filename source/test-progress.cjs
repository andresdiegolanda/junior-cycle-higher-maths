const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
// Saved progress is untrusted: a damaged record must be repaired or discarded, never crash the guide.
const guide=fs.readFileSync(__dirname+'/guide.js','utf8');
const source=guide.slice(guide.indexOf('function cleanProgress'),guide.indexOf('/* end of saved-progress checks */'));
const context={};vm.createContext(context);vm.runInContext(source+'\nglobalThis.clean=cleanProgress;',context);
const clean=x=>{const v=context.clean(x);return v===null?null:JSON.parse(JSON.stringify(v))};
assert.equal(clean(null),null);assert.equal(clean('text'),null);assert.equal(clean([]),null);assert.equal(clean({lessons:[]}),null);assert.equal(clean({lessons:{},answers:'x'}),null);
const good={lessons:{'01-02':{seen:[0,2],done:true}},answers:{'01-02-q0':1},last:{chapter:3,lesson:'03-01'},practice:{'01-02-w1':{notes:'n',review:'supported'}},practicePosition:{'01-02':4},challenges:{'01-c01':{done:true,notes:'x'}}};
assert.deepEqual(clean(good),good);
const broken=clean({lessons:{'01-02':{seen:'x',done:1},'01-03':null,'01-04':{seen:[1,'a',2.5,3]}},answers:{'01-02-q0':'7','01-02-q1':2},last:{chapter:'1'},practice:null,practicePosition:{'01-02':99,'01-03':'x'},challenges:{'01-c01':'bad','01-c02':{done:true}}});
assert.deepEqual(broken.lessons['01-02'],{seen:[],done:false});assert.ok(!('01-03' in broken.lessons));assert.deepEqual(broken.lessons['01-04'],{seen:[1,3],done:false});
assert.deepEqual(broken.answers,{'01-02-q1':2});assert.equal(broken.last,null);assert.ok(!('practice' in broken));
assert.deepEqual(broken.practicePosition,{'01-02':99});assert.deepEqual(broken.challenges,{'01-c02':{done:true}});
// Skill-drill records: counts and stars are clamped; malformed entries are dropped.
const drills=clean({lessons:{},answers:{},skills:{a:{asked:7,right:5,rounds:2,stars:[3,2,0]},b:{asked:-1,right:'x',stars:[9,'y']},c:null,d:'text'},drills:{days:{'2026-11-11':2,'bad':1,'2026-11-12':0,'2026-11-13':'3'}}});
assert.deepEqual(drills.skills,{a:{asked:7,right:5,rounds:2,stars:[3,2,0]},b:{asked:0,right:0,rounds:0,stars:[3,0,0]}});assert.deepEqual(drills.drills,{days:{'2026-11-11':2}});
assert.ok(!('skills' in clean({lessons:{},answers:{},skills:[]})));assert.ok(!('drills' in clean({lessons:{},answers:{},drills:{days:[]}})));
// The lesson helper repairs a record that lost its seen list but keeps a confident mark.
const helper=guide.slice(guide.indexOf('function lessonState'),guide.indexOf('function announce'));
const ctx2={progress:{lessons:{a:{seen:null,done:true},b:{seen:[1],done:false}}}};vm.createContext(ctx2);vm.runInContext(helper+'\nglobalThis.state=lessonState;',ctx2);
const state=id=>JSON.parse(JSON.stringify(ctx2.state({id})));
assert.deepEqual(state('a'),{seen:[],done:true});assert.deepEqual(state('b'),{seen:[1],done:false});assert.deepEqual(state('c'),{seen:[],done:false});
console.log('Progress-storage checks passed: malformed, partial and valid saved records.');
