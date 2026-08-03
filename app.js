const TAB_NAMES = { bug: '虫', fish: '鱼', sea: '海洋生物' };

const CONFIG = {
  STORAGE_KEYS: { collected: 'acnh_collected', hemisphere: 'acnh_hemisphere', ui: 'acnh_ui' },
  TICK_MS: 60000,
  MONTHS: 12,
  HOURS: 24,
  TABS: Object.keys(TAB_NAMES),
  SORT_KEYS: [{key:'name',label:'名称'},{key:'price',label:'价格'},{key:'collected',label:'收集'}],
  STATUS_OPTS: [['all','全部'],['uncollected','未收集'],['collected','已收集']]
};

function escapeHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let toastTimer = null;
function showToast(msg){
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  // Force reflow so re-triggering while visible restarts the transition.
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

function toggleArrayFilter(name, value){
  const arr = state.filters[state.activeTab][name];
  const idx = arr.indexOf(value);
  idx >= 0 ? arr.splice(idx,1) : arr.push(value);
}

function hemisphereButtons(activeClass){
  return '<button class="'+activeClass+(state.hemisphere==='north'?' active':'')+'" data-hemi="north">北半球</button>'
       + '<button class="'+activeClass+(state.hemisphere==='south'?' active':'')+'" data-hemi="south">南半球</button>';
}

function bindHemisphereButtons(root){
  root.querySelectorAll('[data-hemi]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if (state.hemisphere === btn.dataset.hemi) return;
      state.hemisphere = btn.dataset.hemi;
      saveHemisphere();
      renderAll();
      const remaining = applyFilters(DATA_MAP[state.activeTab], state.activeTab).length;
      const label = state.hemisphere === 'north' ? '北半球' : '南半球';
      showToast(remaining === 0
        ? '已切换到' + label + '，当前筛选条件下没有匹配的生物，可尝试重置筛选'
        : '已切换到' + label + '，当前筛选命中 ' + remaining + ' 条');
    });
  });
}

// Lightweight tagged views: keep a reference to the original object plus its
// type, instead of spreading every creature into a fresh 200-object copy.
const ALL_DATA = [
  ...DATA_MAP.fish.map(x => Object.assign(x, {type:'fish'})),
  ...DATA_MAP.bug.map(x => Object.assign(x, {type:'bug'})),
  ...DATA_MAP.sea.map(x => Object.assign(x, {type:'sea'}))
];

// Each tab only carries the array filters its data actually has, so
// applyFilters' tab guards and the key set stay in agreement.
function makeFilters(tab){
  const f = { month:null, hour:null, hourManual:false, status:'all' };
  if (tab === 'fish' || tab === 'bug') f.location = [];
  if (tab === 'fish' || tab === 'sea') f.shadowSize = [];
  if (tab === 'bug') f.weather = [];
  return f;
}

// UI state (active tab, filters, sort, panel collapses) survives reloads.
// hourManual is deliberately NOT persisted: a fresh page should resume
// following the clock, and only a live hour click hands control to the user.
// localStorage is untrusted input — a value of the wrong type here silently
// breaks applyFilters (a string `location` makes every row fail the filter and
// the list goes empty with no explanation), so each key is type-checked and a
// bad value falls back to the default rather than being adopted.
function isValidFilterValue(key, v, isArray) {
  if (isArray) return Array.isArray(v) && v.every(x => typeof x === 'string');
  if (key === 'status') return CONFIG.STATUS_OPTS.some(([val]) => val === v);
  if (key === 'month') return v === null || (Number.isInteger(v) && v >= 1 && v <= CONFIG.MONTHS);
  if (key === 'hour') return v === null || v === 'all' || (Number.isInteger(v) && v >= 0 && v < CONFIG.HOURS);
  return false;
}

function loadUIState() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.ui)); } catch {}
  if (!saved || typeof saved !== 'object') saved = {};
  const filters = { fish: makeFilters('fish'), bug: makeFilters('bug'), sea: makeFilters('sea') };
  for (const tab of CONFIG.TABS) {
    const s = saved.filters && saved.filters[tab];
    if (!s || typeof s !== 'object') continue;
    const target = filters[tab];
    for (const key of Object.keys(target)) {
      if (key === 'hourManual' || !(key in s)) continue;
      if (isValidFilterValue(key, s[key], Array.isArray(target[key]))) target[key] = s[key];
    }
  }
  return {
    activeTab: CONFIG.TABS.includes(saved.activeTab) ? saved.activeTab : 'bug',
    filters,
    sort: saved.sort && CONFIG.SORT_KEYS.some(k => k.key === saved.sort.key)
      ? { key: saved.sort.key, dir: saved.sort.dir === 'desc' ? 'desc' : 'asc' }
      : { key: null, dir: 'asc' },
    todayOpen: !!saved.todayOpen,
    filterOpen: !!saved.filterOpen,
    todayUncollectedOnly: !!saved.todayUncollectedOnly,
    todayGroups: { fish: true, bug: true, sea: true, ...(saved.todayGroups || {}) }
  };
}

const state = {
  ...loadUIState(),
  hemisphere: localStorage.getItem(CONFIG.STORAGE_KEYS.hemisphere) === 'south' ? 'south' : 'north',
  collected: loadCollected(),
};

function saveUIState() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEYS.ui, JSON.stringify({
      activeTab: state.activeTab,
      filters: state.filters,
      sort: state.sort,
      todayOpen: state.todayOpen,
      filterOpen: state.filterOpen,
      todayUncollectedOnly: state.todayUncollectedOnly,
      todayGroups: state.todayGroups
    }));
  } catch {}
}

function loadCollected() {
  try {
    const s = localStorage.getItem(CONFIG.STORAGE_KEYS.collected);
    if (s) return new Set(JSON.parse(s));
  } catch {}
  // Migrate from the legacy cookie (one-time), then clear it.
  const m = document.cookie.split(';').find(c => c.trim().startsWith('acnh_collected='));
  if (m) {
    try {
      const arr = JSON.parse(decodeURIComponent(m.split('=').slice(1).join('=')));
      const set = new Set(arr);
      try { localStorage.setItem(CONFIG.STORAGE_KEYS.collected, JSON.stringify(arr)); } catch {}
      document.cookie = 'acnh_collected=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax';
      return set;
    } catch {}
  }
  return new Set();
}

function saveCollected() {
  try { localStorage.setItem(CONFIG.STORAGE_KEYS.collected, JSON.stringify([...state.collected])); } catch {}
}

function exportCollected() {
  const data = { version: 1, collected: [...state.collected] };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'acnh-collected.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importCollected(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const arr = Array.isArray(parsed) ? parsed : parsed.collected;
      if (!Array.isArray(arr)) throw new Error('文件格式不正确');
      const incoming = new Set(arr);
      if (state.collected.size > 0) {
        if (!confirm('导入将覆盖当前的 ' + state.collected.size + ' 条记录，是否继续？')) {
          e.target.value = '';
          return;
        }
      }
      state.collected = incoming;
      saveCollected();
      renderAll();
      showToast('导入成功，共 ' + state.collected.size + ' 条记录');
    } catch (err) {
      showToast('导入失败：' + err.message);
    }
    e.target.value = '';
  };
  reader.onerror = () => {
    showToast('导入失败：无法读取文件');
    e.target.value = '';
  };
  reader.readAsText(file);
}

function saveHemisphere() {
  try { localStorage.setItem(CONFIG.STORAGE_KEYS.hemisphere, state.hemisphere); } catch {}
}

function getLocalTime() { return new Date(); }

function isAvailableNow(item) {
  const now = getLocalTime();
  const month = now.getMonth() + 1;
  const hour = now.getHours();
  const months = state.hemisphere === 'north' ? item.northMonths : item.southMonths;
  return months.includes(month) && item.hours.includes(hour);
}

function isLeavingNextMonth(item) {
  const now = getLocalTime();
  const month = now.getMonth() + 1;
  const nextMonth = month === CONFIG.MONTHS ? 1 : month + 1;
  const months = state.hemisphere === 'north' ? item.northMonths : item.southMonths;
  return months.includes(month) && !months.includes(nextMonth);
}

// Hours arrive sorted 0..23, so a window spanning midnight shows up as two
// separate runs (e.g. [0..4, 21..23]). Splitting them into "0-4时 / 21-23时"
// misreads as two windows, so the head and tail runs are merged back into the
// single wrapping range they represent: "21-4时".
function getTimeRangeLabel(hours) {
  if (hours.length === CONFIG.HOURS) return '全天';
  const ranges = [];
  let s = hours[0], e = hours[0];
  for (let i = 1; i < hours.length; i++) {
    if (hours[i] === e + 1) { e = hours[i]; }
    else { ranges.push({s, e}); s = hours[i]; e = hours[i]; }
  }
  ranges.push({s, e});

  const last = ranges[ranges.length - 1];
  if (ranges.length > 1 && ranges[0].s === 0 && last.e === CONFIG.HOURS - 1) {
    const head = ranges.shift();
    ranges.pop();
    ranges.unshift({s: last.s, e: head.e});
  }

  return ranges.map(r => r.s === r.e ? r.s + '时' : r.s + '-' + r.e + '时').join(' / ');
}

function applyFilters(data, tab) {
  let items = [...data];
  const f = state.filters[tab];

  if (tab === 'fish' || tab === 'bug') {
    if (f.location.length > 0) items = items.filter(x => f.location.includes(x.location));
  }
  if (tab === 'fish' || tab === 'sea') {
    if (f.shadowSize.length > 0) items = items.filter(x => f.shadowSize.includes(x.shadowSize));
  }
  if (tab === 'bug') {
    if (f.weather && f.weather.length > 0) items = items.filter(x => f.weather.includes(x.weather));
  }
  if (f.month !== null) {
    const m = f.month;
    items = items.filter(x => {
      const months = state.hemisphere === 'north' ? x.northMonths : x.southMonths;
      return months.includes(m);
    });
  }
  if (f.hour !== null) {
    if (f.hour === 'all') {
      items = items.filter(x => x.hours.length === CONFIG.HOURS);
    } else {
      items = items.filter(x => x.hours.includes(f.hour));
    }
  }
  if (f.status === 'collected') items = items.filter(x => state.collected.has(x.id));
  if (f.status === 'uncollected') items = items.filter(x => !state.collected.has(x.id));

  const sk = state.sort.key;
  const sd = state.sort.dir === 'asc' ? 1 : -1;
  if (sk) {
    items.sort((a, b) => {
      if (sk === 'name') return sd * a.name.localeCompare(b.name, 'zh');
      if (sk === 'price') return sd * (a.price - b.price);
      if (sk === 'collected') {
        const ca = state.collected.has(a.id) ? 1 : 0;
        const cb = state.collected.has(b.id) ? 1 : 0;
        return sd * (ca - cb);
      }
      return 0;
    });
  }

  return items;
}

function renderNavTabs() {
  document.getElementById('navTabs').innerHTML = CONFIG.TABS.map(t =>
    '<button class="nav-tab' + (state.activeTab===t?' active':'') + '" data-tab="'+t+'">' + TAB_NAMES[t] + '</button>'
  ).join('');
}

function renderProgress() {
  const data = DATA_MAP[state.activeTab];
  const total = data.length;
  const collected = data.filter(x => state.collected.has(x.id)).length;
  const pct = total > 0 ? (collected/total*100).toFixed(1) : 0;
  const allTotal = ALL_DATA.length;
  const allCollected = ALL_DATA.filter(x => state.collected.has(x.id)).length;
  const allPct = allTotal > 0 ? (allCollected/allTotal*100).toFixed(1) : 0;
  document.getElementById('progressSection').innerHTML =
    '<div class="progress-text"><span class="progress-label">'+TAB_NAMES[state.activeTab]+' 收集进度</span><span class="progress-pct">已收集 '+collected+' / '+total+' （'+pct+'%）</span></div>' +
    '<div class="progress-bar"><div class="progress-fill" style="width:'+pct+'%"></div></div>' +
    '<div class="progress-text" style="margin-top:14px"><span class="progress-label" style="font-size:13px">总进度</span><span style="font-size:15px;font-weight:700;color:var(--color-primary-dark)">已收集 '+allCollected+' / '+allTotal+' （'+allPct+'%）</span></div>' +
    '<div class="progress-bar"><div class="progress-fill" style="width:'+allPct+'%"></div></div>';
}

function renderTodayPanel() {
  const now = getLocalTime();
  const hour = now.getHours();
  const monStr = now.getFullYear()+'年'+(now.getMonth()+1)+'月'+now.getDate()+'日';

  let nowAvailable = ALL_DATA.filter(x => isAvailableNow(x));
  if (state.todayUncollectedOnly) {
    nowAvailable = nowAvailable.filter(x => !state.collected.has(x.id));
  }
  const byType = {
    fish: nowAvailable.filter(x => x.type==='fish'),
    bug: nowAvailable.filter(x => x.type==='bug'),
    sea: nowAvailable.filter(x => x.type==='sea')
  };

  function todayRow(item, tags){
    const warn = isLeavingNextMonth(item) ? ' <span class="warn">⚠️ 本月即将消失</span>' : '';
    const timeLabel = getTimeRangeLabel(item.hours);
    return '<div class="today-item"><span style="font-weight:600;min-width:80px">'
      + escapeHtml(item.name) + '</span>' + tags
      + '<span style="font-size:12px;color:var(--color-text-muted)">' + timeLabel + '</span>'
      + '<span style="color:var(--color-accent-warm);font-weight:600;margin-left:auto">'
      + item.price + ' 铃钱</span>' + warn + '</div>';
  }

  let html = '<div class="today-header'+(state.todayOpen?' open':'')+'" id="todayHeader"><h3><span class="arrow">▶</span> 今日可捕捉 （'+monStr+' '+hour+'时）</h3><span style="font-size:13px;color:var(--color-text-muted)">'+nowAvailable.length+' 种生物可捕捉</span></div>';
  html += '<div class="today-body'+(state.todayOpen?' open':'')+'">';
  html += '<div class="today-info"><span>当前半球：</span>'+hemisphereButtons('hemi-btn')
    + '<label class="today-toggle"><input type="checkbox" id="todayUncollected"'+(state.todayUncollectedOnly?' checked':'')+'>只看未收集</label></div>';

  for (const t of ['fish','bug','sea']) {
    const items = byType[t];
    const open = state.todayGroups[t];
    html += '<h4 class="today-group-header'+(open?' open':'')+'" data-group="'+t+'"><span class="arrow">▶</span> '+TAB_NAMES[t]+' （'+items.length+'）</h4>';
    html += '<div class="today-group-body'+(open?' open':'')+'" id="todayGroup-'+t+'">';
    if (items.length === 0) {
      html += '<div class="today-item" style="color:var(--color-text-muted)">当前时间没有可捕捉的'+TAB_NAMES[t]+'</div>';
    } else {
      items.forEach(item => {
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
  });
  document.getElementById('todayUncollected').addEventListener('change', e => {
    state.todayUncollectedOnly = e.target.checked;
    saveUIState();
    renderTodayPanel();
  });
  // Group headers toggle in place (no full re-render); state.todayGroups
  // keeps the choice in sync for the next scheduled panel refresh.
  document.querySelectorAll('#todayPanel .today-group-header').forEach(h => {
    h.addEventListener('click', () => {
      const g = h.dataset.group;
      state.todayGroups[g] = !state.todayGroups[g];
      h.classList.toggle('open', state.todayGroups[g]);
      document.getElementById('todayGroup-' + g).classList.toggle('open', state.todayGroups[g]);
      saveUIState();
    });
  });
  bindHemisphereButtons(document.getElementById('todayPanel'));
}

function renderFilters() {
  const tab = state.activeTab;
  const f = state.filters[tab];
  const data = DATA_MAP[tab];
  let locations = [], shadows = [], weathers = [];

  if (tab === 'fish' || tab === 'bug') {
    locations = [...new Set(data.map(x => x.location))];
  }
  if (tab === 'fish' || tab === 'sea') {
    shadows = [...new Set(data.map(x => x.shadowSize))];
  }
  if (tab === 'bug') {
    weathers = [...new Set(data.map(x => x.weather))];
  }

  let html = '<button class="filter-toggle-btn" id="filterToggle">🔍 筛选条件</button>';
  html += '<div class="filter-panel'+(state.filterOpen?' open':'')+'">';

  html += '<div class="filter-row"><span class="filter-label">半球</span><div class="filter-options">';
  html += hemisphereButtons('filter-btn');
  html += '</div></div>';

  html += '<div class="filter-row"><span class="filter-label">收集状态</span><div class="filter-options">';
  for (const [val,label] of CONFIG.STATUS_OPTS) {
    html += '<button class="filter-btn'+(f.status===val?' active':'')+'" data-filter="status" data-value="'+val+'">'+label+'</button>';
  }
  html += '</div></div>';

  if (tab === 'fish' || tab === 'bug') {
    html += '<div class="filter-row"><span class="filter-label">出现场所</span><div class="filter-options">';
    locations.forEach(loc => {
      html += '<button class="filter-btn'+(f.location.includes(loc)?' active':'')+'" data-filter="location" data-value="'+escapeHtml(loc)+'">'+escapeHtml(loc)+'</button>';
    });
    html += '</div></div>';
  }

  if (tab !== 'bug') {
    html += '<div class="filter-row"><span class="filter-label">'+(tab==='sea'?'影子大小':'鱼影尺寸')+'</span><div class="filter-options">';
    shadows.forEach(s => {
      html += '<button class="filter-btn'+(f.shadowSize.includes(s)?' active':'')+'" data-filter="shadowSize" data-value="'+escapeHtml(s)+'">'+escapeHtml(s)+'</button>';
    });
    html += '</div></div>';
  }

  if (tab === 'bug') {
    html += '<div class="filter-row"><span class="filter-label">天气条件</span><div class="filter-options">';
    weathers.forEach(w => {
      html += '<button class="filter-btn'+(f.weather.includes(w)?' active':'')+'" data-filter="weather" data-value="'+escapeHtml(w)+'">'+escapeHtml(w)+'</button>';
    });
    html += '</div></div>';
  }

  html += '<div class="filter-row"><span class="filter-label">出现月份</span><div class="filter-options" id="monthGrid">';
  const curMon = getLocalTime().getMonth() + 1;
  for (let m = 1; m <= CONFIG.MONTHS; m++) {
    html += '<button class="filter-btn month-grid'+(f.month===m?' active':'')+(m===curMon?' month-current':'')+'" data-filter="month" data-value="'+m+'">'+m+'</button>';
  }
  html += '</div></div>';

  html += '<div class="filter-row"><span class="filter-label">出现时间</span><div class="filter-options" id="hourGrid">';
  const curHr = getLocalTime().getHours();
  html += '<button class="filter-btn'+(f.hour==='all'?' active':'')+'" data-filter="hour" data-value="all">全天</button>';
  for (let h = 0; h < CONFIG.HOURS; h++) {
    html += '<button class="filter-btn'+(f.hour===h?' active':'')+(h===curHr?' month-current':'')+'" data-filter="hour" data-value="'+h+'">'+h+'</button>';
  }
  html += '</div></div>';

  html += '<div class="filter-row"><span style="flex:1"></span>';
  html += '<button class="filter-reset" id="filterReset">重置全部</button>';
  html += '</div></div>';

  document.getElementById('filterBar').innerHTML = html;

  document.getElementById('filterToggle').addEventListener('click', () => {
    state.filterOpen = !state.filterOpen;
    saveUIState();
    renderFilters();
  });

  bindHemisphereButtons(document.getElementById('filterBar'));

  document.getElementById('filterReset').addEventListener('click', () => {
    // Resetting hands hour control back to the clock, and clears sort too —
    // the button says 重置全部, so leaving sort applied would be a lie.
    state.filters[state.activeTab] = makeFilters(state.activeTab);
    state.sort = { key: null, dir: 'asc' };
    saveUIState();
    renderFilters();
    renderList();
  });
}

// One delegated listener for every filter button, attached once at startup.
// #filterBar itself is persistent (only its innerHTML is re-rendered), so the
// listener survives re-renders without stacking duplicates.
document.getElementById('filterBar').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn[data-filter]');
  if (!btn) return;
  const tab = state.activeTab;
  const filter = btn.dataset.filter;
  const value = btn.dataset.value;
  if (filter === 'status') {
    state.filters[tab].status = value;
  } else if (filter === 'location' || filter === 'shadowSize' || filter === 'weather') {
    toggleArrayFilter(filter, value);
  } else if (filter === 'month') {
    state.filters[tab].month = state.filters[tab].month === parseInt(value) ? null : parseInt(value);
  } else if (filter === 'hour') {
    // Any manual hour choice (including "全天" and re-tapping to clear)
    // marks the filter as user-owned so the hourly tick won't clobber it.
    state.filters[tab].hourManual = true;
    if (value === 'all') {
      state.filters[tab].hour = state.filters[tab].hour === 'all' ? null : 'all';
    } else {
      state.filters[tab].hour = state.filters[tab].hour === parseInt(value) ? null : parseInt(value);
    }
  }
  saveUIState();
  renderFilters();
  renderList();
});

function renderList() {
  const tab = state.activeTab;
  const data = DATA_MAP[tab];
  const filtered = applyFilters(data, tab);

  let html = '<div class="list-header">';
  CONFIG.SORT_KEYS.forEach(sk => {
    const arrow = state.sort.key === sk.key ? (state.sort.dir==='asc'?' ▲':' ▼') : '';
    html += '<span class="sortable" data-sort="'+sk.key+'">'+sk.label+arrow+'</span> ';
  });
  html += '<span style="flex:1"></span>';
  html += '<span style="font-size:12px;color:var(--color-text-muted)">共 '+filtered.length+' 条</span>';
  html += '<button class="data-btn" id="markAllVisible" style="margin-left:8px;padding:4px 12px;font-size:12px">全标</button>';
  html += '<button class="data-btn" id="unmarkAllVisible" style="padding:4px 12px;font-size:12px">全取消</button>';
  html += '</div>';

  if (filtered.length === 0) {
    html += '<div class="empty-state">没有符合条件的生物，请调整筛选条件 🔍</div>';
  }

  const curMon = getLocalTime().getMonth() + 1;
  const northern = state.hemisphere === 'north';
  filtered.forEach(item => {
    const collected = state.collected.has(item.id);
    html += '<div class="creature-item'+(collected?' collected':'')+'" data-id="'+item.id+'">';
    html += '<div class="check-box"></div>';
    html += '<div class="creature-main">';
    html += '<span class="creature-name">'+escapeHtml(item.name)+'</span>';
    // Sea creatures are all 海洋底部 — a tag that never varies is pure noise.
    if (tab !== 'sea') {
      html += '<span class="tag tag-location">'+escapeHtml(item.location)+'</span>';
    }
    if (item.shadowSize) {
      html += '<span class="tag tag-shadow">'+escapeHtml(item.shadowSize)+'</span>';
    }
    // Weather is filterable, so it has to be visible on the row — otherwise a
    // user who filters by 雨天 can't tell why a given row matched.
    if (item.weather && item.weather !== '无限制') {
      html += '<span class="tag tag-weather">'+escapeHtml(item.weather)+'</span>';
    }
    html += '<span class="tag-price">'+item.price+' 铃钱</span>';
    html += '</div>';

    html += '<div class="creature-meta">';
    html += '<div class="meta-row"><span class="meta-label">月:</span>';
    const months = northern ? item.northMonths : item.southMonths;
    for (let m = 1; m <= CONFIG.MONTHS; m++) {
      html += '<span class="heat-cell'+(months.includes(m)?' on':'')+(m===curMon?' current':'')+'">'+m+'</span>';
    }
    html += '</div>';
    // Hour availability as a text range rather than 24 cells per row: the
    // 24-cell grid was ~4800 elements for an 80-row list and dominated both
    // the HTML payload and layout cost.
    html += '<div class="meta-row"><span class="meta-label">时:</span><span class="meta-hours">'
      + getTimeRangeLabel(item.hours) + '</span>';
    html += '</div></div>';
    html += '</div>';
  });

  document.getElementById('listSection').innerHTML = html;

  // Bulk mark/unmark only changes collected state, which is a class toggle on
  // rows that are already on screen — patch them in place instead of rebuilding
  // the whole list. A rebuild is only needed when rows must appear/disappear
  // (status filter) or reorder (collected sort).
  function bulkSetCollected(add) {
    if (filtered.length === 0) return;
    const verb = add ? '标记' : '取消标记';
    if (!confirm('确定要' + verb + '当前 ' + filtered.length + ' 条生物吗？此操作无法撤销。')) return;
    filtered.forEach(x => add ? state.collected.add(x.id) : state.collected.delete(x.id));
    saveCollected();
    renderProgress();
    const f = state.filters[state.activeTab];
    if (f.status !== 'all' || state.sort.key === 'collected') {
      renderList();
    } else {
      document.querySelectorAll('#listSection .creature-item').forEach(el => {
        el.classList.toggle('collected', add);
      });
    }
    showToast('已' + verb + ' ' + filtered.length + ' 条');
  }

  document.getElementById('markAllVisible').addEventListener('click', () => bulkSetCollected(true));
  document.getElementById('unmarkAllVisible').addEventListener('click', () => bulkSetCollected(false));
}

// Delegated listener for sort headers and creature rows, attached once.
document.getElementById('listSection').addEventListener('click', e => {
  const sortEl = e.target.closest('.sortable');
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

  const itemEl = e.target.closest('.creature-item');
  if (!itemEl) return;
  const id = itemEl.dataset.id;
  if (state.collected.has(id)) {
    state.collected.delete(id);
    itemEl.classList.remove('collected');
  } else {
    state.collected.add(id);
    itemEl.classList.add('collected');
  }
  saveCollected();
  renderProgress();
  // When a status filter or collected-sort is active, the item must
  // (dis)appear or reorder — fall back to a list rebuild. Otherwise the
  // in-place class toggle above is enough and avoids losing scroll/focus.
  const f = state.filters[state.activeTab];
  if (f.status !== 'all' || state.sort.key === 'collected') {
    renderList();
  }
});

function renderAll() {
  renderNavTabs();
  renderProgress();
  renderTodayPanel();
  renderFilters();
  renderList();
}

function renderDataBar() {
  document.getElementById('dataBar').innerHTML =
    '<button class="data-btn" id="exportBtn">导出收集记录</button>' +
    '<button class="data-btn" id="importBtn">导入收集记录</button>' +
    '<input type="file" id="importFile" accept="application/json" style="display:none">';
  document.getElementById('exportBtn').addEventListener('click', exportCollected);
  document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', importCollected);
}

document.getElementById('navTabs').addEventListener('click', e => {
  const btn = e.target.closest('.nav-tab');
  if (!btn) return;
  state.activeTab = btn.dataset.tab;
  state.filterOpen = false;
  saveUIState();
  renderAll();
});

// Update the month/hour grids in place instead of re-rendering the whole
// filter bar, so an hour rollover can't discard focus or scroll position.
function refreshTimeGrids() {
  const f = state.filters[state.activeTab];
  const curMon = getLocalTime().getMonth() + 1;
  const curHr = getLocalTime().getHours();

  const monthGrid = document.getElementById('monthGrid');
  if (monthGrid) {
    monthGrid.querySelectorAll('[data-filter="month"]').forEach(btn => {
      const m = parseInt(btn.dataset.value);
      btn.classList.toggle('active', f.month === m);
      btn.classList.toggle('month-current', m === curMon);
    });
  }

  const hourGrid = document.getElementById('hourGrid');
  if (hourGrid) {
    hourGrid.querySelectorAll('[data-filter="hour"]').forEach(btn => {
      const v = btn.dataset.value;
      const h = v === 'all' ? 'all' : parseInt(v);
      btn.classList.toggle('active', f.hour === h);
      btn.classList.toggle('month-current', h === curHr);
    });
  }
}

const initialTick = getLocalTime();
// Seed from the current clock so the first interval fire is a no-op. Starting
// at null made minute/hour always compare unequal, so 60s after load the hour
// branch ran as if the clock had rolled over and silently narrowed the list.
let lastTickMinute = initialTick.getMinutes();
let lastTickHour = initialTick.getHours();
setInterval(() => {
  const now = getLocalTime();
  const minute = now.getMinutes();
  const hour = now.getHours();
  // Re-render the today panel only when the minute actually changed; the
  // interval can fire late or the tab may be backgrounded, so guard against
  // no-op rebuilds that destroy/rebind DOM for nothing.
  if (minute !== lastTickMinute) {
    lastTickMinute = minute;
    renderTodayPanel();
  }
  // When the hour rolls over, follow the clock with the hour filter — but
  // only until the user picks an hour themselves (hourManual). Their choice
  // stays put; hitting 重置全部 hands control back to the clock. Every tab
  // follows, otherwise switching tabs surfaces a stale hour from whenever
  // that tab last happened to be the active one.
  if (hour !== lastTickHour) {
    lastTickHour = hour;
    for (const tab of CONFIG.TABS) {
      if (!state.filters[tab].hourManual) state.filters[tab].hour = hour;
    }
    saveUIState();
    refreshTimeGrids();
    renderList();
  }
}, CONFIG.TICK_MS);

renderDataBar();
renderAll();
