// Simula RabbitMQ: fila principal, retry exponencial e Dead Letter Queue.
export class MessageBroker {
  constructor({ maxRetries = 3, baseDelayMs = 200, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
    if (!Number.isInteger(maxRetries) || maxRetries < 0 || maxRetries > 10) throw new RangeError('maxRetries inválido');
    if (!Number.isFinite(baseDelayMs) || baseDelayMs <= 0) throw new RangeError('baseDelayMs inválido');
    Object.assign(this, { maxRetries, baseDelayMs, sleep });
    this.queue = [];
    this.dlq = [];
    this.delays = [];
  }
  publish(msg) { this.queue.push(msg); }
  async consume(handler) {
    while (this.queue.length) {
      const msg = this.queue.shift();
      for (let attempt = 0; ; attempt++) {
        try { await handler(msg); break; }
        catch (err) {
          if (attempt >= this.maxRetries) { this.dlq.push({ msg, error: err.message }); break; }
          const delay = this.baseDelayMs * 2 ** attempt; // 200, 400, 800 ms; espera simulável nos testes
          this.delays.push(delay);
          await this.sleep(delay);
        }
      }
    }
  }
}

