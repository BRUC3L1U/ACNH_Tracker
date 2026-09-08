import { TAB_DEFINITIONS, TABS, CREATURE_TABS, monthsForHemisphere } from './schema.js';

export const BACKUP_VERSION = 1;
export const MAX_IMPORT_BYTES = 64 * 1024;

const STATUS_VALUES = new Set(['all', 'uncollected', 'collected']);

const LEGACY_BUG_LOCATIONS = Object.freeze({
  '地面下（听声音挖掘地面）': '地面',
  '地面（下雨或有腐烂的大头菜）': '地面',
  '居民身上': '其他',
  '岩石或灌木上（会逃走）': '岩石',
  '岩石（敲击）': '岩石',
  '户外灯光附近飞行': '其他',
  '摇晃或敲击树干落下蜂巢中出现': '树干',
  '树下拟态为叶片（家具物品形式）': '树干',
  '树干（摇晃或敲击垂下）': '树干',
  '树干（除椰子和香蕉树等）': '树干',
  '椰子树树干': '椰子树',
  '水边（飞行）': '水边',
  '池塘（水面滑行）': '水中',
  '沙滩（平时像是个贝壳）': '沙滩',
  '河流或池塘里': '水中',
  '淡水附近': '水边',
  '绿地（飞行） 异色花': '绿地',
  '绿地（飞行）': '绿地',
  '花丛附近（飞行）': '花朵',
  '花朵上（会逃走）': '花朵',
  '花朵上（会逃走）（白色花）': '花朵',
  '草地和普通地面（拿着捕虫网靠近会主动攻击）': '草地',
  '草地（地面爬行）': '草地',
  '草地（地面跳跃）': '草地',
  '随机出现（飞到附近会有嗡嗡）': '其他',
  '雪球附近出现': '其他',
  '飞行（腐烂的大头菜和垃圾等）': '其他'
});

export function makeFilters(tab, now = new Date()) {
  const definition = TAB_DEFINITIONS[tab];
  if (!definition) throw new Error('未知生物类别：' + tab);
  const filters = definition.seasonal
    ? { month: null, hour: now.getHours(), hourManual: false, status: 'all' }
    : { status: 'all' };
  for (const key of definition.filters) filters[key] = [];
  return filters;
}

export function getFilterOptions(dataMap, tab, key) {
  if (!TAB_DEFINITIONS[tab]?.filters.includes(key)) return [];
  return [...new Set(dataMap[tab].map(item => item[key]).filter(Boolean))];
}

function migrateFilterArray(tab, key, values, allowedValues) {
  if (!Array.isArray(values) || !values.every(value => typeof value === 'string')) return [];
  const allowed = new Set(allowedValues);
  const migrated = [];
  for (const rawValue of values) {
    const value = tab === 'bug' && key === 'location'
      ? LEGACY_BUG_LOCATIONS[rawValue] || rawValue
      : rawValue;
    if (allowed.has(value) && !migrated.includes(value)) migrated.push(value);
  }
  return migrated;
}

function normalizeScalarFilter(key, value, fallback) {
  if (key === 'status') return STATUS_VALUES.has(value) ? value : fallback;
  if (key === 'hourManual') return typeof value === 'boolean' ? value : fallback;
  if (key === 'month') {
    return value === null || (Number.isInteger(value) && value >= 1 && value <= 12) ? value : fallback;
  }
  if (key === 'hour') {
    return value === null || value === 'all' || (Number.isInteger(value) && value >= 0 && value < 24)
      ? value
      : fallback;
  }
  return fallback;
}

export function normalizeUIState(saved, dataMap, now = new Date()) {
  const source = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  const filters = {};
  for (const tab of TABS) {
    const target = makeFilters(tab, now);
    const candidate = source.filters?.[tab];
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
      for (const key of Object.keys(target)) {
        if (!(key in candidate)) continue;
        target[key] = Array.isArray(target[key])
          ? migrateFilterArray(tab, key, candidate[key], getFilterOptions(dataMap, tab, key))
          : normalizeScalarFilter(key, candidate[key], target[key]);
      }
    }
    if (TAB_DEFINITIONS[tab].seasonal && !target.hourManual) target.hour = now.getHours();
    filters[tab] = target;
  }

  const todayGroups = Object.fromEntries(CREATURE_TABS.map(tab => [tab, true]));
  if (source.todayGroups && typeof source.todayGroups === 'object' && !Array.isArray(source.todayGroups)) {
    for (const tab of CREATURE_TABS) {
      if (typeof source.todayGroups[tab] === 'boolean') todayGroups[tab] = source.todayGroups[tab];
    }
  }

  return {
    activeTab: TABS.includes(source.activeTab) ? source.activeTab : 'bug',
    filters,
    sort: source.sort && ['name', 'price', 'collected'].includes(source.sort.key)
      ? { key: source.sort.key, dir: source.sort.dir === 'desc' ? 'desc' : 'asc' }
      : { key: null, dir: 'asc' },
    todayOpen: Boolean(source.todayOpen),
    filterOpen: Boolean(source.filterOpen),
    todayUncollectedOnly: Boolean(source.todayUncollectedOnly),
    todayGroups
  };
}

export function createSafeStorage(storage) {
  return Object.freeze({
    getItem(key) {
      try {
        return { ok: true, value: storage.getItem(key) };
      } catch (error) {
        return { ok: false, value: null, error };
      }
    },
    setItem(key, value) {
      try {
        storage.setItem(key, value);
        return { ok: true };
      } catch (error) {
        return { ok: false, error };
      }
    }
  });
}

export function getCollectionAccess(loadFailed) {
  return Object.freeze({
    canEdit: !loadFailed,
    canExport: !loadFailed,
    canImport: true
  });
}

export function normalizeCollected(value, knownIds) {
  if (!Array.isArray(value)) return new Set();
  return new Set(value.filter(id => typeof id === 'string' && knownIds.has(id)));
}

export function serializeBackup(collected) {
  return JSON.stringify({ version: BACKUP_VERSION, collected: [...collected] }, null, 2);
}

export function validateImportFileSize(size) {
  if (!Number.isFinite(size) || size < 0) throw new Error('文件大小无效');
  if (size > MAX_IMPORT_BYTES) throw new Error('文件不能超过 64 KB');
}

export function parseBackup(text, knownIds) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('文件不是有效的 JSON');
  }

  const legacy = Array.isArray(parsed);
  if (!legacy && (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))) {
    throw new Error('文件格式不正确');
  }
  if (!legacy && parsed.version !== BACKUP_VERSION) {
    throw new Error('不支持的备份版本');
  }

  const values = legacy ? parsed : parsed.collected;
  if (!Array.isArray(values) || !values.every(id => typeof id === 'string')) {
    throw new Error('收集记录必须是字符串数组');
  }
  if (values.length > knownIds.size) throw new Error('收集记录数量超出上限');

  const incoming = new Set(values.filter(id => knownIds.has(id)));
  const dropped = new Set(values).size - incoming.size;
  if (values.length > 0 && incoming.size === 0) throw new Error('文件中没有可识别的收集记录');
  return { collected: incoming, dropped, legacy };
}

export function setCollectedForIds(current, ids, add) {
  const next = new Set(current);
  const changes = [];
  for (const id of ids) {
    const before = next.has(id);
    if (before === add) continue;
    add ? next.add(id) : next.delete(id);
    changes.push({ id, before, after: add });
  }
  return { next, changes };
}

export function undoCollectedChanges(current, changes) {
  const next = new Set(current);
  let restored = 0;
  for (const change of changes) {
    if (next.has(change.id) !== change.after) continue;
    change.before ? next.add(change.id) : next.delete(change.id);
    restored += 1;
  }
  return { next, restored };
}

export function applyFilters(data, query) {
  const { filters, hemisphere, collected, sort } = query;
  let items = [...data];
  for (const key of ['location', 'shadowSize', 'weather', 'artType', 'authenticity']) {
    if (filters[key]?.length) items = items.filter(item => filters[key].includes(item[key]));
  }
  if (filters.month != null) {
    items = items.filter(item => monthsForHemisphere(item, hemisphere).includes(filters.month));
  }
  if (filters.hour != null) {
    items = filters.hour === 'all'
      ? items.filter(item => item.hours.length === 24)
      : items.filter(item => item.hours.includes(filters.hour));
  }
  if (filters.status === 'collected') items = items.filter(item => collected.has(item.id));
  if (filters.status === 'uncollected') items = items.filter(item => !collected.has(item.id));

  const direction = sort.dir === 'desc' ? -1 : 1;
  if (sort.key) {
    items.sort((a, b) => {
      if (sort.key === 'name') return direction * a.name.localeCompare(b.name, 'zh');
      if (sort.key === 'price') return direction * (a.price - b.price);
      if (sort.key === 'collected') {
        return direction * (Number(collected.has(a.id)) - Number(collected.has(b.id)));
      }
      return 0;
    });
  }
  return items;
}

export function getTimeRangeLabel(hours) {
  if (!Array.isArray(hours) || hours.length === 0) return '未知';
  const normalized = [...new Set(hours)]
    .filter(hour => Number.isInteger(hour) && hour >= 0 && hour < 24)
    .sort((a, b) => a - b);
  if (normalized.length === 0) return '未知';
  if (normalized.length === 24) return '全天';
  const ranges = [];
  let start = normalized[0];
  let end = normalized[0];
  for (let index = 1; index < normalized.length; index += 1) {
    if (normalized[index] === end + 1) end = normalized[index];
    else {
      ranges.push({ start, end });
      start = normalized[index];
      end = normalized[index];
    }
  }
  ranges.push({ start, end });
  const last = ranges.at(-1);
  if (ranges.length > 1 && ranges[0].start === 0 && last.end === 23) {
    const head = ranges.shift();
    ranges.pop();
    ranges.unshift({ start: last.start, end: head.end });
  }
  const clock = hour => String(hour % 24).padStart(2, '0') + ':00';
  return ranges.map(range => {
    const end = range.end + 1;
    const nextDay = end >= 24 || end <= range.start;
    return clock(range.start) + '–' + (nextDay ? '次日' : '') + clock(end);
  }).join(' / ');
}
