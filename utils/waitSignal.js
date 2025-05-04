/**
 * WaitSignal: simple wait/signal channel for async notification.
 * Usage:
 *   const ws = new WaitSignal();
 *   await ws.wait(timeoutMs);
 *   ws.signal();
 */
class WaitSignal {
  constructor() {
    this.waiters = [];
    this.signaled = false;
  }
  wait(timeoutMs) {
    if (this.signaled) return Promise.resolve();
    return new Promise((resolve) => {
      const timer = timeoutMs
        ? setTimeout(() => {
            this._remove(resolve);
            resolve();
          }, timeoutMs)
        : null;
      this.waiters.push(() => {
        if (timer) clearTimeout(timer);
        resolve();
      });
    });
  }
  signal() {
    this.signaled = true;
    this.waiters.forEach((resolve) => resolve());
    this.waiters = [];
  }
  reset() {
    this.signaled = false;
  }
  _remove(fn) {
    this.waiters = this.waiters.filter((f) => f !== fn);
  }
}

export default WaitSignal;
