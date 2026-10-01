import { escapeHtml } from './ui.js';
import { createImageFrame } from './image-view.js';

export function buildVillagerRow(item) {
  const row = document.createElement('div');
  row.className = 'creature-item villager-item';
  row.dataset.id = item.id;
  const gender = item.gender === '♂' ? '♂ 男' : '♀ 女';
  const source = new URL(item.sourceUrl).hostname === 'wiki.biligame.com' ? 'BWIKI' : 'Nookipedia';
  row.innerHTML = '<span class="villager-portrait-slot"></span>'
    + '<div class="villager-info"><div class="villager-title"><span class="creature-name">'+escapeHtml(item.name)+'</span>'
    + '<span class="villager-english" lang="en">'+escapeHtml(item.englishName)+'</span></div>'
    + '<div class="villager-tags"><span class="tag tag-location">'+escapeHtml(item.species)+'</span>'
    + '<span class="tag">'+gender+'</span><span class="tag">'+escapeHtml(item.personality)+'</span>'
    + (item.collaboration === '普通居民' ? '' : '<span class="tag tag-weather">'+escapeHtml(item.collaboration)+'</span>') + '</div>'
    + '<div class="villager-facts"><span>生日 '+escapeHtml(item.birthdayMonth)+item.birthdayDay+'日</span>'
    + '<span>爱好 '+escapeHtml(item.hobby)+'</span><span>初始口头禅「'+escapeHtml(item.catchphrase)+'」</span></div>'
    + '<a class="art-source-link" href="'+escapeHtml(item.sourceUrl)+'" target="_blank" rel="noopener noreferrer">查看 '+source+' 资料</a></div>';
  row.querySelector('.villager-portrait-slot').appendChild(createImageFrame(item.image, item.name+'立绘', 'villager-portrait', 'art-image-error', {width:80, height:96}));
  return row;
}
