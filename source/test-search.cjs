const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const page=fs.readFileSync(__dirname+'/../site/index.html','utf8');const DATA=JSON.parse(page.split('<script>const DATA=')[1].split(';</script>')[0]);
const context={DATA};vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/discovery.js','utf8').split('function resultLink')[0]+'\nglobalThis.search=searchChapters;',context);
const ids=q=>context.search(q).map(c=>c.id);
assert.equal(ids('gradient')[0],11);assert.ok(ids('gradient').includes(20));assert.ok(ids('gradient').includes(23));assert.ok(!ids('gradient').includes(4));
assert.ok(ids('factorization').includes(2));assert.ok(ids('Pythagoras').includes(8));assert.ok(ids('Pythagoras').includes(22));assert.ok(ids('range').includes(7));assert.ok(ids('range').includes(19));
assert.equal(ids('zzzxxyyy').length,0);assert.equal(ids('').length,0);assert.ok(ids('sin').includes(22));
assert.equal(context.search('gradient').some(c=>c.items.some(i=>i.problem==='23-c02')),true);
console.log('Search checks passed: synonyms, multiword precision, ambiguous terms, all-chapter index and exact problem targets.');
