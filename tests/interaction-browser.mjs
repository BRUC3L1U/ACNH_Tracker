import assert from 'node:assert/strict';

export async function testInteractionBrowser(browser) {
  const failures = [];
  async function check(name, run) {
    const page = await browser.page();
    try {
      await page.evaluate(`localStorage.clear(); localStorage.setItem('acnh_ui', JSON.stringify({activeTab:'fish',filters:{fish:{hour:null,hourManual:true}}}))`);
      await page.reload();
      await run(page);
      console.log('PASS ' + name);
    } catch (error) { failures.push(new Error(name + ': ' + error.message)); }
    finally { await page.close(); }
  }

  await check('cross-tab undo preserves a later uncheck and recheck', async page => {
    const other = await browser.page();
    try {
      await page.click('#markAllVisible');
      await page.waitFor('!!document.querySelector(".toast-action")');
      await other.waitFor('document.querySelectorAll(".creature-checkbox:checked").length === 80');
      const id = await other.evaluate('document.querySelector(".creature-checkbox").dataset.id');
      await other.click('.creature-item .check-box');
      await other.waitFor('!document.querySelector(".creature-checkbox").checked');
      await other.click('.creature-item .check-box');
      await other.waitFor('document.querySelector(".creature-checkbox").checked');
      await page.click('.toast-action');
      await page.waitFor('JSON.parse(localStorage.getItem("acnh_collected")).length === 1');
      assert.deepEqual(await page.evaluate('JSON.parse(localStorage.getItem("acnh_collected"))'), [id]);
      await other.waitFor('document.querySelectorAll(".creature-checkbox:checked").length === 1');
    } finally { await other.close(); }
  });

  await check('category navigation returns to the heading after scrolling', async page => {
    await page.setViewport(1280, 800);
    await page.evaluate('window.scrollTo(0,2200)');
    assert.ok(await page.evaluate('scrollY > 1000'));
    await page.click('[data-tab="bug"]');
    assert.equal(await page.evaluate('scrollY'), 0);
    assert.equal(await page.evaluate('document.activeElement.dataset.tab'), 'bug');
  });

  await check('keyboard collection advances through filtered rows and the empty state', async page => {
    await page.click('#filterToggle');
    await page.click('[data-filter="status"][data-value="uncollected"]');
    const ids = await page.evaluate('[...document.querySelectorAll(".creature-checkbox")].slice(0,2).map(el=>el.dataset.id)');
    await page.evaluate('document.querySelector(".creature-checkbox").focus()');
    await page.press('Space');
    await page.waitFor('document.querySelectorAll(".creature-checkbox").length === 79');
    assert.equal(await page.evaluate('document.activeElement.dataset.id'), ids[1]);
    await page.press('Space');
    await page.waitFor('document.querySelectorAll(".creature-checkbox").length === 78');
    assert.ok((await page.evaluate('JSON.parse(localStorage.getItem("acnh_collected"))')).includes(ids[1]));
    await page.click('#markAllVisible');
    await page.waitFor('!!document.querySelector(".empty-state")');
    assert.notEqual(await page.evaluate('document.activeElement.tagName'), 'BODY');
  });

  await check('expired undo is hidden from keyboard navigation', async page => {
    await page.click('#markAllVisible');
    await page.waitFor('!!document.querySelector(".toast-action")');
    await page.evaluate('document.querySelector(".toast-action").focus()');
    await new Promise(resolve => setTimeout(resolve, 6200));
    assert.equal(await page.evaluate('!!document.querySelector(".toast-action")'), false);
    assert.equal(await page.evaluate('document.activeElement.id'), 'markAllVisible');
  });

  await check('phone first screen shows a collection row and visible filter controls work', async page => {
    for (const [width, height] of [[375,812],[320,568]]) {
      await page.setViewport(width, height);
      await page.evaluate('window.scrollTo(0,0)');
      const top = await page.evaluate('document.querySelector(".creature-item").getBoundingClientRect().top');
      assert.ok(top < height - 80, `${width}px first row starts at ${top}`);
      await page.click('#filterToggle');
      await page.click('[data-filter="month"][data-value="1"]');
      assert.ok(await page.evaluate('document.querySelectorAll(".creature-item").length > 0'));
      assert.match(await page.evaluate('document.querySelector("#filterSummary").textContent'), /1月/);
      assert.equal(await page.evaluate('document.documentElement.scrollWidth > innerWidth'), false);
      await page.click('#filterReset');
      await page.click('#filterToggle');
    }
  });

  await check('month range is available without relying on color', async page => {
    const months = await page.evaluate('document.querySelector("[data-id=fish_001] .month-description")?.textContent');
    assert.match(months || '', /出现月份.*1.*2.*3.*11.*12/);
    assert.equal(await page.evaluate('document.querySelector("[data-id=fish_001] .heat-cell").getAttribute("aria-hidden")'), 'true');
  });

  for (const tab of ['fish', 'art']) {
    await check(tab + ' image retry and reconnect preserve collection state', async page => {
      await page.blockUrls(['https://patchwiki.biligame.com/*']);
      await page.reload();
      await page.click('[data-tab="'+tab+'"]');
      await page.waitFor('!!document.querySelector(".image-retry")');
      assert.equal(await page.evaluate('document.querySelector(".image-retry").closest("label,a")'), null);
      const before = await page.evaluate('localStorage.getItem("acnh_collected")');
      await page.mockImages();
      await page.blockUrls([]);
      await page.click('.image-retry');
      await page.waitFor('document.querySelector(".creature-item img")?.naturalWidth > 0');
      assert.equal(await page.evaluate('localStorage.getItem("acnh_collected")'), before);
      await page.evaluate('window.dispatchEvent(new Event("online"))');
      await page.waitFor('!document.querySelector("[data-image-failed]")');
      assert.ok(await page.evaluate('document.querySelectorAll(".creature-item img").length > 1'));
      assert.equal(await page.evaluate('localStorage.getItem("acnh_collected")'), before);
      await page.click('.creature-item img');
      await page.waitFor('document.querySelector(".creature-checkbox").checked');
    });
  }

  await check('all phone categories, expanded filters and import dialog remain usable', async page => {
    for (const width of [320,375]) {
      await page.setViewport(width, 812);
      for (const tab of ['fish','bug','sea','art']) {
        await page.click('[data-tab="'+tab+'"]');
        await page.click('#filterToggle');
        assert.equal(await page.evaluate('document.querySelector("#filterToggle").getAttribute("aria-expanded")'), 'true');
        assert.equal(await page.evaluate('document.documentElement.scrollWidth > innerWidth'), false);
        await page.click('[data-filter="status"][data-value="collected"]');
        assert.ok(await page.evaluate('!!document.querySelector(".empty-state")'));
        await page.click('[data-filter="status"][data-value="all"]');
        await page.click('#filterToggle');
        assert.ok(await page.evaluate('document.querySelectorAll(".creature-item").length > 0'));
      }
      await page.click('.art-item .check-box');
      await page.waitFor('document.querySelector(".art-item input").checked');
      await page.click('#backupMenu summary');
      await page.evaluate(`(() => {
        const input = document.querySelector('#importFile');
        const transfer = new DataTransfer();
        transfer.items.add(new File(['{"version":1,"collected":[]}'], 'empty.json', {type:'application/json'}));
        input.files = transfer.files; input.dispatchEvent(new Event('change',{bubbles:true}));
      })()`);
      await page.waitFor('!!document.querySelector(".modal-overlay.show")');
      assert.equal(await page.evaluate('document.documentElement.scrollWidth > innerWidth'), false);
      await page.press('Tab');
      assert.equal(await page.evaluate('document.activeElement.dataset.r'), 'cancel');
      await page.press('Enter');
      await page.waitFor('!document.querySelector(".modal-overlay")');
      assert.equal(await page.evaluate('document.querySelector(".art-item input").checked'), true);
      await page.click('.art-item .check-box');
      await page.waitFor('!document.querySelector(".art-item input").checked');
      await page.click('#backupMenu summary');
    }
  });

  if (failures.length) throw new AggregateError(failures, failures.map(e=>e.message).join('\n'));
}
