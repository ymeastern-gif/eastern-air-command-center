export const MISSING = Object.freeze({
  owner: '__unassigned__',
  category: '__no_category__',
  floor: '__no_floor__',
  system: '__no_system__',
  source: '__no_source__',
  tag: '__no_tag__',
  watcher: '__no_watcher__',
  equipment: '__no_equipment__',
});

export const DEFAULT_FILTER_STATE = Object.freeze({
  search: '',
  include: {},
  exclude: {},
  date: {},
  sort: null,
  groupBy: null,
});

function uniq(values = []) {
  return [...new Set(values.filter(v => v !== undefined && v !== null && v !== ''))];
}

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const bs = new Set(b);
  return a.every(v => bs.has(v));
}

export function normalizeSelection(selected = [], available = []) {
  const a = uniq(available);
  const allowed = new Set(a);
  const s = uniq(selected).filter(v => allowed.has(v));
  if (s.length === 0) return [];
  if (sameSet(s, a)) return [];
  return s;
}

export function normalizeFilterState(state = {}, universe = {}) {
  const normalized = {
    search: String(state.search ?? '').trim(),
    include: {},
    exclude: {},
    date: { ...(state.date ?? {}) },
    sort: state.sort ?? null,
    groupBy: state.groupBy ?? null,
  };

  const dimensions = new Set([
    ...Object.keys(state.include ?? {}),
    ...Object.keys(state.exclude ?? {}),
    ...Object.keys(universe ?? {}),
  ]);

  for (const dim of dimensions) {
    const available = universe[dim] ?? [];
    normalized.include[dim] = normalizeSelection(state.include?.[dim] ?? [], available);
    const allowed = new Set(uniq(available));
    normalized.exclude[dim] = uniq(state.exclude?.[dim] ?? []).filter(v => allowed.has(v));
  }
  return normalized;
}

export function activeRestrictionCount(state = {}, universe = {}) {
  const n = normalizeFilterState(state, universe);
  let count = 0;
  if (n.search) count += 1;
  for (const dim of Object.keys(n.include)) if (n.include[dim]?.length) count += 1;
  for (const dim of Object.keys(n.exclude)) if (n.exclude[dim]?.length) count += 1;
  const d = n.date ?? {};
  for (const key of Object.keys(d)) {
    if (d[key] !== null && d[key] !== undefined && d[key] !== '') count += 1;
  }
  return count;
}

export function optionValue(value, missingToken) {
  return value === null || value === undefined || value === '' ? missingToken : value;
}

export function missingFor(dim) {
  return MISSING[dim] ?? `__no_${dim}__`;
}

function valuesFor(record, dim) {
  const v = record?.[dim];
  if (Array.isArray(v)) return v.length ? v : [missingFor(dim)];
  return [optionValue(v, missingFor(dim))];
}

function anyIncluded(recordValues, includeValues) {
  if (!includeValues?.length) return true;
  const set = new Set(includeValues);
  return recordValues.some(v => set.has(v));
}

function anyExcluded(recordValues, excludeValues) {
  if (!excludeValues?.length) return false;
  const set = new Set(excludeValues);
  return recordValues.some(v => set.has(v));
}

function matchesSearch(record, query) {
  if (!query) return true;
  const haystack = [
    record.title,
    record.description,
    record.projectName,
    record.ownerName,
    record.categoryName,
    record.floor,
    record.system,
    record.equipment,
    record.waitingOn,
    ...(record.tags ?? []),
    ...(record.sources ?? []),
    ...(record.searchText ?? []),
  ].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function dateMatches(record, dateState = {}) {
  const due = record.due ?? null;
  const followUp = record.followUp ?? null;
  const planned = record.plannedDate ?? null;

  if (dateState.dueBefore && (!due || due > dateState.dueBefore)) return false;
  if (dateState.dueAfter && (!due || due < dateState.dueAfter)) return false;
  if (dateState.followUpBefore && (!followUp || followUp > dateState.followUpBefore)) return false;
  if (dateState.followUpAfter && (!followUp || followUp < dateState.followUpAfter)) return false;
  if (dateState.plannedBefore && (!planned || planned > dateState.plannedBefore)) return false;
  if (dateState.plannedAfter && (!planned || planned < dateState.plannedAfter)) return false;
  return true;
}

export function matchesRecord(record, state = {}, universe = {}) {
  const n = normalizeFilterState(state, universe);
  if (!matchesSearch(record, n.search)) return false;

  const dims = new Set([...Object.keys(n.include), ...Object.keys(n.exclude)]);
  for (const dim of dims) {
    const rv = valuesFor(record, dim);
    if (anyExcluded(rv, n.exclude[dim])) return false;
    if (!anyIncluded(rv, n.include[dim])) return false;
  }
  if (!dateMatches(record, n.date)) return false;
  return true;
}

export function filterRecords(records = [], state = {}, universe = {}) {
  return records.filter(record => matchesRecord(record, state, universe));
}

export function buildUniverse(records = [], configured = {}) {
  const universe = {};
  const dims = new Set(Object.keys(configured));
  for (const r of records) Object.keys(r).forEach(k => dims.add(k));

  for (const dim of dims) {
    const values = [...(configured[dim] ?? [])];
    for (const record of records) values.push(...valuesFor(record, dim));
    universe[dim] = uniq(values);
  }
  return universe;
}

export function selectAll(available = []) {
  return uniq(available);
}

export function clearSelection() {
  return [];
}

export function isEffectivelyAllSelected(selected = [], available = []) {
  const a = uniq(available);
  const allowed = new Set(a);
  const s = uniq(selected).filter(v => allowed.has(v));
  return a.length > 0 && sameSet(s, a);
}

export function serializeView({ name, page, projectScope, state, universe, isShared = false }) {
  return {
    name,
    page,
    project_scope: projectScope,
    is_shared: !!isShared,
    filters: normalizeFilterState(state, universe),
  };
}
