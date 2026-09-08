import assert from 'node:assert/strict';

export async function testArtBrowser(browser) {
  const page = await browser.page();
  // Remote images must not make CI depend on a third party's network uptime.
  await page.blockUrls(['https://patchwiki.biligame.com/*']);
  await page.evaluate(`localStorage.setItem('acnh_collected', '["fish_001","bug_001","sea_001"]');
    localStorage.setItem('acnh_ui', JSON.stringify({activeTab:'fish', filters:{fish:{month:9,hour:7,hourManual:true}}}))`);
  await page.reload();
  await page.evaluate(`document.querySelector('[data-tab="art"]').click()`);
  assert.equal(await page.evaluate('document.querySelectorAll(".art-item").length'), 43);
  assert.equal(await page.evaluate('document.querySelector("#todayPanel").hidden'), true);
  assert.equal(await page.evaluate('document.querySelectorAll("#filterBar [data-hemi], #monthGrid, #hourGrid").length'), 0);
  assert.equal(await page.evaluate('document.querySelectorAll("#listHeader [data-sort=price]").length'), 0);
  assert.match(await page.evaluate('document.querySelector("#progressSection").textContent'), /0 \/ 43/);
  assert.match(await page.evaluate('document.querySelector("#progressSection").textContent'), /3 \/ 243/);
  console.log('PASS art tab migrates existing state and excludes seasonal controls');

  await page.evaluate(`document.querySelector('[data-filter="artType"][data-value="雕塑"]').click()`);
  assert.equal(await page.evaluate('document.querySelectorAll(".art-item").length'), 13);
  await page.evaluate(`document.querySelector('[data-filter="authenticity"][data-value="仅真品"]').click()`);
  assert.equal(await page.evaluate('document.querySelectorAll(".art-item").length'), 2);
  await page.evaluate(`document.querySelector('.art-item input').click()`);
  await page.waitFor('JSON.parse(localStorage.getItem("acnh_collected")).length === 4');
  const saved = await page.evaluate('JSON.parse(localStorage.getItem("acnh_collected")).sort()');
  for (const id of ['fish_001', 'bug_001', 'sea_001']) assert.ok(saved.includes(id));
  await page.reload();
  assert.equal(await page.evaluate('document.querySelectorAll(".art-item").length'), 2);
  assert.equal(await page.evaluate('document.querySelectorAll(".art-item input:checked").length'), 1);
  await page.evaluate(`document.querySelector('[data-filter="status"][data-value="uncollected"]').click()`);
  assert.equal(await page.evaluate('document.querySelectorAll(".art-item").length'), 1);
  await page.evaluate(`document.querySelector('#markAllVisible').click()`);
  await page.waitFor('document.querySelectorAll(".art-item").length === 0 && !!document.querySelector(".toast-action")');
  await page.evaluate(`document.querySelector('.toast-action').click()`);
  await page.waitFor('document.querySelectorAll(".art-item").length === 1');
  assert.deepEqual(await page.evaluate('JSON.parse(localStorage.getItem("acnh_collected")).sort()'), saved);
  console.log('PASS art filters, persistence, filtered bulk actions and undo preserve creature records');

  await page.evaluate(`document.querySelector('#filterReset').click(); document.querySelector('[data-id="art_001"] summary').click()`);
  await page.waitFor('document.querySelectorAll("[data-id=art_001] .art-comparisons figure").length === 2');
  assert.deepEqual(await page.evaluate('JSON.parse(localStorage.getItem("acnh_collected")).sort()'), saved);
  assert.deepEqual(await page.evaluate('[...document.querySelectorAll("[data-id=art_001] figcaption")].map(x=>x.textContent)'), ['真品','赝品']);
  assert.match(await page.evaluate('document.querySelector("[data-id=art_001] .art-clues").textContent'), /咖啡渍/);
  assert.equal(await page.evaluate('document.querySelector("[data-id=art_001] .art-source-link").closest("label")'), null);
  await page.evaluate(`document.querySelector('[data-id="art_001"] input').focus(); document.activeElement.click()`);
  await page.waitFor('JSON.parse(localStorage.getItem("acnh_collected")).includes("art_001")');
  assert.equal(await page.evaluate('document.querySelector("[data-id=art_001] details").open'), true);
  assert.equal(await page.evaluate('document.activeElement.dataset.id'), 'art_001');
  await page.waitFor('!!document.querySelector("[data-id=art_001] .art-image-error")');
  console.log('PASS comparison disclosure never checks an item; details and focus survive edits without images');

  await page.evaluate(`window.NativeDate = Date;
    window.Date = class extends window.NativeDate { constructor(...args) { super(...(args.length ? args : ['2026-12-31T23:00:00'])); } };
    Object.defineProperty(document, 'visibilityState', {value:'visible',configurable:true});
    document.dispatchEvent(new Event('visibilitychange'))`);
  assert.equal(await page.evaluate('document.querySelectorAll(".art-item").length'), 43);
  assert.equal(await page.evaluate('"hour" in JSON.parse(localStorage.getItem("acnh_ui")).filters.art'), false);
  await page.evaluate('window.Date = window.NativeDate');
  await page.evaluate(`document.querySelector('[data-tab="fish"]').click()`);
  assert.equal(await page.evaluate('document.querySelector("#todayPanel").hidden'), false);
  assert.equal(await page.evaluate('document.querySelectorAll(".today-group-header").length'), 3);
  assert.equal(await page.evaluate('document.querySelectorAll(".today-group-header[data-group=art]").length'), 0);
  assert.equal(await page.evaluate('JSON.parse(localStorage.getItem("acnh_ui")).filters.fish.hour'), 7);
  await page.evaluate(`document.querySelector('[data-tab="art"]').click()`);
  console.log('PASS clock updates keep art non-seasonal and creature filters intact');

  const exported = await page.evaluate(`(async () => {
    const create = URL.createObjectURL;
    const click = HTMLAnchorElement.prototype.click;
    let text;
    URL.createObjectURL = blob => { text = blob.text(); return create(blob); };
    HTMLAnchorElement.prototype.click = function() {};
    document.querySelector('#exportBtn').click();
    URL.createObjectURL = create;
    HTMLAnchorElement.prototype.click = click;
    return JSON.parse(await text);
  })()`);
  assert.ok(exported.collected.includes('art_001') && exported.collected.includes('fish_001'));
  await page.evaluate(`(() => {
    const input = document.querySelector('#importFile');
    const data = new DataTransfer();
    data.items.add(new File(['{"version":1,"collected":["art_043","fish_001"]}'], 'mixed.json', {type:'application/json'}));
    input.files = data.files;
    input.dispatchEvent(new Event('change', {bubbles:true}));
  })()`);
  await page.waitFor('!!document.querySelector(".modal-overlay")');
  await page.evaluate(`document.querySelector('[data-r="ok"]').click()`);
  await page.waitFor('!document.querySelector(".modal-overlay") && !document.querySelector("#importBtn").disabled');
  await page.reload();
  assert.deepEqual(await page.evaluate('JSON.parse(localStorage.getItem("acnh_collected"))'), ['art_043','fish_001']);
  assert.equal(await page.evaluate('document.querySelector("[data-id=art_043] input").checked'), true);
  console.log('PASS mixed art and creature records export and import through the real UI');

  await page.evaluate(`document.querySelector('[data-id="art_001"] summary').click()`);
  for (const width of [320, 375, 768, 1280]) {
    await page.setViewport(width);
    const dimensions = await page.evaluate('({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})');
    assert.ok(dimensions.scroll <= dimensions.client, 'Art layout overflows at ' + width);
  }
  console.log('PASS art layout fits mobile and desktop viewports');
  await page.close();
}
