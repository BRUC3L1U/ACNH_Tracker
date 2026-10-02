import assert from 'node:assert/strict';

export async function testReviewBrowser(browser) {
  const failures = [];
  async function check(name, run) {
    const page = await browser.page();
    try {
      await page.blockUrls(['*patchwiki.biligame.com*']);
      await page.evaluate(`localStorage.clear(); localStorage.setItem('acnh_ui', JSON.stringify({activeTab:'fish',filters:{fish:{hour:null,hourManual:true}}}))`);
      await page.reload();
      await run(page);
      console.log('PASS ' + name);
    } catch (error) { failures.push(new Error(name + ': ' + error.message)); }
    finally { await page.close(); }
  }

  // Deliver a storage notification between real native mouse down/up events.
  // This makes the cross-page redraw race deterministic without timing sleeps.
  async function refreshDuringClick(page, selector) {
    await page.evaluate(`document.addEventListener('mousedown', () => {
      localStorage.setItem('acnh_collected', '["fish_080"]');
      dispatchEvent(new StorageEvent('storage', {key:'acnh_collected',storageArea:localStorage}));
    }, {once:true});`);
    await page.click(selector);
  }

  await check('collection click survives a cross-page refresh during the pointer gesture', async page => {
    await refreshDuringClick(page, '[data-id="fish_001"] .check-box');
    await page.waitFor('JSON.parse(localStorage.getItem("acnh_collected")).includes("fish_001")');
    assert.deepEqual((await page.evaluate('JSON.parse(localStorage.getItem("acnh_collected"))')).sort(), ['fish_001', 'fish_080']);
  });

  await check('sort click survives a cross-page refresh during the pointer gesture', async page => {
    await refreshDuringClick(page, '[data-sort="name"]');
    assert.equal(await page.evaluate('document.querySelector("[data-sort=name]").getAttribute("aria-pressed")'), 'true');
  });

  await check('today toggle survives a cross-page refresh during the pointer gesture', async page => {
    await refreshDuringClick(page, '#todayHeader');
    assert.equal(await page.evaluate('document.querySelector("#todayHeader").getAttribute("aria-expanded")'), 'true');
  });

  await check('backup menu and selected file input survive cross-page refreshes', async page => {
    await page.evaluate('window.originalImportInput = document.querySelector("#importFile")');
    await refreshDuringClick(page, '#backupToggle');
    assert.equal(await page.evaluate('document.querySelector("#backupMenu").open'), true);
    assert.equal(await page.evaluate('document.querySelector("#importFile") === window.originalImportInput'), true);
  });

  await check('storage read failure keeps an operable keyboard focus and recovery imports work', async page => {
    await page.evaluate(`document.querySelector('#collected-fish_001').focus();
      localStorage.setItem('acnh_collected', 'broken');
      dispatchEvent(new StorageEvent('storage', {key:'acnh_collected',storageArea:localStorage}));`);
    assert.equal(await page.evaluate('document.activeElement.id'), 'filterToggle');
    assert.equal(await page.evaluate('document.querySelector("#exportBtn").disabled'), true);
    assert.equal(await page.evaluate('document.querySelectorAll(".creature-checkbox:not(:disabled)").length'), 0);
    await page.evaluate(`const transfer = new DataTransfer();
      transfer.items.add(new File(['{"version":1,"collected":["fish_002"]}'], 'recover.json', {type:'application/json'}));
      const input = document.querySelector('#importFile');
      input.files = transfer.files; input.dispatchEvent(new Event('change', {bubbles:true}));`);
    await page.waitFor('!!document.querySelector(".modal-overlay.show")');
    await page.click('[data-r="ok"]');
    await page.waitFor('!document.querySelector(".modal-overlay") && !document.querySelector("#importBtn").disabled');
    assert.deepEqual(await page.evaluate('JSON.parse(localStorage.getItem("acnh_collected"))'), ['fish_002']);
    assert.equal(await page.evaluate('document.querySelector("#exportBtn").disabled'), false);
    assert.equal(await page.evaluate('document.querySelector("#collected-fish_002").checked'), true);
  });

  await check('phone results leave the focused filter toggle below both navigation rows', async page => {
    for (const width of [320, 375, 760]) {
      await page.setViewport(width, 568);
      await page.click('#filterToggle');
      await page.click('#filterShowResults');
      await page.evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
      const rect = await page.evaluate(`({
        top:document.querySelector('#filterToggle').getBoundingClientRect().top,
        nav:document.querySelector('.navbar').getBoundingClientRect().bottom
      })`);
      assert.ok(rect.top >= rect.nav, JSON.stringify({width, ...rect}));
      assert.equal(await page.evaluate('document.activeElement.id'), 'filterToggle');
    }
  });

  await check('late image failure transfers link focus to retry without stealing it back', async page => {
    for (const moveFocus of [false, true]) {
      await page.evaluate(`(async () => {
        const {createImageFrame} = await import('/image-view.js');
        const frame = createImageFrame('data:image/png;base64,broken', '加载失败的对照图',
          'art-comparison-frame', 'art-image-error', {link:true,width:72,height:72});
        frame.id = 'late-image-error';
        document.querySelector('#listRows').prepend(frame);
        frame.querySelector('a').focus();
        if (${moveFocus}) document.querySelector('#filterToggle').focus();
      })()`);
      await page.waitFor('!!document.querySelector("#late-image-error .image-retry")');
      assert.equal(await page.evaluate(moveFocus
        ? 'document.activeElement.id === "filterToggle"'
        : 'document.activeElement === document.querySelector("#late-image-error .image-retry")'), true);
      await page.evaluate('document.querySelector("#late-image-error").remove()');
    }
  });

  if (failures.length) throw new AggregateError(failures, failures.map(error => error.message).join('\n'));
}
