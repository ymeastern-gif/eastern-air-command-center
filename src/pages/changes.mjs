import { filterRecords } from '../core/filter-engine.mjs';
import { esc, fmtDateTime, human } from '../ui/dom.mjs';
import { CHANGE_FILTER_DIMS, renderToolbar, wireToolbar } from '../ui/page-tools.mjs';

export function renderChanges(ctx,root){
  const state=ctx.store.get(),ilya=(state.raw.people??[]).find(p=>String(p.name).toLowerCase().includes('ilya'));
  const scoped=state.changeFilterRecords.filter(r=>state.projectScope==='all'||r.project===state.projectScope);
  const filtered=filterRecords(scoped,state.viewState.filters,state.changeUniverse).filter(r=>{
    if(!ilya||r.actor!==ilya.id||r.meaningful==='meaningful')return true;
    return /(block|delay|delivery|deliver|schedule|order|material|release|lead time)/.test(String(r.title||'').toLowerCase());
  });
  const ids=new Set(filtered.map(r=>r.id)),rows=(state.raw.activityEvents??[]).filter(e=>ids.has(e.id)).sort((a,b)=>String(b.happened_at||'').localeCompare(String(a.happened_at||'')));
  root.innerHTML=`<div class="pageHeader"><div><div class="eyebrow">MEANINGFUL SOURCE DELTAS</div><h1>What Changed</h1><p>Schedule movement, approvals, releases, delivery commitments, blockers and other changes worth your attention.</p></div></div>${renderToolbar(state,{page:'changes',placeholder:'Search changes…',dimensions:CHANGE_FILTER_DIMS})}<div class="resultBar"><strong>${rows.length}</strong> change${rows.length===1?'':'s'}</div><div class="changeTimeline">${rows.map(e=>`<article class="changeEvent"><div class="changeDate">${esc(fmtDateTime(e.happened_at))}</div><div><div class="chipRow"><span class="contextChip">${esc(state.maps.projects[e.project_id]?.name||'No Job')}</span><span class="contextChip">${esc(human(e.event_type))}</span><span class="confidence ${esc(e.confidence||'source_says')}">${esc(human(e.confidence||'source_says'))}</span>${e.meaningful?'<span class="meaningfulFlag">Meaningful</span>':''}</div><h3>${esc(e.summary||'Change')}</h3></div></article>`).join('')||'<div class="emptyState">No changes match this view.</div>'}</div>`;
  wireToolbar({root,state,store:ctx.store,api:ctx.api,page:'changes',dimensions:CHANGE_FILTER_DIMS,onChange:ctx.render});
}
