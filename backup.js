import { getCollectionAccess, parseBackup, serializeBackup, validateImportFileSize } from './core.js';
import { confirmDialog, showToast } from './ui.js';

export function createBackupActions(collection, knownIds) {
  let importInProgress = false;

  function exportCollected() {
    collection.refresh();
    if (!getCollectionAccess(collection.loadFailed).canExport) {
      showToast('未能加载已有收集记录，已暂停导出；可导入有效备份恢复');
      return;
    }
    const blob = new Blob([serializeBackup(collection.collected)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    a.download = 'acnh-collected-' + now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + '.json';
    a.href = url;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function importCollected(event) {
    const input = event.target;
    const file = input.files[0];
    if (!file || importInProgress) return;
    importInProgress = true;
    document.getElementById('importBtn').disabled = true;
    try {
      validateImportFileSize(file.size);
      const { collected: incoming, dropped } = parseBackup(await file.text(), knownIds);
      collection.refresh();
      const expected = collection.snapshot;
      if (collection.collected.size > 0 || collection.loadFailed) {
        const message = collection.loadFailed
          ? '已有记录无法读取，导入将覆盖浏览器中的记录，是否继续？'
          : '导入将覆盖当前的 ' + collection.collected.size + ' 条记录，是否继续？';
        if (!await confirmDialog(message, '覆盖导入')) return;
      }
      if ((await collection.replace(incoming, expected)).ok) {
        showToast('导入成功，共 ' + incoming.size + ' 条记录' + (dropped > 0 ? '（已忽略 ' + dropped + ' 条无法识别的记录）' : ''));
      }
    } catch (error) {
      showToast('导入失败：' + error.message);
    } finally {
      importInProgress = false;
      document.getElementById('importBtn').disabled = false;
      input.value = '';
    }
  }

  return { exportCollected, importCollected, get importInProgress() { return importInProgress; } };
}
