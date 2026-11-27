import { InventoryPort } from '../domain/ports.js';

export class CircuitBreaker {
  constructor({ threshold = 3, resetMs = 5000, now = () => Date.now() } = {}) {
    Object.assign(this, { threshold, resetMs, now, failures: 0, openedAt: null });
  }
  get state() {
    if (this.openedAt === null) return 'CLOSED';
    return this.now() - this.openedAt >= this.resetMs ? 'HALF_OPEN' : 'OPEN';
  }
  async exec(fn, fallback) {
    if (this.state === 'OPEN') return fallback();
    try {
      const r = await fn();
      this.failures = 0; this.openedAt = null;
      return r;
    } catch (e) {
      this.failures++;
      if (this.failures >= this.threshold || this.state === 'HALF_OPEN') this.openedAt = this.now();
      return fallback();
    }
  }
}

// Decorator: protege qualquer InventoryPort (ex.: o adapter do mainframe).
export class ResilientInventory extends InventoryPort {
  constructor(inner, breaker = new CircuitBreaker()) { super(); this.inner = inner; this.breaker = breaker; }
  getAsset(id) {
    return this.breaker.exec(() => this.inner.getAsset(id), () => ({ assetId: id, model: 'desconhecido', warranty: false }));
  }
}
