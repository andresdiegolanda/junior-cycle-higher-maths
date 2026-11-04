import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
export function localDatabase(filename=':memory:'){
 const sqlite=new DatabaseSync(filename);sqlite.exec('PRAGMA foreign_keys=ON');
 if(!sqlite.prepare("SELECT name FROM sqlite_master WHERE name='users'").get())sqlite.exec(readFileSync(new URL('../migrations/0001_accounts.sql',import.meta.url),'utf8'));
 const wrap=(sql,values=[])=>({
  bind(...args){return wrap(sql,args)},
  async first(){return sqlite.prepare(sql).get(...values)||null},
  async all(){return {results:sqlite.prepare(sql).all(...values)}},
  async run(){return {success:true,meta:sqlite.prepare(sql).run(...values)}},
  _run(){const s=sqlite.prepare(sql);return s.columns().length?{results:s.all(...values)}:{success:true,meta:s.run(...values)}}
 });
 return {sqlite,prepare:wrap,async batch(items){sqlite.exec('BEGIN IMMEDIATE');try{const result=items.map(s=>s._run());sqlite.exec('COMMIT');return result}catch(e){sqlite.exec('ROLLBACK');throw e}},close(){sqlite.close()}};
}
