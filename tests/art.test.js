import assert from 'node:assert/strict';
import test from 'node:test';
import { ART_DATA } from '../art-data.js';
import { DATA_MAP } from '../data.js';
import { CREATURE_TABS } from '../schema.js';
import { applyFilters, makeFilters, normalizeUIState, parseBackup, serializeBackup } from '../core.js';

const knownIds = new Set(Object.values(DATA_MAP).flat().map(item => item.id));
const query = filters => ({ filters, hemisphere: 'south', collected: new Set(['art_001']), sort: { key: 'name', dir: 'asc' } });

test('art catalogue has 43 stable identities and complete genuine/fake information', () => {
  assert.equal(ART_DATA.length, 43);
  assert.equal(ART_DATA.filter(item => item.artType === '名画').length, 30);
  assert.equal(ART_DATA.filter(item => item.artType === '雕塑').length, 13);
  assert.equal(ART_DATA.filter(item => item.authenticity === '仅真品').length, 16);
  assert.equal(new Set(ART_DATA.map(item => item.name)).size, 43);
  assert.equal(new Set(ART_DATA.map(item => item.id)).size, 43);
  assert.equal(ART_DATA.find(item => item.id === 'art_001').name, '学术性的名画');
  assert.equal(ART_DATA.find(item => item.id === 'art_043').name, '名贵的名画');
  for (const item of ART_DATA) {
    assert.match(item.id, /^art_\d{3}$/);
    assert.ok(item.realName && item.genuineNote);
    assert.ok(!('hours' in item) && !('northMonths' in item));
    assert.equal(item.comparisons[0].label, '真品');
    assert.equal(item.authenticity === '有赝品', Boolean(item.fakeNote));
    assert.equal(item.authenticity === '有赝品', item.comparisons.length > 1);
    assert.equal(new URL(item.sourceUrl).hostname, 'wiki.biligame.com');
    for (const url of [item.image, ...item.comparisons.map(image => image.url)]) {
      assert.equal(new URL(url).protocol, 'https:');
      assert.equal(new URL(url).hostname, 'patchwiki.biligame.com');
    }
  }
});

test('art filters exclude seasons and compose type, authenticity and collection status', () => {
  const filters = makeFilters('art', new Date(2026, 0, 1, 0));
  assert.deepEqual(filters, { status: 'all', artType: [], authenticity: [] });
  assert.equal(applyFilters(ART_DATA, query(filters)).length, 43);
  const result = applyFilters(ART_DATA, query({ ...filters, artType: ['雕塑'], authenticity: ['仅真品'] }));
  assert.equal(result.length, 2);
  assert.deepEqual(new Set(result.map(item => item.name)), new Set(['伟大的雕塑', '似曾相识的雕塑']));
  assert.equal(applyFilters(ART_DATA, query({ ...filters, status: 'collected' })).length, 1);
  assert.equal(applyFilters(ART_DATA, query({ ...filters, status: 'uncollected' })).length, 42);
});

test('old UI state gains art filters without changing creature choices or today groups', () => {
  const old = { activeTab: 'fish', filters: { fish: { month: 9, hour: 7, hourManual: true } } };
  const state = normalizeUIState(old, DATA_MAP, new Date(2026, 0, 1));
  assert.equal(state.activeTab, 'fish');
  assert.equal(state.filters.fish.hour, 7);
  assert.equal(state.filters.fish.month, 9);
  assert.deepEqual(state.filters.art, makeFilters('art'));
  assert.deepEqual(Object.keys(state.todayGroups), [...CREATURE_TABS]);
  assert.ok(!CREATURE_TABS.includes('art'));
  const restored = normalizeUIState({ activeTab: 'art', filters: { art: {
    month: 1, hour: 12, artType: ['雕塑', 'unknown'], authenticity: ['仅真品']
  } } }, DATA_MAP);
  assert.equal(restored.activeTab, 'art');
  assert.deepEqual(restored.filters.art, { status: 'all', artType: ['雕塑'], authenticity: ['仅真品'] });
});

test('legacy and mixed collection backups survive expansion to 243 records', () => {
  assert.deepEqual([...parseBackup('["fish_001","bug_001","sea_001"]', knownIds).collected], ['fish_001','bug_001','sea_001']);
  const mixed = new Set(['fish_001','art_001','art_043']);
  assert.deepEqual(parseBackup(serializeBackup(mixed), knownIds).collected, mixed);
  const full = parseBackup(serializeBackup(knownIds), knownIds);
  assert.equal(full.collected.size, 243);
  assert.equal(full.dropped, 0);
});
