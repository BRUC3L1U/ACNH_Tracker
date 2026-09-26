import assert from 'node:assert/strict';

export async function testAuditBrowser(browser) {
  const failures = [];
  async function check(name, run) {
    const page = await browser.page();
    try {
      await page.blockUrls(['https://patchwiki.biligame.com/*']);
      await page.evaluate(`localStorage.clear(); localStorage.setItem('acnh_ui', JSON.stringify({activeTab:'fish',filters:{fish:{hour:null,hourManual:true}}}))`);
      await page.reload();
      await run(page);
      console.log('PASS ' + name);
    } catch (error) { failures.push(new Error(name + ': ' + error.message)); }
    finally { await page.close(); }
  }

  await check('pending checkbox survives sorting, storage refresh and repeated input', async page => {
    await page.evaluate(`window.lockHeld = false;
      window.lockDone = navigator.locks.request('acnh_collected:write', () => new Promise(resolve => {
        window.releaseLock = resolve; window.lockHeld = true;
      })); void 0;`);
    await page.waitFor('window.lockHeld');
    try {
      await page.click('[data-id="fish_001"] .check-box');
      await page.click('[data-sort="name"]');
      assert.equal(await page.evaluate('document.querySelector("#collected-fish_001").checked'), true);
      assert.equal(await page.evaluate('document.querySelector("#collected-fish_001").closest(".creature-item").getAttribute("aria-busy")'), 'true');
      assert.equal(await page.evaluate('document.querySelector("#exportBtn").disabled'), true);
      // Simulate a previously queued storage event while our write is waiting.
      await page.evaluate(`localStorage.setItem('acnh_collected','["fish_002"]');
        dispatchEvent(new StorageEvent('storage',{key:'acnh_collected',storageArea:localStorage}));`);
      assert.equal(await page.evaluate('document.querySelector("#collected-fish_001").checked'), true);
      await page.click('[data-id="fish_001"] .check-box');
      await page.click('[data-sort="price"]');
      assert.equal(await page.evaluate('document.querySelector("#collected-fish_001").checked'), false);
    } finally { await page.evaluate('window.releaseLock(); window.lockDone'); }
    await page.waitFor('!document.querySelector("#exportBtn").disabled');
    assert.deepEqual(await page.evaluate('JSON.parse(localStorage.getItem("acnh_collected"))'), ['fish_002']);
    assert.equal(await page.evaluate('document.querySelector("#collected-fish_001").checked'), false);
  });

  await check('automatic image retry keeps keyboard focus', async page => {
    await page.waitFor('!!document.querySelector("[data-id=fish_001] .image-retry")');
    await page.evaluate('document.querySelector("[data-id=fish_001] .image-retry").focus()');
    await page.mockImages();
    await page.blockUrls([]);
    await page.evaluate('dispatchEvent(new Event("online"))');
    await page.waitFor('document.querySelector("[data-id=fish_001] img")?.naturalWidth > 0');
    assert.equal(await page.evaluate('document.activeElement === document.querySelector("[data-id=fish_001] .creature-thumbnail")'), true);
  });

  await check('newer catalogue records survive import, edits and export without inflating progress', async page => {
    await page.click('#backupMenu summary');
    await page.evaluate(`(() => {
      const input = document.querySelector('#importFile');
      const transfer = new DataTransfer();
      transfer.items.add(new File(['{"version":1,"collected":["fish_001","future_001"]}'], 'future.json', {type:'application/json'}));
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', {bubbles:true}));
    })()`);
    await page.waitFor('document.querySelector("#toast")?.textContent.includes("尚未收录，已保留")');
    assert.match(await page.evaluate('document.querySelector("#progressSection").textContent'), /1 \/ 243/);
    await page.click('[data-id="fish_002"] .check-box');
    await page.waitFor('JSON.parse(localStorage.getItem("acnh_collected")).length === 3');
    await page.waitFor('!document.querySelector("#exportBtn").disabled');
    await page.evaluate(`window.exportCapture = {create:URL.createObjectURL, click:HTMLAnchorElement.prototype.click};
      URL.createObjectURL = blob => {window.exportCapture.text = blob.text(); return window.exportCapture.create(blob);};
      HTMLAnchorElement.prototype.click = function() {};`);
    await page.click('#exportBtn');
    const exported = await page.evaluate(`(async () => {
      URL.createObjectURL = window.exportCapture.create;
      HTMLAnchorElement.prototype.click = window.exportCapture.click;
      return JSON.parse(await window.exportCapture.text);
    })()`);
    assert.deepEqual(exported.collected, ['fish_001','future_001','fish_002']);
  });

  await check('seasonal hours update filters, cached labels and the today panel together', async page => {
    await page.click('#filterToggle');
    await page.click('[data-filter="month"][data-value="3"]');
    assert.equal(await page.evaluate('document.querySelector("[data-id=fish_027] .meta-hours").textContent'), '16:00–次日09:00');
    await page.click('[data-filter="hour"][data-value="12"]');
    assert.equal(await page.evaluate('document.querySelector("[data-id=fish_027]")'), null);
    assert.equal(await page.evaluate('document.querySelector("[data-id=fish_028]")'), null);
    await page.click('[data-filter="month"][data-value="9"]');
    assert.equal(await page.evaluate('document.querySelector("[data-id=fish_027] .meta-hours").textContent'), '全天');
    assert.equal(await page.evaluate('document.querySelector("[data-id=fish_028] .meta-hours").textContent'), '全天');
    await page.click('[data-filter="hour"][data-value="all"]');
    assert.ok(await page.evaluate('!!document.querySelector("[data-id=fish_028]")'));
    await page.click('#filterBar [data-hemi="south"]');
    assert.equal(await page.evaluate('document.querySelector("[data-id=fish_028]")'), null);
    await page.click('[data-filter="month"][data-value="3"]');
    assert.ok(await page.evaluate('!!document.querySelector("[data-id=fish_028]")'));
    // Clear the month to show all seasonal ranges, shifted for the hemisphere.
    await page.click('[data-filter="month"][data-value="3"]');
    assert.equal(await page.evaluate('document.querySelector("[data-id=fish_028] .meta-hours").textContent'),
      '9、10、11、12月：16:00–次日09:00；3、4、5月：全天');
    await page.click('#filterShowResults');
    for (const month of [3, 9]) {
      await page.evaluate(`window.NativeDate ||= Date;
        window.Date = class extends window.NativeDate { constructor(...args) { super(...(args.length ? args : [2026, ${month - 1}, 15, 12])); } };
        Object.defineProperty(document, 'visibilityState', {value:'visible',configurable:true});
        document.dispatchEvent(new Event('visibilitychange'));`);
      // Southern March is autumn (all day); southern September is spring.
      assert.equal(await page.evaluate('document.querySelector("#todayGroup-fish").textContent.includes("樱花钩吻鲑")'), month === 3);
      assert.equal(await page.evaluate('document.querySelector("#todayGroup-fish").textContent.includes("花羔红点鲑")'), month === 3);
    }
    await page.evaluate('window.Date = window.NativeDate');
    await page.setViewport(320, 568);
    assert.equal(await page.evaluate('document.documentElement.scrollWidth > innerWidth'), false);
  });

  for (const control of ['summary', '.art-source-link']) {
    await check('removed art ' + control + ' moves focus to a neighbour and then the filter', async page => {
      await page.click('[data-tab="art"]');
      await page.click('#filterToggle');
      await page.click('[data-filter="status"][data-value="uncollected"]');
      await page.click('[data-id="art_001"] summary');
      await page.evaluate(`document.querySelector('[data-id="art_001"] ${control}').focus()`);
      const other = await browser.page();
      try {
        await other.click('[data-id="art_001"] .check-box');
        await page.waitFor('!document.querySelector("[data-id=art_001]")');
        assert.equal(await page.evaluate('document.activeElement.id'), 'collected-art_002');
        await page.click('[data-id="art_002"] summary');
        await page.evaluate(`document.querySelector('[data-id="art_002"] ${control}').focus()`);
        await other.click('#markAllVisible');
        await page.waitFor('!!document.querySelector(".empty-state")');
        assert.equal(await page.evaluate('document.activeElement.id'), 'filterToggle');
      } finally { await other.close(); }
    });
  }
  if (failures.length) throw new AggregateError(failures, failures.map(error => error.message).join('\n'));
}
