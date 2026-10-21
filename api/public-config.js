// Public configuration only. Never expose service_role or private keys.
module.exports = function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if(!url||!key)return res.status(503).json({error:'Ulasan belum dikonfigurasi'});
  return res.status(200).json({url,key});
};
