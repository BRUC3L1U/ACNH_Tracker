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
function showToast(msg, opts){
  opts = opts || {};
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  // An optional inline action (撤销 on bulk operations). textContent above
  // wipes any button left over from a previous toast, so the new one is
  // appended into a clean slate.
  if (opts.action) {
    const btn = document.createElement('button');
    btn.className = 'toast-action';
    btn.type = 'button';
    btn.textContent = opts.action.label;
    btn.addEventListener('click', () => {
      clearTimeout(toastTimer);
      el.classList.remove('show');
      opts.action.onClick();
    });
    el.appendChild(btn);
  }
  // Force reflow so re-triggering while visible restarts the transition.
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(toastTimer);
  // Action toasts outlive plain ones — an undo affordance that vanishes in
  // 2.6s is a tease, not a safety net.
  toastTimer = setTimeout(() => el.classList.remove('show'), opts.duration || 2600);
}

// Native confirm() is gone: it blocks, it ignores the page's styling, and it
// offers no focus handling. This in-page dialog replaces it — but only for
// actions that replace everything at once and are too important to trust to
// a transient toast (import-overwrite). Bulk mark/unmark skips it entirely
// and relies on the toast's 撤销 action instead: undo is strictly safer than
// a confirm that can't be taken back once clicked.
// Escape/backdrop/取消 = cancel, Enter or 确定 = confirm; focus is restored
// to whatever had it before the dialog opened.
function confirmDialog(message, confirmLabel) {
  return new Promise(resolve => {
    const prevFocus = document.activeElement;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true">'
      + '<p class="modal-msg"></p>'
      + '<div class="modal-btns">'
      + '<button type="button" class="modal-btn" data-r="cancel">取消</button>'
      + '<button type="button" class="modal-btn modal-btn-confirm" data-r="ok"></button>'
      + '</div></div>';
    overlay.querySelector('.modal-msg').textContent = message;
    const okBtn = overlay.querySelector('[data-r="ok"]');
    okBtn.textContent = confirmLabel || '确定';
    let done = false;
    const close = result => {
      if (done) return;
      done = true;
      overlay.classList.remove('show');
      document.removeEventListener('keydown', onKey);
      // Let the fade-out finish before detaching, then hand focus back.
      setTimeout(() => {
        overlay.remove();
        if (prevFocus && prevFocus.isConnected) prevFocus.focus();
      }, 200);
      resolve(result);
    };
    const onKey = e => {
      if (e.key === 'Escape') { e.preventDefault(); close(false); return; }
      if (e.key === 'Enter') {
        // Enter on a focused button should activate that button, not force
        // confirm — only a bare Enter (dialog itself focused) confirms.
        if (e.target && e.target.closest && e.target.closest('[data-r]')) return;
        close(true);
      }
    };
    overlay.addEventListener('click', e => {
      if (e.target === overlay) return close(false);
      const btn = e.target.closest('[data-r]');
      if (btn) close(btn.dataset.r === 'ok');
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(overlay);
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => overlay.classList.add('show'));
    else overlay.classList.add('show');
    okBtn.focus();
  });
}

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
  state.hemisphere = hemi;
  saveHemisphere();
  renderAll();
  const remaining = applyFilters(DATA_MAP[state.activeTab], state.activeTab).length;
  const label = state.hemisphere === 'north' ? '北半球' : '南半球';
  showToast(remaining === 0
    ? '已切换到' + label + '，当前筛选条件下没有匹配的生物，可尝试重置筛选'
    : '已切换到' + label + '，当前筛选命中 ' + remaining + ' 条');
}

function hemisphereButtons(activeClass){
  return '<button class="'+activeClass+(state.hemisphere==='north'?' active':'')+'" data-hemi="north">北半球</button>'
       + '<button class="'+activeClass+(state.hemisphere==='south'?' active':'')+'" data-hemi="south">南半球</button>';
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

// A flat view over all three datasets, tagged with its source tab. The tag
// lives in a wrapper rather than being assigned onto the creature itself:
// mutating the objects in DATA_MAP would make data.js's shape depend on
// app.js having run, which leaks into anything else reading that data.
const ALL_DATA = CONFIG.TABS.flatMap(type => DATA_MAP[type].map(item => ({ type, item })));

// Collected ids are only meaningful if they match a real creature — imports
// are validated against this set so junk ids can't squat in storage forever.
const KNOWN_IDS = new Set(ALL_DATA.map(x => x.item.id));

// Each tab only carries the array filters its data actually has, so
// applyFilters' tab guards and the key set stay in agreement.
function makeFilters(tab){
  const now = getLocalTime();
  const f = { month:null, hour:now.getHours(), hourManual:false, status:'all' };
  if (tab === 'fish' || tab === 'bug') f.location = [];
  if (tab === 'fish' || tab === 'sea') f.shadowSize = [];
  if (tab === 'bug') f.weather = [];
  return f;
}

// UI state (active tab, filters, sort, panel collapses) survives reloads.
// hourManual is persisted alongside hour: the hour filter defaults to the
// current clock hour and follows it on rollover, but once the user picks an
// hour themselves that choice must survive a reload too — otherwise the next
// rollover would silently overwrite it.
// localStorage is untrusted input — a value of the wrong type here silently
// breaks applyFilters (a string `location` makes every row fail the filter and
// the list goes empty with no explanation), so each key is type-checked and a
// bad value falls back to the default rather than being adopted.
function isValidFilterValue(key, v, isArray) {
  if (isArray) return Array.isArray(v) && v.every(x => typeof x === 'string');
  if (key === 'status') return CONFIG.STATUS_OPTS.some(([val]) => val === v);
  if (key === 'hourManual') return typeof v === 'boolean';
  if (key === 'month') return v === null || (Number.isInteger(v) && v >= 1 && v <= CONFIG.MONTHS);
  if (key === 'hour') return v === null || v === 'all' || (Number.isInteger(v) && v >= 0 && v < CONFIG.HOURS);
  return false;
}

// Same untrusted-localStorage rule as the filters: todayGroups is only
// adopted when it is a plain object carrying booleans under known tab keys.
// (A stray string or array used to survive the spread in loadUIState.)
function loadTodayGroups(saved) {
  const g = { fish: true, bug: true, sea: true };
  const s = saved.todayGroups;
  if (s && typeof s === 'object' && !Array.isArray(s)) {
    for (const t of CONFIG.TABS) {
      if (typeof s[t] === 'boolean') g[t] = s[t];
    }
  }
  return g;
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
      if (!(key in s)) continue;
      if (isValidFilterValue(key, s[key], Array.isArray(target[key]))) target[key] = s[key];
    }
    // A restored hour is only meaningful if the user chose it. Otherwise it is
    // a stale snapshot of whatever hour the last session happened to end on, so
    // resume following the clock instead.
    if (!target.hourManual) target.hour = getLocalTime().getHours();
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
    todayGroups: loadTodayGroups(saved)
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
  // Date-stamped so consecutive backups stay distinguishable in Downloads.
  const now = getLocalTime();
  const pad = n => String(n).padStart(2, '0');
  a.download = 'acnh-collected-' + now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + '.json';
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importCollected(e) {
  const input = e.target;
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      const arr = Array.isArray(parsed) ? parsed : parsed.collected;
      if (!Array.isArray(arr)) throw new Error('文件格式不正确');
      // Unknown ids would sit in storage forever, never matching a row and
      // silently inflating the imported count — drop them at the door and say
      // so. A file with no recognizable ids at all is almost certainly not an
      // export of this app.
      const incoming = new Set(arr.filter(id => KNOWN_IDS.has(id)));
      const dropped = new Set(arr).size - incoming.size;
      if (incoming.size === 0) throw new Error('文件中没有可识别的生物记录');
      if (state.collected.size > 0) {
        const ok = await confirmDialog('导入将覆盖当前的 ' + state.collected.size + ' 条记录，是否继续？', '覆盖导入');
        if (!ok) {
          input.value = '';
          return;
        }
      }
      state.collected = incoming;
      saveCollected();
      renderAll();
      showToast('导入成功，共 ' + incoming.size + ' 条记录' + (dropped > 0 ? '（已忽略 ' + dropped + ' 条无法识别的记录）' : ''));
    } catch (err) {
      showToast('导入失败：' + err.message);
    }
    input.value = '';
  };
  reader.onerror = () => {
    showToast('导入失败：无法读取文件');
    input.value = '';
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
  const allCollected = ALL_DATA.filter(x => state.collected.has(x.item.id)).length;
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

  let nowAvailable = ALL_DATA.filter(x => isAvailableNow(x.item));
  if (state.todayUncollectedOnly) {
    nowAvailable = nowAvailable.filter(x => !state.collected.has(x.item.id));
  }
  const byType = {
    fish: nowAvailable.filter(x => x.type==='fish'),
    bug: nowAvailable.filter(x => x.type==='bug'),
    sea: nowAvailable.filter(x => x.type==='sea')
  };

  function todayRow(item, tags){
    const timeLabel = getTimeRangeLabel(item.hours);
    const note = item.note ? '<span class="note">'+escapeHtml(item.note)+'</span>' : '';
    return '<div class="today-item"><span style="font-weight:600;min-width:80px">'
      + escapeHtml(item.name) + '</span>' + tags + note
      + '<span style="font-size:12px;color:var(--color-text-muted)">' + timeLabel + '</span>'
      + '<span style="color:var(--color-accent-warm);font-weight:600;margin-left:auto">'
      + item.price + ' 铃钱</span></div>';
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

// No name-search box — deliberate, not an oversight. Search was decided
// against: the filter dimensions (location / shadow / weather / month /
// hour / status) are the intended way to find a creature, and they compose to
// answer the questions this page exists for ("what can I catch right now",
// "what's still missing"). If a future change feels like it needs a search
// box, that decision was made on purpose — don't add one without checking
// with the project owner first.
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
    html += '<button class="filter-btn month-grid'+(f.month===m?' active':'')+(m===curMon?' is-now':'')+'" data-filter="month" data-value="'+m+'">'+m+'</button>';
  }
  html += '</div></div>';

  // The hour row has three non-numeric states, and they are not the same
  // thing: 不限 = no hour filtering at all; 全天出现 = only creatures whose
  // hours cover all 24; and the unmarked default = follow the clock. Hiding
  // "clear" behind a re-tap of the active hour chip (the old behaviour)
  // made none of that discoverable, so 不限 is now an explicit chip.
  html += '<div class="filter-row"><span class="filter-label">出现时间</span><div class="filter-options" id="hourGrid">';
  const curHr = getLocalTime().getHours();
  html += '<button class="filter-btn'+(f.hour===null?' active':'')+'" data-filter="hour" data-value="none">不限</button>';
  html += '<button class="filter-btn'+(f.hour==='all'?' active':'')+'" data-filter="hour" data-value="all">全天出现</button>';
  for (let h = 0; h < CONFIG.HOURS; h++) {
    html += '<button class="filter-btn'+(f.hour===h?' active':'')+(h===curHr?' is-now':'')+'" data-filter="hour" data-value="'+h+'">'+h+'</button>';
  }
  html += '</div></div>';

  html += '<div class="filter-row"><span style="flex:1"></span>';
  html += '<button class="filter-reset" id="filterReset">重置全部</button>';
  html += '</div></div>';

  document.getElementById('filterBar').innerHTML = html;
}

// Sync every filter chip's classes against the current state, in place.
// Filter taps and clock changes both land here — a tap only flips chip
// classes (no innerHTML rebuild, so focus and scroll survive), and a clock
// change additionally moves the is-now highlight on the month/hour grids.
function syncFilterChips() {
  const f = state.filters[state.activeTab];
  const curMon = getLocalTime().getMonth() + 1;
  const curHr = getLocalTime().getHours();
  document.querySelectorAll('#filterBar [data-filter]').forEach(btn => {
    const filter = btn.dataset.filter;
    const value = btn.dataset.value;
    let active = false;
    if (filter === 'status') active = f.status === value;
    else if (filter === 'location') active = f.location.includes(value);
    else if (filter === 'shadowSize') active = f.shadowSize.includes(value);
    else if (filter === 'weather') active = f.weather.includes(value);
    else if (filter === 'month') active = f.month === parseInt(value);
    else if (filter === 'hour') {
      active = f.hour === (value === 'all' ? 'all' : value === 'none' ? null : parseInt(value));
    }
    btn.classList.toggle('active', active);
    if (filter === 'month') {
      btn.classList.toggle('is-now', parseInt(value) === curMon);
    } else if (filter === 'hour') {
      btn.classList.toggle('is-now', value !== 'all' && value !== 'none' && parseInt(value) === curHr);
    }
  });
}

// One delegated listener for everything clickable in the filter bar — filter
// chips, hemisphere buttons, the mobile toggle and 重置全部 — attached once
// at startup. #filterBar itself is persistent (only its innerHTML is
// re-rendered), so the listener survives re-renders without stacking
// duplicates.
document.getElementById('filterBar').addEventListener('click', e => {
  const hemiBtn = e.target.closest('[data-hemi]');
  if (hemiBtn) return handleHemisphereChange(hemiBtn.dataset.hemi);

  if (e.target.closest('#filterToggle')) {
    state.filterOpen = !state.filterOpen;
    saveUIState();
    renderFilters();
    return;
  }

  if (e.target.closest('#filterReset')) {
    // Resetting hands hour control back to the clock, and clears sort too —
    // the button says 重置全部, so leaving sort applied would be a lie.
    state.filters[state.activeTab] = makeFilters(state.activeTab);
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
  } else if (filter === 'location' || filter === 'shadowSize' || filter === 'weather') {
    toggleArrayFilter(filter, value);
  } else if (filter === 'month') {
    state.filters[tab].month = state.filters[tab].month === parseInt(value) ? null : parseInt(value);
  } else if (filter === 'hour') {
    // Any manual hour choice (including 不限 and 全天出现) marks the filter
    // as user-owned so the hourly tick won't clobber it. 不限 is "no hour
    // filter", which is itself a choice — not a request to follow the clock
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

// Header and rows live in their own persistent containers so a re-render can
// replace one without destroying the other.
document.getElementById('listSection').innerHTML =
  '<div class="list-header" id="listHeader"></div><div id="listRows"></div>';

// Row elements are cached by creature id and reused across renders. Rebuilding
// #listSection wholesale meant parsing ~69KB of HTML and constructing every
// element again for each filter tap; now a re-render only re-orders nodes that
// already exist. What a row's markup bakes in — the tab, the hemisphere's
// months, the current-month highlight — is tracked in rowCacheSig, and any
// change there invalidates the whole cache.
const rowCache = new Map();
let rowCacheSig = '';
// The bulk buttons act on whatever the last render filtered down to, and they
// are bound once via delegation rather than re-bound per render.
let lastFiltered = [];

function buildRow(item, tab, northern, curMon) {
  let html = '<div class="check-box"></div><div class="creature-main">';
  html += '<span class="creature-name">'+escapeHtml(item.name)+'</span>';
  // Sea creatures are all 海洋底部 — a tag that never varies is pure noise.
  if (tab !== 'sea') {
    html += '<span class="tag tag-location">'+escapeHtml(item.location)+'</span>';
  }
  if (item.shadowSize) {
    html += '<span class="tag tag-shadow">'+escapeHtml(item.shadowSize)+'</span>';
  }
  // Weather is filterable on the bug tab, so it has to be visible on the row —
  // otherwise a user who filters by 雨天 can't tell why a given row matched.
  if (item.weather && item.weather !== '无限制') {
    html += '<span class="tag tag-weather">'+escapeHtml(item.weather)+'</span>';
  }
  html += '<span class="tag-price">'+item.price+' 铃钱</span>';
  // Capture notes are prose, not a filter dimension — rendered as plain text so
  // they read differently from the tags beside them.
  if (item.note) {
    html += '<span class="note">'+escapeHtml(item.note)+'</span>';
  }
  html += '</div><div class="creature-meta"><div class="meta-row"><span class="meta-label">月:</span>';
  const months = northern ? item.northMonths : item.southMonths;
  for (let m = 1; m <= CONFIG.MONTHS; m++) {
    html += '<span class="heat-cell'+(months.includes(m)?' on':'')+(m===curMon?' current':'')+'">'+m+'</span>';
  }
  // Hour availability as a text range rather than 24 cells per row: the 24-cell
  // grid was ~4800 elements for an 80-row list and dominated both the HTML
  // payload and layout cost.
  html += '</div><div class="meta-row"><span class="meta-label">时:</span><span class="meta-hours">'
    + getTimeRangeLabel(item.hours) + '</span></div></div>';

  const el = document.createElement('div');
  el.className = 'creature-item';
  el.dataset.id = item.id;
  el.innerHTML = html;
  return el;
}

function renderListHeader(count) {
  let html = '';
  CONFIG.SORT_KEYS.forEach(sk => {
    const arrow = state.sort.key === sk.key ? (state.sort.dir==='asc'?' ▲':' ▼') : '';
    html += '<span class="sortable" data-sort="'+sk.key+'">'+sk.label+arrow+'</span> ';
  });
  html += '<span style="flex:1"></span>';
  html += '<span style="font-size:12px;color:var(--color-text-muted)">共 '+count+' 条</span>';
  html += '<button class="data-btn" id="markAllVisible" style="margin-left:8px;padding:4px 12px;font-size:12px">全标</button>';
  html += '<button class="data-btn" id="unmarkAllVisible" style="padding:4px 12px;font-size:12px">全取消</button>';
  document.getElementById('listHeader').innerHTML = html;
}

function renderList() {
  const tab = state.activeTab;
  const filtered = applyFilters(DATA_MAP[tab], tab);
  lastFiltered = filtered;
  renderListHeader(filtered.length);

  const rows = document.getElementById('listRows');
  if (filtered.length === 0) {
    rows.innerHTML = '<div class="empty-state">没有符合条件的生物，请调整筛选条件 🔍</div>';
    return;
  }

  const northern = state.hemisphere === 'north';
  const curMon = getLocalTime().getMonth() + 1;
  const sig = tab + '|' + northern + '|' + curMon;
  if (sig !== rowCacheSig) {
    rowCache.clear();
    rowCacheSig = sig;
  }

  // Appending an existing node to the fragment detaches it from the old list,
  // so reorders and removals fall out of rebuilding this in filtered order.
  const frag = document.createDocumentFragment();
  for (const item of filtered) {
    let el = rowCache.get(item.id);
    if (!el) {
      el = buildRow(item, tab, northern, curMon);
      rowCache.set(item.id, el);
    }
    el.classList.toggle('collected', state.collected.has(item.id));
    frag.appendChild(el);
  }
  rows.replaceChildren(frag);
}

// Bulk mark/unmark acts immediately and offers 撤销 in the toast — the old
// confirm() gate is gone. A confirm couldn't be un-clicked anyway: once
// "确定" was tapped, up to 80 rows changed with no way back. An undo that
// restores exactly the rows this operation touched (single toggles made in
// between are preserved) is strictly safer.
function bulkSetCollected(add) {
  if (lastFiltered.length === 0) return;
  const verb = add ? '标记' : '取消标记';
  const before = new Set(state.collected);
  const ids = lastFiltered.map(x => x.id);
  ids.forEach(id => add ? state.collected.add(id) : state.collected.delete(id));
  saveCollected();
  renderProgress();
  const f = state.filters[state.activeTab];
  if (f.status !== 'all' || state.sort.key === 'collected') {
    renderList();
  } else {
    document.querySelectorAll('#listRows .creature-item').forEach(el => {
      el.classList.toggle('collected', add);
    });
  }
  showToast('已' + verb + ' ' + ids.length + ' 条', {
    duration: 6000,
    action: {
      label: '撤销',
      onClick: () => {
        // Only the rows this bulk operation touched are restored to their
        // pre-op state, so a single toggle made while the toast was up
        // survives the undo.
        ids.forEach(id => before.has(id) ? state.collected.add(id) : state.collected.delete(id));
        saveCollected();
        renderProgress();
        const f = state.filters[state.activeTab];
        if (f.status !== 'all' || state.sort.key === 'collected') {
          renderList();
        } else {
          document.querySelectorAll('#listRows .creature-item').forEach(el => {
            el.classList.toggle('collected', state.collected.has(el.dataset.id));
          });
        }
        showToast('已撤销');
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

// Everything clock-driven is hour-granular: the today panel filters by hour
// and its header shows no minutes, and the hour filter follows the clock. So
// a minute tick has nothing to update — re-rendering on it only destroyed and
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
  // Follow the clock with the hour filter — but only until the user picks an
  // hour themselves (hourManual; 不限 counts as a pick too). 重置全部 is what
  // hands control back to the clock. Every tab follows, otherwise switching
  // tabs surfaces a stale hour from whenever that tab was last active.
  for (const tab of CONFIG.TABS) {
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
// late — or not at all until the tab is visible again. Re-check on visibility
// so the page is correct the moment the user looks at it, not up to a minute
// later.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  const stamp = clockStamp();
  if (stamp === lastTickStamp) return;
  lastTickStamp = stamp;
  onClockChange();
});

renderDataBar();
renderAll();
