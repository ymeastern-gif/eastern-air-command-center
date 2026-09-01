import assert from 'node:assert/strict';
import {
  MISSING,
  normalizeSelection,
  normalizeFilterState,
  activeRestrictionCount,
  filterRecords,
  buildUniverse,
  selectAll,
  isEffectivelyAllSelected,
} from '../src/core/filter-engine.mjs';

const records = [
  { id: 1, title: 'Mine', owner: 'yosef', category: 'drawings', status: 'working', priority: 'high', source: ['asana'], floor: '3F' },
  { id: 2, title: 'Israel task', owner: 'israel', category: 'field', status: 'assigned', priority: 'medium', source: ['asana'], floor: '2F' },
  { id: 3, title: 'Unassigned task', owner: null, category: 'field', status: 'inbox', priority: 'low', source: ['gmail'], floor: null },
  { id: 4, title: 'No source', owner: null, category: null, status: 'needs_review', priority: 'high', source: [], floor: '4F' },
];

const universe = buildUniverse(records, {
  owner: ['yosef', 'israel', MISSING.owner],
  category: ['drawings', 'field', MISSING.category],
  status: ['working', 'assigned', 'inbox', 'needs_review'],
  priority: ['critical', 'high', 'medium', 'low'],
  source: ['asana', 'gmail', 'todoist', MISSING.source],
  floor: ['2F', '3F', '4F', MISSING.floor],
});

assert.deepEqual(normalizeSelection([], universe.owner), []);
assert.deepEqual(normalizeSelection(selectAll(universe.owner), universe.owner), []);
assert.equal(isEffectivelyAllSelected(selectAll(universe.owner), universe.owner), true);

const allPeopleState = { include: { owner: selectAll(universe.owner) } };
assert.equal(filterRecords(records, allPeopleState, universe).length, 4, 'all people includes unassigned');
assert.equal(activeRestrictionCount(allPeopleState, universe), 0, 'all people contributes zero badge restrictions');

const yosefState = { include: { owner: ['yosef'] } };
assert.deepEqual(filterRecords(records, yosefState, universe).map(r => r.id), [1]);
assert.equal(activeRestrictionCount(yosefState, universe), 1);

const unassignedState = { include: { owner: [MISSING.owner] } };
assert.deepEqual(filterRecords(records, unassignedState, universe).map(r => r.id), [3,4]);

const allCategories = { include: { category: selectAll(universe.category) } };
assert.equal(filterRecords(records, allCategories, universe).length, 4);

const noCategory = { include: { category: [MISSING.category] } };
assert.deepEqual(filterRecords(records, noCategory, universe).map(r => r.id), [4]);

const asanaOnly = { include: { source: ['asana'] } };
assert.deepEqual(filterRecords(records, asanaOnly, universe).map(r => r.id), [1,2]);

const noSource = { include: { source: [MISSING.source] } };
assert.deepEqual(filterRecords(records, noSource, universe).map(r => r.id), [4]);

const excludeIsrael = { exclude: { owner: ['israel'] } };
assert.deepEqual(filterRecords(records, excludeIsrael, universe).map(r => r.id), [1,3,4]);

const combined = { include: { category: ['field'], owner: ['israel', MISSING.owner] }, exclude: { status: ['inbox'] } };
assert.deepEqual(filterRecords(records, combined, universe).map(r => r.id), [2]);

const normalized = normalizeFilterState({ include: { owner: selectAll(universe.owner), category: ['field'] } }, universe);
assert.deepEqual(normalized.include.owner, []);
assert.deepEqual(normalized.include.category, ['field']);

console.log('filter-engine.test.mjs: all tests passed');
