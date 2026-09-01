import { activeRestrictionCount, MISSING, selectAll } from '../core/filter-engine.mjs';
import { closeModal, esc, human, openModal, qsa, qs } from './dom.mjs';

const DEFAULT_LABELS={project:'Project',owner:'People / Owner',watcher:'Watcher',attention:'Attention',status:'Status',category:'Category',floor:'Floor / Area',system:'System',equipment:'Equipment / Tag',priority:'Priority',scheduleImpact:'Schedule Impact',source:'Source',confidence:'Confidence',tag:'Tags',scheduleCategory:'Schedule Category'};

function optionLabel(dim,value,lookups={}) {
  if (value===MISSING.owner) return 'Unassigned';
  if (value===MISSING.category) return 'No Category';
  if (value===MISSING.floor) return 'No Floor / Area';
  if (value===MISSING.system) return 'No System';
  if (value===MISSING.source) return 'No Source';
  if (value===MISSING.tag) return 'No Tag';
  if (value===MISSING.watcher) return 'No Watcher';
  if (value===MISSING.equipment) return 'No Equipment / Tag';
  return lookups?.[dim]?.[value] ?? human(value);
}

function copyState(state={}) { return structuredClone({search:'',include:{},exclude:{},date:{},...(state??{})}); }

export function openFilterPanel({state,universe,dimensions,lookups={},title='Filters',scopeLabel='',onApply,onSetDefault,onSaveView,onResetDefault}) {
  const draft=copyState(state);
  const groups=dimensions.filter(dim=>(universe[dim]??[]).length).map(dim=>{
    const options=universe[dim]??[];
    const included=new Set(draft.include?.[dim]??[]);
    const excluded=new Set(draft.exclude?.[dim]??[]);
    return `<section class="filterGroupV3" data-dim="${esc(dim)}" data-mode="include"><div class="filterGroupHead"><div><strong>${esc(DEFAULT_LABELS[dim]??human(dim))}</strong><span class="filterSummary" data-summary></span></div><div class="miniActions"><button type="button" class="linkBtn" data-select-all>Select All</button><button type="button" class="linkBtn" data-clear>Clear</button></div></div><div class="modeTabs"><button type="button" class="modeBtn active" data-mode="include">Include</button><button type="button" class="modeBtn" data-mode="exclude">Exclude</button></div><div class="optionSearchWrap ${options.length>8?'':'hidden'}"><input data-option-search placeholder="Search ${esc((DEFAULT_LABELS[dim]??dim).toLowerCase())}…"></div><div class="filterOptions" data-options>${options.map(v=>`<label class="filterOption" data-option-label="${esc(optionLabel(dim,v,lookups).toLowerCase())}"><input type="checkbox" value="${esc(v)}" ${included.has(v)?'checked':''} data-include><span>${esc(optionLabel(dim,v,lookups))}</span><span class="excludeMark ${excluded.has(v)?'show':''}" data-excluded>EXCLUDED</span></label>`).join('')}</div></section>`;
  }).join('');

  const panel=openModal(`<div class="modalHeader"><div><h2>${esc(title)}</h2><p>${esc(scopeLabel)}</p></div><button class="iconBtn" data-close-modal>×</button></div><div class="filterGlobalBar"><div><strong>All filter groups</strong><div class="smallMuted">Select All means unrestricted when every option is included.</div></div><div class="miniActions"><button class="btn secondary" data-all-groups>Select All Groups</button><button class="btn secondary" data-clear-groups>Clear All</button></div></div><div class="filterGroupsV3">${groups}</div><div class="filterFooterV3"><div class="restrictionText"><strong data-restriction-count>${activeRestrictionCount(draft,universe)}</strong> active restriction(s)</div><div class="footerActions">${onResetDefault?'<button class="btn secondary" data-reset-default>Reset to Default</button>':''}${onSetDefault?'<button class="btn secondary" data-set-default>Set as Default</button>':''}${onSaveView?'<button class="btn secondary" data-save-view>Save View</button>':''}<button class="btn primary" data-apply>Apply</button></div></div>`,{wide:true});

  function groupSelection(group,mode){const dim=group.dataset.dim;return draft[mode][dim]??(draft[mode][dim]=[])}
  function setGroup(group,mode,values){draft[mode][group.dataset.dim]=[...values]}
  function renderGroup(group){const dim=group.dataset.dim,mode=group.dataset.mode;const selected=new Set(draft[mode][dim]??[]),excluded=new Set(draft.exclude[dim]??[]);qsa('[data-include]',group).forEach(cb=>{cb.checked=selected.has(cb.value);cb.closest('.filterOption').querySelector('[data-excluded]').classList.toggle('show',excluded.has(cb.value))});qsa('.modeBtn',group).forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));const inc=draft.include[dim]?.length??0,exc=draft.exclude[dim]?.length??0;qs('[data-summary]',group).textContent=`${inc?`+${inc} included`:''}${inc&&exc?' · ':''}${exc?`−${exc} excluded`:''}`}
  function updateCount(){qs('[data-restriction-count]',panel).textContent=activeRestrictionCount(draft,universe)}

  qsa('.filterGroupV3',panel).forEach(group=>{const dim=group.dataset.dim;renderGroup(group);qsa('.modeBtn',group).forEach(b=>b.addEventListener('click',()=>{group.dataset.mode=b.dataset.mode;renderGroup(group)}));qs('[data-select-all]',group).addEventListener('click',()=>{const mode=group.dataset.mode;setGroup(group,mode,selectAll(universe[dim]??[]));if(mode==='include')draft.exclude[dim]=[];renderGroup(group);updateCount()});qs('[data-clear]',group).addEventListener('click',()=>{setGroup(group,group.dataset.mode,[]);renderGroup(group);updateCount()});qsa('[data-include]',group).forEach(cb=>cb.addEventListener('change',()=>{const mode=group.dataset.mode;const s=new Set(groupSelection(group,mode));cb.checked?s.add(cb.value):s.delete(cb.value);setGroup(group,mode,s);if(mode==='include'&&cb.checked){const ex=new Set(draft.exclude[dim]??[]);ex.delete(cb.value);draft.exclude[dim]=[...ex]}if(mode==='exclude'&&cb.checked){const inc=new Set(draft.include[dim]??[]);inc.delete(cb.value);draft.include[dim]=[...inc]}renderGroup(group);updateCount()}));const search=qs('[data-option-search]',group);if(search)search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();qsa('.filterOption',group).forEach(o=>o.classList.toggle('hidden',!!q&&!o.dataset.optionLabel.includes(q)))})});

  qs('[data-all-groups]',panel).addEventListener('click',()=>{qsa('.filterGroupV3',panel).forEach(group=>{const dim=group.dataset.dim;draft.include[dim]=selectAll(universe[dim]??[]);draft.exclude[dim]=[];group.dataset.mode='include';renderGroup(group)});updateCount()});
  qs('[data-clear-groups]',panel).addEventListener('click',()=>{qsa('.filterGroupV3',panel).forEach(group=>{const dim=group.dataset.dim;draft.include[dim]=[];draft.exclude[dim]=[];group.dataset.mode='include';renderGroup(group)});updateCount()});
  qs('[data-apply]',panel).addEventListener('click',()=>{onApply?.(draft);closeModal()});
  qs('[data-set-default]',panel)?.addEventListener('click',async()=>{await onSetDefault?.(draft);closeModal()});
  qs('[data-save-view]',panel)?.addEventListener('click',()=>onSaveView?.(draft));
  qs('[data-reset-default]',panel)?.addEventListener('click',async()=>{const reset=await onResetDefault?.();if(reset){Object.assign(draft,copyState(reset));closeModal();onApply?.(draft)}});
  return {panel,draft};
}
