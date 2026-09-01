import assert from 'node:assert/strict';
import {aliasExpansions,buildBrainDocuments,searchBrain} from '../src/core/brain-search.mjs';
const aliases=[{alias:'ct',canonical_value:'Cooling Tower'},{alias:'mau',canonical_value:'Make-Up Air Unit'}];
assert(aliasExpansions('ct',aliases).includes('cooling tower'));
const docs=buildBrainDocuments({
 records:[{id:'w1',project:'1484',title:'Review piping reply',projectName:'1484',ownerName:'Yosef',categoryName:'Piping',source:['asana'],tags:[],searchText:[]}],
 intelligenceRecords:[{id:'s1',sourceRecordId:'sr1',project:'192',title:'CT-22-1A approved',projectName:'192',source:['file'],searchText:[],tags:[]}],
 schedule:[{id:'m1',project:'192',title:'Cooling tower expected delivery',projectName:'192',plannedDate:'2026-10-02',sourceSystem:'file'}],
 topics:[{id:'t1',project_id:'550',title:'MAU-1/2 release',summary:'AAON H3 release follow-up',equipment:'MAU-1/2'}],
 commitments:[],suggestions:[],sourceEntities:[{source_record_id:'sr1',entity_type:'equipment_tag',entity_value:'CT-22-1A'}]
});
assert.equal(searchBrain(docs,'ct',aliases,{projectScope:'all'})[0].project,'192');
assert(searchBrain(docs,'mau',aliases,{projectScope:'all'}).some(x=>x.type==='topic'));
assert(searchBrain(docs,'piping reply',aliases,{projectScope:'1484'}).some(x=>x.id==='w1'));
console.log('brain-search.test.mjs: all tests passed');
