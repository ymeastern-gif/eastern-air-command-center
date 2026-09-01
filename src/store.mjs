import { buildCanonicalModel, canonicalMaps } from './core/model.mjs';
import { buildIntelligenceRecords } from './core/intelligence-model.mjs';
import { buildBrainDocuments } from './core/brain-search.mjs';
import { buildUniverse, MISSING } from './core/filter-engine.mjs';
import { normalizeMilestone } from './core/schedule-engine.mjs';
import { ATTENTION_OPTIONS, PRIORITY_OPTIONS, STATUS_OPTIONS } from './config.mjs';

const SOURCE_OPTIONS=['asana','gmail','todoist','procore','drive','file','command_center','other'];

export function createStore(){
  let state={user:null,member:null,raw:null,records:[],intelligenceRecords:[],combinedRecords:[],brainDocuments:[],schedule:[],sourceFilterRecords:[],changeFilterRecords:[],maps:{},errors:[],page:'brain',projectScope:'all',viewState:{filters:{search:'',include:{},exclude:{},date:{}}},universe:{},combinedUniverse:{},scheduleUniverse:{},sourceUniverse:{},changeUniverse:{},loading:true};
  const listeners=new Set();const get=()=>state;const emit=()=>listeners.forEach(fn=>fn(state));const set=patch=>{state={...state,...patch};emit()};const subscribe=fn=>{listeners.add(fn);return()=>listeners.delete(fn)};
  function rebuildDerived(){
    if(!state.raw||!state.user)return;
    const records=buildCanonicalModel(state.raw,state.user.id);
    const intelligenceRecords=buildIntelligenceRecords(state.raw,state.user.id);
    const combinedRecords=[...records,...intelligenceRecords];
    const maps=canonicalMaps(state.raw);
    const schedule=(state.raw.scheduleMilestones??[]).map(r=>normalizeMilestone(r,maps.projects,maps.sources));
    const brainDocuments=buildBrainDocuments({records,intelligenceRecords,schedule,topics:state.raw.topics??[],commitments:state.raw.commitments??[],suggestions:(state.raw.actionSuggestions??[]).filter(s=>s.state==='pending'),sourceEntities:state.raw.sourceEntities??[]});
    const configured={project:(state.raw.projects??[]).map(p=>p.id),owner:[...(state.raw.people??[]).map(p=>p.id),MISSING.owner],category:[...(state.raw.categories??[]).map(c=>c.id),MISSING.category],attention:ATTENTION_OPTIONS,status:[...STATUS_OPTIONS,'source'],priority:PRIORITY_OPTIONS,source:[...SOURCE_OPTIONS,MISSING.source],floor:[MISSING.floor],system:[MISSING.system],equipment:[MISSING.equipment],tag:[MISSING.tag]};
    const universe=buildUniverse(records,configured);const combinedUniverse=buildUniverse(combinedRecords,configured);
    const scheduleRecords=schedule.map(m=>({...m,source:m.sourceSystem?[m.sourceSystem]:[],scheduleCategory:m.category,attention:['delayed','at_risk'].includes(m.status)?'risk':'background'}));
    const scheduleUniverse=buildUniverse(scheduleRecords,{project:configured.project,source:configured.source,floor:[MISSING.floor],scheduleCategory:[],confidence:['confirmed','source_says','calculated','inferred','needs_verification'],status:[]});
    const sourceFilterRecords=(state.raw.sourceRecords??[]).map(s=>({id:s.id,project:s.project_id||null,source:s.source_system?[s.source_system]:[],confidence:'source_says',sourceState:s.is_historical?'historical':'current',title:s.title||'',description:s.body||'',searchText:[s.source_ref,s.source_system]}));
    const sourceUniverse=buildUniverse(sourceFilterRecords,{project:configured.project,source:configured.source,confidence:['source_says'],sourceState:['current','historical']});
    const deltas=(state.raw.sourceDeltas??[]).map(e=>({id:e.id,project:e.project_id||null,source:e.source_system?[e.source_system]:[],confidence:e.confidence||'source_says',changeType:e.delta_type||'change',actor:MISSING.owner,meaningful:e.meaningful?'meaningful':'routine',title:e.summary||'',description:e.meaningful_reason||''}));
    const legacy=(state.raw.activityEvents??[]).map(e=>{const sr=e.source_record_id?maps.sources[e.source_record_id]:null;return{id:e.id,project:e.project_id||null,source:sr?.source_system?[sr.source_system]:[],confidence:e.confidence||'source_says',changeType:e.event_type||'change',actor:e.actor_person_id||MISSING.owner,meaningful:e.meaningful?'meaningful':'routine',title:e.summary||'',description:e.summary||''}});
    const changeFilterRecords=[...deltas,...legacy];
    const changeUniverse=buildUniverse(changeFilterRecords,{project:configured.project,source:configured.source,confidence:['confirmed','source_says','calculated','inferred','needs_verification'],changeType:[],actor:[...(state.raw.people??[]).map(p=>p.id),MISSING.owner],meaningful:['meaningful','routine']});
    state={...state,records,intelligenceRecords,combinedRecords,brainDocuments,schedule,maps,universe,combinedUniverse,scheduleUniverse,sourceFilterRecords,sourceUniverse,changeFilterRecords,changeUniverse};
  }
  function load({user,member,raw,errors=[]}){state={...state,user,member,raw,errors,loading:false};rebuildDerived();emit()}
  function refreshRaw(raw,errors=[]){state={...state,raw,errors};rebuildDerived();emit()}
  return{get,set,subscribe,load,refreshRaw,rebuildDerived};
}
