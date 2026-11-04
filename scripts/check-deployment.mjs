import fs from 'node:fs';
import assert from 'node:assert/strict';
const config=JSON.parse(fs.readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8').replace(/^\uFEFF/,''));
assert.equal(config.main,'worker/index.mjs');
assert.equal(config.assets.run_worker_first,true,'All static assets must pass account authorization.');
assert.equal(config.assets.directory,'./site');
assert.equal(config.preview_urls,false,'Do not create unconfigured preview login origins.');
assert.match(config.vars.APP_ORIGIN,/^https:\/\/junior-cycle-higher-maths\.andresdiegolanda\.workers\.dev$/);
assert.match(config.vars.ACCESS_TEAM_URL,/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/);
assert.match(config.vars.ACCESS_AUD,/^[a-f0-9]{64}$/i,'Configure the Access application AUD before deployment.');
assert.equal(config.d1_databases[0].database_id,'b83a391f-e80d-4749-ac31-7e44dfc2972d');
assert.ok(config.triggers.crons.length,'The retention schedule is required.');
const entry=fs.readFileSync(new URL('../worker/index.mjs',import.meta.url),'utf8');
assert.ok(entry.includes('verify:verifyAccess'),'Production must use verified Access identity.');
assert.ok(!/dev\/|Test-Identity|dev-user|localhost|bypass/i.test(entry),'No local test identity in the production entry.');
console.log('Deployment configuration verified: protected assets, real Access identity, D1 and retention.');

