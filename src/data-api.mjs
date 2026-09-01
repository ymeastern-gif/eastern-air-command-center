export function createDataApi(client, workspaceId) {
  async function safe(name, request) {
    try {
      const result = await request;
      if (result.error) return { name, data: [], error: result.error };
      return { name, data: result.data ?? [], error: null };
    } catch (error) {
      return { name, data: [], error };
    }
  }

  async function loadWorkspace(userId) {
    const queries = await Promise.all([
      safe('projects', client.from('projects').select('*').eq('workspace_id',workspaceId).eq('active',true).order('sort_order')),
      safe('categories', client.from('work_categories').select('*').eq('workspace_id',workspaceId).eq('active',true).order('sort_order')),
      safe('people', client.from('people').select('*').eq('workspace_id',workspaceId).eq('active',true).order('name')),
      safe('items', client.from('items').select('*').eq('workspace_id',workspaceId).eq('active',true).order('updated_at',{ascending:false})),
      safe('management', client.from('item_management').select('*').eq('workspace_id',workspaceId)),
      safe('assignments', client.from('item_assignees').select('*')),
      safe('watchers', client.from('item_watchers').select('*')),
      safe('userItemPreferences', client.from('user_item_preferences').select('*').eq('user_id',userId)),
      safe('itemSources', client.from('item_sources').select('*')),
      safe('sourceRecords', client.from('source_records').select('*').eq('workspace_id',workspaceId)),
      safe('tags', client.from('tags').select('*').eq('workspace_id',workspaceId).order('name')),
      safe('itemTags', client.from('item_tags').select('*')),
      safe('scheduleMilestones', client.from('schedule_milestones').select('*').eq('workspace_id',workspaceId).order('planned_date')),
      safe('activityEvents', client.from('activity_events').select('*').eq('workspace_id',workspaceId).order('happened_at',{ascending:false}).limit(500)),
      safe('savedViews', client.from('saved_views').select('*').eq('workspace_id',workspaceId).or(`owner_user_id.eq.${userId},is_shared.eq.true`).order('sort_order')),
      safe('userPreferences', client.from('user_preferences').select('*').eq('workspace_id',workspaceId).eq('user_id',userId).maybeSingle()),
      safe('profiles', client.from('profiles').select('id,display_name,email')),
      safe('members', client.from('workspace_members').select('*').eq('workspace_id',workspaceId)),
      safe('notifications', client.from('notifications').select('*').eq('workspace_id',workspaceId).eq('user_id',userId).order('created_at',{ascending:false}).limit(100)),
      safe('sourceEntities', client.from('source_entities').select('*')),
      safe('entityAliases', client.from('entity_aliases').select('*').eq('workspace_id',workspaceId).order('entity_type').order('alias')),
      safe('topics', client.from('topics').select('*').eq('workspace_id',workspaceId).order('last_source_at',{ascending:false,nullsFirst:false})),
      safe('topicSources', client.from('topic_sources').select('*')),
      safe('commitments', client.from('commitments').select('*').eq('workspace_id',workspaceId).order('due_at',{ascending:true,nullsFirst:false})),
      safe('actionSuggestions', client.from('action_suggestions').select('*').eq('workspace_id',workspaceId).order('created_at',{ascending:false})),
      safe('sourceDeltas', client.from('source_deltas').select('*').eq('workspace_id',workspaceId).order('happened_at',{ascending:false}).limit(1000)),
      safe('sourceConfigs', client.from('project_source_configs').select('*').eq('workspace_id',workspaceId).order('project_id').order('source_system')),
      safe('taxonomyRules', client.from('project_taxonomy_rules').select('*').eq('workspace_id',workspaceId).eq('active',true).order('sort_order')),
      safe('seenState', client.from('user_seen_state').select('*').eq('workspace_id',workspaceId).eq('user_id',userId)),
      safe('syncRuns', client.from('sync_runs').select('*').eq('workspace_id',workspaceId).order('started_at',{ascending:false}).limit(100)),
    ]);

    const raw = {
      projects:[],categories:[],people:[],items:[],management:[],assignments:[],watchers:[],userItemPreferences:[],itemSources:[],sourceRecords:[],tags:[],itemTags:[],scheduleMilestones:[],activityEvents:[],savedViews:[],userPreferences:null,profiles:[],members:[],notifications:[],sourceEntities:[],entityAliases:[],topics:[],topicSources:[],commitments:[],actionSuggestions:[],sourceDeltas:[],sourceConfigs:[],taxonomyRules:[],seenState:[],syncRuns:[],
    };
    const errors=[];
    for (const q of queries) {
      if (q.error) errors.push({source:q.name,message:q.error.message ?? String(q.error)});
      if (q.name==='userPreferences') raw.userPreferences = Array.isArray(q.data) ? q.data[0] ?? null : q.data;
      else raw[q.name] = q.data;
    }
    return {raw,errors};
  }

  async function getMembership(userId) {
    const {data,error}=await client.from('workspace_members').select('*').eq('workspace_id',workspaceId).eq('user_id',userId).eq('active',true).maybeSingle();
    return {data,error};
  }

  async function saveManagement(itemId, patch, userId) {
    const {data:old,error:oldError}=await client.from('item_management').select('*').eq('item_id',itemId).maybeSingle();
    if (oldError) return {error:oldError};
    const row={...(old??{}),item_id:itemId,workspace_id:workspaceId,...patch,updated_by:userId,updated_at:new Date().toISOString()};
    return client.from('item_management').upsert(row,{onConflict:'item_id'}).select().single();
  }

  async function assignItem(itemId, personId, note='', keepWatching=false) {
    return client.rpc('assign_item',{p_item_id:itemId,p_person_id:personId,p_note:note||null,p_keep_watching:!!keepWatching});
  }

  async function clearAssignment(itemId, userId) {
    const a=await client.from('item_assignees').update({active:false}).eq('item_id',itemId).eq('active',true);
    if (a.error) return a;
    return saveManagement(itemId,{current_owner_person_id:null,management_origin:'user'},userId);
  }

  async function setWatching(itemId, userId, watching) {
    if (watching) return client.from('item_watchers').upsert({item_id:itemId,user_id:userId},{onConflict:'user_id,item_id'});
    return client.from('item_watchers').delete().eq('item_id',itemId).eq('user_id',userId);
  }

  async function setItemTags(itemId, names=[]) {
    const cleaned=[...new Set(names.map(x=>String(x).trim().replace(/^#/, '')).filter(Boolean))];
    const wanted=[];
    for (const name of cleaned) {
      let {data:tag,error}=await client.from('tags').select('*').eq('workspace_id',workspaceId).ilike('name',name).maybeSingle();
      if (error) return {error};
      if (!tag) {
        const created=await client.from('tags').insert({workspace_id:workspaceId,name}).select().single();
        if (created.error) return {error:created.error};
        tag=created.data;
      }
      wanted.push(tag.id);
    }
    const existing=await client.from('item_tags').select('*').eq('item_id',itemId);
    if (existing.error) return {error:existing.error};
    const existingIds=new Set((existing.data??[]).map(x=>x.tag_id)), wantedSet=new Set(wanted);
    for (const row of existing.data??[]) if (!wantedSet.has(row.tag_id)) {
      const del=await client.from('item_tags').delete().eq('item_id',itemId).eq('tag_id',row.tag_id);if(del.error)return {error:del.error};
    }
    for (const tagId of wanted) if (!existingIds.has(tagId)) {
      const ins=await client.from('item_tags').insert({item_id:itemId,tag_id:tagId});if(ins.error)return {error:ins.error};
    }
    return {data:wanted,error:null};
  }

  async function savePersonalPreference(itemId, userId, patch) {
    const {data:old}=await client.from('user_item_preferences').select('*').eq('item_id',itemId).eq('user_id',userId).maybeSingle();
    const row={...(old??{}),user_id:userId,item_id:itemId,...patch,updated_at:new Date().toISOString()};
    return client.from('user_item_preferences').upsert(row,{onConflict:'user_id,item_id'}).select().single();
  }

  async function loadItemDetail(itemId) {
    const [comments,handoffs,events] = await Promise.all([
      safe('comments',client.from('item_comments').select('*').eq('item_id',itemId).order('created_at')),
      safe('handoffs',client.from('item_handoffs').select('*').eq('item_id',itemId).order('happened_at',{ascending:false})),
      safe('events',client.from('activity_events').select('*').eq('item_id',itemId).order('happened_at',{ascending:false}).limit(100)),
    ]);
    return {comments:comments.data,handoffs:handoffs.data,events:events.data,errors:[comments,handoffs,events].filter(x=>x.error).map(x=>({source:x.name,message:x.error.message??String(x.error)}))};
  }

  async function addComment(itemId,userId,body) {
    return client.from('item_comments').insert({workspace_id:workspaceId,item_id:itemId,author_user_id:userId,body}).select().single();
  }

  async function saveUserSettings(userId, settings) {
    return client.from('user_preferences').upsert({user_id:userId,workspace_id:workspaceId,settings,updated_at:new Date().toISOString()},{onConflict:'user_id'}).select().single();
  }

  async function createSavedView(userId, payload) {
    return client.from('saved_views').insert({workspace_id:workspaceId,owner_user_id:userId,name:payload.name,is_shared:payload.is_shared,filters:payload.filters,sort_order:999}).select().single();
  }

  async function deleteSavedView(id,userId) {
    return client.from('saved_views').delete().eq('id',id).eq('owner_user_id',userId);
  }

  async function createCommandItem(userId,{projectId,title,description=null,categoryId='general',priority='medium',due=null,ownerPersonId=null,sourceRecordId=null}) {
    const {data:item,error}=await client.from('items').insert({workspace_id:workspaceId,project_id:projectId,title,description,category_id:categoryId,category:categoryId,priority,due_at:due,origin:'command_center',confidence:'confirmed',created_by:userId}).select().single();
    if (error) return {data:null,error};
    const mgmt={item_id:item.id,workspace_id:workspaceId,status:'inbox',attention_state:'action',management_origin:'user',promoted_at:new Date().toISOString(),promoted_by:userId,updated_by:userId};
    const result=await client.from('item_management').insert(mgmt);
    if (result.error) return {data:item,error:result.error};
    if (sourceRecordId) {
      const link=await client.from('item_sources').upsert({item_id:item.id,source_record_id:sourceRecordId,is_primary:true},{onConflict:'item_id,source_record_id'});
      if (link.error) return {data:item,error:link.error};
    }
    if (ownerPersonId) await assignItem(item.id,ownerPersonId,'Assigned when created',false);
    return {data:item,error:null};
  }

  async function acceptSuggestion(id,userId) {
    const {data:s,error}=await client.from('action_suggestions').select('*').eq('id',id).single();
    if(error)return {error};
    const created=await createCommandItem(userId,{projectId:s.project_id,title:s.suggested_action||s.title,description:`Suggested by Command Center brain.\n\nReason: ${s.reason}`,categoryId:'follow-up',priority:s.priority||'medium',due:s.suggested_due_at?String(s.suggested_due_at).slice(0,10):null,ownerPersonId:s.suggested_owner_person_id||null,sourceRecordId:s.source_record_id||null});
    if(created.error)return created;
    const upd=await client.from('action_suggestions').update({state:'accepted',decided_at:new Date().toISOString(),decided_by:userId}).eq('id',id);
    if(upd.error)return {data:created.data,error:upd.error};
    return {data:created.data,error:null};
  }

  async function dismissSuggestion(id,userId) {
    return client.from('action_suggestions').update({state:'dismissed',decided_at:new Date().toISOString(),decided_by:userId}).eq('id',id);
  }

  async function updateCommitmentStatus(id,status) {
    return client.from('commitments').update({status,resolved_at:status==='resolved'?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq('id',id);
  }

  async function markSeen(userId,scopeKey,at=new Date().toISOString()) {
    return client.from('user_seen_state').upsert({user_id:userId,workspace_id:workspaceId,scope_key:scopeKey,last_seen_at:at},{onConflict:'user_id,workspace_id,scope_key'}).select().single();
  }

  return {loadWorkspace,getMembership,saveManagement,assignItem,clearAssignment,setWatching,setItemTags,savePersonalPreference,loadItemDetail,addComment,saveUserSettings,createSavedView,deleteSavedView,createCommandItem,acceptSuggestion,dismissSuggestion,updateCommitmentStatus,markSeen};
}
