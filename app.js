const TAB_NAMES = { bug: '虫', fish: '鱼', sea: '海洋生物' };

const state = {
  activeTab: 'bug',
  hemisphere: localStorage.getItem('acnh_hemisphere') === 'south' ? 'south' : 'north',
  collected: loadCollected(),
  filters: {
    fish: { location:[], shadowSize:[], month:null, hour:null, status:'all', search:'' },
    bug:  { location:[], weather:[], month:null, hour:null, status:'all', search:'' },
    sea:  { shadowSize:[], month:null, hour:null, status:'all', search:'' }
  },
  sort: { key: null, dir: 'asc' },
  todayOpen: false,
  filterOpen: false
};

function loadCollected() {
  try {
    const s = localStorage.getItem('acnh_collected');
    if (s) return new Set(JSON.parse(s));
  } catch {}
  // Migrate from the legacy cookie (one-time), then clear it.
  const m = document.cookie.split(';').find(c => c.trim().startsWith('acnh_collected='));
  if (m) {
    try {
      const arr = JSON.parse(decodeURIComponent(m.split('=').slice(1).join('=')));
      const set = new Set(arr);
      try { localStorage.setItem('acnh_collected', JSON.stringify(arr)); } catch {}
      document.cookie = 'acnh_collected=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax';
      return set;
    } catch {}
  }
  return new Set();
}

function saveCollected() {
  try { localStorage.setItem('acnh_collected', JSON.stringify([...state.collected])); } catch {}
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
      state.collected = new Set(arr);
      saveCollected();
      renderAll();
      alert('导入成功，共 ' + state.collected.size + ' 条记录');
    } catch (err) {
      alert('导入失败：' + err.message);
    }
    e.target.value = '';
  };
  reader.readAsText(file);
}

function saveHemisphere() {
  try { localStorage.setItem('acnh_hemisphere', state.hemisphere); } catch {}
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
  const nextMonth = month === 12 ? 1 : month + 1;
  const months = state.hemisphere === 'north' ? item.northMonths : item.southMonths;
  return months.includes(month) && !months.includes(nextMonth);
}

function getTimeRangeLabel(hours) {
  if (hours.length === 24) return '全天';
  var r = [];
  var s = hours[0], e = hours[0];
  for (var i = 1; i < hours.length; i++) {
    if (hours[i] === e + 1) { e = hours[i]; }
    else { r.push(s === e ? s + '时' : s + '-' + e + '时'); s = hours[i]; e = hours[i]; }
  }
  r.push(s === e ? s + '时' : s + '-' + e + '时');
  return r.join(' / ');
}

function applyFilters(data, tab) {
  let items = [...data];
  const f = state.filters[tab];

  if (f.search) {
    const s = f.search.toLowerCase();
    items = items.filter(x => x.name.toLowerCase().includes(s));
  }

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
      items = items.filter(x => x.hours.length === 24);
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
      if (sk === 'rarity') {
        const ma = state.hemisphere==='north'?a.northMonths.length:a.southMonths.length;
        const mb = state.hemisphere==='north'?b.northMonths.length:b.southMonths.length;
        return sd * (ma - mb);
      }
      return 0;
    });
  }

  return items;
}

function renderNavTabs() {
  document.getElementById('navTabs').innerHTML = ['bug','fish','sea'].map(t =>
    '<button class="nav-tab' + (state.activeTab===t?' active':'') + '" data-tab="'+t+'">' + TAB_NAMES[t] + '</button>'
  ).join('');
}

function renderProgress() {
  const data = DATA_MAP[state.activeTab];
  const total = data.length;
  const collected = data.filter(x => state.collected.has(x.id)).length;
  const pct = total > 0 ? (collected/total*100).toFixed(1) : 0;
  document.getElementById('progressSection').innerHTML =
    '<div class="progress-text"><span class="progress-label">'+TAB_NAMES[state.activeTab]+' 收集进度</span><span class="progress-pct">已收集 '+collected+' / '+total+' （'+pct+'%）</span></div>' +
    '<div class="progress-bar"><div class="progress-fill" style="width:'+pct+'%"></div></div>';
}

function renderTodayPanel() {
  const now = getLocalTime();
  const hour = now.getHours();
  const monStr = now.getFullYear()+'年'+(now.getMonth()+1)+'月'+now.getDate()+'日';

  const allData = [
    ...FISH_DATA.map(x => ({...x,type:'fish'})),
    ...BUG_DATA.map(x => ({...x,type:'bug'})),
    ...SEA_DATA.map(x => ({...x,type:'sea'}))
  ];

  const nowAvailable = allData.filter(x => isAvailableNow(x));
  const byType = {
    fish: nowAvailable.filter(x => x.type==='fish'),
    bug: nowAvailable.filter(x => x.type==='bug'),
    sea: nowAvailable.filter(x => x.type==='sea')
  };

  let html = '<div class="today-header'+(state.todayOpen?' open':'')+'" id="todayHeader"><h3><span class="arrow">▶</span> 今日可捕捉 （'+monStr+' '+hour+'时）</h3><span style="font-size:13px;color:var(--color-text-muted)">'+nowAvailable.length+' 种生物可捕捉</span></div>';
  html += '<div class="today-body'+(state.todayOpen?' open':'')+'">';
  html += '<div class="today-info"><span>当前半球：</span><button class="hemi-btn'+(state.hemisphere==='north'?' active':'')+'" id="hemiNorth">北半球</button><button class="hemi-btn'+(state.hemisphere==='south'?' active':'')+'" id="hemiSouth">南半球</button><span style="color:var(--color-text-muted);font-size:12px">（可切换）</span></div>';

  for (const t of ['fish','bug','sea']) {
    const items = byType[t];
    html += '<h4>'+TAB_NAMES[t]+' （'+items.length+'）</h4>';
    if (items.length === 0) {
      html += '<div class="today-item" style="color:var(--color-text-muted)">当前时间没有可捕捉的'+TAB_NAMES[t]+'</div>';
    } else {
      items.forEach(item => {
        const warn = isLeavingNextMonth(item) ? ' <span class="warn">⚠️ 本月即将消失</span>' : '';
        const timeLabel = getTimeRangeLabel(item.hours);
        if (t === 'fish') {
          html += '<div class="today-item"><span style="font-weight:600;min-width:80px">'+item.name+'</span><span class="tag tag-location">'+item.location+'</span><span class="tag tag-shadow">'+item.shadowSize+'</span><span style="font-size:12px;color:var(--color-text-muted)">'+timeLabel+'</span><span style="color:var(--color-accent-warm);font-weight:600;margin-left:auto">'+item.price+' 铃钱</span>'+warn+'</div>';
        } else if (t === 'bug') {
          html += '<div class="today-item"><span style="font-weight:600;min-width:80px">'+item.name+'</span><span class="tag tag-location">'+item.location+'</span><span style="font-size:12px;color:var(--color-text-muted)">'+timeLabel+'</span><span style="color:var(--color-accent-warm);font-weight:600;margin-left:auto">'+item.price+' 铃钱</span>'+warn+'</div>';
        } else {
          html += '<div class="today-item"><span style="font-weight:600;min-width:80px">'+item.name+'</span><span class="tag tag-shadow">'+item.shadowSize+'</span><span style="font-size:12px;color:var(--color-text-muted)">'+timeLabel+'</span><span style="color:var(--color-accent-warm);font-weight:600;margin-left:auto">'+item.price+' 铃钱</span>'+warn+'</div>';
        }
      });
    }
  }
  html += '</div>';

  document.getElementById('todayPanel').innerHTML = html;

  document.getElementById('todayHeader').addEventListener('click', () => {
    state.todayOpen = !state.todayOpen;
    renderTodayPanel();
  });
  document.getElementById('hemiNorth').addEventListener('click', () => { state.hemisphere = 'north'; saveHemisphere(); renderAll(); });
  document.getElementById('hemiSouth').addEventListener('click', () => { state.hemisphere = 'south'; saveHemisphere(); renderAll(); });
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
  html += '<button class="filter-btn'+(state.hemisphere==='north'?' active':'')+'" data-hemi="north">北半球</button>';
  html += '<button class="filter-btn'+(state.hemisphere==='south'?' active':'')+'" data-hemi="south">南半球</button>';
  html += '</div></div>';

  html += '<div class="filter-row"><span class="filter-label">收集状态</span><div class="filter-options">';
  for (const [val,label] of [['all','全部'],['uncollected','未收集'],['collected','已收集']]) {
    html += '<button class="filter-btn'+(f.status===val?' active':'')+'" data-filter="status" data-value="'+val+'">'+label+'</button>';
  }
  html += '</div></div>';

  if (tab === 'fish' || tab === 'bug') {
    html += '<div class="filter-row"><span class="filter-label">出现场所</span><div class="filter-options">';
    locations.forEach(loc => {
      html += '<button class="filter-btn'+(f.location.includes(loc)?' active':'')+'" data-filter="location" data-value="'+loc.replace(/"/g,'&quot;')+'">'+loc+'</button>';
    });
    html += '</div></div>';
  }

  if (tab !== 'bug') {
    html += '<div class="filter-row"><span class="filter-label">'+(tab==='sea'?'影子大小':'鱼影尺寸')+'</span><div class="filter-options">';
    shadows.forEach(s => {
      html += '<button class="filter-btn'+(f.shadowSize.includes(s)?' active':'')+'" data-filter="shadowSize" data-value="'+s+'">'+s+'</button>';
    });
    html += '</div></div>';
  }

  if (tab === 'bug') {
    html += '<div class="filter-row"><span class="filter-label">天气条件</span><div class="filter-options">';
    weathers.forEach(w => {
      html += '<button class="filter-btn'+(f.weather.includes(w)?' active':'')+'" data-filter="weather" data-value="'+w+'">'+w+'</button>';
    });
    html += '</div></div>';
  }

  html += '<div class="filter-row"><span class="filter-label">出现月份</span><div class="filter-options" id="monthGrid">';
  const curMon = getLocalTime().getMonth() + 1;
  for (let m = 1; m <= 12; m++) {
    html += '<button class="filter-btn month-grid'+(f.month===m?' active':'')+(m===curMon?' month-current':'')+'" data-filter="month" data-value="'+m+'">'+m+'</button>';
  }
  html += '</div></div>';

  html += '<div class="filter-row"><span class="filter-label">出现时间</span><div class="filter-options" id="hourGrid">';
  const curHr = getLocalTime().getHours();
  html += '<button class="filter-btn'+(f.hour==='all'?' active':'')+'" data-filter="hour" data-value="all">全天</button>';
  for (let h = 0; h < 24; h++) {
    html += '<button class="filter-btn'+(f.hour===h?' active':'')+(h===curHr?' month-current':'')+'" data-filter="hour" data-value="'+h+'">'+h+'</button>';
  }
  html += '</div></div>';

  html += '<div class="filter-row"><span class="filter-label">搜索</span>';
  html += '<input class="filter-search" id="filterSearch" type="text" placeholder="按名称模糊搜索..." value="'+f.search.replace(/"/g,'&quot;')+'">';
  html += '<button class="filter-reset" id="filterReset">重置全部</button>';
  html += '</div></div>';

  document.getElementById('filterBar').innerHTML = html;

  document.getElementById('filterToggle').addEventListener('click', () => {
    state.filterOpen = !state.filterOpen;
    renderFilters();
  });

  document.querySelectorAll('#filterBar .filter-btn[data-hemi]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.hemisphere = btn.dataset.hemi;
      saveHemisphere();
      renderAll();
    });
  });

  document.querySelectorAll('#filterBar .filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      const value = btn.dataset.value;
      if (filter === 'status') {
        state.filters[tab].status = value;
      } else if (filter === 'location') {
        const arr = state.filters[tab].location;
        const idx = arr.indexOf(value);
        idx >= 0 ? arr.splice(idx,1) : arr.push(value);
      } else if (filter === 'shadowSize') {
        const arr = state.filters[tab].shadowSize;
        const idx = arr.indexOf(value);
        idx >= 0 ? arr.splice(idx,1) : arr.push(value);
      } else if (filter === 'weather') {
        const arr = state.filters[tab].weather;
        const idx = arr.indexOf(value);
        idx >= 0 ? arr.splice(idx,1) : arr.push(value);
      } else if (filter === 'month') {
        state.filters[tab].month = state.filters[tab].month === parseInt(value) ? null : parseInt(value);
      } else if (filter === 'hour') {
        if (value === 'all') {
          state.filters[tab].hour = state.filters[tab].hour === 'all' ? null : 'all';
        } else {
          state.filters[tab].hour = state.filters[tab].hour === parseInt(value) ? null : parseInt(value);
        }
      }
      renderFilters();
      renderList();
    });
  });

  document.getElementById('filterSearch').addEventListener('input', function() {
    state.filters[tab].search = this.value;
    renderList();
  });

  document.getElementById('filterReset').addEventListener('click', () => {
    state.filters[tab] = { location:[], shadowSize:[], weather:[], month:null, hour:null, status:'all', search:'' };
    renderFilters();
    renderList();
  });
}

function renderList() {
  const tab = state.activeTab;
  const data = DATA_MAP[tab];
  const filtered = applyFilters(data, tab);

  let html = '<div class="list-header">';
  const sortKeys = [{key:'name',label:'名称'},{key:'price',label:'价格'},{key:'collected',label:'收集'},{key:'rarity',label:'稀有度'}];
  sortKeys.forEach(sk => {
    const arrow = state.sort.key === sk.key ? (state.sort.dir==='asc'?' ▲':' ▼') : '';
    html += '<span class="sortable" data-sort="'+sk.key+'">'+sk.label+'</span><span style="font-size:10px">'+arrow+'</span> ';
  });
  html += '<span style="flex:1"></span>';
  html += '<span style="font-size:12px;color:var(--color-text-muted)">共 '+filtered.length+' 条</span>';
  html += '</div>';

  if (filtered.length === 0) {
    html += '<div class="empty-state">没有符合条件的生物，请调整筛选条件 🔍</div>';
  }

  filtered.forEach(item => {
    const collected = state.collected.has(item.id);
    html += '<div class="creature-item'+(collected?' collected':'')+'" data-id="'+item.id+'">';
    html += '<div class="check-box"></div>';
    html += '<div class="creature-main">';
    html += '<span class="creature-name">'+item.name+'</span>';
    html += '<span class="tag tag-location">'+item.location+'</span>';
    if (item.shadowSize) {
      html += '<span class="tag tag-shadow">'+item.shadowSize+'</span>';
    }
    html += '<span class="tag-price">'+item.price+' 铃钱</span>';
    html += '</div>';

    html += '<div class="creature-meta">';
    html += '<div class="meta-row"><span style="min-width:40px;font-size:11px">月:</span>';
    const months = state.hemisphere === 'north' ? item.northMonths : item.southMonths;
    const curMon = getLocalTime().getMonth() + 1;
    for (let m = 1; m <= 12; m++) {
      html += '<span class="heat-cell'+(months.includes(m)?' on':'')+(m===curMon?' current':'')+'">'+m+'</span>';
    }
    html += '</div>';
    html += '<div class="meta-row"><span style="min-width:40px;font-size:11px">时:</span>';
    const curHr = getLocalTime().getHours();
    for (let h = 0; h < 24; h++) {
      html += '<span class="heat-cell heat-cell-hour'+(item.hours.includes(h)?' on':'')+(h===curHr?' current':'')+'">'+h+'</span>';
    }
    html += '</div></div>';
    html += '</div>';
  });

  document.getElementById('listSection').innerHTML = html;

  document.querySelectorAll('.sortable').forEach(el => {
    el.addEventListener('click', () => {
      const key = el.dataset.sort;
      if (state.sort.key === key) {
        state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sort.key = key;
        state.sort.dir = 'asc';
      }
      renderList();
    });
  });

  document.querySelectorAll('.creature-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      if (state.collected.has(id)) {
        state.collected.delete(id);
        el.classList.remove('collected');
      } else {
        state.collected.add(id);
        el.classList.add('collected');
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
  });
}

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
  renderAll();
});

let lastTickMinute = null;
let lastTickHour = null;
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
  // When the hour rolls over, the list's current-hour highlight goes stale —
  // refresh it too (month boundary handled by getDate in the panel render).
  if (hour !== lastTickHour) {
    lastTickHour = hour;
    renderList();
  }
}, 60000);

renderDataBar();
renderAll();
