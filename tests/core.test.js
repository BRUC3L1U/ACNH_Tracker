import assert from 'node:assert/strict';
import test from 'node:test';

import { DATA_MAP } from '../data.js';
import { monthsForHemisphere, shiftMonths } from '../schema.js';
import { escapeHtml } from '../ui.js';
import {
  applyFilters,
  createSafeStorage,
  getCollectionAccess,
  getStorageModeNotice,
  getTimeRangeLabel,
  normalizeUIState,
  parseBackup,
  serializeBackup,
  setCollectedForIds,
  undoCollectedChanges,
  validateImportFileSize
} from '../core.js';

const all = Object.values(DATA_MAP).flat();
const knownIds = new Set(all.map(item => item.id));

test('HTML escaping protects generated labels and attributes', () => {
  assert.equal(escapeHtml('<b title="x">&</b>'), '&lt;b title=&quot;x&quot;&gt;&amp;&lt;/b&gt;');
});

test('data schema and hemisphere derivation stay consistent', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(DATA_MAP).map(([key, value]) => [key, value.length])), {
    fish: 80,
    bug: 80,
    sea: 40
  });
  assert.equal(knownIds.size, 200);
  for (const item of all) {
    assert.match(item.id, /^(fish|bug|sea)_\d{3}$/);
    assert.ok(item.name);
    assert.ok(Number.isInteger(item.price) && item.price >= 0);
    assert.deepEqual(item.southMonths, shiftMonths(item.northMonths));
    assert.deepEqual(monthsForHemisphere(item, 'south'), item.southMonths);
    for (const month of item.northMonths) assert.ok(month >= 1 && month <= 12);
    for (const hour of item.hours) assert.ok(hour >= 0 && hour <= 23);
    assert.deepEqual([...new Set(item.hours)], item.hours);
    assert.deepEqual([...item.hours].sort((a, b) => a - b), item.hours);
  }
});

test('legacy location filters migrate and unknown values are removed', () => {
  const saved = {
    activeTab: 'bug',
    filters: {
      bug: {
        location: ['绿地（飞行）', '完全未知地点'],
        weather: ['雨天', '不存在天气'],
        hour: 7,
        hourManual: true,
        month: 9,
        status: 'uncollected'
      }
    }
  };
  const state = normalizeUIState(saved, DATA_MAP, new Date(2026, 8, 2, 11));
  assert.deepEqual(state.filters.bug.location, ['绿地']);
  assert.deepEqual(state.filters.bug.weather, ['雨天']);
  assert.equal(state.filters.bug.hour, 7);
  assert.equal(state.filters.bug.hourManual, true);
});

test('safe storage reports read and write failures without throwing', () => {
  const error = new DOMException('blocked', 'SecurityError');
  const storage = createSafeStorage({
    getItem() { throw error; },
    setItem() { throw error; }
  });
  assert.equal(storage.getItem('x').ok, false);
  assert.equal(storage.setItem('x', 'y').ok, false);
});

test('collection access blocks edits and empty exports after a load failure', () => {
  assert.deepEqual(getCollectionAccess(false), { canEdit: true, canExport: true, canImport: true });
  assert.deepEqual(getCollectionAccess(true), { canEdit: false, canExport: false, canImport: true });
});

test('backup round-trips an empty collection', () => {
  const text = serializeBackup(new Set());
  const parsed = parseBackup(text, knownIds);
  assert.equal(parsed.collected.size, 0);
  assert.equal(parsed.dropped, 0);
});

test('backup accepts the legacy array and rejects unknown versions and oversized lists', () => {
  assert.deepEqual([...parseBackup('["fish_001"]', knownIds).collected], ['fish_001']);
  assert.throws(() => parseBackup('{"version":2,"collected":[]}', knownIds), /不支持的备份版本/);
  assert.throws(() => parseBackup(JSON.stringify({ version: 1, collected: Array(201).fill('fish_001') }), knownIds), /数量超出上限/);
  assert.throws(() => parseBackup('{"version":1,"collected":["unknown"]}', knownIds), /没有可识别/);
});

test('import file size is bounded before reading', () => {
  assert.doesNotThrow(() => validateImportFileSize(64 * 1024));
  assert.throws(() => validateImportFileSize(64 * 1024 + 1), /64 KB/);
});

test('bulk undo preserves later edits and excludes no-op ids', () => {
  const current = new Set(['already']);
  const bulk = setCollectedForIds(current, ['already', 'new', 'edited-later'], true);
  assert.deepEqual(bulk.changes, [
    { id: 'new', before: false, after: true },
    { id: 'edited-later', before: false, after: true }
  ]);

  const afterLaterEdit = new Set(bulk.next);
  afterLaterEdit.delete('already');
  afterLaterEdit.delete('edited-later');
  const undo = undoCollectedChanges(afterLaterEdit, bulk.changes);
  assert.deepEqual([...undo.next], []);
  assert.equal(undo.restored, 1);
});

test('filters use explicit query state and do not mutate source data', () => {
  const source = DATA_MAP.fish;
  const result = applyFilters(source, {
    filters: { location: ['河流'], shadowSize: [], month: 1, hour: null, hourManual: true, status: 'uncollected' },
    hemisphere: 'north',
    collected: new Set(['fish_001']),
    sort: { key: 'price', dir: 'desc' }
  });
  assert.ok(result.length > 0);
  assert.ok(result.every(item => item.location === '河流' && item.northMonths.includes(1) && item.id !== 'fish_001'));
  assert.notEqual(result, source);
  assert.ok(result.every((item, index) => index === 0 || result[index - 1].price >= item.price));
});

test('time ranges handle midnight wrapping and empty data', () => {
  assert.equal(getTimeRangeLabel([0, 1, 2, 21, 22, 23]), '21:00–次日03:00');
  assert.equal(getTimeRangeLabel([21, 22, 23, 0, 1, 2]), '21:00–次日03:00');
  assert.equal(getTimeRangeLabel([]), '未知');
});

test('file mode explains that browser storage is origin-specific', () => {
  assert.match(getStorageModeNotice('file:'), /HTTP.*不同.*存储/);
  assert.equal(getStorageModeNotice('http:'), '');
});

test('time labels use exclusive end boundaries for full hours', () => {
  assert.equal(getTimeRangeLabel([9,10,11,12,13,14,15,16]), '09:00–17:00');
  assert.equal(getTimeRangeLabel([23]), '23:00–次日00:00');
  assert.equal(getTimeRangeLabel([0]), '00:00–01:00');
  assert.equal(getTimeRangeLabel([22,23,0,1]), '22:00–次日02:00');
  assert.equal(getTimeRangeLabel([9,10,16]), '09:00–11:00 / 16:00–17:00');
  assert.equal(getTimeRangeLabel(Array.from({length:24}, (_,i)=>i)), '全天');
});
