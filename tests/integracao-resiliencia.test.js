import test from 'node:test';
import assert from 'node:assert/strict';
import { MessageBroker } from '../src/infrastructure/MessageBroker.js';
import { CircuitBreaker, ResilientInventory } from '../src/infrastructure/CircuitBreaker.js';
import { withTimeout, TimeoutError } from '../src/infrastructure/Timeout.js';

const broker = (options = {}) => new MessageBroker({ sleep: async () => {}, ...options });

test('mensagem bem-sucedida não é retentada', async () => {
  const b = broker(); b.publish({ id: 1 }); let calls = 0;
  await b.consume(async () => { calls++; });
  assert.equal(calls, 1); assert.deepEqual(b.delays, []); assert.equal(b.dlq.length, 0);
});
test('falhas transitórias recuperam sem DLQ', async () => {
  const b = broker(); b.publish({ id: 1 }); let calls = 0;
  await b.consume(async () => { if (++calls < 3) throw new Error('rede'); });
  assert.equal(calls, 3); assert.deepEqual(b.delays, [200, 400]); assert.equal(b.dlq.length, 0);
});
test('três retries após a tentativa inicial e envio à DLQ', async () => {
  const b = broker(); const msg = { id: 7 }; b.publish(msg); let calls = 0;
  await b.consume(async () => { calls++; throw new Error('legado indisponível'); });
  assert.equal(calls, 4); assert.deepEqual(b.delays, [200, 400, 800]);
  assert.equal(b.dlq.length, 1); assert.equal(b.dlq[0].msg, msg);
});
test('mensagem com falha não impede a próxima de ser processada', async () => {
  const b = broker(); b.publish({ id: 1 }); b.publish({ id: 2 }); const completed = [];
  await b.consume(async msg => { if (msg.id === 1) throw new Error('inválida'); completed.push(msg.id); });
  assert.deepEqual(completed, [2]); assert.equal(b.dlq.length, 1);
});
test('zero retries envia a mensagem à DLQ na primeira falha', async () => {
  const b = broker({ maxRetries: 0 }); b.publish(1);
  await b.consume(async () => { throw new Error('falha'); });
  assert.deepEqual(b.delays, []); assert.equal(b.dlq.length, 1);
});
test('configuração inválida de retry é rejeitada', () => {
  assert.throws(() => broker({ maxRetries: -1 }), RangeError);
  assert.throws(() => broker({ baseDelayMs: 0 }), RangeError);
});
test('circuito aberto não chama a dependência', async () => {
  const c = new CircuitBreaker({ threshold: 2 }); let calls = 0;
  const fail = async () => { calls++; throw new Error('offline'); };
  for (let i = 0; i < 3; i++) assert.equal(await c.exec(fail, () => 'pendente'), 'pendente');
  assert.equal(calls, 2); assert.equal(c.state, 'OPEN');
});
test('probe bem-sucedido fecha o circuito após 30 segundos', async () => {
  let time = 0; const c = new CircuitBreaker({ threshold: 1, now: () => time });
  await c.exec(async () => { throw new Error('offline'); }, () => null);
  time = 29999; assert.equal(c.state, 'OPEN'); time = 30000; assert.equal(c.state, 'HALF_OPEN');
  assert.equal(await c.exec(async () => 'recuperado', () => null), 'recuperado');
  assert.equal(c.state, 'CLOSED');
});
test('probe com falha reabre o circuito', async () => {
  let time = 0; const c = new CircuitBreaker({ threshold: 1, now: () => time });
  const fail = async () => { throw new Error('offline'); };
  await c.exec(fail, () => null); time = 30000; await c.exec(fail, () => null);
  assert.equal(c.state, 'OPEN');
});
test('half-open permite somente uma chamada de prova simultânea', async () => {
  let time = 0; const c = new CircuitBreaker({ threshold: 1, now: () => time });
  await c.exec(async () => { throw new Error(); }, () => null); time = 30000;
  let release; const probe = c.exec(() => new Promise(resolve => { release = resolve; }), () => 'fallback');
  assert.equal(await c.exec(async () => assert.fail('não deveria chamar'), () => 'fallback'), 'fallback');
  release('ok'); assert.equal(await probe, 'ok'); assert.equal(c.state, 'CLOSED');
});
test('timeout não permite aguardar indefinidamente', async () => {
  await assert.rejects(withTimeout(() => new Promise(() => {}), 10), TimeoutError);
  assert.equal(await withTimeout(async () => 'ok', 1000), 'ok');
});
test('inventário lento devolve fallback com timeout e abre circuito', async () => {
  const c = new CircuitBreaker({ threshold: 1 });
  const inv = new ResilientInventory({ getAsset: () => new Promise(() => {}) }, c, { timeoutMs: 10 });
  assert.deepEqual(await inv.getAsset('A'), { assetId: 'A', model: 'desconhecido', warranty: false });
  assert.equal(c.state, 'OPEN');
});
test('inventário disponível preserva resposta original', async () => {
  const expected = { assetId: 'A', model: 'Teste', warranty: true };
  const inv = new ResilientInventory({ getAsset: async () => expected });
  assert.equal(await inv.getAsset('A'), expected);
});
test('configuração inválida do breaker é rejeitada', () => {
  assert.throws(() => new CircuitBreaker({ threshold: 0 }), RangeError);
});
