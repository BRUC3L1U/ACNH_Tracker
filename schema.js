export const TAB_DEFINITIONS = Object.freeze({
  bug: Object.freeze({ label: '虫', seasonal: true, filters: Object.freeze(['location', 'weather']) }),
  fish: Object.freeze({ label: '鱼', seasonal: true, filters: Object.freeze(['location', 'shadowSize']) }),
  sea: Object.freeze({ label: '海洋生物', seasonal: true, filters: Object.freeze(['shadowSize']) }),
  art: Object.freeze({ label: '艺术品', seasonal: false, filters: Object.freeze(['artType', 'authenticity']) }),
  music: Object.freeze({ label: '唱片', seasonal: false, filters: Object.freeze(['acquisition']) }),
  villager: Object.freeze({ label: '小动物', seasonal: false, collectible: false, filters: Object.freeze(['species', 'gender', 'personality', 'birthdayMonth', 'hobby', 'collaboration']) })
});

export const TABS = Object.freeze(Object.keys(TAB_DEFINITIONS));
export const COLLECTIBLE_TABS = Object.freeze(TABS.filter(tab => TAB_DEFINITIONS[tab].collectible !== false));
export const CREATURE_TABS = Object.freeze(TABS.filter(tab => TAB_DEFINITIONS[tab].seasonal));

export function shiftMonths(months) {
  return months.map(month => ((month + 5) % 12) + 1).sort((a, b) => a - b);
}

export function monthsForHemisphere(item, hemisphere) {
  return hemisphere === 'south' ? item.southMonths : item.northMonths;
}

// A null month means any occurrence month; a specific month must use its own
// season, including the six-month shift for southern islands.
export function hoursForMonth(item, hemisphere, month = null) {
  if (month === null) return item.hours;
  const northMonth = hemisphere === 'south' ? (month + 5) % 12 + 1 : month;
  if (!item.northMonths.includes(northMonth)) return [];
  if (!item.northSeasons) return item.hours;
  return item.northSeasons.find(season => season.months.includes(northMonth))?.hours || [];
}
