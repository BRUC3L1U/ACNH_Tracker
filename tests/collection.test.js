import assert from 'node:assert/strict';
import test from 'node:test';
import { createSafeStorage } from '../core.js';
import { createCollectionController } from '../collection.js';

function setup(raw = '[]') {
  const data = new Map([['collected', raw]]);
  let writeError = null;
  let queue = Promise.resolve();
  const storage = createSafeStorage({
    getItem: key => data.get(key) ?? null,
    setItem(key, value) { if (writeError) throw writeError; data.set(key, value); }
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
  return { data, errors, create, failWrites() { writeError = new Error('Quota exceeded'); } };
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
