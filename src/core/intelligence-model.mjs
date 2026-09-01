import { resolveSourceLink, sourceActionLabel, sourceLabel } from './source-links.mjs';

function clean(v){return String(v??'').trim()}
function byName(people=[]){const m=new Map();for(const p of people){m.set(clean(p.name).toLowerCase(),p);if(p.email)m.set(clean(p.email).toLowerCase(),p)}return m}

export function buildIntelligenceRecords(raw,currentUserId){
  const projects=Object.fromEntries((raw.projects??[]).map(p=>[p.id,p]));
  const peopleMap=byName(raw.people??[]);
  const linkedBySource=new Map((raw.itemSources??[]).map(x=>[x.source_record_id,x.item_id]));
  return (raw.sourceRecords??[]).filter(s=>!s.is_historical).map(s=>{
    const r=s.raw??{};
    const assigneeName=clean(r.assignee||r.assignee_name);
    const assigneeEmail=clean(r.assignee_email);
    const person=peopleMap.get(assigneeEmail.toLowerCase())||peopleMap.get(assigneeName.toLowerCase())||null;
    const link=resolveSourceLink(s);
    const section=clean(r.section||r.section_name);
    const sourceSystem=clean(s.source_system)||'other';
    const isAsana=sourceSystem==='asana';
    const ownerUserId=person?.linked_user_id??null;
    return {
      id:`source:${s.id}`,
      sourceRecordId:s.id,
      linkedItemId:linkedBySource.get(s.id)??null,
      sourceOnly:true,
      title:s.title||'Untitled source',
      description:s.body||'',
      project:s.project_id??null,
      projectName:projects[s.project_id]?.name??null,
      category:section||`source:${sourceSystem}`,
      categoryName:section||(sourceSystem==='gmail'?'Email / Conversation':'Source Activity'),
      floor:null,
      system:null,
      equipment:null,
      priority:'medium',
      status:'source',
      attention:'background',
      attentionState:'background',
      due:null,
      followUp:null,
      waitingOn:null,
      scheduleImpact:null,
      confidence:'source_says',
      owner:person?.id??null,
      ownerName:person?.name||assigneeName||null,
      ownerUserId,
      watcher:[],watcherUserIds:[],
      tags:[],tag:[],
      source:[sourceSystem],sources:[sourceSystem],
      sourceTaskAssigned:isAsana&&!!ownerUserId,
      assignedToCurrentUser:isAsana&&ownerUserId===currentUserId,
      primarySource:{...s,isPrimary:true,resolvedUrl:link.url,urlKind:s.source_url_kind||link.kind,badge:sourceLabel(sourceSystem),actionLabel:sourceActionLabel(sourceSystem)},
      sourceRecords:[{...s,isPrimary:true,resolvedUrl:link.url,urlKind:s.source_url_kind||link.kind,badge:sourceLabel(sourceSystem),actionLabel:sourceActionLabel(sourceSystem)}],
      updatedAt:s.source_updated_at||s.last_seen_at||s.created_at,
      createdAt:s.source_created_at||s.created_at,
      searchText:[s.title,s.body,s.source_ref,assigneeName,assigneeEmail,section].filter(Boolean),
    };
  });
}

export function latestIntelligence(records,{projectScope='all',limit=20,excludeSystems=[]}={}){
  const excluded=new Set(excludeSystems);
  return records.filter(r=>(projectScope==='all'||r.project===projectScope)&&!excluded.has(r.source?.[0])).sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||''))).slice(0,limit);
}
