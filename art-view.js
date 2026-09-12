import { escapeHtml } from './ui.js';
import { createImageFrame } from './image-view.js';

function artImage(url, alt, className, link = false, labelFor) {
  return createImageFrame(url, alt, className, 'art-image-error', { link, labelFor });
}

export function buildArtRow(item) {
  const row = document.createElement('div');
  row.className = 'creature-item art-item';
  row.dataset.id = item.id;
  const hasFake = item.authenticity === '有赝品';
  const checkboxId = 'collected-' + item.id;
  row.innerHTML = '<div class="art-collect">'
    + '<input id="'+checkboxId+'" class="creature-checkbox sr-only" type="checkbox" data-id="'+item.id+'" aria-label="'+escapeHtml(item.name)+'，已收集真品">'
    + '<label class="collect-toggle" for="'+checkboxId+'"><span class="check-box" aria-hidden="true"></span></label><span class="art-thumbnail"></span>'
    + '<label class="art-title-group" for="'+checkboxId+'"><span class="art-title-line"><span class="creature-name">'+escapeHtml(item.name)+'</span>'
    + '<span class="tag tag-location">'+item.artType+'</span>'
    + '<span class="tag '+(hasFake?'tag-shadow':'tag-location')+'">'+item.authenticity+'</span></span>'
    + '<span class="art-real-name">'+escapeHtml(item.realName)+'</span></label></div>'
    + '<details class="art-details"><summary>'+(hasFake?'查看鉴伪要点与对照图':'查看作品与来源')+'</summary>'
    + '<div class="art-detail-body"><div class="art-clues">'
    + '<p><strong>'+(hasFake?'真品特征':'真伪情况')+'</strong>'+escapeHtml(item.genuineNote)+'</p>'
    + (hasFake?'<p><strong>赝品特征</strong>'+escapeHtml(item.fakeNote)+'</p>':'')
    + '</div><div class="art-comparisons"></div>'
    + '<a class="art-source-link" href="'+escapeHtml(item.sourceUrl)+'" target="_blank" rel="noopener noreferrer">查看 BWIKI 条目</a>'
    + '</div></details>';
  row.querySelector('.art-thumbnail').appendChild(artImage(item.image, item.name+'真品缩略图', 'art-thumbnail-frame', false, checkboxId));
  const details = row.querySelector('details');
  let imagesLoaded = false;
  details.addEventListener('toggle', () => {
    if (!details.open || imagesLoaded) return;
    imagesLoaded = true;
    const gallery = row.querySelector('.art-comparisons');
    for (const comparison of item.comparisons) {
      const figure = document.createElement('figure');
      const caption = document.createElement('figcaption');
      caption.textContent = comparison.label;
      figure.append(caption, artImage(comparison.url, item.name+'，'+comparison.label, 'art-comparison-frame', true));
      gallery.appendChild(figure);
    }
  });
  return row;
}
