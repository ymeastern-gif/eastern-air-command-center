export const ATTENTION = Object.freeze({
  BACKGROUND: 'background',
  WATCH: 'watch',
  ACTION: 'action',
  WAITING: 'waiting',
  REVIEW: 'review',
  RISK: 'risk',
  RESOLVED: 'resolved',
});

export const LIVE_ATTENTION = new Set([
  ATTENTION.WATCH,
  ATTENTION.ACTION,
  ATTENTION.WAITING,
  ATTENTION.REVIEW,
  ATTENTION.RISK,
]);

export function isLiveAttention(state) {
  return LIVE_ATTENTION.has(state);
}

function includesUser(list, userId) {
  return Array.isArray(list) && list.includes(userId);
}

function onOrBefore(date, today) {
  return !!date && date <= today;
}

export function isOwnedBy(record, userId) {
  return !!userId && record.ownerUserId === userId;
}

export function isWatchedBy(record, userId) {
  return !!userId && includesUser(record.watcherUserIds, userId);
}

export function isRelevantToUser(record, userId) {
  return isOwnedBy(record, userId) || isWatchedBy(record, userId) || includesUser(record.flaggedToUserIds, userId);
}

export function isMyWorkEligible(record, userId) {
  if (!record || !isLiveAttention(record.attentionState)) return false;
  if (record.personalDismissed === true) return false;

  if (isOwnedBy(record, userId) || isWatchedBy(record, userId)) return true;

  if (record.personalSource === true && record.promoted === true && !record.ownerUserId) return true;

  return false;
}

export function isAssignedOutEligible(record, userId) {
  if (!record || !isLiveAttention(record.attentionState)) return false;
  return !!record.ownerUserId && record.ownerUserId !== userId;
}

export function isTodayEligible(record, userId, today) {
  if (!record || !isLiveAttention(record.attentionState)) return false;
  if (record.personalDismissed === true) return false;

  const mine = isOwnedBy(record, userId);
  const watched = isWatchedBy(record, userId);
  const flagged = includesUser(record.flaggedToUserIds, userId);

  if (flagged) return true;
  if (onOrBefore(record.personalFollowUp, today)) return true;

  if (mine || watched) {
    if ([ATTENTION.ACTION, ATTENTION.REVIEW, ATTENTION.RISK].includes(record.attentionState)) return true;
    if (onOrBefore(record.followUp, today)) return true;
    if (onOrBefore(record.due, today)) return true;
    if (record.meaningfulChangeNeedsReview === true) return true;
    if (record.scheduleRisk === true) return true;
  }

  return false;
}

export function shouldPromoteSource({ explicitFlag = false, explicitAssignment = false, explicitWatch = false, due = null, followUp = null, trustedRule = false, intelligenceReview = false } = {}) {
  return !!(explicitFlag || explicitAssignment || explicitWatch || due || followUp || trustedRule || intelligenceReview);
}

export function fallbackAttentionState({ status, flaggedAt, attentionReason, due, followUp, explicitManagement = false } = {}) {
  if (status === 'done') return ATTENTION.RESOLVED;
  if (status === 'needs_review') return ATTENTION.REVIEW;
  if (status === 'waiting' || status === 'follow_up') return ATTENTION.WAITING;
  if (explicitManagement || flaggedAt || attentionReason || due || followUp) return ATTENTION.ACTION;
  return ATTENTION.BACKGROUND;
}
