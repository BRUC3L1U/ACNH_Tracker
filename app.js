import { DATA_MAP } from './data.js';
import { TAB_DEFINITIONS, TABS, CREATURE_TABS, monthsForHemisphere } from './schema.js';
import { escapeHtml, showToast } from './ui.js';
import { createCollectionController } from './collection.js';
import { createBackupActions } from './backup.js';
import { createListView } from './list-view.js';
import {
  applyFilters,
  createSafeStorage,
  getCollectionAccess,
  getFilterOptions,
  getTimeRangeLabel,
  makeFilters,
  normalizeUIState
} from './core.js';

const TAB_NAMES = Object.fromEntries(TABS.map(tab => [tab, TAB_DEFINITIONS[tab].label]));

const CONFIG = {
  STORAGE_KEYS: { collected: 'acnh_collected', hemisphere: 'acnh_hemisphere', ui: 'acnh_ui' },
  TICK_MS: 60000,
  MONTHS: 12,
  HOURS: 24,
  TABS,
  SORT_KEYS: [{key:'name',label:'名称'},{key:'price',label:'价格'},{key:'collected',label:'收集'}],
  STATUS_OPTS: [['all','全部'],['uncollected','未收集'],['collected','已收集']]
};

let storageAccessError = null;
let nativeStorage;
try {
  nativeStorage = window.localStorage;
} catch (error) {
  storageAccessError = error;
  nativeStorage = {
    getItem() { throw error; },
    setItem() { throw error; }
  };
}
const storage = createSafeStorage(nativeStorage);

function toggleArrayFilter(name, value){
  const arr = state.filters[state.activeTab][name];
  const idx = arr.indexOf(value);
  idx >= 0 ? arr.splice(idx,1) : arr.push(value);
}

// Shared by the today panel's per-render buttons and the filter bar's
// delegated listener. renderAll() covers every surface that shows hemisphere
// state; the applyFilters recount is just for the toast.
function handleHemisphereChange(hemi){
  if (state.hemisphere === hemi) return;
  const focusRoot = document.activeElement?.closest('#todayPanel')
    ? '#todayPanel'
    : document.activeElement?.closest('#filterBar') ? '#filterBar' : null;
  if (!saveHemisphere(hemi)) return;
  state.hemisphere = hemi;
  renderAll();
  if (focusRoot) document.querySelector(focusRoot+' [data-hemi="'+hemi+'"]')?.focus();
  const remaining = filteredItems(state.activeTab).length;
  const label = state.hemisphere === 'north' ? '北半球' : '南半球';
  showToast(remaining === 0
    ? '已切换到' + label + '，当前筛选条件下没有匹配的生物，可尝试重置筛选'
    : '已切换到' + label + '，当前筛选命中 ' + remaining + ' 条');
}

function hemisphereButtons(activeClass){
  return '<button type="button" class="'+activeClass+(state.hemisphere==='north'?' active':'')+'" data-hemi="north" aria-pressed="'+(state.hemisphere==='north')+'">北半球</button>'
       + '<button type="button" class="'+activeClass+(state.hemisphere==='south'?' active':'')+'" data-hemi="south" aria-pressed="'+(state.hemisphere==='south')+'">南半球</button>';
}

// The today panel re-renders on an hourly cadence, so its hemisphere buttons
// are (re)bound per render; filter-bar hemisphere clicks go through the
// delegated #filterBar listener instead. Both funnel into
// handleHemisphereChange.
function bindHemisphereButtons(root){
  root.querySelectorAll('[data-hemi]').forEach(btn=>{
    btn.addEventListener('click', ()=>handleHemisphereChange(btn.dataset.hemi));
  });
}

// A flat view over all collection datasets, tagged with its source tab. The tag
// lives in a wrapper rather than being assigned onto the creature itself:
// mutating the objects in DATA_MAP would make data.js's shape depend on
// app.js having run, which leaks into anything else reading that data.
const ALL_DATA = CONFIG.TABS.flatMap(type => DATA_MAP[type].map(item => ({ type, item })));

// Collected ids are only meaningful if they match a real creature: imports
// are validated against this set so junk ids can't squat in storage forever.
const KNOWN_IDS = new Set(ALL_DATA.map(x => x.item.id));

const collection = createCollectionController({
  storage,
  key: CONFIG.STORAGE_KEYS.collected,
  knownIds: KNOWN_IDS,
  locks: navigator.locks,
  readLegacy() {
    try {
      const cookie = document.cookie.split(';').find(c => c.trim().startsWith('acnh_collected='));
      return cookie ? JSON.parse(decodeURIComponent(cookie.split('=').slice(1).join('='))) : [];
    } catch { return []; }
  },
  clearLegacy() {
    document.cookie = 'acnh_collected=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax';
  },
  onChange() {
    renderCollectionViews();
    renderDataBar();
  },
  onError(message) { showToast(message, { duration: 6000 }); }
});
const backup = createBackupActions(collection, KNOWN_IDS);
window.addEventListener('storage', event => {
  if (event.storageArea === nativeStorage && (event.key === CONFIG.STORAGE_KEYS.collected || event.key === null)) {
    collection.refresh();
  }
});

function loadUIState() {
  const result = storage.getItem(CONFIG.STORAGE_KEYS.ui);
  if (!result.ok) storageAccessError ||= result.error;
  let saved = null;
  try { saved = result.value ? JSON.parse(result.value) : null; } catch {}
  return normalizeUIState(saved, DATA_MAP, getLocalTime());
}

function loadHemisphere() {
  const result = storage.getItem(CONFIG.STORAGE_KEYS.hemisphere);
  if (!result.ok) storageAccessError ||= result.error;
  return result.value === 'south' ? 'south' : 'north';
}

const state = {
  ...loadUIState(),
  hemisphere: loadHemisphere(),
  get collected() { return collection.collected; },
};

function saveUIState() {
  const result = storage.setItem(CONFIG.STORAGE_KEYS.ui, JSON.stringify({
    activeTab: state.activeTab,
    filters: state.filters,
    sort: state.sort,
    todayOpen: state.todayOpen,
    filterOpen: state.filterOpen,
    todayUncollectedOnly: state.todayUncollectedOnly,
    todayGroups: state.todayGroups
  }));
  if (!result.ok) showStorageWarning();
  return result.ok;
}

function showStorageWarning() {
  showToast('浏览器阻止了本地存储，当前更改无法可靠保存', { duration: 6000 });
}

function showCollectionLoadWarning() {
  showToast('未能加载已有收集记录，已暂停导出和修改；可导入有效备份恢复', { duration: 8000 });
}

function renderCollectionViews() {
  renderProgress();
  renderTodayPanel();
  renderList();
}

function saveHemisphere(next) {
  const result = storage.setItem(CONFIG.STORAGE_KEYS.hemisphere, next);
  if (!result.ok) showStorageWarning();
  return result.ok;
}

function getLocalTime() { return new Date(); }

function isAvailableNow(item) {
  const now = getLocalTime();
  const month = now.getMonth() + 1;
  const hour = now.getHours();
  const months = monthsForHemisphere(item, state.hemisphere);
  return months.includes(month) && item.hours.includes(hour);
}

function filteredItems(tab) {
  return applyFilters(DATA_MAP[tab], {
    filters: state.filters[tab],
    hemisphere: state.hemisphere,
    collected: state.collected,
    sort: tab === 'art' && state.sort.key === 'price' ? { key: null, dir: 'asc' } : state.sort
  });
}

function renderNavTabs() {
  document.getElementById('navTabs').innerHTML = CONFIG.TABS.map(t =>
    '<button type="button" class="nav-tab' + (state.activeTab===t?' active':'') + '" data-tab="'+t+'" aria-pressed="'+(state.activeTab===t)+'">' + '<span class="nav-index" aria-hidden="true">0'+(CONFIG.TABS.indexOf(t)+1)+'</span><span>'+TAB_NAMES[t]+'</span></button>'
  ).join('');
}

function renderProgress() {
  const data = DATA_MAP[state.activeTab];
  const total = data.length;
  const collected = data.filter(x => state.collected.has(x.id)).length;
  const pct = total > 0 ? (collected/total*100).toFixed(1) : 0;
  const allTotal = ALL_DATA.length;
  const allCollected = ALL_DATA.filter(x => state.collected.has(x.item.id)).length;
  const allPct = allTotal > 0 ? (allCollected/allTotal*100).toFixed(1) : 0;
  document.getElementById('collectionTitle').textContent = TAB_NAMES[state.activeTab] + '图鉴';
  document.getElementById('progressSection').innerHTML =
    '<div><div class="progress-text"><span class="progress-label">本类已收集</span><span class="progress-pct">'+collected+' / '+total+'<small>'+pct+'%</small></span></div>' +
    '<div class="progress-bar" role="progressbar" aria-label="'+TAB_NAMES[state.activeTab]+'收集进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'"><div class="progress-fill" style="width:'+pct+'%"></div></div></div>' +
    '<div class="progress-total"><div class="progress-text"><span class="progress-label">全部图鉴</span><span class="progress-pct">'+allCollected+' / '+allTotal+'<small>'+allPct+'%</small></span></div>' +
    '<div class="progress-bar" role="progressbar" aria-label="总收集进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+allPct+'"><div class="progress-fill" style="width:'+allPct+'%"></div></div></div>';
}

function renderTodayPanel() {
  const showArt = state.activeTab === 'art';
  document.getElementById('todayPanel').hidden = showArt;
  if (showArt) return;
  const now = getLocalTime();
  const hour = now.getHours();
  const monStr = now.getFullYear()+'年'+(now.getMonth()+1)+'月'+now.getDate()+'日';

  let nowAvailable = ALL_DATA.filter(x => TAB_DEFINITIONS[x.type].seasonal && isAvailableNow(x.item));
  if (state.todayUncollectedOnly) {
    nowAvailable = nowAvailable.filter(x => !state.collected.has(x.item.id));
  }
  const byType = Object.fromEntries(CREATURE_TABS.map(type => [
    type,
    nowAvailable.filter(entry => entry.type === type)
  ]));

  function todayRow(item, tags){
    const timeLabel = getTimeRangeLabel(item.hours);
    const note = item.note ? '<span class="note">'+escapeHtml(item.note)+'</span>' : '';
    return '<div class="today-item"><span style="font-weight:600;min-width:80px">'
      + escapeHtml(item.name) + '</span>' + tags + note
      + '<span style="font-size:12px;color:var(--color-text-muted)">' + timeLabel + '</span>'
      + '<span style="color:var(--color-accent-warm);font-weight:600;margin-left:auto">'
      + item.price + ' 铃钱</span></div>';
  }

  let html = '<button type="button" class="today-header'+(state.todayOpen?' open':'')+'" id="todayHeader" aria-expanded="'+state.todayOpen+'" aria-controls="todayBody"><span class="today-heading"><span class="arrow" aria-hidden="true">▶</span> 今日可捕捉 <span class="today-date">'+monStr+' · '+hour+'时</span></span><span class="today-count">'+nowAvailable.length+' 种生物可捕捉</span></button>';
  html += '<div class="today-body'+(state.todayOpen?' open':'')+'" id="todayBody"'+(state.todayOpen?'':' hidden')+'>';
  html += '<div class="today-info"><span>当前半球：</span>'+hemisphereButtons('hemi-btn')
    + '<label class="today-toggle"><input type="checkbox" id="todayUncollected"'+(state.todayUncollectedOnly?' checked':'')+'>只看未收集</label></div>';

  for (const t of CREATURE_TABS) {
    const items = byType[t];
    const open = state.todayGroups[t];
    html += '<h4><button type="button" class="today-group-header'+(open?' open':'')+'" data-group="'+t+'" aria-expanded="'+open+'" aria-controls="todayGroup-'+t+'"><span class="arrow" aria-hidden="true">▶</span> '+TAB_NAMES[t]+' （'+items.length+'）</button></h4>';
    html += '<div class="today-group-body'+(open?' open':'')+'" id="todayGroup-'+t+'"'+(open?'':' hidden')+'>';
    if (items.length === 0) {
      html += '<div class="today-item" style="color:var(--color-text-muted)">当前时间没有可捕捉的'+TAB_NAMES[t]+'</div>';
    } else {
      items.forEach(({ item }) => {
        let tags = '';
        if (t !== 'sea') tags += '<span class="tag tag-location">'+escapeHtml(item.location)+'</span>';
        if (item.shadowSize) tags += '<span class="tag tag-shadow">'+escapeHtml(item.shadowSize)+'</span>';
        if (item.weather && item.weather !== '无限制') {
          tags += '<span class="tag tag-weather">'+escapeHtml(item.weather)+'</span>';
        }
        html += todayRow(item, tags);
      });
    }
    html += '</div>';
  }
  html += '</div>';

  document.getElementById('todayPanel').innerHTML = html;

  document.getElementById('todayHeader').addEventListener('click', () => {
    state.todayOpen = !state.todayOpen;
    saveUIState();
    renderTodayPanel();
    document.getElementById('todayHeader').focus();
  });
  document.getElementById('todayUncollected').addEventListener('change', e => {
    state.todayUncollectedOnly = e.target.checked;
    saveUIState();
    renderTodayPanel();
    document.getElementById('todayUncollected').focus();
  });
  // Group headers toggle in place (no full re-render); state.todayGroups
  // keeps the choice in sync for the next scheduled panel refresh.
  document.querySelectorAll('#todayPanel .today-group-header').forEach(h => {
    h.addEventListener('click', () => {
      const g = h.dataset.group;
      state.todayGroups[g] = !state.todayGroups[g];
      h.classList.toggle('open', state.todayGroups[g]);
      h.setAttribute('aria-expanded', state.todayGroups[g]);
      const body = document.getElementById('todayGroup-' + g);
      body.classList.toggle('open', state.todayGroups[g]);
      body.hidden = !state.todayGroups[g];
      saveUIState();
    });
  });
  bindHemisphereButtons(document.getElementById('todayPanel'));
}

// No name-search box: deliberate, not an oversight. Search was decided
// against: the filter dimensions (location / shadow / weather / month /
// hour / status) are the intended way to find a creature, and they compose to
// answer the questions this page exists for ("what can I catch right now",
// "what's still missing"). If a future change feels like it needs a search
// box, that decision was made on purpose; don't add one without checking
// with the project owner first.
function filterSummary() {
  const f = state.filters[state.activeTab];
  const parts = [];
  if (TAB_DEFINITIONS[state.activeTab].seasonal) {
    parts.push(state.hemisphere === 'north' ? '北半球' : '南半球');
    if (f.month != null) parts.push(f.month + '月');
    parts.push(f.hour == null ? '任意时段' : f.hour === 'all' ? '全天出现' : f.hour + '时');
  }
  if (f.status !== 'all') parts.push(CONFIG.STATUS_OPTS.find(([value]) => value === f.status)[1]);
  const selected = TAB_DEFINITIONS[state.activeTab].filters.flatMap(key => f[key]);
  if (selected.length) parts.push(selected.length === 1 ? selected[0] : selected.length + '项条件');
  return parts.join(' · ') || '全部作品';
}

function renderFilters() {
  const tab = state.activeTab;
  const f = state.filters[tab];
  const definition = TAB_DEFINITIONS[tab];
  const locations = getFilterOptions(DATA_MAP, tab, 'location');
  const shadows = getFilterOptions(DATA_MAP, tab, 'shadowSize');
  const weathers = getFilterOptions(DATA_MAP, tab, 'weather');

  let html = '<button type="button" class="filter-toggle-btn" id="filterToggle" aria-expanded="'+state.filterOpen+'" aria-controls="filterPanel"><span>筛选条件<span class="filter-summary" id="filterSummary">'+escapeHtml(filterSummary())+'</span></span></button>';
  html += '<div class="filter-panel'+(state.filterOpen?' open':'')+'" id="filterPanel">';

  if (definition.seasonal) {
  html += '<div class="filter-row"><span class="filter-label">半球</span><div class="filter-options">';
  html += hemisphereButtons('filter-btn');
  html += '</div></div>';
  }

  html += '<div class="filter-row"><span class="filter-label">收集状态</span><div class="filter-options">';
  for (const [val,label] of CONFIG.STATUS_OPTS) {
    html += '<button type="button" class="filter-btn'+(f.status===val?' active':'')+'" data-filter="status" data-value="'+val+'" aria-pressed="'+(f.status===val)+'">'+label+'</button>';
  }
  html += '</div></div>';

  for (const [key, label] of [['artType', '艺术类型'], ['authenticity', '真伪情况']]) {
    if (!definition.filters.includes(key)) continue;
    html += '<div class="filter-row"><span class="filter-label">'+label+'</span><div class="filter-options">';
    for (const value of getFilterOptions(DATA_MAP, tab, key)) {
      html += '<button type="button" class="filter-btn'+(f[key].includes(value)?' active':'')+'" data-filter="'+key+'" data-value="'+value+'" aria-pressed="'+f[key].includes(value)+'">'+value+'</button>';
    }
    html += '</div></div>';
  }

  if (definition.filters.includes('location')) {
    html += '<div class="filter-row"><span class="filter-label">出现场所</span><div class="filter-options">';
    locations.forEach(loc => {
      html += '<button type="button" class="filter-btn'+(f.location.includes(loc)?' active':'')+'" data-filter="location" data-value="'+escapeHtml(loc)+'" aria-pressed="'+f.location.includes(loc)+'">'+escapeHtml(loc)+'</button>';
    });
    html += '</div></div>';
  }

  if (definition.filters.includes('shadowSize')) {
    html += '<div class="filter-row"><span class="filter-label">'+(tab==='sea'?'影子大小':'鱼影尺寸')+'</span><div class="filter-options">';
    shadows.forEach(s => {
      html += '<button type="button" class="filter-btn'+(f.shadowSize.includes(s)?' active':'')+'" data-filter="shadowSize" data-value="'+escapeHtml(s)+'" aria-pressed="'+f.shadowSize.includes(s)+'">'+escapeHtml(s)+'</button>';
    });
    html += '</div></div>';
  }

  if (definition.filters.includes('weather')) {
    html += '<div class="filter-row"><span class="filter-label">天气条件</span><div class="filter-options">';
    weathers.forEach(w => {
      html += '<button type="button" class="filter-btn'+(f.weather.includes(w)?' active':'')+'" data-filter="weather" data-value="'+escapeHtml(w)+'" aria-pressed="'+f.weather.includes(w)+'">'+escapeHtml(w)+'</button>';
    });
    html += '</div></div>';
  }

  if (definition.seasonal) {
    html += '<div class="filter-row"><span class="filter-label">出现月份</span><div class="filter-options" id="monthGrid">';
    const curMon = getLocalTime().getMonth() + 1;
    for (let m = 1; m <= CONFIG.MONTHS; m++) {
      html += '<button type="button" class="filter-btn month-grid'+(f.month===m?' active':'')+(m===curMon?' is-now':'')+'" data-filter="month" data-value="'+m+'" aria-pressed="'+(f.month===m)+'">'+m+'</button>';
    }
    html += '</div></div>';

    // The hour row has three non-numeric states, and they are not the same
    // thing: 不限 = no hour filtering at all; 全天出现 = only creatures whose
    // hours cover all 24; and the unmarked default = follow the clock. Hiding
    // "clear" behind a re-tap of the active hour chip (the old behaviour)
    // made none of that discoverable, so 不限 is now an explicit chip.
    html += '<div class="filter-row"><span class="filter-label">出现时间</span><div class="filter-options" id="hourGrid">';
    const curHr = getLocalTime().getHours();
    html += '<button type="button" class="filter-btn'+(f.hour===null?' active':'')+'" data-filter="hour" data-value="none" aria-pressed="'+(f.hour===null)+'">不限</button>';
    html += '<button type="button" class="filter-btn'+(f.hour==='all'?' active':'')+'" data-filter="hour" data-value="all" aria-pressed="'+(f.hour==='all')+'">全天出现</button>';
    for (let h = 0; h < CONFIG.HOURS; h++) {
      html += '<button type="button" class="filter-btn'+(f.hour===h?' active':'')+(h===curHr?' is-now':'')+'" data-filter="hour" data-value="'+h+'" aria-pressed="'+(f.hour===h)+'">'+h+'</button>';
    }
    html += '</div></div>';

  }

  html += '<div class="filter-row"><span style="flex:1"></span>';
  html += '<button type="button" class="filter-reset" id="filterReset">重置全部</button>';
  html += '</div></div>';

  document.getElementById('filterBar').innerHTML = html;
}

// Sync every filter chip's classes against the current state, in place.
// Filter taps and clock changes both land here: a tap only flips chip
// classes (no innerHTML rebuild, so focus and scroll survive), and a clock
// change additionally moves the is-now highlight on the month/hour grids.
function syncFilterChips() {
  document.getElementById('filterSummary').textContent = filterSummary();
  const f = state.filters[state.activeTab];
  const curMon = getLocalTime().getMonth() + 1;
  const curHr = getLocalTime().getHours();
  document.querySelectorAll('#filterBar [data-filter]').forEach(btn => {
    const filter = btn.dataset.filter;
    const value = btn.dataset.value;
    let active = false;
    if (filter === 'status') active = f.status === value;
    else if (Array.isArray(f[filter])) active = f[filter].includes(value);
    else if (filter === 'month') active = f.month === parseInt(value);
    else if (filter === 'hour') {
      active = f.hour === (value === 'all' ? 'all' : value === 'none' ? null : parseInt(value));
    }
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active);
    if (filter === 'month') {
      btn.classList.toggle('is-now', parseInt(value) === curMon);
    } else if (filter === 'hour') {
      btn.classList.toggle('is-now', value !== 'all' && value !== 'none' && parseInt(value) === curHr);
    }
  });
}

// One delegated listener for everything clickable in the filter bar: filter
// chips, hemisphere buttons, the mobile toggle and 重置全部; attached once
// at startup. #filterBar itself is persistent (only its innerHTML is
// re-rendered), so the listener survives re-renders without stacking
// duplicates.
document.getElementById('filterBar').addEventListener('click', e => {
  const hemiBtn = e.target.closest('[data-hemi]');
  if (hemiBtn) return handleHemisphereChange(hemiBtn.dataset.hemi);

  if (e.target.closest('#filterToggle')) {
    state.filterOpen = !state.filterOpen;
    saveUIState();
    const toggle = document.getElementById('filterToggle');
    const panel = document.getElementById('filterPanel');
    toggle.setAttribute('aria-expanded', state.filterOpen);
    panel.classList.toggle('open', state.filterOpen);
    return;
  }

  if (e.target.closest('#filterReset')) {
    // Resetting hands hour control back to the clock, and clears sort too:
    // the button says 重置全部, so leaving sort applied would be a lie.
    state.filters[state.activeTab] = makeFilters(state.activeTab, getLocalTime());
    state.sort = { key: null, dir: 'asc' };
    saveUIState();
    syncFilterChips();
    renderList();
    return;
  }

  const btn = e.target.closest('.filter-btn[data-filter]');
  if (!btn) return;
  const tab = state.activeTab;
  const filter = btn.dataset.filter;
  const value = btn.dataset.value;
  if (filter === 'status') {
    state.filters[tab].status = value;
  } else if (TAB_DEFINITIONS[tab].filters.includes(filter)) {
    toggleArrayFilter(filter, value);
  } else if (filter === 'month') {
    state.filters[tab].month = state.filters[tab].month === parseInt(value) ? null : parseInt(value);
  } else if (filter === 'hour') {
    // Any manual hour choice (including 不限 and 全天出现) marks the filter
    // as user-owned so the hourly tick won't clobber it. 不限 is "no hour
    // filter", which is itself a choice, not a request to follow the clock
    // again. Only 重置全部 hands control back to the clock.
    state.filters[tab].hourManual = true;
    if (value === 'none') {
      state.filters[tab].hour = null;
    } else if (value === 'all') {
      state.filters[tab].hour = state.filters[tab].hour === 'all' ? null : 'all';
    } else {
      state.filters[tab].hour = state.filters[tab].hour === parseInt(value) ? null : parseInt(value);
    }
  }
  saveUIState();
  syncFilterChips();
  renderList();
});

const listView = createListView({
  state, filteredItems, isLoadFailed: () => collection.loadFailed, sortKeys: CONFIG.SORT_KEYS
});
function renderList() { listView.render(); }

// Bulk actions record only ids whose state actually changed. Undo restores an
// id only while it still has the bulk result, so a later single-row edit wins.
async function bulkSetCollected(add) {
  if (listView.filtered.length === 0) return;
  const verb = add ? '标记' : '取消标记';
  const result = await collection.set(listView.filtered.map(x => x.id), add);
  if (!result.ok) return;
  if (result.changes.length === 0) {
    showToast(add ? '当前条目均已标记' : '当前条目均未标记');
    return;
  }
  showToast('已' + verb + ' ' + result.changes.length + ' 条', {
    duration: 6000,
    action: {
      label: '撤销',
      onClick: async () => {
        const undo = await collection.undo(result.changes);
        if (undo.ok) showToast(undo.restored > 0 ? '已撤销' : '没有可撤销的条目');
      }
    }
  });
}

// Delegated listener for the bulk buttons, sort headers and creature rows,
// attached once. #listSection is persistent; only its inner containers are
// re-rendered, so this survives re-renders without stacking duplicates.
document.getElementById('listSection').addEventListener('click', e => {
  if (e.target.closest('#markAllVisible')) return bulkSetCollected(true);
  if (e.target.closest('#unmarkAllVisible')) return bulkSetCollected(false);

  const sortEl = e.target.closest('.sort-btn');
  if (sortEl) {
    const key = sortEl.dataset.sort;
    if (state.sort.key === key) {
      state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      state.sort.key = key;
      state.sort.dir = 'asc';
    }
    saveUIState();
    renderList();
    return;
  }

});

document.getElementById('listSection').addEventListener('change', async e => {
  const input = e.target.closest('.creature-checkbox');
  if (!input) return;
  const add = input.checked;
  await collection.set([input.dataset.id], add);
});

function renderAll() {
  renderNavTabs();
  renderProgress();
  renderTodayPanel();
  renderFilters();
  renderList();
}

function renderDataBar() {
  const access = getCollectionAccess(collection.loadFailed);
  const focusedAction = document.activeElement?.closest('#dataBar button')?.id;
  const notice = access.canExport ? ''
    : '未能加载已有收集记录。为避免生成错误的空备份，导出和修改已暂停；可导入有效备份恢复。';
  document.getElementById('dataBar').innerHTML =
    (notice ? '<span class="storage-mode-note" id="storageModeNote" role="note">'+escapeHtml(notice)+'</span>' : '') +
    '<button type="button" class="data-btn" id="exportBtn"'+(access.canExport?'':' disabled aria-describedby="storageModeNote"')+'>导出收集记录</button>' +
    '<button type="button" class="data-btn" id="importBtn"'+(backup.importInProgress?' disabled':'')+'>导入收集记录</button>' +
    '<input type="file" id="importFile" accept="application/json" aria-label="选择收集记录 JSON 文件" hidden>';
  document.getElementById('exportBtn').addEventListener('click', backup.exportCollected);
  document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', backup.importCollected);
  if (focusedAction) document.getElementById(focusedAction)?.focus();
}

document.getElementById('navTabs').addEventListener('click', e => {
  const btn = e.target.closest('.nav-tab');
  if (!btn) return;
  state.activeTab = btn.dataset.tab;
  state.filterOpen = false;
  saveUIState();
  renderAll();
  document.querySelector('.nav-tab[data-tab="'+state.activeTab+'"]').focus();
});

// Everything clock-driven is hour-granular: the today panel filters by hour
// and its header shows no minutes, and the hour filter follows the clock. So
// a minute tick has nothing to update: re-rendering on it only destroyed and
// rebound DOM for an identical result. The stamp also carries the date, so a
// device that sleeps across a whole day (same hour, different day) still
// counts as a change when it wakes.
function clockStamp() {
  const now = getLocalTime();
  return now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate() + 'T' + now.getHours();
}
// Seed from the current clock so the first interval fire is a no-op.
let lastTickStamp = clockStamp();

function onClockChange() {
  const hour = getLocalTime().getHours();
  renderTodayPanel();
  // Follow the clock with the hour filter, but only until the user picks an
  // hour themselves (hourManual; 不限 counts as a pick too). 重置全部 is what
  // hands control back to the clock. Every tab follows, otherwise switching
  // tabs surfaces a stale hour from whenever that tab was last active.
  for (const tab of CREATURE_TABS) {
    if (!state.filters[tab].hourManual) state.filters[tab].hour = hour;
  }
  saveUIState();
  syncFilterChips();
  renderList();
}

setInterval(() => {
  const stamp = clockStamp();
  if (stamp === lastTickStamp) return;
  lastTickStamp = stamp;
  onClockChange();
}, CONFIG.TICK_MS);

// Background tabs get their timers throttled, so the minute tick may fire
// late, or not at all until the tab is visible again. Re-check on visibility
// so the page is correct the moment the user looks at it, not up to a minute
// later.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  collection.refresh();
  const stamp = clockStamp();
  if (stamp === lastTickStamp) return;
  lastTickStamp = stamp;
  onClockChange();
});

renderDataBar();
renderAll();
if (collection.loadFailed) showCollectionLoadWarning();
else if (storageAccessError) showStorageWarning();
