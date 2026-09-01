import { isAssignedOutEligible, isMyWorkEligible, isTodayEligible } from './attention-engine.mjs';

export function inProjectScope(record, projectScope='all') {
  return projectScope === 'all' || record.project === projectScope;
}

export function selectToday(records, { userId, today, projectScope='all' }) {
  return records.filter(r => inProjectScope(r, projectScope) && isTodayEligible(r, userId, today));
}

export function selectMyWork(records, { userId, projectScope='all' }) {
  return records.filter(r => inProjectScope(r, projectScope) && isMyWorkEligible(r, userId));
}

export function selectAssignedOut(records, { userId, projectScope='all' }) {
  return records.filter(r => inProjectScope(r, projectScope) && isAssignedOutEligible(r, userId));
}

export function selectBackgroundIntelligence(records, { projectScope='all' }={}) {
  return records.filter(r => inProjectScope(r, projectScope) && r.attentionState === 'background');
}

export function selectWaiting(records, { userId=null, projectScope='all', mineOrWatched=false }={}) {
  return records.filter(r => {
    if (!inProjectScope(r, projectScope)) return false;
    if (r.attentionState !== 'waiting' && r.status !== 'waiting' && r.status !== 'follow_up') return false;
    if (!mineOrWatched || !userId) return true;
    return r.ownerUserId === userId || r.watcherUserIds?.includes(userId);
  });
}

export function sortByUrgency(records, today) {
  const score = r => {
    let n = 0;
    if (r.attentionState === 'risk') n -= 1000;
    if (r.attentionState === 'review') n -= 700;
    if (r.priority === 'critical') n -= 500;
    if (r.priority === 'high') n -= 300;
    if (r.due && r.due < today) n -= 400;
    if (r.followUp && r.followUp <= today) n -= 350;
    const date = r.due || r.followUp || '9999-12-31';
    return [n,date,String(r.title??'')];
  };
  return [...records].sort((a,b) => {
    const aa=score(a), bb=score(b);
    return aa[0]-bb[0] || aa[1].localeCompare(bb[1]) || aa[2].localeCompare(bb[2]);
  });
}

export function projectWorkStats(records, { projectId, userId, today }) {
  const scoped = records.filter(r => r.project === projectId && r.attentionState !== 'background' && r.attentionState !== 'resolved');
  return {
    active: scoped.length,
    mine: scoped.filter(r => r.ownerUserId === userId || r.watcherUserIds?.includes(userId)).length,
    assignedOut: scoped.filter(r => r.ownerUserId && r.ownerUserId !== userId).length,
    waiting: scoped.filter(r => r.attentionState === 'waiting' || ['waiting','follow_up'].includes(r.status)).length,
    review: scoped.filter(r => r.attentionState === 'review').length,
    risks: scoped.filter(r => r.attentionState === 'risk' || ['high','critical'].includes(r.scheduleImpact)).length,
    overdue: scoped.filter(r => r.due && r.due < today).length,
  };
}
