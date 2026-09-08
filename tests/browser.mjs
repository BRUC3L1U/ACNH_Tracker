import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launchBrowser } from './helpers/browser.mjs';

const root = fileURLToPath(new URL('../', import.meta.url)).replace(/\/$/, '');
const browser = await launchBrowser(root);
try {
  const a = await browser.page();
  await a.evaluate('localStorage.clear()');
  await a.reload();
  await a.evaluate(`document.querySelector('[data-filter="hour"][data-value="none"]').click()`);
  const b = await browser.page();
  const ids = await a.evaluate('[...document.querySelectorAll(".creature-checkbox")].slice(0,2).map(x=>x.dataset.id)');
  assert.equal(ids.length, 2);
  const click = id => 'document.querySelector(\'.creature-checkbox[data-id="' + id + '"]\').click()';
  await Promise.all([a.evaluate(click(ids[0])), b.evaluate(click(ids[1]))]);
  await a.waitFor('JSON.parse(localStorage.getItem("acnh_collected") || "[]").length === 2');
  await a.waitFor('document.querySelectorAll(".creature-checkbox:checked").length === 2');
  await b.waitFor('document.querySelectorAll(".creature-checkbox:checked").length === 2');
  await a.reload();
  assert.equal(await a.evaluate('document.querySelectorAll(".creature-checkbox:checked").length'), 2);
  console.log('PASS simultaneous tabs, live synchronization and reload persistence');

  const stored = page => page.evaluate('JSON.parse(localStorage.getItem("acnh_collected") || "[]").sort()');
  const importFile = async (page, collected) => {
    await page.evaluate('(() => { const input = document.querySelector("#importFile"); const transfer = new DataTransfer(); transfer.items.add(new File([' + JSON.stringify(JSON.stringify({version:1, collected})) + '], "backup.json", {type:"application/json"})); input.files = transfer.files; input.dispatchEvent(new Event("change", {bubbles:true})); })()');
    await page.waitFor('!!document.querySelector(".modal-overlay")');
  };
  const finishImport = page => page.waitFor('!document.querySelector(".modal-overlay") && !document.querySelector("#importBtn").disabled');
  const before = await stored(a);
  await importFile(a, ['fish_001']);
  await a.evaluate(`document.querySelector('[data-r="cancel"]').click()`);
  await finishImport(a);
  assert.deepEqual(await stored(a), before);
  console.log('PASS cancelling import preserves collection');

  await importFile(a, ['fish_001']);
  const third = await b.evaluate('document.querySelectorAll(".creature-checkbox")[2].dataset.id');
  await b.evaluate(click(third));
  await a.waitFor('JSON.parse(localStorage.getItem("acnh_collected")).length === 3');
  await a.evaluate(`document.querySelector('[data-r="ok"]').click()`);
  await finishImport(a);
  assert.deepEqual(await stored(a), [...before, third].sort());
  assert.match(await a.evaluate('document.querySelector("#toast").textContent'), /其他页面已修改/);
  console.log('PASS import refuses to overwrite changes made during confirmation');

  await importFile(a, ['fish_001']);
  await a.evaluate(`document.querySelector('[data-r="ok"]').click()`);
  await finishImport(a);
  assert.deepEqual(await stored(a), ['fish_001']);
  await a.reload();
  assert.deepEqual(await stored(a), ['fish_001']);
  console.log('PASS confirmed import replaces and persists collection');

  await a.evaluate('document.querySelector("#markAllVisible").click()');
  await a.waitFor('!!document.querySelector(".toast-action")');
  assert.ok((await stored(a)).length > 1);
  await a.evaluate('document.querySelector(".toast-action").click()');
  await a.waitFor('JSON.parse(localStorage.getItem("acnh_collected")).length === 1');
  assert.deepEqual(await stored(a), ['fish_001']);
  console.log('PASS bulk undo preserves previously collected items');

  await a.evaluate(`document.querySelector('[data-sort="price"]').focus(); document.activeElement.click()`);
  assert.equal(await a.evaluate('document.activeElement.dataset.sort'), 'price');
  await a.evaluate('document.querySelector(".creature-checkbox").focus(); document.activeElement.click()');
  await a.waitFor('JSON.parse(localStorage.getItem("acnh_collected")).length === 2');
  await a.waitFor('document.activeElement.matches(".creature-checkbox:not(:disabled)")');
  assert.equal(await a.evaluate('document.activeElement.checked'), true);
  console.log('PASS sort and collection edits retain keyboard focus');

  await a.evaluate(`document.querySelector('[data-tab="fish"]').click(); document.querySelector('[data-filter="hour"][data-value="none"]').click()`);
  assert.equal(await a.evaluate(`document.querySelector('.creature-item[data-id="fish_002"] .meta-hours').textContent`), '09:00–17:00');
  console.log('PASS exclusive time boundary rendered in browser');

  const beforeFailure = await stored(a);
  await a.evaluate(`window.originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) { if (key === 'acnh_collected') throw new Error('test write failure'); return window.originalSetItem.call(this, key, value); };
    document.querySelector('.creature-checkbox:not(:checked)').click()`);
  await a.waitFor('document.querySelector("#toast").textContent.includes("test write failure")');
  assert.deepEqual(await stored(a), beforeFailure);
  assert.equal(await a.evaluate('document.querySelectorAll(".creature-checkbox:checked").length'), 1);
  await a.evaluate('Storage.prototype.setItem = window.originalSetItem');
  console.log('PASS failed save restores checkbox and preserves records');


  const filePage = await browser.page(pathToFileURL(root + '/index.html').href);
  assert.match(await filePage.evaluate('document.querySelector("#storageModeNote").textContent'), /HTTP/);
  assert.equal(await filePage.evaluate('typeof navigator.locks.request'), 'function');
  await filePage.evaluate('document.querySelector(".creature-checkbox").click()');
  await filePage.waitFor('JSON.parse(localStorage.getItem("acnh_collected") || "[]").length === 1');
  await filePage.reload();
  assert.equal(await filePage.evaluate('document.querySelectorAll(".creature-checkbox:checked").length'), 1);
  console.log('PASS direct file opening, safe saving and reload persistence');
} finally { await browser.close(); }
