import assert from 'node:assert/strict';
import {
  ATTENTION,
  isMyWorkEligible,
  isAssignedOutEligible,
  isTodayEligible,
  shouldPromoteSource,
  fallbackAttentionState,
} from '../src/core/attention-engine.mjs';

const me='u1'; const other='u2'; const today='2026-09-01';

assert.equal(isMyWorkEligible({attentionState:ATTENTION.BACKGROUND,ownerUserId:me},me), false);
assert.equal(isMyWorkEligible({attentionState:ATTENTION.ACTION,ownerUserId:me},me), true);
assert.equal(isMyWorkEligible({attentionState:ATTENTION.WATCH,watcherUserIds:[me]},me), true);
assert.equal(isMyWorkEligible({attentionState:ATTENTION.ACTION,personalSource:true,promoted:true,ownerUserId:null},me), true);
assert.equal(isMyWorkEligible({attentionState:ATTENTION.ACTION,personalSource:true,promoted:false,ownerUserId:null},me), false);
assert.equal(isMyWorkEligible({attentionState:ATTENTION.ACTION,ownerUserId:me,personalDismissed:true},me), false);

assert.equal(isAssignedOutEligible({attentionState:ATTENTION.ACTION,ownerUserId:other},me), true);
assert.equal(isAssignedOutEligible({attentionState:ATTENTION.ACTION,ownerUserId:me},me), false);
assert.equal(isAssignedOutEligible({attentionState:ATTENTION.BACKGROUND,ownerUserId:other},me), false);

assert.equal(isTodayEligible({attentionState:ATTENTION.ACTION,ownerUserId:me},me,today), true);
assert.equal(isTodayEligible({attentionState:ATTENTION.WAITING,ownerUserId:me,followUp:'2026-09-01'},me,today), true);
assert.equal(isTodayEligible({attentionState:ATTENTION.WAITING,ownerUserId:me,followUp:'2026-09-05'},me,today), false);
assert.equal(isTodayEligible({attentionState:ATTENTION.ACTION,ownerUserId:other},me,today), false);
assert.equal(isTodayEligible({attentionState:ATTENTION.RISK,watcherUserIds:[me],scheduleRisk:true},me,today), true);
assert.equal(isTodayEligible({attentionState:ATTENTION.BACKGROUND,flaggedToUserIds:[me]},me,today), false);
assert.equal(isTodayEligible({attentionState:ATTENTION.REVIEW,flaggedToUserIds:[me]},me,today), true);

assert.equal(shouldPromoteSource({}), false);
assert.equal(shouldPromoteSource({explicitAssignment:true}), true);
assert.equal(shouldPromoteSource({followUp:'2026-09-03'}), true);

assert.equal(fallbackAttentionState({status:'assigned'}), ATTENTION.BACKGROUND);
assert.equal(fallbackAttentionState({status:'assigned', explicitManagement:true}), ATTENTION.ACTION);
assert.equal(fallbackAttentionState({status:'needs_review'}), ATTENTION.REVIEW);
assert.equal(fallbackAttentionState({status:'waiting'}), ATTENTION.WAITING);
assert.equal(fallbackAttentionState({status:'done'}), ATTENTION.RESOLVED);

console.log('attention-engine.test.mjs: all tests passed');
