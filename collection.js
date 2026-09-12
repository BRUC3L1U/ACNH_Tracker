import { normalizeCollected, setCollectedForIds, undoCollectedChanges } from './core.js';

// All collection writers share one origin-scoped lock. Read inside the lock,
// then apply the user's operation to that fresh snapshot, never to a stale tab.
export function createCollectionController({ storage, key, knownIds, locks, readLegacy, clearLegacy, onChange, onError }) {
  let collected = new Set();
  let loadFailed = false;
  let snapshot = null;
  let error = null;
  const revisionKey = key + ':revisions';

  function readRevisions() {
    const result = storage.getItem(revisionKey);
    if (!result.ok) throw result.error;
    try {
      const parsed = JSON.parse(result.value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch { return {}; }
  }

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
          const revisionSnapshot = storage.getItem(revisionKey);
          if (!revisionSnapshot.ok) throw revisionSnapshot.error;
          if (result.value !== expected.value || revisionSnapshot.value !== expected.revisions) {
            refresh();
            onError('其他页面已修改收集记录，请重新导入并确认');
            return { ok: false, conflict: true };
          }
          // Recovery imports can replace malformed storage after confirmation.
          latest = new Set();
        } else {
          latest = read().collected;
        }
        const revisions = readRevisions();
        const result = operation(latest, revisions);
        const raw = JSON.stringify([...result.next]);
        const changed = [...knownIds].filter(id => expected !== undefined || latest.has(id) !== result.next.has(id));
        if (changed.length) {
          const revision = crypto.randomUUID();
          const nextRevisions = Object.fromEntries([...knownIds]
            .filter(id => typeof revisions[id] === 'string')
            .map(id => [id, revisions[id]]));
          for (const id of changed) nextRevisions[id] = revision;
          // Invalidate old undo before changing data. If the data write fails,
          // an undo may become stale, but it can never overwrite a later edit.
          // The collection array and exported backup format stay compatible.
          const savedRevisions = storage.setItem(revisionKey, JSON.stringify(nextRevisions));
          if (!savedRevisions.ok) throw savedRevisions.error;
          if (result.changes) result.changes = result.changes.map(change => ({ ...change, revision }));
        }
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
    get snapshot() {
      const revisions = storage.getItem(revisionKey);
      if (!revisions.ok) throw revisions.error;
      return { value: snapshot, revisions: revisions.value };
    },
    get error() { return error; },
    refresh,
    set(ids, add) { return transact(current => setCollectedForIds(current, ids, add)); },
    undo(changes) {
      return transact((current, revisions) => undoCollectedChanges(current,
        changes.filter(change => typeof change.revision === 'string' && revisions[change.id] === change.revision)));
    },
    replace(incoming, expected) { return transact(() => ({ next: new Set(incoming) }), expected); }
  };
}
