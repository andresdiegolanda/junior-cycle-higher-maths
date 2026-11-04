import {verifyAccess} from './auth.mjs';
import {createApp,retainSixMonths} from './service.mjs';
import catalog from './catalog.json' with {type:'json'};
const app=createApp({verify:verifyAccess,catalog});
export default {fetch:app,async scheduled(_event,env,ctx){ctx.waitUntil(retainSixMonths(env.DB))}};
