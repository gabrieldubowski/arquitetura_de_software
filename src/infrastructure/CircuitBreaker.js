import { InventoryPort } from '../domain/ports.js';
import { withTimeout } from './Timeout.js';

// Política de falhas consecutivas da demonstração. Não equivale à janela percentual da ADR 004.
export class CircuitBreaker {
  constructor({ threshold = 3, resetMs = 30000, now = () => Date.now() } = {}) {
    if (!Number.isInteger(threshold) || threshold < 1) throw new RangeError('threshold inválido');
    if (!Number.isFinite(resetMs) || resetMs <= 0) throw new RangeError('resetMs inválido');
    Object.assign(this, { threshold, resetMs, now, failures: 0, openedAt: null, probeInFlight: false });
  }
  get state() {
    if (this.openedAt === null) return 'CLOSED';
    return this.now() - this.openedAt >= this.resetMs ? 'HALF_OPEN' : 'OPEN';
  }
  async exec(fn, fallback) {
    const current = this.state;
    if (current === 'OPEN' || (current === 'HALF_OPEN' && this.probeInFlight)) return fallback();
    const probing = current === 'HALF_OPEN';
    if (probing) this.probeInFlight = true;
    try {
      const r = await fn();
      // Um sucesso antigo, iniciado antes da abertura, não fecha um circuito já aberto.
      if (probing || this.openedAt === null) { this.failures = 0; this.openedAt = null; }
      return r;
    } catch {
      this.failures++;
      if (probing || this.failures >= this.threshold) this.openedAt = this.now();
      return fallback();
    } finally { if (probing) this.probeInFlight = false; }
  }
}

export class ResilientInventory extends InventoryPort {
  constructor(inner, breaker = new CircuitBreaker(), { timeoutMs = 1500 } = {}) {
    super(); this.inner = inner; this.breaker = breaker; this.timeoutMs = timeoutMs;
  }
  getAsset(id) {
    return this.breaker.exec(
      () => withTimeout(() => this.inner.getAsset(id), this.timeoutMs),
      () => ({ assetId: id, model: 'desconhecido', warranty: false })
    );
  }
}
