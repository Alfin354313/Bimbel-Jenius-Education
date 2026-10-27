(function(){
 let controller=null;
 function make(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
 function unmount(){if(!controller)return;clearInterval(controller.timer);controller.root.remove();controller=null;}
 function mount(client,navigate){
  unmount();const account=document.querySelector('.dash-account');if(!account)return;
  const root=make('div','student-notifications'),button=make('button','student-bell');button.type='button';button.setAttribute('aria-label','Pemberitahuan');button.setAttribute('aria-expanded','false');
  button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg><span class="student-bell-dot" hidden></span>';
  const dot=button.querySelector('.student-bell-dot'),panel=make('section','student-notification-panel');panel.hidden=true;panel.setAttribute('aria-label','Daftar pemberitahuan');const header=make('div','student-notification-heading');header.append(make('strong','','Pemberitahuan'));const list=make('div','student-notification-list');panel.append(header,list);root.append(button,panel);account.prepend(root);
  let loading=false,items=[];
  function render(){
   const unread=items.filter(x=>!x.read).length;dot.hidden=!unread;button.setAttribute('aria-label',unread?'Pemberitahuan, '+unread+' belum dibaca':'Pemberitahuan');list.replaceChildren();
   if(!items.length){list.append(make('p','student-notification-empty','Belum ada pemberitahuan.'));return;}
   items.forEach(item=>{const row=make('button','student-notification-item'+(item.read?'':' unread'));row.type='button';const label={material:'Materi baru',exam:'Ujian tersedia',result:'Nilai tersedia',review:'Pembahasan tersedia',announcement:'Pengumuman'}[item.kind]||'Pemberitahuan';row.append(make('span','student-notification-label',label),make('strong','',item.title||''),make('span','student-notification-body',item.body||''));
     row.onclick=async()=>{row.disabled=true;const r=await client.rpc('jenius_student_notification_read',{p_key:item.key});if(r.error){row.disabled=false;list.prepend(make('p','student-notification-error','Belum dapat menandai sudah dibaca.'));return;}item.read=true;render();if(item.kind!=='announcement'){panel.hidden=true;button.setAttribute('aria-expanded','false');navigate(({exam:1,result:2,review:3,material:4})[item.kind],false);}};
     list.append(row);
   });
  }
  async function refresh(){if(loading)return;loading=true;try{const r=await client.rpc('jenius_student_notifications');if(r.error)throw r.error;items=Array.isArray(r.data)?r.data:[];render();}catch(e){list.replaceChildren(make('p','student-notification-error','Pemberitahuan belum dapat dimuat. Coba lagi nanti.'));}finally{loading=false;}}
  button.onclick=()=>{panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)refresh();};
  root.addEventListener('keydown',e=>{if(e.key==='Escape'){panel.hidden=true;button.setAttribute('aria-expanded','false');button.focus();}});
  document.addEventListener('click',e=>{if(controller?.root===root&&!root.contains(e.target)){panel.hidden=true;button.setAttribute('aria-expanded','false');}});
  controller={root,timer:setInterval(()=>{if(!document.hidden)refresh();},60000)};refresh();
 }
 window.JeniusStudentNotifications={mount,unmount};
})();