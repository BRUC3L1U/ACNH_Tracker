// Compare index.html data against BWIKI saved pages.
// Run: node Wiki/compare.js
const fs = require('fs');
const path = require('path');

const WIKI_DIR = path.join(__dirname);
const INDEX = path.join(__dirname, '..', 'index.html');

// ---- Load data arrays from index.html ----
const html = fs.readFileSync(INDEX, 'utf8');
function extractArr(name) {
  const m = html.match(new RegExp('const ' + name + '=\\[(.+?)\\];const ', 's'));
  if (!m) throw new Error('cannot find ' + name);
  return JSON.parse('[' + m[1] + ']');
}
const FISH = extractArr('FISH_DATA');
const BUG = extractArr('BUG_DATA');
const SEA = extractArr('SEA_DATA');

// ---- Parse a wiki page into rows ----
function parseWiki(file) {
  const h = fs.readFileSync(file, 'utf8');
  const rows = [];
  const trs = [...h.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)];
  for (const tr of trs) {
    const tds = [...tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)];
    if (tds.length < 7) continue;
    const cell = (i) => tds[i][1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const name = cell(0);
    if (!name) continue;
    rows.push({
      name,
      td1: cell(1), td2: cell(2),
      monthsN: cell(3), monthsS: cell(4),
      hoursRaw: cell(5),
      price: cell(6),
    });
  }
  return rows;
}

// parse "12、1、2、3、6、7、8、9" -> sorted Set of ints; also handle param comma form
function parseNums(s) {
  const out = new Set();
  if (!s) return out;
  for (const tok of s.split(/[,，、\s]+/)) {
    const n = parseInt(tok, 10);
    if (!isNaN(n)) out.add(n);
  }
  return out;
}
// wiki hours use 1-24 where 24 == 0 (midnight)
function parseHours(s) {
  const set = new Set();
  if (!s) return set;
  for (const tok of s.split(/[,，、\s]+/)) {
    if (/全天/.test(tok)) continue;
    const n = parseInt(tok, 10);
    if (isNaN(n)) continue;
    set.add(n === 24 ? 0 : n);
  }
  return set;
}

const files = {
  fish: '博物馆图鉴 - 集合啦动物森友会WIKI_BWIKI_哔哩哔哩.html',
  bug: '虫图鉴 - 集合啦动物森友会WIKI_BWIKI_哔哩哔哩.html',
  sea: '海洋生物图鉴 - 集合啦动物森友会WIKI_BWIKI_哔哩哔哩.html',
};

const our = { fish: FISH, bug: BUG, sea: SEA };
let diffs = [];
let missingInWiki = [];
let missingInOurs = [];

for (const tab of ['fish', 'bug', 'sea']) {
  const wiki = parseWiki(path.join(WIKI_DIR, files[tab]));
  const wikiByName = new Map(wiki.map(r => [r.name, r]));
  const ourNames = new Set(our[tab].map(x => x.name));

  // names in wiki not in ours
  for (const r of wiki) if (!ourNames.has(r.name)) missingInOurs.push(`[${tab}] wiki有但index无: ${r.name}`);

  for (const item of our[tab]) {
    const w = wikiByName.get(item.name);
    if (!w) { missingInWiki.push(`[${tab}] index有但wiki无: ${item.name}`); continue; }

    const wN = parseNums(w.monthsN);
    const wS = parseNums(w.monthsS);
    const wH = parseHours(w.hoursRaw);
    const wP = parseInt(w.price, 10);

    const oN = new Set(item.northMonths);
    const oS = new Set(item.southMonths);
    const oH = new Set(item.hours);

    const cmp = (label, a, b) => {
      const sa = [...a].sort((x, y) => x - y), sb = [...b].sort((x, y) => x - y);
      if (sa.join(',') !== sb.join(',')) {
        diffs.push(`[${tab}] ${item.name} ${label}:\n    index=[${sa}]\n    wiki =[${sb}]`);
      }
    };
    cmp('北月份', oN, wN);
    cmp('南月份', oS, wS);
    cmp('小时', oH, wH);
    if (item.price !== wP) diffs.push(`[${tab}] ${item.name} 价格: index=${item.price} wiki=${wP}`);

    // location / shadow / weather field comparisons (best-effort text)
    if (tab === 'fish' || tab === 'sea') {
      if (item.location !== w.td1) diffs.push(`[${tab}] ${item.name} 场所: index="${item.location}" wiki="${w.td1}"`);
      if (item.shadowSize !== w.td2) diffs.push(`[${tab}] ${item.name} 影子: index="${item.shadowSize}" wiki="${w.td2}"`);
    }
    if (tab === 'bug') {
      if (item.location !== w.td1) diffs.push(`[${tab}] ${item.name} 场所: index="${item.location}" wiki="${w.td1}"`);
      // BWIKI leaves the weather cell blank to mean "无限制" (no restriction);
      // treat empty wiki weather as "无限制" rather than a difference.
      const wWeather = w.td2 === '' ? '无限制' : w.td2;
      if (item.weather !== wWeather) diffs.push(`[${tab}] ${item.name} 天气: index="${item.weather}" wiki="${wWeather}"`);
    }
  }
}

console.log('===== 缺失对比 =====');
console.log(missingInOurs.join('\n') || '(无)');
console.log('---');
console.log(missingInWiki.join('\n') || '(无)');
console.log('\n===== 字段差异 =====');
console.log(diffs.join('\n') || '(无)');
console.log(`\n总计: 缺失 ${missingInOurs.length + missingInWiki.length} 条, 字段差异 ${diffs.length} 处`);
