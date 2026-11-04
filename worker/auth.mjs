import {createRemoteJWKSet,jwtVerify} from 'jose';
const keySets=new Map();
export async function verifyAccess(request,env){
 const issuer=env.ACCESS_TEAM_URL;
 if(!issuer || !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer) || !env.ACCESS_AUD) throw new Error('AUTH_NOT_CONFIGURED');
 const token=request.headers.get('Cf-Access-Jwt-Assertion');
 if(!token) return null;
 try{
  if(!keySets.has(issuer))keySets.set(issuer,createRemoteJWKSet(new URL(issuer+'/cdn-cgi/access/certs')));
  const {payload}=await jwtVerify(token,keySets.get(issuer),{issuer,audience:env.ACCESS_AUD,algorithms:['RS256'],requiredClaims:['sub','email','exp','iat'],clockTolerance:5});
  if(!payload.sub || typeof payload.email!=='string' || payload.type!=='app')return null;
  return {issuer:payload.iss,subject:payload.sub,email:payload.email.trim().toLowerCase()};
 }catch{return null}
}
