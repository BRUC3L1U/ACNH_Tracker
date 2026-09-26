import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { DATA_MAP } from '../data.js';
import { applyFilters } from '../core.js';

// Reference ranges are transcribed from the New Horizons sources listed in
// the fixture, not inferred from the implementation's hour arrays.
const reference = JSON.parse(await readFile(new URL('./fixtures/critter-times.json', import.meta.url)));
const expand = ranges => ranges.flatMap(([start, end]) => Array.from({length: end - start}, (_, i) => start + i));
function matches(item, month, hour, hemisphere) {
  return applyFilters([item], {
    filters: {month, hour, status:'all'}, hemisphere,
    collected: new Set(), sort: {key:null, dir:'asc'}
  }).length > 0;
}

for (const tab of ['fish', 'bug', 'sea']) {
  test(tab + ' availability matches source intervals in every month and hemisphere', () => {
    assert.equal(reference[tab].length, DATA_MAP[tab].length);
    for (const expected of reference[tab]) {
      const item = DATA_MAP[tab].find(item => item.id === expected.id);
      assert.ok(item, expected.id);
      const allHours = expand(expected.ranges);
      assert.deepEqual(item.hours, allHours, item.id + ' time boundaries');
      for (const hemisphere of ['north', 'south']) {
        for (let month = 1; month <= 12; month++) {
          const northMonth = hemisphere === 'south' ? (month + 5) % 12 + 1 : month;
          const ranges = expected.northSeasons
            ? expected.northSeasons.find(season => season.months.includes(northMonth))?.ranges || []
            : expected.ranges;
          const hours = item.northMonths.includes(northMonth) ? expand(ranges) : [];
          for (let hour = 0; hour < 24; hour++) {
            assert.equal(matches(item, month, hour, hemisphere), hours.includes(hour),
              item.id + ' ' + hemisphere + ' month=' + month + ' hour=' + hour);
          }
          assert.equal(matches(item, month, 'all', hemisphere), hours.length === 24, item.id + ' all-day filter');
        }
      }
    }
  });
}

test('seasonal fish use month-specific hours and show either season when month is unrestricted', () => {
  for (const id of ['fish_027', 'fish_028']) {
    const fish = DATA_MAP.fish.find(item => item.id === id);
    assert.equal(matches(fish, 3, 12, 'north'), false, id + ' spring midday');
    assert.equal(matches(fish, 9, 12, 'north'), true, id + ' autumn midday');
    assert.equal(matches(fish, 9, 12, 'south'), false, id + ' southern spring');
    assert.equal(matches(fish, 3, 12, 'south'), true, id + ' southern autumn');
    assert.equal(matches(fish, null, 12, 'north'), true);
    assert.equal(matches(fish, null, 'all', 'north'), true);
  }
});
