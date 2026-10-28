export async function connectCDP(url, onEvent = () => {}) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let sequence = 0;
  let session;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (!message.id) { onEvent(message); return; }
    const item = pending.get(message.id);
    if (!item) return;
    clearTimeout(item.timer);
    pending.delete(message.id);
    if (message.error) item.reject(new Error(JSON.stringify(message.error)));
    else item.resolve(message.result);
  });
  function call(method, params = {}, target = session) {
    const id = ++sequence;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 30000);
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params, ...(target ? { sessionId: target } : {}) }));
    });
  }
  async function evaluate(expression) {
    const response = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description?.split('\n')[0] ?? response.exceptionDetails.text);
    return response.result.value;
  }
  async function click(selector) {
    const point = await evaluate(`(() => {const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw Error('missing element');el.scrollIntoView({block:'nearest'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await call('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
    await call('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
  }
  async function key(selector, key, code) {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code });
    await call('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code });
  }
  return {
    call, evaluate, click, key,
    async attach() {
      const target = await call('Target.createTarget', { url: 'about:blank' }, null);
      ({ sessionId: session } = await call('Target.attachToTarget', { targetId: target.targetId, flatten: true }, null));
    },
    close() {
      socket.close();
      for (const item of pending.values()) { clearTimeout(item.timer); item.reject(new Error('CDP closed')); }
      pending.clear();
    },
  };
}
