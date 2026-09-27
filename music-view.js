import { escapeHtml } from './ui.js';
import { createImageFrame } from './image-view.js';

export function buildMusicRow(item) {
  const row = document.createElement('div');
  row.className = 'creature-item music-item';
  row.dataset.id = item.id;
  const checkboxId = 'collected-' + item.id;
  row.innerHTML = '<input id="'+checkboxId+'" class="creature-checkbox sr-only" type="checkbox" data-id="'+item.id+'" aria-label="'+escapeHtml(item.name)+'，已收集唱片">'
    + '<label class="collect-toggle" for="'+checkboxId+'"><span class="check-box" aria-hidden="true"></span></label>'
    + '<span class="music-cover-slot"></span>'
    + '<div class="music-info"><label class="music-title" for="'+checkboxId+'"><span class="creature-name">'+escapeHtml(item.name)+'</span>'
    + '<span class="music-english">'+escapeHtml(item.englishName)+'</span></label>'
    + '<div class="music-tags"><span class="tag tag-location">'+escapeHtml(item.acquisition)+'</span>'
    + '<span class="music-price">'+(item.buyPrice === null ? '非卖品' : '购买 '+item.buyPrice+' 铃钱')+'</span></div>'
    + '<details class="music-details"><summary>获取说明</summary><p>'+escapeHtml(item.note)+'</p>'
    + '<a class="art-source-link" href="'+escapeHtml(item.sourceUrl)+'" target="_blank" rel="noopener noreferrer">查看 BWIKI 唱片图鉴</a></details></div>';
  row.querySelector('.music-cover-slot').appendChild(createImageFrame(item.image, item.name+'唱片封面', 'music-cover', 'art-image-error', {width:88, height:88, labelFor:checkboxId}));
  return row;
}
