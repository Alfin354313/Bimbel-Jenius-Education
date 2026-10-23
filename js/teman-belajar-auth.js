(()=>{'use strict';
const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
let role=params.get('role')==='parent'?'parent':'murid',client=null,busy=false;
const status=(message)=>{$('status').textContent=message||'';};
const dashboardStatus=(message)=>{$('dashboardStatus').textContent=message||'';};
function selectRole(next){if(busy)return;role=next;document.querySelectorAll('[data-role]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.role===role)));$('formTitle').textContent=role==='murid'?'Masuk sebagai Murid':'Masuk sebagai Orang Tua';history.replaceState(null,'','?role='+encodeURIComponent(role));status('');}
function showLogin(){ $('dashboard').hidden=true;$('choiceView').hidden=true;$('loginView').hidden=false; }
function showDashboard(){ $('choiceView').hidden=true;$('loginView').hidden=true;$('dashboard').hidden=false; }
function list(id,items,format){const target=$(id);target.replaceChildren();if(!items.length){const li=document.createElement('li');li.textContent='Belum ada catatan.';target.append(li);return;}items.slice(0,6).forEach(item=>{const li=document.createElement('li');li.textContent=format(item);target.append(li);});}
async function getClient(selected){const res=await fetch('/api/teman-belajar-config',{cache:'no-store'});if(!res.ok)throw Error('Konfigurasi portal belum tersedia.');const cfg=await res.json();if(!cfg.url||!cfg.key)throw Error('Koneksi database Teman Belajar belum dikonfigurasi di Vercel.');if(!window.supabase)throw Error('Pustaka login belum dapat dimuat.');return window.supabase.createClient(cfg.url,cfg.key,{auth:{storageKey:selected==='murid'?'jenius-teman-murid':'jenius-teman-parent',autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});}
async function openDashboard(selected){const userRes=await client.auth.getUser();if(userRes.error||!userRes.data.user)throw Error('Sesi tidak valid. Silakan masuk kembali.');const user=userRes.data.user;const accountRole=String(user.app_metadata?.role||'').toLowerCase();if(selected==='murid'&&accountRole!=='murid')throw Error('Akun ini bukan akun Murid.');if(selected==='parent'&&['admin','pengelola','guru','teacher','murid','student'].includes(accountRole))throw Error('Akun ini bukan akun Orang Tua.');
const name=user.email||'Pengguna';$('dashboardRole').textContent=selected==='murid'?'Murid':'Orang Tua';$('welcome').textContent='Halo, '+name;dashboardStatus('Memuat data belajar...');
const result=await client.rpc(selected==='murid'?'jenius_student_home':'jenius_parent_dashboard');if(result.error)throw Error('Data belum dapat dibuka: '+result.error.message);
const data=result.data||{};if(!data.linked||!data.student)throw Error('Akun belum terhubung ke data murid. Hubungi pengelola untuk menghubungkan akun.');
const student=data.student;$('studentName').textContent=student.nama||'Murid';$('studentInfo').textContent=[student.jenjang,student.kelas].filter(Boolean).join(' · ')||'Kelas belum dicatat';$('classInfo').textContent=selected==='murid'?'Dashboard Murid':'Perkembangan anak: '+(student.nama||'Murid');
const attendance=Array.isArray(data.attendance)?data.attendance:[];const payments=Array.isArray(data.payments)?data.payments:[];$('attendanceCount').textContent=attendance.length.toLocaleString('id-ID');$('paymentCount').textContent=payments.length.toLocaleString('id-ID');
list('attendanceList',attendance,x=>[x.tanggal,x.status].filter(Boolean).join(' — '));list('paymentList',payments,x=>[x.bulan,x.status].filter(Boolean).join(' — '));$('learningInfo').textContent=selected==='murid'?'Akun Murid terhubung. Fitur ujian dan latihan lanjutan akan diintegrasikan pada tahap berikutnya.':'Informasi materi, laporan, dan pengumuman akan diintegrasikan pada tahap berikutnya.';showDashboard();dashboardStatus('');
}
async function login(event){event.preventDefault();if(busy)return;busy=true;$('submit').disabled=true;status('Memeriksa akun...');const selected=role;let signedIn=false;try{client=await getClient(selected);const res=await client.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(res.error)throw res.error;signedIn=true;await openDashboard(selected);$('password').value='';}catch(e){if(signedIn&&client)await client.auth.signOut().catch(()=>{});showLogin();status(e?.message||'Login gagal. Silakan coba kembali.');}finally{busy=false;$('submit').disabled=false;}}
document.querySelectorAll('[data-role]').forEach(button=>button.addEventListener('click',()=>selectRole(button.dataset.role)));
document.querySelectorAll('[data-open-role]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();selectRole(link.dataset.openRole);showLogin();$('email').focus();}));
$('togglePassword').onclick=()=>{const input=$('password');input.type=input.type==='password'?'text':'password';$('togglePassword').textContent=input.type==='password'?'Tampilkan kata sandi':'Sembunyikan kata sandi';};
$('loginForm').addEventListener('submit',login);
$('logout').onclick=async()=>{if(client)await client.auth.signOut();client=null;$('dashboard').hidden=true;$('loginView').hidden=true;$('choiceView').hidden=false;status('Anda sudah keluar.');};
selectRole(role);
if(params.has('role'))showLogin();
(async()=>{try{client=await getClient(role);const session=await client.auth.getSession();if(session.data.session){try{await openDashboard(role);}catch(e){await client.auth.signOut();showLogin();status(e.message);}}}catch(e){status(e.message);}})();
})();