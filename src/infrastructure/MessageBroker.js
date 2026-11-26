// Simula RabbitMQ: fila principal, retry exponencial e Dead Letter Queue.
export class MessageBroker {
  constructor({ maxRetries = 3, baseDelayMs = 100, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
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
          const delay = this.baseDelayMs * 2 ** attempt; // 100, 200, 400...
          this.delays.push(delay);
          await this.sleep(delay);
        }
      }
    }
  }
}
