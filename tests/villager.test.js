import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { VILLAGER_DATA } from '../villager-data.js';
import { DATA_MAP } from '../data.js';
import { COLLECTIBLE_TABS, CREATURE_TABS, TAB_DEFINITIONS } from '../schema.js';
import { applyFilters, getFilterOptions, makeFilters, normalizeUIState, parseBackup, serializeBackup } from '../core.js';

const raw = JSON.parse(await readFile(new URL('./fixtures/villagers.json', import.meta.url)));
const species = Object.fromEntries(['Alligator:鳄鱼','Anteater:食蚁兽','Bear:大熊','Bear cub:小熊','Bird:鸟','Bull:牛','Cat:猫','Chicken:鸡','Cow:奶牛','Deer:鹿','Dog:狗','Duck:鸭','Eagle:老鹰','Elephant:象','Frog:青蛙','Goat:山羊','Gorilla:猩猩','Hamster:仓鼠','Hippo:河马','Horse:马','Kangaroo:袋鼠','Koala:考拉','Lion:狮子','Monkey:猴子','Mouse:老鼠','Octopus:章鱼','Ostrich:鸵鸟','Penguin:企鹅','Pig:猪','Rabbit:兔子','Rhinoceros:犀牛','Sheep:绵羊','Squirrel:松鼠','Tiger:老虎','Wolf:狼'].map(x => x.split(':')));
const personalities = {Jock:'运动',Cranky:'暴躁',Lazy:'悠闲',Smug:'自恋',Normal:'普通',Peppy:'元气',Snooty:'成熟','Big Sister':'大姐姐'};
const hobbies = {Fitness:'健身',Play:'游戏',Nature:'自然',Education:'教育',Fashion:'时尚',Music:'音乐'};
const knownIds = new Set(COLLECTIBLE_TABS.flatMap(tab => DATA_MAP[tab]).map(x => x.id));
const fields = ['id','name','englishName','gender','personality','species','birthdayMonth','birthdayDay','hobby','collaboration','image','sourceUrl','catchphrase'].sort();

test('all 417 villagers match independent source rows, with stable IDs and no version fields', () => {
  assert.equal(VILLAGER_DATA.length, 417);
  assert.equal(raw.length, 417);
  for (const key of ['id','name','englishName','image']) assert.equal(new Set(VILLAGER_DATA.map(x => x[key])).size, 417);
  const actual = new Map(VILLAGER_DATA.map(x => [x.id, x]));
  for (const source of raw) {
    const item = actual.get('villager_'+source.Filename);
    assert.ok(item, source.Name);
    const [month,day] = source.Birthday.split('/').map(Number);
    assert.deepEqual({name:item.name,englishName:item.englishName,species:item.species,gender:item.gender,personality:item.personality,hobby:item.hobby,birthdayMonth:item.birthdayMonth,birthdayDay:item.birthdayDay,catchphrase:item.catchphrase}, {
      name:source.CNzh,englishName:source.Name,species:species[source.Species],gender:source.Gender === 'Male' ? '♂' : '♀',personality:personalities[source.Personality]+source.Subtype+'型',hobby:hobbies[source.Hobby],birthdayMonth:month+'月',birthdayDay:day,catchphrase:source['Catchphrase CNzh']
    }, source.Name);
    assert.deepEqual(Object.keys(item).sort(), fields);
    assert.ok(Object.isFrozen(item));
    assert.equal(new URL(item.image).protocol, 'https:');
    assert.equal(new URL(item.sourceUrl).protocol, 'https:');
    assert.doesNotMatch(item.name, /2\.0|新增|回归/);
    assert.ok(day <= new Date(2024,month,0).getDate() && day >= 1);
  }
  assert.equal(new Set(VILLAGER_DATA.map(x => x.species)).size,35);
  assert.equal(VILLAGER_DATA.filter(x => x.collaboration === '三丽鸥联动').length,6);
  assert.equal(VILLAGER_DATA.filter(x => x.collaboration === '塞尔达传说联动').length,2);
  assert.equal(VILLAGER_DATA.filter(x => x.collaboration === '斯普拉遁联动').length,2);
  assert.ok(!VILLAGER_DATA.some(x => ['西施惠','K.K.','String'].includes(x.name)));
});

test('villager filters compose all dimensions without collection or seasonal state', () => {
  const defaults = makeFilters('villager');
  assert.deepEqual(defaults, {species:[],gender:[],personality:[],birthdayMonth:[],hobby:[],collaboration:[]});
  const run = overrides => applyFilters(VILLAGER_DATA,{filters:{...defaults,...overrides},hemisphere:'south',collected:new Set(['villager_cat23']),sort:{key:null,dir:'asc'}});
  for (const key of TAB_DEFINITIONS.villager.filters) {
    for (const option of getFilterOptions(DATA_MAP,'villager',key)) {
      assert.deepEqual(run({[key]:[option]}).map(x => x.id), VILLAGER_DATA.filter(x => x[key] === option).map(x => x.id));
    }
  }
  assert.deepEqual(getFilterOptions(DATA_MAP,'villager','birthdayMonth'),Array.from({length:12},(_,i) => (i+1)+'月'));
  assert.equal(run({species:['猫'],gender:['♂'],personality:['自恋B型'],birthdayMonth:['10月'],hobby:['自然']})[0].name,'杰克');
  assert.ok(!COLLECTIBLE_TABS.includes('villager'));
  assert.equal(TAB_DEFINITIONS.villager.collectible,false);
  const state = normalizeUIState({activeTab:'villager',filters:{villager:{month:1,hour:7,status:'collected',version:['ignored'],species:['猫','unknown'],birthdayMonth:['10月','13月']},fish:{hour:7,hourManual:true}}},DATA_MAP);
  assert.deepEqual(state.filters.villager,{...defaults,species:['猫'],birthdayMonth:['10月']});
  assert.equal(state.filters.fish.hour,7);
  assert.ok(!CREATURE_TABS.includes('villager') && !('villager' in state.todayGroups));
});

test('browse-only villagers do not expand collection IDs or change existing backups', () => {
  assert.equal(knownIds.size,350);
  for (const records of [new Set(['fish_001','art_001','music_107']),new Set(['villager_cat23','villager_brd20','fish_001','future_001']),knownIds]) {
    assert.deepEqual(parseBackup(serializeBackup(records),knownIds).collected,records);
  }
  assert.equal(parseBackup(serializeBackup(new Set(['villager_cat23','future_001'])),knownIds).unknown,2);
});
