import { monthsForHemisphere } from './schema.js';
import { getCollectionAccess, getTimeRangeLabel } from './core.js';
import { escapeHtml } from './ui.js';
import { buildArtRow } from './art-view.js';
import { createImageFrame } from './image-view.js';

export function createListView({ state, filteredItems, isLoadFailed, sortKeys }) {
  const CONFIG = { MONTHS: 12, SORT_KEYS: sortKeys };
  const getLocalTime = () => new Date();
  // Header and rows live in their own persistent containers so a re-render can
  // replace one without destroying the other.
  document.getElementById('listSection').innerHTML =
    '<div class="list-header" id="listHeader"></div><div id="listRows"></div>';

  // Row elements are cached by creature id and reused across renders. Rebuilding
  // #listSection wholesale meant parsing ~69KB of HTML and constructing every
  // element again for each filter tap; now a re-render only re-orders nodes that
  // already exist. What a row's markup bakes in: the tab, the hemisphere's
  // months, the current-month highlight, is tracked in rowCacheSig, and any
  // change there invalidates the whole cache.
  const rowCache = new Map();
  let rowCacheSig = '';
  // The bulk buttons act on whatever the last render filtered down to, and they
  // are bound once via delegation rather than re-bound per render.
  let lastFiltered = [];

  function buildRow(item, tab, northern, curMon) {
    const checkboxId = 'collected-' + item.id;
    let html = '<input id="'+checkboxId+'" class="creature-checkbox sr-only" type="checkbox" data-id="'+item.id+'" aria-label="'+escapeHtml(item.name)+'" aria-describedby="months-'+item.id+'">'
      + '<label class="collect-toggle" for="'+checkboxId+'"><span class="check-box" aria-hidden="true"></span></label><label class="creature-main" for="'+checkboxId+'">';
    html += '<span class="creature-name">'+escapeHtml(item.name)+'</span>';
    // Sea creatures are all 海洋底部: a tag that never varies is pure noise.
    if (tab !== 'sea') {
      html += '<span class="tag tag-location">'+escapeHtml(item.location)+'</span>';
    }
    if (item.shadowSize) {
      html += '<span class="tag tag-shadow">'+escapeHtml(item.shadowSize)+'</span>';
    }
    // Weather is filterable on the bug tab, so it has to be visible on the row:
    // otherwise a user who filters by 雨天 can't tell why a given row matched.
    if (item.weather && item.weather !== '无限制') {
      html += '<span class="tag tag-weather">'+escapeHtml(item.weather)+'</span>';
    }
    html += '<span class="tag-price">'+item.price+' 铃钱</span>';
    // Capture notes are prose, not a filter dimension; rendered as plain text so
    // they read differently from the tags beside them.
    if (item.note) {
      html += '<span class="note">'+escapeHtml(item.note)+'</span>';
    }
    html += '</label><label class="creature-meta" for="'+checkboxId+'"><span class="meta-row"><span class="meta-label" aria-hidden="true">月:</span>';
    const months = monthsForHemisphere(item, northern ? 'north' : 'south');
    html += '<span class="sr-only month-description" id="months-'+item.id+'">出现月份：'+(months.length === 12 ? '全年' : months.join('、')+'月')+'。</span>';
    for (let m = 1; m <= CONFIG.MONTHS; m++) {
      html += '<span aria-hidden="true" class="heat-cell'+(months.includes(m)?' on':'')+(m===curMon?' current':'')+'">'+m+'</span>';
    }
    // Hour availability as a text range rather than 24 cells per row: the 24-cell
    // grid was ~4800 elements for an 80-row list and dominated both the HTML
    // payload and layout cost.
    html += '</span><span class="meta-row"><span class="meta-label">时:</span><span class="meta-hours">'
      + getTimeRangeLabel(item.hours) + '</span></span></label>';

    const el = document.createElement('div');
    el.className = 'creature-item creature-row';
    el.dataset.id = item.id;
    el.innerHTML = html;
    el.querySelector('.collect-toggle').after(createImageFrame(item.image, item.name,
      'creature-thumbnail', 'creature-image-error', { width: 72, height: 72, labelFor: checkboxId }));
    return el;
  }

  function renderListHeader(count) {
    const editDisabled = getCollectionAccess(isLoadFailed()).canEdit ? '' : ' disabled';
    let html = '';
    CONFIG.SORT_KEYS.filter(sk => state.activeTab !== 'art' || sk.key !== 'price').forEach(sk => {
      const arrow = state.sort.key === sk.key ? (state.sort.dir==='asc'?' ▲':' ▼') : '';
      const active = state.sort.key === sk.key;
      const current = active ? '，当前'+(state.sort.dir==='asc'?'升序':'降序') : '';
      html += '<button type="button" class="sort-btn" data-sort="'+sk.key+'" aria-pressed="'+active+'" aria-label="按'+sk.label+'排序'+current+'">'+sk.label+arrow+'</button>';
    });
    html += '<span style="flex:1"></span>';
    document.getElementById('filterResultCount').textContent = '共 '+count+' 条';
    html += '<span class="bulk-actions"><button type="button" class="data-btn" id="markAllVisible"'+editDisabled+'>全标</button>';
    html += '<button type="button" class="data-btn" id="unmarkAllVisible"'+editDisabled+'>全取消</button></span>';
    document.getElementById('listHeader').innerHTML = html;
  }

  function renderList() {
    const canEdit = getCollectionAccess(isLoadFailed()).canEdit;
    const focusedRowElement = document.getElementById('listRows').contains(document.activeElement) ? document.activeElement : null;
    const focusedId = document.activeElement?.classList.contains('creature-checkbox')
      ? document.activeElement.dataset.id
      : null;
    const focusedSort = document.activeElement?.classList.contains('sort-btn')
      ? document.activeElement.dataset.sort
      : null;
    const focusedAction = document.activeElement?.closest('#listHeader button')?.id;
    const focusedIndex = focusedId ? lastFiltered.findIndex(item => item.id === focusedId) : -1;
    const tab = state.activeTab;
    const filtered = filteredItems(tab);
    lastFiltered = filtered;
    renderListHeader(filtered.length);

    const rows = document.getElementById('listRows');
    if (filtered.length === 0) {
      rows.innerHTML = '<div class="empty-state">没有符合条件的条目，请调整筛选条件 🔍</div>';
      if (focusedSort) document.querySelector('.sort-btn[data-sort="'+focusedSort+'"]')?.focus();
      else if (focusedAction) document.getElementById(focusedAction)?.focus();
      else if (focusedId) document.getElementById('filterToggle').focus();
      return;
    }

    const northern = state.hemisphere === 'north';
    const curMon = getLocalTime().getMonth() + 1;
    const sig = tab === 'art' ? tab : tab + '|' + northern + '|' + curMon;
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
        el = tab === 'art' ? buildArtRow(item) : buildRow(item, tab, northern, curMon);
        rowCache.set(item.id, el);
      }
      const collected = state.collected.has(item.id);
      el.classList.toggle('collected', collected);
      const checkbox = el.querySelector('.creature-checkbox');
      checkbox.checked = collected;
      checkbox.disabled = !canEdit;
      frag.appendChild(el);
    }
    rows.replaceChildren(frag);
    if (focusedId) {
      const next = rows.querySelector('.creature-checkbox[data-id="'+focusedId+'"]')
        || rows.querySelectorAll('.creature-checkbox')[Math.min(Math.max(focusedIndex, 0), filtered.length - 1)];
      next?.focus({ preventScroll: true });
    }
    else if (focusedSort) document.querySelector('.sort-btn[data-sort="'+focusedSort+'"]')?.focus();
    else if (focusedAction) document.getElementById(focusedAction)?.focus({ preventScroll: true });
    else if (focusedRowElement?.isConnected) focusedRowElement.focus();
  }

  return { render: renderList, get filtered() { return lastFiltered; } };
}
