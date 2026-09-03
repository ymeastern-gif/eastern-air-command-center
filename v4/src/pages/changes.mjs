import { filterRecords } from '../core/filter-engine.mjs';
import { resolveSourceLink } from '../core/source-links.mjs';
import { esc, fmtDateTime, human } from '../ui/dom.mjs';
import { CHANGE_FILTER_DIMS, renderToolbar, wireToolbar } from '../ui/page-tools.mjs';

function rowFromDelta(d,state){const source=d.source_record_id?(state.raw.sourceRecords??[]).find(s=>s.id===d.source_record_id):null,link=source?resolveSourceLink(source):{url:null};return{kind:'delta',id:d.id,project_id:d.project_id,happened_at:d.happened_at,event_type:d.delta_type,confidence:d.confidence||'source_says',meaningful:d.meaningful,summary:d.summary||human(d.delta_type),reason:d.meaningful_reason,sourceSystem:d.source_system,url:link.url}}
function rowFromEvent(e,state){const source=e.source_record_id?(state.raw.sourceRecords??[]).find(s=>s.id===e.source_record_id):null,link=source?resolveSourceLink(source):{url:null};return{kind:'event',id:e.id,project_id:e.project_id,happened_at:e.happened_at,event_type:e.event_type,confidence:e.confidence||'source_says',meaningful:e.meaningful,summary:e.summary||'Change',reason:null,sourceSystem:source?.source_system||'command_center',url:link.url}}
function changeCard(e,state){return `<article class="changeEvent"><div class="changeDate">${esc(fmtDateTime(e.happened_at))}</div><div><div class="chipRow"><span class="contextChip">${esc(state.maps.projects[e.project_id]?.name||'No Job')}</span><span class="sourceBadge compact">${esc(human(e.sourceSystem))}</span><span class="contextChip">${esc(human(e.event_type))}</span><span class="confidence ${esc(e.confidence)}">${esc(human(e.confidence))}</span>${e.meaningful?'<span class="meaningfulFlag">Meaningful</span>':''}</div><h3>${esc(e.summary)}</h3>${e.reason?`<p>${esc(e.reason)}</p>`:''}${e.url?`<a class="btn secondary small" href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">Open Original</a>`:''}</div></article>`}
export function renderChanges(ctx,root){
  const state=ctx.store.get(),ilya=(state.raw.people??[]).find(p=>String(p.name).toLowerCase().includes('ilya'));
  const scoped=state.changeFilterRecords.filter(r=>state.projectScope==='all'||r.project===state.projectScope);
  const filtered=filterRecords(scoped,state.viewState.filters,state.changeUniverse).filter(r=>{if(!ilya||r.actor!==ilya.id||r.meaningful==='meaningful')return true;return/(block|delay|delivery|deliver|schedule|order|material|release|lead time|approval)/.test(String(r.title||'').toLowerCase())});
  const ids=new Set(filtered.map(r=>r.id));
  const deltaRows=(state.raw.sourceDeltas??[]).filter(d=>ids.has(d.id)).map(d=>rowFromDelta(d,state));
  const eventRows=(state.raw.activityEvents??[]).filter(e=>ids.has(e.id)).map(e=>rowFromEvent(e,state));
  const rows=[...deltaRows,...eventRows].sort((a,b)=>String(b.happened_at||'').localeCompare(String(a.happened_at||'')));
  root.innerHTML=`<div class="pageHeader"><div><div class="eyebrow">MEANINGFUL SOURCE DELTAS</div><h1>What Changed</h1><p>Actual new/changed source records plus meaningful management events. This grows automatically with every hourly sync.</p></div></div>${renderToolbar(state,{page:'changes',placeholder:'Search changes…',dimensions:CHANGE_FILTER_DIMS})}<div class="resultBar"><strong>${rows.length}</strong> change${rows.length===1?'':'s'}</div><div class="changeTimeline">${rows.map(e=>changeCard(e,state)).join('')||'<div class="emptyState">No changes match this view.</div>'}</div>`;
  wireToolbar({root,state,store:ctx.store,api:ctx.api,page:'changes',dimensions:CHANGE_FILTER_DIMS,onChange:ctx.render});
}
