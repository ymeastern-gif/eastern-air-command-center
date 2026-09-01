import { esc, fmtDateTime, human, qs } from '../ui/dom.mjs';

function filtered(state){
  const q=String(state.changeSearch||'').toLowerCase(),showAll=!!state.showAllChanges;
  const ilya=(state.raw.people??[]).find(p=>String(p.name).toLowerCase().includes('ilya'));
  return (state.raw.activityEvents??[]).filter(e=>{
    if(state.projectScope!=='all'&&e.project_id!==state.projectScope)return false;
    if(!showAll&&!e.meaningful)return false;
    if(!showAll&&ilya&&e.actor_person_id===ilya.id){const text=String(e.summary||'').toLowerCase();if(!/(block|delay|delivery|deliver|schedule|order|material|release|lead time)/.test(text))return false;}
    if(q&&!`${e.summary||''} ${e.event_type||''}`.toLowerCase().includes(q))return false;
    return true;
  });
}

export function renderChanges(ctx,root){
  const state=ctx.store.get(),rows=filtered(state);
  root.innerHTML=`<div class="pageHeader"><div><div class="eyebrow">MEANINGFUL SOURCE DELTAS</div><h1>What Changed</h1><p>Schedule movement, approvals, releases, delivery commitments, blockers and other changes worth your attention.</p></div></div><div class="sourceToolbar"><div class="searchWrap"><input data-change-search value="${esc(state.changeSearch||'')}" placeholder="Search changes…"></div><label class="inlineToggle"><input type="checkbox" data-show-all ${state.showAllChanges?'checked':''}> Show routine / non-meaningful activity</label></div><div class="resultBar"><strong>${rows.length}</strong> change${rows.length===1?'':'s'}</div><div class="changeTimeline">${rows.map(e=>`<article class="changeEvent"><div class="changeDate">${esc(fmtDateTime(e.happened_at))}</div><div><div class="chipRow"><span class="contextChip">${esc(state.maps.projects[e.project_id]?.name||'No Job')}</span><span class="contextChip">${esc(human(e.event_type))}</span><span class="confidence ${esc(e.confidence||'source_says')}">${esc(human(e.confidence||'source_says'))}</span>${e.meaningful?'<span class="meaningfulFlag">Meaningful</span>':''}</div><h3>${esc(e.summary||'Change')}</h3></div></article>`).join('')||'<div class="emptyState">No meaningful changes match this view.</div>'}</div>`;
  qs('[data-change-search]',root).addEventListener('input',e=>{ctx.store.set({changeSearch:e.target.value});ctx.render()});qs('[data-show-all]',root).addEventListener('change',e=>{ctx.store.set({showAllChanges:e.target.checked});ctx.render()});
}
