import { selectAssignedOut } from '../core/selectors.mjs';
import { esc, human, qsa, todayIso } from '../ui/dom.mjs';

function personCard(person,state){
  const rows=state.records.filter(r=>r.owner===person.id&&r.attentionState!=='background'&&r.attentionState!=='resolved');
  const waiting=rows.filter(r=>r.attentionState==='waiting'||['waiting','follow_up'].includes(r.status)).length;
  const review=rows.filter(r=>r.attentionState==='review').length;
  const overdue=rows.filter(r=>r.due&&r.due<todayIso()).length;
  return `<article class="personCard"><div class="personCardTop"><div><h2>${esc(person.name)}</h2><span>${person.linked_user_id?'Login connected':'No login yet'}</span></div><button class="btn secondary" data-person-work="${esc(person.id)}">View Work</button></div><div class="personMetrics"><div><strong>${rows.length}</strong><span>Active</span></div><div><strong>${waiting}</strong><span>Waiting</span></div><div><strong>${review}</strong><span>Review</span></div><div><strong>${overdue}</strong><span>Overdue</span></div></div></article>`;
}

export function renderTeam(ctx,root){
  const state=ctx.store.get(),people=state.raw.people??[];
  root.innerHTML=`<div class="pageHeader"><div><div class="eyebrow">SHARED OWNERSHIP</div><h1>Team</h1><p>Who owns what, what is waiting, and where work has been handed off.</p></div></div><div class="personGrid">${people.map(p=>personCard(p,state)).join('')}</div>`;
  qsa('[data-person-work]',root).forEach(b=>b.addEventListener('click',()=>{ctx.store.set({projectScope:'all',page:'assigned_out',viewState:{filters:{search:'',include:{owner:[b.dataset.personWork]},exclude:{},date:{}}}});ctx.renderShell()}));
}
