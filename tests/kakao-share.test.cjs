const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function fixture({ key = 'test-javascript-key', protocol = 'https:', sdk = true, failure, templateArgs = {} } = {}) {
  const calls = [];
  let initialized = false;
  let click;
  const button = { addEventListener(type, handler) { if (type === 'click') click = handler; } };
  const toast = { textContent: '', classList: { add() {}, remove() {} } };
  const Kakao = {
    isInitialized: () => initialized,
    init(value) {
      calls.push({ type: 'init', value });
      if (failure === 'init') throw new Error('Invalid JavaScript key');
      initialized = true;
    },
    Share: { sendCustom(value) {
      if (failure === 'share') throw new Error('SDK request failed');
      calls.push({ type: 'share', value: JSON.parse(JSON.stringify(value)) });
    } }
  };
  const context = vm.createContext({
    URL,
    window: { location: { protocol }, Kakao: sdk ? Kakao : undefined },
    document: {
      readyState: 'loading', addEventListener() {},
      querySelector(selector) { return selector === '#kakao-share-button' ? button : toast; }
    },
    clearTimeout() {}, setTimeout() { return 1; }
  });
  vm.runInContext(source, context);
  context.testKey = key;
  context.testArgs = templateArgs;
  vm.runInContext('KAKAO_SHARE_CONFIG.javascriptKey = testKey; KAKAO_SHARE_CONFIG.templateArgs = testArgs; setupKakaoShare();', context);
  return { click: () => click(), calls, toast };
}

test('custom sharing uses numeric template 138398 without overriding its saved content', () => {
  const { click, calls } = fixture();
  assert.equal(calls.length, 0, 'No initialization or sharing before a visitor clicks');
  click();
  const request = calls.find(call => call.type === 'share').value;
  assert.deepEqual(request, { templateId: 138398 });
});

test('configured user arguments reach sendCustom with their exact names and values', () => {
  const templateArgs = { NAME: '테스트 초대', PAGE_PATH: 'wedding_invitation/' };
  const { click, calls } = fixture({ templateArgs });
  click();
  const request = calls.find(call => call.type === 'share').value;
  assert.deepEqual(request, { templateId: 138398, templateArgs });
});

test('repeated clicks reuse SDK initialization', () => {
  const { click, calls } = fixture();
  click(); click();
  assert.equal(calls.filter(call => call.type === 'init').length, 1);
  assert.equal(calls.filter(call => call.type === 'share').length, 2);
});

test('an unconfigured key gives feedback without invoking Kakao', () => {
  const { click, calls, toast } = fixture({ key: '   ' });
  click();
  assert.equal(calls.length, 0);
  assert.match(toast.textContent, /링크 복사/);
});

test('a blocked or unavailable SDK does not throw', () => {
  const { click, toast } = fixture({ sdk: false });
  assert.doesNotThrow(click);
  assert.match(toast.textContent, /링크 복사/);
});

test('local file mode does not open the sharing service', () => {
  const { click, calls, toast } = fixture({ protocol: 'file:' });
  click();
  assert.equal(calls.length, 0);
  assert.match(toast.textContent, /웹사이트/);
});

for (const failure of ['init', 'share']) {
  test(`${failure} errors stay within the share button and give feedback`, () => {
    const { click, toast } = fixture({ failure });
    assert.doesNotThrow(click);
    assert.match(toast.textContent, /링크 복사/);
  });
}

test('official version-pinned SDK uses SRI and async loading; existing share UI and OG remain', () => {
  assert.equal([...html.matchAll(/<script\b[^>]*src="[^"]*kakao_js_sdk[^\"]*"/g)].length, 1, 'SDK is loaded exactly once');
  assert.match(html, /src="https:\/\/t1\.kakaocdn\.net\/kakao_js_sdk\/2\.8\.4\/kakao\.min\.js"[^>]+integrity="sha384-[^"]+"[^>]+crossorigin="anonymous"[^>]+async/);
  assert.match(html, /id="share-button"/);
  assert.match(html, /id="kakao-share-button"/);
  for (const property of ['og:type', 'og:title', 'og:description', 'og:image', 'og:url']) {
    assert.ok(html.includes(`property="${property}"`));
  }
});
