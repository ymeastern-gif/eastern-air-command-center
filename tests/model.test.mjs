import assert from 'node:assert/strict';
import { buildCanonicalModel } from '../src/core/model.mjs';

const raw = {
  projects:[{id:'p1',name:'1484 First Ave'}],
  categories:[{id:'drawings',name:'Drawings & Submittals'}],
  people:[{id:'person-y',name:'Yosef',linked_user_id:'u1'}],
  items:[
    {id:'a',project_id:'p1',title:'Raw Asana',category_id:'drawings',priority:'medium',origin:'source_normalized'},
    {id:'t',project_id:'p1',title:'Todoist followup',category_id:'drawings',priority:'low',origin:'source_normalized'},
  ],
  management:[
    {item_id:'a',status:'assigned',current_owner_person_id:'person-y'},
    {item_id:'t',status:'needs_review',current_owner_person_id:'person-y'},
  ],
  assignments:[
    {item_id:'a',person_id:'person-y',active:true,is_primary:true},
    {item_id:'t',person_id:'person-y',active:true,is_primary:true},
  ],
  watchers:[],
  userItemPreferences:[],
  itemSources:[
    {item_id:'a',source_record_id:'sa',is_primary:true},
    {item_id:'t',source_record_id:'st',is_primary:true},
  ],
  sourceRecords:[
    {id:'sa',source_system:'asana',source_ref:'1210721289397407',source_url:null,title:'Asana source'},
    {id:'st',source_system:'todoist',source_ref:'123',source_url:null,title:'Todoist source'},
  ],
  tags:[], itemTags:[],
};

const model=buildCanonicalModel(raw,'u1');
const asana=model.find(x=>x.id==='a');
const todo=model.find(x=>x.id==='t');
assert.equal(asana.attentionState,'background');
assert.equal(asana.ownerUserId,'u1');
assert.equal(asana.primarySource.resolvedUrl,'https://app.asana.com/0/0/1210721289397407/f');
assert.equal(todo.attentionState,'review');
assert.equal(todo.personalSource,true);
assert.equal(todo.promoted,true);
console.log('model.test.mjs: all tests passed');
