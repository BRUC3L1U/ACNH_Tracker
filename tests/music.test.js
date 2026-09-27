import assert from 'node:assert/strict';
import test from 'node:test';
import { MUSIC_DATA } from '../music-data.js';
import { DATA_MAP } from '../data.js';
import { CREATURE_TABS } from '../schema.js';
import { makeFilters, applyFilters, normalizeUIState, parseBackup, serializeBackup } from '../core.js';

test('music catalogue has 107 unique collectible records and correct acquisition boundaries', () => {
  assert.equal(MUSIC_DATA.length, 107);
  for (const key of ['id', 'name', 'englishName', 'image']) assert.equal(new Set(MUSIC_DATA.map(x => x[key])).size, 107);
  assert.equal(MUSIC_DATA.filter(x => x.buyPrice === 3200).length, 102);
  assert.deepEqual(MUSIC_DATA.filter(x => x.buyPrice === null).map(x => x.englishName).sort(), ['Animal City', "Drivin'", 'Farewell', 'K.K. Birthday', 'Welcome Horizons']);
  assert.equal(MUSIC_DATA.find(x => x.id === 'music_001').name, 'K.K.50年代摇滚');
  assert.equal(MUSIC_DATA.find(x => x.id === 'music_107').name, '只有我');
  assert.equal(MUSIC_DATA.find(x => x.name === 'K.K.嘻哈').englishName, 'K.K. Hop');
  for (const item of MUSIC_DATA) {
    assert.match(item.id, /^music_\d{3}$/);
    assert.equal(new URL(item.image).protocol, 'https:');
    assert.ok(item.note && item.sourceUrl);
    assert.ok(!('hours' in item) && !('northMonths' in item));
  }
});

test('music filters compose acquisition and collection without seasons', () => {
  const filters = makeFilters('music');
  assert.deepEqual(filters, { status: 'all', acquisition: [] });
  const run = overrides => applyFilters(MUSIC_DATA, { filters: {...filters,...overrides}, hemisphere:'south', collected:new Set(['music_002']), sort:{key:null,dir:'asc'} });
  assert.equal(run({acquisition:['隐藏点播']}).length, 3);
  assert.equal(run({acquisition:['Nook购物'],status:'uncollected'}).length, 101);
  assert.equal(run({acquisition:['生日赠送']}).length, 1);
  const state = normalizeUIState({activeTab:'music',filters:{music:{month:1,hour:3,version:['2.0新增'],acquisition:['隐藏点播','unknown']}, fish:{hour:7,hourManual:true}}}, DATA_MAP);
  assert.deepEqual(state.filters.music, {...filters,acquisition:['隐藏点播']});
  assert.equal(state.filters.fish.hour, 7);
  assert.ok(!CREATURE_TABS.includes('music'));
  assert.ok(!('music' in state.todayGroups));
});

test('old and mixed backups preserve records after music catalogue expansion', () => {
  const ids = new Set(Object.values(DATA_MAP).flat().map(x => x.id));
  for (const records of [new Set(['fish_001','art_001']),new Set(['fish_001','music_002','art_001','future_001']),ids]) {
    assert.deepEqual(parseBackup(serializeBackup(records),ids).collected, records);
  }
  assert.equal(ids.size,350);
});
