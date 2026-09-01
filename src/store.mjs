import { buildCanonicalModel, canonicalMaps } from './core/model.mjs';
import { buildUniverse, MISSING } from './core/filter-engine.mjs';
import { normalizeMilestone } from './core/schedule-engine.mjs';
import { ATTENTION_OPTIONS, PRIORITY_OPTIONS, STATUS_OPTIONS } from './config.mjs';

const SOURCE_OPTIONS=['asana','gmail','todoist','procore','google_drive','drive','file','command_center'];

export function createStore() {
  let state={
    user:null,member:null,raw:null,records:[],schedule:[],maps:{},errors:[],page:'today',projectScope:'all',viewState:{filters:{search:'',include:{},exclude:{},date:{}}},universe:{},scheduleUniverse:{},selectedItemId:null,loading:true,
  };
  const listeners=new Set();
  const get=()=>state;
  const emit=()=>listeners.forEach(fn=>fn(state));
  const set=patch=>{state={...state,...patch};emit();};
  const subscribe=fn=>{listeners.add(fn);return()=>listeners.delete(fn)};

  function rebuildDerived() {
    if (!state.raw || !state.user) return;
    const records=buildCanonicalModel(state.raw,state.user.id);
    const maps=canonicalMaps(state.raw);
    const schedule=(state.raw.scheduleMilestones??[]).map(row=>normalizeMilestone(row,maps.projects,maps.sources));
    const configured={
      project:[...(state.raw.projects??[]).map(p=>p.id)],
      owner:[...(state.raw.people??[]).map(p=>p.id),MISSING.owner],
      category:[...(state.raw.categories??[]).map(c=>c.id),MISSING.category],
      attention:ATTENTION_OPTIONS,
      status:STATUS_OPTIONS,
      priority:PRIORITY_OPTIONS,
      source:[...SOURCE_OPTIONS,MISSING.source],
      floor:[MISSING.floor],
      system:[MISSING.system],
      equipment:[MISSING.equipment],
      tag:[MISSING.tag],
    };
    const universe=buildUniverse(records,configured);
    const scheduleRecords=schedule.map(m=>({
      ...m,
      source:m.sourceSystem?[m.sourceSystem]:[],
      floor:m.floor,
      scheduleCategory:m.category,
      attention:m.status==='delayed'||m.status==='at_risk'?'risk':'background',
    }));
    const scheduleUniverse=buildUniverse(scheduleRecords,{
      project:[...(state.raw.projects??[]).map(p=>p.id)],
      source:[...SOURCE_OPTIONS,MISSING.source],
      floor:[MISSING.floor],
      scheduleCategory:[],
      confidence:['confirmed','source_says','calculated','inferred','needs_verification'],
      status:[],
    });
    state={...state,records,schedule,maps,universe,scheduleUniverse};
  }

  function load({user,member,raw,errors=[]}) {state={...state,user,member,raw,errors,loading:false};rebuildDerived();emit();}
  function refreshRaw(raw,errors=[]) {state={...state,raw,errors};rebuildDerived();emit();}

  return {get,set,subscribe,load,refreshRaw,rebuildDerived};
}
