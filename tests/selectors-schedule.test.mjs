import assert from 'node:assert/strict';
import { selectToday, selectMyWork, selectAssignedOut, selectBackgroundIntelligence, projectWorkStats } from '../src/core/selectors.mjs';
import { ATTENTION } from '../src/core/attention-engine.mjs';
import { normalizeMilestone, selectUpcoming, groupCycleByFloor, nextByFloor, isScheduleRisk, isCompleteMilestone } from '../src/core/schedule-engine.mjs';

const records=[
 {id:1,project:'p',attentionState:ATTENTION.BACKGROUND,ownerUserId:'me',watcherUserIds:[],status:'assigned'},
 {id:2,project:'p',attentionState:ATTENTION.ACTION,ownerUserId:'me',watcherUserIds:[],status:'working',priority:'high'},
 {id:3,project:'p',attentionState:ATTENTION.WAITING,ownerUserId:'other',watcherUserIds:['me'],status:'waiting',followUp:'2026-09-01'},
 {id:4,project:'p',attentionState:ATTENTION.REVIEW,ownerUserId:'other',watcherUserIds:[],status:'needs_review'},
];
assert.deepEqual(selectMyWork(records,{userId:'me',projectScope:'p'}).map(x=>x.id),[2,3]);
assert.deepEqual(selectToday(records,{userId:'me',today:'2026-09-01',projectScope:'p'}).map(x=>x.id),[2,3]);
assert.deepEqual(selectAssignedOut(records,{userId:'me',projectScope:'p'}).map(x=>x.id),[3,4]);
assert.deepEqual(selectBackgroundIntelligence(records,{projectScope:'p'}).map(x=>x.id),[1]);
assert.equal(projectWorkStats(records,{projectId:'p',userId:'me',today:'2026-09-01'}).active,3);

const rows=[
 {id:'m1',project_id:'p',title:'3F Risers',floor:'3F',category:'floor_cycle',planned_date:'2026-09-08',status:'planned',confidence:'source_says'},
 {id:'m2',project_id:'p',title:'2F Risers',floor:'2F',category:'floor_cycle',planned_date:'2026-08-25',status:'delayed',confidence:'source_says'},
 {id:'m3',project_id:'p',title:'Delivery',category:'procurement',planned_date:'2026-09-17',status:'planned',confidence:'calculated'},
 {id:'m4',project_id:'p',title:'Already Delivered',category:'procurement',planned_date:'2026-09-20',status:'complete',confidence:'calculated'},
];
const m=rows.map(r=>normalizeMilestone(r,{p:{name:'Job'}},{}));
assert.equal(m[0].dateType,'project_cycle');
assert.equal(m[2].dateType,'calculated_lead_time');
assert.equal(isScheduleRisk(m[1],'2026-09-01'),true);
assert.equal(isCompleteMilestone(m[3]),true);
assert.deepEqual(selectUpcoming(m,{today:'2026-09-01',days:30,projectScope:'p'}).map(x=>x.id),['m1','m3']);
assert.equal(isScheduleRisk(m[3],'2026-09-01'),false);
assert.equal(groupCycleByFloor(m,'p').get('3F')[0].id,'m1');
assert.equal(nextByFloor(m,{today:'2026-09-01',projectScope:'p'})[0].floor,'3F');
console.log('selectors-schedule.test.mjs: all tests passed');
