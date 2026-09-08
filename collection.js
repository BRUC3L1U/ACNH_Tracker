import { normalizeCollected, setCollectedForIds, undoCollectedChanges } from './core.js';

// All collection writers share one origin-scoped lock. Read inside the lock,
// then apply the user's operation to that fresh snapshot, never to a stale tab.
export function createCollectionController({ storage, key, knownIds, locks, readLegacy, clearLegacy, onChange, onError }) {
  let collected = new Set();
  let loadFailed = false;
  let snapshot = null;
  let error = null;

  function read() {
    const result = storage.getItem(key);
    if (!result.ok) throw result.error;
    const raw = result.value;
    if (raw === null) return { raw, collected: normalizeCollected(readLegacy?.(), knownIds) };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(id => typeof id === 'string')) {
      throw new Error('浏览器中的收集记录格式损坏');
    }
    return { raw, collected: normalizeCollected(parsed, knownIds) };
  }

  function refresh(notify = true) {
    const previousSnapshot = snapshot;
    const previouslyFailed = loadFailed;
    try {
      const latest = read();
      snapshot = latest.raw;
      collected = latest.collected;
      loadFailed = false;
      error = null;
    } catch (cause) {
      const result = storage.getItem(key);
      snapshot = result.ok ? result.value : null;
      loadFailed = true;
      error = cause;
    }
    if (notify && (snapshot !== previousSnapshot || loadFailed !== previouslyFailed)) onChange();
  }

  async function transact(operation, expected) {
    try {
      if (!locks?.request) throw new Error('当前浏览器不支持安全保存，请使用新版 Edge、Chrome 或 Safari，并通过 HTTPS、本地服务或直接打开文件使用');
      return await locks.request(key + ':write', () => {
        let latest;
        if (expected !== undefined) {
          const result = storage.getItem(key);
          if (!result.ok) throw result.error;
          if (result.value !== expected) {
            refresh();
            onError('其他页面已修改收集记录，请重新导入并确认');
            return { ok: false, conflict: true };
          }
          // Recovery imports can replace malformed storage after confirmation.
          latest = new Set();
        } else {
          latest = read().collected;
        }
        const result = operation(latest);
        const raw = JSON.stringify([...result.next]);
        const saved = storage.setItem(key, raw);
        if (!saved.ok) throw saved.error;
        collected = result.next;
        snapshot = raw;
        loadFailed = false;
        error = null;
        try { clearLegacy?.(); } catch {}
        onChange();
        return { ...result, ok: true };
      });
    } catch (cause) {
      refresh(false);
      onChange();
      onError(cause.message || '浏览器阻止了本地存储，当前更改无法保存');
      return { ok: false };
    }
  }

  refresh(false);
  return {
    get collected() { return collected; },
    get loadFailed() { return loadFailed; },
    get snapshot() { return snapshot; },
    get error() { return error; },
    refresh,
    set(ids, add) { return transact(current => setCollectedForIds(current, ids, add)); },
    undo(changes) { return transact(current => undoCollectedChanges(current, changes)); },
    replace(incoming, expected) { return transact(() => ({ next: new Set(incoming) }), expected); }
  };
}
