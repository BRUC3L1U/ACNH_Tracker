import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';

export async function launchBrowser(root) {
  const profile = await mkdtemp(join(tmpdir(), 'acnh-browser-'));
  const server = createServer(async (req, res) => {
    try {
      const file = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
      if (!file.startsWith(root + sep)) throw new Error('Invalid path');
      const target = file.endsWith(sep) || file === root ? join(file, 'index.html') : file;
      res.setHeader('Content-Type', target.endsWith('.js') ? 'text/javascript' : 'text/html');
      res.end(await readFile(target));
    } catch { res.writeHead(404); res.end(); }
  });
  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
  } catch (error) {
    await rm(profile, { recursive: true, force: true });
    throw error;
  }
  const executable = process.env.CHROME_BIN || (process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome');
  const child = spawn(executable, ['--headless=new', '--no-sandbox', '--disable-gpu',
    '--no-first-run', '--no-default-browser-check', '--remote-debugging-pipe', '--user-data-dir=' + profile],
  { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
  let stderr = '';
  child.stderr.on('data', data => { stderr += data; });
  const pending = new Map();
  let nextId = 0;
  let buffer = '';
  function fail(error) {
    for (const request of pending.values()) { clearTimeout(request.timer); request.reject(error); }
    pending.clear();
  }
  child.on('error', fail);
  child.on('exit', () => fail(new Error('Chrome exited: ' + stderr)));
  child.stdio[4].setEncoding('utf8');
  child.stdio[4].on('data', data => {
    buffer += data;
    let boundary;
    while ((boundary = buffer.indexOf('\0')) !== -1) {
      const message = JSON.parse(buffer.slice(0, boundary));
      buffer = buffer.slice(boundary + 1);
      const request = pending.get(message.id);
      if (!request) continue;
      pending.delete(message.id);
      clearTimeout(request.timer);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
    }
  });
  function send(method, params = {}, sessionId) {
    return new Promise((resolve, reject) => {
      const id = ++nextId;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method + '\n' + stderr)); }, 10000);
      pending.set(id, { resolve, reject, timer });
      child.stdio[3].write(JSON.stringify({ id, method, params, sessionId }) + '\0');
    });
  }
  async function page(url = 'http://127.0.0.1:' + server.address().port + '/index.html') {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    // Evaluate actual DOM interactions in an isolated browser profile.
    async function evaluate(expression) {
      const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
      return result.result.value;
    }
    async function waitFor(expression) {
      const end = Date.now() + 5000;
      while (Date.now() < end) {
        if (await evaluate(expression)) return;
        await new Promise(resolve => setTimeout(resolve, 25));
      }
      throw new Error('Browser condition failed: ' + expression);
    }
    await send('Page.navigate', { url }, sessionId);
    await waitFor('!!document.querySelector(".creature-item")');
    return { evaluate, waitFor, reload: async () => {
      await send('Page.navigate', { url: 'about:blank' }, sessionId);
      await send('Page.navigate', { url }, sessionId);
      await waitFor('!!document.querySelector(".creature-item")');
    }, close: () => send('Target.closeTarget', { targetId }) };
  }
  return { page, close: async () => {
    child.kill();
    await new Promise(resolve => !child.pid || child.exitCode !== null || child.signalCode !== null ? resolve() : child.once('exit', resolve));
    await new Promise(resolve => server.close(resolve));
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  } };
}
