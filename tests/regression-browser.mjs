import assert from 'node:assert/strict';

export async function testRegressionBrowser(browser) {
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

  await check('phone navigation receives pointer clicks while the page heading scrolls behind it', async page => {
    for (const width of [320,375]) {
      await page.setViewport(width, 812);
      await page.click('[data-tab="fish"]');
      await page.evaluate('scrollTo(0,60)');
      const point = await page.evaluate(`(() => {
        const r = document.querySelector('[data-tab="art"]').getBoundingClientRect();
        return {x:r.x+r.width/2,y:r.y+r.height/2};
      })()`);
      // Do not scroll the target into view: that concealed the overlapping header.
      await page.clickAt(point.x, point.y);
      assert.equal(await page.evaluate('document.querySelector(".nav-tab.active").dataset.tab'), 'art');
      assert.equal(await page.evaluate('document.querySelector("#backupMenu").open'), false);
    }
  });

  for (const action of ['cancel','ok']) {
    await check('import ' + action + ' returns keyboard focus to the current import button', async page => {
      await page.click('.creature-item .check-box');
      await page.waitFor('JSON.parse(localStorage.getItem("acnh_collected") || "[]").length === 1');
      await page.click('#backupMenu summary');
      await page.click('#importBtn');
      await page.evaluate(`(() => {
        const input = document.querySelector('#importFile');
        const transfer = new DataTransfer();
        transfer.items.add(new File(['{"version":1,"collected":["fish_002"]}'], 'backup.json', {type:'application/json'}));
        input.files = transfer.files; input.dispatchEvent(new Event('change',{bubbles:true}));
      })()`);
      await page.waitFor('!!document.querySelector(".modal-overlay.show")');
      await page.click('[data-r="'+action+'"]');
      await page.waitFor('!document.querySelector(".modal-overlay") && !document.querySelector("#importBtn").disabled');
      assert.equal(await page.evaluate('document.activeElement.id'), 'importBtn');
      await page.press('Tab', 8);
      assert.equal(await page.evaluate('document.activeElement.id'), 'exportBtn');
    });
  }

  await check('cross-tab refresh preserves focus in backup and today controls', async page => {
    const other = await browser.page();
    try {
      await page.click('#todayHeader');
      let checked = 0;
      for (const selector of ['#backupMenu summary','#todayUncollected','#todayPanel [data-group="fish"]','#todayPanel [data-hemi="north"]']) {
        await page.activate();
        await page.evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
        await other.click('.creature-item .check-box');
        checked = 1 - checked;
        await page.waitFor('document.querySelectorAll(".creature-checkbox:checked").length === '+checked);
        assert.equal(await page.evaluate(`document.activeElement.matches(${JSON.stringify(selector)})`), true, selector);
      }
    } finally { await other.close(); }
  });

  await check('undo expiry restores focus after another page rebuilds the list header', async page => {
    const other = await browser.page();
    try {
      await page.click('#markAllVisible');
      await page.waitFor('!!document.querySelector(".toast-action")');
      await page.evaluate('document.querySelector(".toast-action").focus()');
      await other.waitFor('document.querySelectorAll(".creature-checkbox:checked").length === 80');
      await other.click('.creature-item .check-box');
      await page.waitFor('document.querySelectorAll(".creature-checkbox:checked").length === 79');
      await page.activate();
      await new Promise(resolve=>setTimeout(resolve,6200));
      assert.equal(await page.evaluate('document.activeElement.id'), 'markAllVisible');
      assert.equal(await page.evaluate('!!document.querySelector(".toast-action")'), false);
    } finally { await other.close(); }
  });

  await check('phone filter footer closes the panel and returns to results, including empty results', async page => {
    for (const width of [320,375]) {
      await page.setViewport(width,568);
      for (const status of ['all','collected']) {
        await page.click('#filterToggle');
        await page.click('[data-filter="status"][data-value="'+status+'"]');
        await page.click('#filterShowResults');
        assert.equal(await page.evaluate('document.querySelector("#filterToggle").getAttribute("aria-expanded")'), 'false');
        assert.equal(await page.evaluate('document.activeElement.id'), 'filterToggle');
        const rect = await page.evaluate(`(() => {const r=document.querySelector('#listHeader').getBoundingClientRect();return {top:r.top,bottom:r.bottom,nav:document.querySelector('.navbar').getBoundingClientRect().bottom}})()`);
        assert.ok(rect.top >= rect.nav && rect.bottom < 568, JSON.stringify(rect));
        assert.equal(await page.evaluate('document.documentElement.scrollWidth > innerWidth'), false);
      }
    }
  });

  if (failures.length) throw new AggregateError(failures, failures.map(error=>error.message).join('\n'));
}
