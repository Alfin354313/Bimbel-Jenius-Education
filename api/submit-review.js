// Server-only submission endpoint. Requires Turnstile, Upstash Redis and Supabase service role.
const crypto=require('crypto');
const reply=(res,status,error)=>res.status(status).json({error});
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return reply(res,405,'Metode tidak didukung.')}
 const {TURNSTILE_SECRET_KEY,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,SUPABASE_SERVICE_ROLE_KEY}=process.env;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL;
 if(!TURNSTILE_SECRET_KEY||!UPSTASH_REDIS_REST_URL||!UPSTASH_REDIS_REST_TOKEN||!SUPABASE_SERVICE_ROLE_KEY||!url)return reply(res,503,'Keamanan formulir belum dikonfigurasi.');
 let b=req.body;
 if(typeof b==='string'){try{b=JSON.parse(b)}catch{return reply(res,400,'Data tidak valid.')}}
 if(!b||typeof b!=='object')return reply(res,400,'Data tidak valid.');
 const name=String(b.reviewer_name||'').trim(),message=String(b.review_text||'').trim(),type=String(b.reviewer_type||''),rating=Number(b.rating);
 if(b.website)return reply(res,400,'Pengiriman tidak valid.');
 if(name.length<2||name.length>90||message.length<20||message.length>1200||!['orang_tua','siswa','alumni'].includes(type)||!Number.isInteger(rating)||rating<1||rating>5||b.consent_confirmed!==true)return reply(res,400,'Lengkapi formulir dengan benar.');
 if(/https?:\/\/|www\.|(?:[a-z0-9-]+\.)+(?:com|xyz|ru|click|top|site|online)\b/i.test(message)||/(.)\1{12,}/u.test(message))return reply(res,400,'Ulasan mengandung konten yang tidak diperbolehkan.');
 const token=String(b.turnstile_token||'');
 if(!token||token.length>2048)return reply(res,400,'Verifikasi keamanan diperlukan.');
 try{
  const verify=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret:TURNSTILE_SECRET_KEY,response:token})});
  if(!verify.ok)return reply(res,503,'Verifikasi keamanan sedang bermasalah.');
  const check=await verify.json();
  if(!check.success||check.action!=='review_submit')return reply(res,403,'Verifikasi keamanan gagal. Coba lagi.');
  const ip=String(req.headers['x-forwarded-for']||'').split(',')[0].trim()||'unknown';
  const key=crypto.createHash('sha256').update(ip).digest('hex');
  const duplicate=crypto.createHash('sha256').update(name.toLowerCase()+'|'+message.toLowerCase()).digest('hex');
  const redis=async(args)=>{const r=await fetch(UPSTASH_REDIS_REST_URL.replace(/\/$/,'')+'/pipeline',{method:'POST',headers:{Authorization:'Bearer '+UPSTASH_REDIS_REST_TOKEN,'Content-Type':'application/json'},body:JSON.stringify(args)});if(!r.ok)throw Error('Rate limit unavailable');const d=await r.json();if(!Array.isArray(d)||d.some(x=>x.error))throw Error('Rate limit error');return d};
  const rate=await redis([['INCR','jenius:reviews:ip:'+key],['EXPIRE','jenius:reviews:ip:'+key,900,'NX'],['SET','jenius:reviews:duplicate:'+duplicate,'1','EX',86400,'NX']]);
  if(Number(rate[0].result)>3)return reply(res,429,'Terlalu banyak ulasan. Silakan coba lagi dalam 15 menit.');
  if(rate[2].result!=='OK')return reply(res,429,'Ulasan serupa sudah dikirim. Silakan tunggu sebelum mengirim ulang.');
  const saved=await fetch(url.replace(/\/$/,'')+'/rest/v1/review_submissions',{method:'POST',headers:{apikey:SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({reviewer_name:name,reviewer_type:type,review_text:message,rating,consent_confirmed:true})});
  if(!saved.ok){console.error('Review insert failed',saved.status);return reply(res,503,'Ulasan belum dapat disimpan. Coba lagi nanti.')}
  return res.status(201).json({ok:true});
 }catch(err){console.error('Review submission error',err.message);return reply(res,503,'Layanan ulasan sementara tidak tersedia.')}
};
