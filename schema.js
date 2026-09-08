export const TAB_DEFINITIONS = Object.freeze({
  bug: Object.freeze({ label: '虫', seasonal: true, filters: Object.freeze(['location', 'weather']) }),
  fish: Object.freeze({ label: '鱼', seasonal: true, filters: Object.freeze(['location', 'shadowSize']) }),
  sea: Object.freeze({ label: '海洋生物', seasonal: true, filters: Object.freeze(['shadowSize']) }),
  art: Object.freeze({ label: '艺术品', seasonal: false, filters: Object.freeze(['artType', 'authenticity']) })
});

export const TABS = Object.freeze(Object.keys(TAB_DEFINITIONS));
export const CREATURE_TABS = Object.freeze(TABS.filter(tab => TAB_DEFINITIONS[tab].seasonal));

export function shiftMonths(months) {
  return months.map(month => ((month + 5) % 12) + 1).sort((a, b) => a - b);
}

export function monthsForHemisphere(item, hemisphere) {
  return hemisphere === 'south' ? item.southMonths : item.northMonths;
}
