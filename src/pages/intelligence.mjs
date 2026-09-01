import { filterRecords } from '../core/filter-engine.mjs';
import { resolveSourceLink, sourceActionLabel, sourceLabel } from '../core/source-links.mjs';
import { esc, fmtDateTime, human, qsa, toast } from '../ui/dom.mjs';
import { renderToolbar, wireToolbar, SOURCE_FILTER_DIMS } from '../ui/page-tools.mjs';

function sourceRow(source,state){
  const resolved=resolveSourceLink(source),project=state.maps.projects[source.project_id],link=state.raw.itemSources.find(x=>x.source_record_id===source.id),item=link?state.records.find(r=>r.id===link.item_id):null;
  return `<article class="intelRow"><div class="intelTop"><div class="chipRow"><span class="sourceBadge">${esc(sourceLabel(source.source_system))}</span><span class="contextChip">${esc(project?.name||'No Job')}</span>${source.is_historical?'<span class="contextChip historical">Historical</span>':'<span class="contextChip current">Current</span>'}${item?`<span class="attentionBadge ${esc(item.attentionState)}">${esc(human(item.attentionState))}</span>`:''}</div><div class="rowActions">${resolved.url?`<a class="btn small secondary" href="${esc(resolved.url)}" target="_blank" rel="noopener noreferrer">${esc(sourceActionLabel(source.source_system))}</a>`:''}${item&&item.attentionState==='background'?`<button class="btn small primary" data-promote-item="${esc(item.id)}">Promote</button>`:''}${item&&item.attentionState!=='background'?`<button class="btn small primary" data-manage-item="${esc(item.id)}">Manage</button>`:''}</div></div><h3>${esc(source.title||'Untitled source')}</h3><div class="intelMeta">Source ID: ${esc(source.source_ref||'—')} ${source.source_updated_at?`· Updated ${esc(fmtDateTime(source.source_updated_at))}`:''} ${source.last_seen_at?`· Last seen ${esc(fmtDateTime(source.last_seen_at))}`:''}</div>${source.body?`<p>${esc(String(source.body).slice(0,500))}${String(source.body).length>500?'…':''}</p>`:''}</article>`;
}

export function renderIntelligence(ctx,root){
  const state=ctx.store.get();
  const scoped=state.sourceFilterRecords.filter(r=>state.projectScope==='all'||r.project===state.projectScope);
  const filtered=filterRecords(scoped,state.viewState.filters,state.sourceUniverse),ids=new Set(filtered.map(r=>r.id));
  const rows=(state.raw.sourceRecords??[]).filter(s=>ids.has(s.id)).sort((a,b)=>String(b.source_updated_at||b.last_seen_at||'').localeCompare(String(a.source_updated_at||a.last_seen_at||'')));
  root.innerHTML=`<div class="pageHeader"><div><div class="eyebrow">SOURCE INTELLIGENCE</div><h1>Sources / Intelligence</h1><p>Raw source evidence stays here until you deliberately promote it into Eastern management.</p></div></div>${renderToolbar(state,{page:'intelligence',placeholder:'Search source titles, text or IDs…',dimensions:SOURCE_FILTER_DIMS})}<div class="resultBar"><strong>${rows.length}</strong> source record${rows.length===1?'':'s'}</div><div class="intelList">${rows.slice(0,500).map(s=>sourceRow(s,state)).join('')||'<div class="emptyState">No source records match this view.</div>'}</div>`;
  wireToolbar({root,state,store:ctx.store,api:ctx.api,page:'intelligence',dimensions:SOURCE_FILTER_DIMS,onChange:ctx.render});
  qsa('[data-manage-item]',root).forEach(b=>b.addEventListener('click',()=>ctx.openItem(b.dataset.manageItem)));
  qsa('[data-promote-item]',root).forEach(b=>b.addEventListener('click',async()=>{const id=b.dataset.promoteItem;const r=await ctx.api.saveManagement(id,{attention_state:'review',status:'needs_review',management_origin:'user',promoted_at:new Date().toISOString(),promoted_by:state.user.id,attention_reason:'Promoted from Source Intelligence'},state.user.id);if(r.error)return toast(r.error.message,{bad:true});const w=await ctx.api.setWatching(id,state.user.id,true);if(w.error)return toast(w.error.message,{bad:true});toast('Promoted to Needs Review and added to your live view');await ctx.reload()}));
}
