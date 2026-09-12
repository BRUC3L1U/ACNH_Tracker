import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const publicAssets = ['index.html', 'bundle.js', 'favicon.png'];

test('Cloudflare deploy uploads only the browser-ready static assets', async () => {
  const config = JSON.parse(await readFile(new URL('wrangler.jsonc', root), 'utf8'));
  const packageJson = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
  const lock = JSON.parse(await readFile(new URL('package-lock.json', root), 'utf8'));
  assert.equal(config.name, 'acnh-tracker');
  assert.equal(config.assets?.directory, '.');
  assert.equal(packageJson.devDependencies?.wrangler, '4.128.0');
  assert.equal(packageJson.scripts?.postinstall, 'npm run check');
  assert.equal(packageJson.scripts?.deploy, 'wrangler deploy');
  assert.deepEqual(lock.packages[''].devDependencies, packageJson.devDependencies);
  assert.equal(lock.packages['node_modules/wrangler'].version, packageJson.devDependencies.wrangler);

  const ignoreRules = (await readFile(new URL('.assetsignore', root), 'utf8'))
    .trim()
    .split(/\r?\n/);
  assert.deepEqual(ignoreRules, ['*', '!index.html', '!bundle.js', '!favicon.png']);

  for (const asset of publicAssets) {
    const info = await stat(new URL(asset, root));
    assert.ok(info.isFile(), asset + ' must be a file');
    assert.ok(info.size > 0, asset + ' must not be empty');
    assert.ok(info.size <= 25 * 1024 * 1024, asset + ' exceeds Cloudflare\'s asset limit');
  }
});
