import assert from 'node:assert/strict';
import test from 'node:test';
import { createSafeStorage, serializeBackup } from '../core.js';
import { createCollectionController } from '../collection.js';

function setup(raw = '[]') {
  const data = new Map([['collected', raw]]);
  let writeError = null;
  let failedKey;
  let queue = Promise.resolve();
  const storage = createSafeStorage({
    getItem: key => data.get(key) ?? null,
    setItem(key, value) { if (writeError && (!failedKey || failedKey === key)) throw writeError; data.set(key, value); }
  });
  const locks = { request(name, action) {
    const result = queue.then(action);
    queue = result.catch(() => {});
    return result;
  } };
  const errors = [];
  const create = (options = {}) => createCollectionController({
    storage, key: 'collected', knownIds: new Set(['a', 'b', 'c']), locks,
    onChange() {}, onError: error => errors.push(error), ...options
  });
  return { data, errors, create,
    failWrites(key) { writeError = new Error('Quota exceeded'); failedKey = key; },
    allowWrites() { writeError = null; }
  };
}

test('concurrent operations read fresh storage even without storage events', async () => {
  const fixture = setup();
  const a = fixture.create();
  const b = fixture.create();
  await Promise.all([a.set(['a'], true), b.set(['b'], true)]);
  assert.deepEqual(JSON.parse(fixture.data.get('collected')), ['a', 'b']);
  await a.set(['a'], false);
  assert.deepEqual(JSON.parse(fixture.data.get('collected')), ['b']);
  b.refresh();
  assert.deepEqual([...b.collected], ['b']);
});

test('failed writes retain the stored collection and report failure', async () => {
  const fixture = setup('["a"]');
  const collection = fixture.create();
  fixture.failWrites();
  assert.equal((await collection.set(['b'], true)).ok, false);
  assert.deepEqual([...collection.collected], ['a']);
  assert.equal(fixture.data.get('collected'), '["a"]');
  assert.match(fixture.errors[0], /Quota/);
});

test('corruption detected after startup blocks edits and supports explicit recovery', async () => {
  const fixture = setup('["a"]');
  const collection = fixture.create();
  fixture.data.set('collected', 'broken');
  assert.equal((await collection.set(['b'], true)).ok, false);
  assert.equal(collection.loadFailed, true);
  assert.equal(fixture.data.get('collected'), 'broken');
  assert.equal((await collection.replace(new Set(['c']), collection.snapshot)).ok, true);
  assert.equal(collection.loadFailed, false);
  assert.deepEqual([...collection.collected], ['c']);
});

test('import checks the confirmed snapshot inside the write lock', async () => {
  const fixture = setup('["a"]');
  const a = fixture.create();
  const b = fixture.create();
  const expected = a.snapshot;
  await b.set(['b'], true);
  const result = await a.replace(new Set(['c']), expected);
  assert.equal(result.conflict, true);
  assert.deepEqual([...a.collected], ['a', 'b']);
  assert.deepEqual(JSON.parse(fixture.data.get('collected')), ['a', 'b']);
});

test('legacy records are migrated by the first successful locked save', async () => {
  const fixture = setup();
  fixture.data.delete('collected');
  let cleared = false;
  const collection = fixture.create({ readLegacy: () => ['a'], clearLegacy() { cleared = true; } });
  assert.deepEqual([...collection.collected], ['a']);
  assert.equal(cleared, false);
  await collection.set(['b'], true);
  assert.deepEqual(JSON.parse(fixture.data.get('collected')), ['a', 'b']);
  assert.equal(cleared, true);
});

test('without cross-tab locks, unsafe writes are refused', async () => {
  const fixture = setup('["a"]');
  const collection = fixture.create({ locks: undefined });
  assert.equal((await collection.set(['b'], true)).ok, false);
  assert.equal(fixture.data.get('collected'), '["a"]');
  assert.match(fixture.errors[0], /不支持安全保存/);
});

test('bulk undo preserves a later off-on edit from another page', async () => {
  const fixture = setup();
  const a = fixture.create();
  const b = fixture.create();
  const bulk = await a.set(['a', 'b'], true);
  await b.set(['a'], false);
  await b.set(['a'], true);
  const undo = await a.undo(bulk.changes);
  assert.equal(undo.restored, 1);
  assert.deepEqual([...a.collected], ['a']);
});

test('explicit import invalidates earlier undo even when values are unchanged', async () => {
  const fixture = setup();
  const a = fixture.create();
  const bulk = await a.set(['a'], true);
  await a.replace(new Set(['a']), a.snapshot);
  assert.equal((await a.undo(bulk.changes)).restored, 0);
  assert.deepEqual([...a.collected], ['a']);
});

test('revision write failure cannot change collection data', async () => {
  const fixture = setup('["a"]');
  const a = fixture.create();
  fixture.failWrites('collected:revisions');
  assert.equal((await a.set(['b'], true)).ok, false);
  assert.equal(fixture.data.get('collected'), '["a"]');
});

test('failed data write preserves records and safely invalidates stale undo', async () => {
  const fixture = setup();
  const a = fixture.create();
  const bulk = await a.set(['a'], true);
  fixture.failWrites('collected');
  assert.equal((await a.set(['a'], false)).ok, false);
  assert.equal(fixture.data.get('collected'), '["a"]');
  fixture.allowWrites();
  assert.equal((await a.undo(bulk.changes)).restored, 0);
  assert.deepEqual([...a.collected], ['a']);
});

test('import detects off-on edits even when the stored array returns to the same value', async () => {
  const fixture = setup('["a"]');
  const a = fixture.create();
  const b = fixture.create();
  const expected = a.snapshot;
  await b.set(['a'], false);
  await b.set(['a'], true);
  assert.equal((await a.replace(new Set(['b']), expected)).conflict, true);
  assert.deepEqual([...a.collected], ['a']);
});

test('older catalogues preserve unknown records and their undo revisions', async () => {
  const fixture = setup();
  const older = fixture.create({ knownIds: new Set(['a']) });
  const newer = fixture.create();
  const bulk = await newer.set(['b', 'c'], true);
  await older.set(['a'], true);
  assert.deepEqual(JSON.parse(fixture.data.get('collected')), ['b', 'c', 'a']);
  assert.equal(JSON.parse(fixture.data.get('collected:revisions')).b, bulk.changes[0].revision);
  await older.set(['a'], false);
  assert.deepEqual(JSON.parse(fixture.data.get('collected')), ['b', 'c']);
  assert.equal((await newer.undo(bulk.changes)).restored, 2);
  assert.deepEqual(JSON.parse(fixture.data.get('collected')), []);
});

test('pending edits retain the latest intention through refresh and earlier completions', async () => {
  const fixture = setup();
  const waiting = [];
  const collection = fixture.create({ locks: { request: (_, action) => new Promise(resolve => waiting.push(() => resolve(action()))) } });
  const first = collection.set(['a'], true);
  assert.equal(collection.isSaving, true);
  assert.equal(collection.pendingValue('a'), true);
  collection.refresh();
  assert.equal(collection.pendingValue('a'), true);
  const second = collection.set(['a'], false);
  assert.equal(collection.pendingValue('a'), false);
  waiting.shift()();
  await first;
  assert.equal(collection.isSaving, true);
  assert.equal(collection.pendingValue('a'), false);
  waiting.shift()();
  await second;
  assert.equal(collection.isSaving, false);
  assert.equal(collection.pendingValue('a'), undefined);
  assert.deepEqual([...collection.collected], []);
});

test('failed pending saves clear the pending state and restore committed records', async () => {
  const fixture = setup('["a"]');
  const collection = fixture.create();
  fixture.failWrites();
  const save = collection.set(['a'], false);
  assert.equal(collection.pendingValue('a'), false);
  assert.equal((await save).ok, false);
  assert.equal(collection.isSaving, false);
  assert.equal(collection.pendingValue('a'), undefined);
  assert.deepEqual([...collection.collected], ['a']);
});

test('older catalogue imports invalidate undo for records only newer pages recognise', async () => {
  const fixture = setup();
  const newer = fixture.create();
  const older = fixture.create({knownIds:new Set(['a'])});
  const bulk = await newer.set(['b'], true);
  older.refresh();
  assert.equal((await older.replace(new Set(['b']), older.snapshot)).ok, true);
  assert.equal((await newer.undo(bulk.changes)).restored, 0);
  assert.deepEqual(JSON.parse(fixture.data.get('collected')), ['b']);
});

test('edits cannot grow a valid collection beyond the restorable backup size', async () => {
  const overhead = serializeBackup(new Set([''])).length;
  const futureId = 'x'.repeat(64 * 1024 - overhead);
  const raw = JSON.stringify([futureId]);
  const fixture = setup(raw);
  const collection = fixture.create();
  assert.equal((await collection.set(['a'], true)).ok, false);
  assert.equal(fixture.data.get('collected'), raw);
  assert.equal(collection.isSaving, false);
  assert.match(fixture.errors[0], /64 KB/);
});
