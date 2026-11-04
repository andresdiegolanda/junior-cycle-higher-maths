import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPair,exportJWK,SignJWT} from 'jose';
import {verifyAccess} from '../worker/auth.mjs';
test('Access validates signature, issuer, audience, expiry and human identity',async t=>{
 const {privateKey,publicKey}=await generateKeyPair('RS256'),jwk=await exportJWK(publicKey);jwk.kid='test-key';jwk.alg='RS256';
 const original=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({keys:[jwk]}),{headers:{'Content-Type':'application/json'}});t.after(()=>globalThis.fetch=original);
 const env={ACCESS_TEAM_URL:'https://test-team.cloudflareaccess.com',ACCESS_AUD:'maths-app'};
 async function token(changes={}){return new SignJWT({type:'app',email:'a@example.test',sub:'user-a',...changes}).setProtectedHeader({alg:'RS256',kid:'test-key'}).setIssuer(changes.iss||env.ACCESS_TEAM_URL).setAudience(changes.aud||env.ACCESS_AUD).setIssuedAt().setExpirationTime(changes.exp||'1h').sign(privateKey)}
 const verify=async jwt=>verifyAccess(new Request('https://maths.example',{headers:{'Cf-Access-Jwt-Assertion':jwt}}),env);
 assert.equal((await verify(await token())).email,'a@example.test');assert.equal(await verify(await token({aud:'another-app'})),null);assert.equal(await verify(await token({iss:'https://wrong.cloudflareaccess.com'})),null);assert.equal(await verify(await token({exp:1})),null);assert.equal(await verify(await token({sub:''})),null);assert.equal(await verify(await token({type:'org'})),null);assert.equal(await verify('forged'),null);
 assert.equal(await verifyAccess(new Request('https://maths.example'),env),null);
});
