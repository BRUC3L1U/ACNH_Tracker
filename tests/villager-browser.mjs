import assert from 'node:assert/strict';
import { VILLAGER_DATA } from '../villager-data.js';

export async function testVillagerBrowser(browser) {
  const page = await browser.page();
  await page.blockUrls(['*patchwiki.biligame.com*','*dodo.ac*']);
  await page.evaluate(`localStorage.clear();localStorage.setItem('acnh_collected','["fish_001","art_001","music_107","future_001"]');localStorage.setItem('acnh_ui',JSON.stringify({activeTab:'fish',filters:{fish:{month:9,hour:7,hourManual:true}},sort:{key:'collected',dir:'desc'}}))`);
  await page.reload();
  await page.setViewport(800,493);
  await page.click('[data-tab="villager"]');
  const stored = await page.evaluate('localStorage.getItem("acnh_collected")');
  assert.equal(await page.evaluate('document.querySelectorAll(".villager-item").length'),417);
  assert.deepEqual(await page.evaluate('[...document.querySelectorAll(".villager-english")].map(x=>x.textContent)'),VILLAGER_DATA.map(x=>x.englishName));
  assert.equal(await page.evaluate('document.querySelector("#todayPanel").hidden && document.querySelector("#progressSection").hidden && document.querySelector("#dataBar").hidden'),true);
  assert.equal(await page.evaluate('document.querySelectorAll("#filterBar [data-hemi],#monthGrid,#hourGrid,#listHeader [data-sort=price],#listHeader [data-sort=collected],#filterBar [data-filter=status],.villager-item input,.villager-item label,#markAllVisible,#unmarkAllVisible").length'),0);
  assert.doesNotMatch(await page.evaluate('document.querySelector("#listRows").textContent'),/2\.0|新增|回归/);
  await page.click('.villager-item .creature-name');
  assert.equal(await page.evaluate('localStorage.getItem("acnh_collected")'),stored);
  await page.click('#filterToggle');
  for (const [filter,value] of [['species','猫'],['gender','♂'],['personality','自恋B型'],['birthdayMonth','10月'],['hobby','自然']]) {
    await page.click('[data-filter="'+filter+'"][data-value="'+value+'"]');
  }
  assert.equal(await page.evaluate('document.querySelectorAll(".villager-item").length'),1);
  assert.match(await page.evaluate('document.querySelector(".villager-item").textContent'),/杰克.*Raymond.*10月1日.*严肃/s);
  await page.reload();
  assert.equal(await page.evaluate('document.querySelectorAll(".villager-item").length'),1);
  assert.equal(await page.evaluate('document.querySelector(".villager-english").textContent'),'Raymond');
  await page.waitFor('!!document.querySelector(".villager-portrait .image-retry")');
  await page.click('.villager-portrait .image-retry');
  assert.equal(await page.evaluate('localStorage.getItem("acnh_collected")'),stored);
  await page.click('#filterReset');
  await page.click('[data-filter="collaboration"][data-value="三丽鸥联动"]');
  assert.equal(await page.evaluate('document.querySelectorAll(".villager-item").length'),6);
  await page.click('[data-filter="species"][data-value="狼"]');
  assert.equal(await page.evaluate('!!document.querySelector(".empty-state")'),true);
  await page.click('#filterReset');
  await page.click('[data-filter="collaboration"][data-value="塞尔达传说联动"]');
  assert.equal(await page.evaluate('document.querySelectorAll(".villager-item").length'),2);
  assert.deepEqual((await page.evaluate('[...document.querySelectorAll(".villager-english")].map(x=>x.textContent)')).sort(),['Mineru','Tulin']);
  await page.click('#filterReset');
  await page.click('[data-filter="collaboration"][data-value="斯普拉遁联动"]');
  assert.deepEqual((await page.evaluate('[...document.querySelectorAll(".villager-english")].map(x=>x.textContent)')).sort(),['Cece','Viché']);
  await page.click('#filterReset');
  await page.click('#filterShowResults');
  await page.click('[data-sort="name"]');
  const asc = await page.evaluate('[...document.querySelectorAll(".villager-item")].map(x=>x.dataset.id)');
  await page.click('[data-sort="name"]');
  assert.deepEqual(await page.evaluate('[...document.querySelectorAll(".villager-item")].map(x=>x.dataset.id)'),asc.reverse());
  for (const width of [320,375,768,1280]) {
    await page.setViewport(width);
    await page.click('[data-tab="music"]');
    assert.equal(await page.evaluate('document.querySelector("#progressSection").hidden || document.querySelector("#dataBar").hidden'),false);
    assert.match(await page.evaluate('document.querySelector("#progressSection").textContent'),/3 \/ 350/);
    await page.click('[data-tab="villager"]');
    assert.equal(await page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'),true,'villager overflow '+width);
    assert.equal(await page.evaluate('[...document.querySelectorAll(".nav-tab")].every(x=>{const r=x.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth && r.height>=40})'),true);
    assert.ok(await page.evaluate('document.querySelector(".villager-item").getBoundingClientRect().top < innerHeight'));
    await page.click('#filterToggle');
    assert.equal(await page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'),true,'expanded villager filters '+width);
    await page.click('#filterShowResults');
  }
  await page.evaluate(`window.NativeDate = Date;window.Date = class extends window.NativeDate {constructor(...args){super(...(args.length ? args : ['2026-12-31T23:00:00']));}};Object.defineProperty(document,'visibilityState',{value:'visible',configurable:true});document.dispatchEvent(new Event('visibilitychange'));`);
  assert.equal(await page.evaluate('document.querySelectorAll(".villager-item").length'),417);
  assert.equal(await page.evaluate('localStorage.getItem("acnh_collected")'),stored);
  await page.click('[data-tab="fish"]');
  assert.equal(await page.evaluate('document.querySelector("#todayPanel").hidden'),false);
  assert.equal(await page.evaluate('JSON.parse(localStorage.getItem("acnh_ui")).filters.fish.hour'),7);
  await page.click('[data-tab="villager"]');
  await page.reload();
  assert.equal(await page.evaluate('document.querySelectorAll(".villager-item").length'),417);
  assert.equal(await page.evaluate('document.querySelectorAll(".villager-english").length'),417);
  assert.equal(await page.evaluate('localStorage.getItem("acnh_collected")'),stored);
  await page.close();
  console.log('PASS browse-only villagers: all English names, combined filters, saved filters, name sorting, image retry, responsive navigation and unchanged collection');
}
