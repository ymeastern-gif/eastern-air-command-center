import { activeRestrictionCount, filterRecords } from '../core/filter-engine.mjs';
import { parseSavedView, resolveDefaultView, savedViewPayload, setDefaultView, viewVisibleInScope } from '../core/view-engine.mjs';
import { esc, human, openModal, closeModal, qs, qsa, toast } from './dom.mjs';
import { openFilterPanel } from './filter-panel.mjs';

export const WORK_FILTER_DIMS=['owner','attention','status','category','floor','system','equipment','priority','scheduleImpact','source','confidence','tag'];
export const SOURCE_FILTER_DIMS=['project','source','sourceState'];
export const CHANGE_FILTER_DIMS=['project','source','confidence','changeType','actor','meaningful'];
export const SCHEDULE_FILTER_DIMS=['floor','scheduleCategory','confidence','status','source'];

export function lookupsFor(state){
  const people=Object.fromEntries((state.raw.people??[]).map(p=>[p.id,p.name]));
  return {
    project:Object.fromEntries((state.raw.projects??[]).map(p=>[p.id,p.name])),
    owner:people,actor:people,
    category:Object.fromEntries((state.raw.categories??[]).map(c=>[c.id,c.name])),
    attention:Object.fromEntries((state.universe.attention??[]).map(v=>[v,human(v)])),
    status:Object.fromEntries((state.universe.status??[]).map(v=>[v,human(v)])),
    priority:Object.fromEntries((state.universe.priority??[]).map(v=>[v,human(v)])),
    source:Object.fromEntries([...(state.universe.source??[]),...(state.sourceUniverse.source??[]),...(state.changeUniverse.source??[])].map(v=>[v,human(v)])),
    confidence:Object.fromEntries([...(state.universe.confidence??[]),...(state.scheduleUniverse.confidence??[])].map(v=>[v,human(v)])),
    sourceState:{current:'Current',historical:'Historical'}, meaningful:{meaningful:'Meaningful',routine:'Routine'},
    changeType:Object.fromEntries((state.changeUniverse.changeType??[]).map(v=>[v,human(v)])),
  };
}

function emptyView(){return {filters:{search:'',include:{},exclude:{},date:{}},sort:null,groupBy:null,dateWindow:null,display:null};}
export function currentView(state){return state.viewState??emptyView()}
export function pageUniverse(state,page){if(page==='calendar')return state.scheduleUniverse;if(page==='intelligence')return state.sourceUniverse;if(page==='changes')return state.changeUniverse;return state.universe}
export function filteredForPage(records,state){return filterRecords(records,currentView(state).filters,pageUniverse(state,state.page))}
function visibleViews(state,page){return (state.raw.savedViews??[]).map(v=>parseSavedView(v,pageUniverse(state,page))).filter(v=>viewVisibleInScope(v,{page,projectScope:state.projectScope}));}

export function renderToolbar(state,{page=state.page,placeholder='Search…',dimensions=WORK_FILTER_DIMS,showSave=true}={}){
  const view=currentView(state),count=activeRestrictionCount(view.filters,pageUniverse(state,page)),views=visibleViews(state,page);
  return `<div class="pageToolbar"><div class="searchWrap"><input data-global-search value="${esc(view.filters.search||'')}" placeholder="${esc(placeholder)}"></div><button class="btn secondary" data-open-filters>Filters${count?` <span class="countBubble">${count}</span>`:''}</button>${showSave?'<button class="btn secondary" data-quick-save-view>Save View</button>':''}</div><div class="savedViews"><button class="viewChip" data-clear-view>All</button>${views.map(v=>`<button class="viewChip" data-view-id="${esc(v.id)}">#${esc(v.name)}</button>`).join('')}</div>`;
}

export function wireToolbar({root,state,store,api,page=state.page,dimensions=WORK_FILTER_DIMS,onChange,showSave=true,builtInDefault={}}){
  const universe=pageUniverse(state,page),lookups=lookupsFor(state),search=qs('[data-global-search]',root);
  if(search){const commit=()=>{const v=structuredClone(currentView(store.get()));if(v.filters.search===search.value)return;v.filters.search=search.value;store.set({viewState:v});onChange?.()};search.addEventListener('change',commit);search.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();commit();}})}
  qs('[data-clear-view]',root)?.addEventListener('click',()=>{store.set({viewState:emptyView()});onChange?.()});
  qsa('[data-view-id]',root).forEach(btn=>btn.addEventListener('click',()=>{const row=store.get().raw.savedViews.find(v=>v.id===btn.dataset.viewId);if(!row)return;const parsed=parseSavedView(row,universe);store.set({viewState:parsed.state,projectScope:parsed.projectScope==='all'?store.get().projectScope:parsed.projectScope});onChange?.()}));
  qs('[data-open-filters]',root)?.addEventListener('click',()=>openFilterPanel({state:currentView(store.get()).filters,universe,dimensions,lookups,title:'Filters',scopeLabel:store.get().projectScope==='all'?'All Jobs':lookups.project[store.get().projectScope]||store.get().projectScope,onApply:draft=>{const v=structuredClone(currentView(store.get()));v.filters=draft;store.set({viewState:v});onChange?.()},onSetDefault:async draft=>{const s=store.get(),v=structuredClone(currentView(s));v.filters=draft;const next=setDefaultView({settings:s.raw.userPreferences?.settings??{},page,projectScope:s.projectScope,viewState:v,universe});const r=await api.saveUserSettings(s.user.id,next);if(r.error)return toast(r.error.message,{bad:true});s.raw.userPreferences=r.data;toast('Default view saved')},onSaveView:draft=>openSaveView({state:store.get(),api,page,universe,draft,onDone:onChange}),onResetDefault:async()=>resolveDefaultView({settings:store.get().raw.userPreferences?.settings??{},page,projectScope:store.get().projectScope,builtIn:builtInDefault,universe}).filters}));
  if(showSave)qs('[data-quick-save-view]',root)?.addEventListener('click',()=>openSaveView({state:store.get(),api,page,universe,draft:currentView(store.get()).filters,onDone:onChange}));
}

function openSaveView({state,api,page,universe,draft,onDone}){
  const panel=openModal(`<div class="modalHeader"><div><h2>Save View</h2><p>Save this page, job and filter setup.</p></div><button class="iconBtn" data-close-modal>×</button></div><label>View Name<input id="svName" placeholder="WaitingGC"></label><label class="toggleRow"><input id="svShared" type="checkbox"> Share with team</label><button class="btn primary full" id="svSave">Save View</button>`);
  qs('#svSave',panel).addEventListener('click',async()=>{const name=qs('#svName',panel).value.trim();if(!name)return toast('Give the view a name',{bad:true});const payload=savedViewPayload({name,page,projectScope:state.projectScope,viewState:{...currentView(state),filters:draft},isShared:qs('#svShared',panel).checked,universe});const r=await api.createSavedView(state.user.id,payload);if(r.error)return toast(r.error.message,{bad:true});state.raw.savedViews.push(r.data);toast('View saved');closeModal();await onDone?.();});
}
export function restorePageDefault(state,page,builtIn={}){return resolveDefaultView({settings:state.raw.userPreferences?.settings??{},page,projectScope:state.projectScope,builtIn,universe:pageUniverse(state,page)});}
