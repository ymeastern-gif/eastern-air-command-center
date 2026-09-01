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
    ]);

    const raw = {
      projects:[],categories:[],people:[],items:[],management:[],assignments:[],watchers:[],userItemPreferences:[],itemSources:[],sourceRecords:[],tags:[],itemTags:[],scheduleMilestones:[],activityEvents:[],savedViews:[],userPreferences:null,profiles:[],members:[],notifications:[],
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

  async function createCommandItem(userId,{projectId,title,description=null,categoryId='general',priority='medium',due=null,ownerPersonId=null}) {
    const {data:item,error}=await client.from('items').insert({workspace_id:workspaceId,project_id:projectId,title,description,category_id:categoryId,category:categoryId,priority,due_at:due,origin:'command_center',confidence:'confirmed',created_by:userId}).select().single();
    if (error) return {data:null,error};
    const mgmt={item_id:item.id,workspace_id:workspaceId,status:'inbox',attention_state:'action',management_origin:'user',promoted_at:new Date().toISOString(),promoted_by:userId,updated_by:userId};
    const result=await client.from('item_management').insert(mgmt);
    if (result.error) return {data:item,error:result.error};
    if (ownerPersonId) await assignItem(item.id,ownerPersonId,'Assigned when created',false);
    return {data:item,error:null};
  }

  return {loadWorkspace,getMembership,saveManagement,assignItem,clearAssignment,setWatching,savePersonalPreference,loadItemDetail,addComment,saveUserSettings,createSavedView,deleteSavedView,createCommandItem};
}
