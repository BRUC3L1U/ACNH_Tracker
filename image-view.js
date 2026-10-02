const retries = new WeakMap();

// Only connected, failed frames retry, once per frame on reconnect. Cached
// rows do not retain window listeners, and hidden rows still load lazily.
window.addEventListener('online', () => {
  document.querySelectorAll('[data-image-failed]').forEach(frame => retries.get(frame)?.());
});

export function createImageFrame(url, alt, className, errorClass, size = {}) {
  const frame = document.createElement('span');
  frame.className = className;
  let automaticRetries = 0;

  function load() {
    const hadFocus = frame.contains(document.activeElement);
    delete frame.dataset.imageFailed;
    const image = document.createElement('img');
    image.alt = alt;
    if (size.width) image.width = size.width;
    if (size.height) image.height = size.height;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.referrerPolicy = 'no-referrer';
    image.addEventListener('error', () => {
      const restoreFocus = frame.contains(document.activeElement);
      frame.dataset.imageFailed = 'true';
      const fallback = document.createElement('span');
      fallback.className = errorClass + ' image-fallback';
      const message = document.createElement('span');
      message.textContent = '加载失败';
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'image-retry';
      retry.textContent = '重试';
      retry.setAttribute('aria-label', alt + '，重新加载图片');
      retry.addEventListener('click', event => {
        // Retry is separate from the image label and original-image link.
        event.preventDefault();
        event.stopPropagation();
        load();
      });
      fallback.append(message, retry);
      frame.replaceChildren(fallback);
      if (restoreFocus) retry.focus({ preventScroll: true });
    }, { once: true });
    image.src = url;
    if (size.link) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', alt + '，打开原图');
      link.appendChild(image);
      frame.replaceChildren(link);
    } else if (size.labelFor) {
      const label = document.createElement('label');
      label.htmlFor = size.labelFor;
      label.appendChild(image);
      frame.replaceChildren(label);
    } else frame.replaceChildren(image);
    if (hadFocus) {
      frame.tabIndex = -1;
      frame.focus({ preventScroll: true });
    }
  }

  retries.set(frame, () => {
    if (automaticRetries >= 1) return;
    automaticRetries += 1;
    load();
  });
  load();
  return frame;
}
