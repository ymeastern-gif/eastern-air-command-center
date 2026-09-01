import assert from 'node:assert/strict';
import { scopeKey, resolveDefaultView, setDefaultView, savedViewPayload, parseSavedView } from '../src/core/view-engine.mjs';
const universe={owner:['y','i','__unassigned__'],category:['drawings','field']};
assert.equal(scopeKey('my_work','all'),'all_jobs|my_work');
assert.equal(scopeKey('my_work','1484'),'project:1484|my_work');

let settings={};
settings=setDefaultView({settings,page:'my_work',projectScope:'all',viewState:{filters:{include:{owner:['y']}}},universe});
settings=setDefaultView({settings,page:'my_work',projectScope:'1484',viewState:{filters:{include:{category:['drawings']}}},universe});
assert.deepEqual(resolveDefaultView({settings,page:'my_work',projectScope:'1484',universe}).filters.include.category,['drawings']);
assert.deepEqual(resolveDefaultView({settings,page:'my_work',projectScope:'550',universe}).filters.include.owner,['y']);

const payload=savedViewPayload({name:'#WaitingGC',page:'my_work',projectScope:'1484',viewState:{filters:{include:{owner:['y']}}},universe});
assert.equal(payload.name,'WaitingGC');
assert.equal(payload.filters.version,3);
assert.equal(payload.filters.project_scope,'1484');

const old=parseSavedView({id:'1',name:'Old',filters:{page:'mine',project_id:'1484',people:['y'],categories:['drawings']}},universe);
assert.equal(old.projectScope,'1484');
assert.deepEqual(old.state.filters.include.owner,['y']);
console.log('view-engine.test.mjs: all tests passed');
