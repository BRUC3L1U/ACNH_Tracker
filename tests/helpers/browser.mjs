import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
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
  const imageResponses = new Map();
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
      if (message.method === 'Fetch.requestPaused' && imageResponses.has(message.sessionId)) {
        send('Fetch.fulfillRequest', {
          requestId: message.params.requestId, responseCode: 200,
          responseHeaders: [{name:'Content-Type',value:'image/png'}],
          body: imageResponses.get(message.sessionId)
        }, message.sessionId).catch(error => {
          if (imageResponses.has(message.sessionId)) fail(error);
        });
        continue;
      }
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
    async function click(selector) {
      await send('Page.bringToFront', {}, sessionId);
      const point = await evaluate(`(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el || el.disabled || !el.getClientRects().length) throw new Error('Not clickable: ' + ${JSON.stringify(selector)});
        el.scrollIntoView({block:'center',inline:'nearest'});
        const r = el.getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        const hit = document.elementFromPoint(x, y);
        if (!hit || !(hit === el || el.contains(hit))) throw new Error('Click is obstructed: ' + ${JSON.stringify(selector)});
        return {x,y};
      })()`);
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 }, sessionId);
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 }, sessionId);
    }
    async function press(key, modifiers = 0) {
      await send('Page.bringToFront', {}, sessionId);
      const keys = { Tab: ['Tab', 9], Enter: ['Enter', 13], Space: [' ', 32], Escape: ['Escape', 27] };
      const [value, code] = keys[key];
      const params = {key: value, code: key, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code, modifiers,
        ...(key === 'Enter' ? {text:'\r', unmodifiedText:'\r'} : {})};
      await send('Input.dispatchKeyEvent', { type: 'keyDown', ...params }, sessionId);
      await send('Input.dispatchKeyEvent', { type: 'keyUp', ...params }, sessionId);
    }
    await send('Page.navigate', { url }, sessionId);
    await waitFor('!!document.querySelector("#listRows .creature-item, #listRows .empty-state")');
    return { evaluate, waitFor, click, press,
      activate: () => send('Page.bringToFront', {}, sessionId),
      mockImages: async () => {
        imageResponses.set(sessionId, (await readFile(join(root, 'favicon.png'))).toString('base64'));
        await send('Fetch.enable', { patterns: [{urlPattern:'https://patchwiki.biligame.com/*'}] }, sessionId);
      },
      setViewport: (width, height = 900) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }, sessionId),
      blockUrls: async urls => {
        await send('Network.enable', {}, sessionId);
        await send('Network.setBlockedURLs', { urls }, sessionId);
      },
      screenshot: async path => {
        const { data } = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
        await writeFile(path, Buffer.from(data, 'base64'));
      },
      reload: async () => {
      await send('Page.navigate', { url: 'about:blank' }, sessionId);
      await send('Page.navigate', { url }, sessionId);
      await waitFor('!!document.querySelector("#listRows .creature-item, #listRows .empty-state")');
    }, close: () => {
      imageResponses.delete(sessionId);
      return send('Target.closeTarget', { targetId });
    } };
  }
  return { page, close: async () => {
    child.kill();
    await new Promise(resolve => !child.pid || child.exitCode !== null || child.signalCode !== null ? resolve() : child.once('exit', resolve));
    await new Promise(resolve => server.close(resolve));
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  } };
}
