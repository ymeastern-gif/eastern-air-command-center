export function esc(value) {
  return String(value ?? '').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
}

export function fmtDate(value,{year=false}={}) {
  if (!value) return '';
  const d=new Date(`${String(value).slice(0,10)}T12:00:00`);
  return d.toLocaleDateString([],{month:'short',day:'numeric',...(year?{year:'numeric'}:{})});
}

export function fmtDateTime(value) {
  if (!value) return '';
  const d=new Date(value);
  return d.toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
}

export function todayIso() { return new Date().toLocaleDateString('en-CA'); }
export function human(value) { return String(value ?? '').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase()); }
export function qs(sel,root=document){return root.querySelector(sel)}
export function qsa(sel,root=document){return [...root.querySelectorAll(sel)]}

export function modalHost() {
  let host=document.querySelector('#v3ModalHost');
  if (!host) { host=document.createElement('div'); host.id='v3ModalHost'; host.className='modalHost'; document.body.appendChild(host); }
  return host;
}

export function openModal(content,{wide=false}={}) {
  const host=modalHost();
  host.innerHTML=`<div class="modalBackdrop" data-close-modal></div><section class="modalPanel ${wide?'wide':''}" role="dialog" aria-modal="true">${content}</section>`;
  host.classList.add('open');
  host.querySelectorAll('[data-close-modal]').forEach(el=>el.addEventListener('click',closeModal));
  return host.querySelector('.modalPanel');
}

export function closeModal(){const h=document.querySelector('#v3ModalHost');if(h){h.classList.remove('open');h.innerHTML='';}}

export function toast(message,{bad=false}={}) {
  let h=document.querySelector('#toastHost');
  if(!h){h=document.createElement('div');h.id='toastHost';h.className='toastHost';document.body.appendChild(h)}
  const el=document.createElement('div');el.className=`toast ${bad?'bad':''}`;el.textContent=message;h.appendChild(el);setTimeout(()=>el.remove(),3500);
}
