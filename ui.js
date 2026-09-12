export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let toastTimer = null;

export function showToast(message, options = {}) {
  const previousFocus = document.activeElement;
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.hidden = false;
  function hide() {
    const restoreFocus = toast.contains(document.activeElement);
    toast.classList.remove('show');
    toast.querySelector('.toast-action')?.remove();
    toast.hidden = true;
    if (restoreFocus && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  }
  if (options.action) {
    const button = document.createElement('button');
    button.className = 'toast-action';
    button.type = 'button';
    button.textContent = options.action.label;
    button.addEventListener('click', () => {
      clearTimeout(toastTimer);
      hide();
      options.action.onClick();
    });
    toast.appendChild(button);
  }
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hide, options.duration || 2600);
}

export function confirmDialog(message, confirmLabel = '确定') {
  return new Promise(resolve => {
    const previousFocus = document.activeElement;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="confirmTitle" aria-describedby="confirmMessage">'
      + '<h2 class="sr-only" id="confirmTitle">确认操作</h2>'
      + '<p class="modal-msg" id="confirmMessage"></p>'
      + '<div class="modal-btns">'
      + '<button type="button" class="modal-btn" data-r="cancel">取消</button>'
      + '<button type="button" class="modal-btn modal-btn-confirm" data-r="ok"></button>'
      + '</div></div>';
    overlay.querySelector('.modal-msg').textContent = message;
    const okButton = overlay.querySelector('[data-r="ok"]');
    okButton.textContent = confirmLabel;
    let done = false;

    const close = result => {
      if (done) return;
      done = true;
      overlay.classList.remove('show');
      document.removeEventListener('keydown', onKeyDown);
      setTimeout(() => {
        overlay.remove();
        if (previousFocus && previousFocus.isConnected) previousFocus.focus();
      }, 200);
      resolve(result);
    };

    const onKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(false);
        return;
      }
      if (event.key === 'Tab') {
        const buttons = [...overlay.querySelectorAll('button')];
        const first = buttons[0];
        const last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }
      if (event.key === 'Enter' && !event.target.closest?.('[data-r]')) close(true);
    };

    overlay.addEventListener('click', event => {
      if (event.target === overlay) return close(false);
      const button = event.target.closest('[data-r]');
      if (button) close(button.dataset.r === 'ok');
    });
    document.addEventListener('keydown', onKeyDown);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
    okButton.focus();
  });
}
