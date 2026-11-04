// Local-only harness. This file is never an input to the production Worker.
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createApp} from '../worker/service.mjs';
import {localDatabase} from './database.mjs';
import catalog from '../worker/catalog.json' with {type:'json'};
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url))),port=8787,origin=`http://127.0.0.1:${port}`;
await mkdir(path.join(root,'dev/.local-state'),{recursive:true});
const db=localDatabase(path.join(root,'dev/.local-state/pilot.sqlite'));
for(const [id,email,name] of [['student-a','student.a@example.test','Test student A'],['student-b','student.b@example.test','Test student B']])db.sqlite.prepare("INSERT OR IGNORE INTO users(id,email,name,role,status,invited_at) VALUES(?,?,?,'student','invited',?)").run(id,email,name,new Date().toISOString());
const identities={admin:{issuer:'local-test',subject:'admin',email:'andresdiegolanda@gmail.com'},a:{issuer:'local-test',subject:'student-a',email:'student.a@example.test'},b:{issuer:'local-test',subject:'student-b',email:'student.b@example.test'}};
const app=createApp({catalog,verify:async request=>identities[request.headers.get('cookie')?.match(/(?:^|;\s*)maths_test=([a-z]+)/)?.[1]]||null});
const env={DB:db,APP_ORIGIN:origin,ASSETS:{async fetch(request){
 const p=new URL(request.url).pathname,relative=decodeURIComponent(p==='/'?'/index.html':p),filename=path.resolve(root,'site','.'+relative);
 if(!filename.startsWith(path.join(root,'site')+path.sep))return new Response('Not found',{status:404});
 try{return new Response(await readFile(filename),{headers:{'Content-Type':filename.endsWith('.html')?'text/html; charset=utf-8':filename.endsWith('.pdf')?'application/pdf':'text/plain; charset=utf-8'}})}catch{return new Response('Not found',{status:404})}
}}};
const login=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Local account testing</title><style>body{font:18px/1.6 system-ui;max-width:700px;margin:10vh auto;padding:24px;color:#173349}a{display:block;padding:18px;margin:12px 0;border:1px solid #bad8d3;border-radius:12px;color:#087f75}small{color:#526b78}</style><h1>Test student accounts</h1><p>This is the local development environment. These test identities cannot sign in to the live website.</p><a href="/dev/login?as=admin">Administrator</a><a href="/dev/login?as=a">Test student A</a><a href="/dev/login?as=b">Test student B</a><small>No emails are sent from this environment.</small></html>`;
http.createServer(async(req,res)=>{
 try{
  if(req.headers.host!==`127.0.0.1:${port}`){res.writeHead(403);res.end('Local host only');return}
  const url=new URL(req.url,origin);
  if(url.pathname==='/dev/login'){
   const who=url.searchParams.get('as');
   if(who&&identities[who]){res.writeHead(303,{'Location':'/','Set-Cookie':`maths_test=${who}; HttpOnly; SameSite=Strict; Path=/`,'Cache-Control':'no-store'});res.end();return}
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(login);return;
  }
  if(url.pathname==='/cdn-cgi/access/logout'){res.writeHead(303,{'Location':'/dev/login','Set-Cookie':'maths_test=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});res.end();return}
  if(!req.headers.cookie?.includes('maths_test=')&&!url.pathname.startsWith('/api/')){res.writeHead(303,{Location:'/dev/login'});res.end();return}
  let chunks=[],size=0;for await(const c of req){size+=c.length;if(size>65536){res.writeHead(413);res.end();return}chunks.push(c)}
  const request=new Request(url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
  const response=await app(request,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch(e){console.error(e.message);res.writeHead(500);res.end('Local server error')}
}).listen(port,'127.0.0.1',()=>console.log(`Local account tests: ${origin}/dev/login`));
