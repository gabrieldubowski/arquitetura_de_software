import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Ticket } from '../src/domain/ticket/Ticket.js';
import { IllegalTransitionError } from '../src/domain/ticket/TicketState.js';
import { TriageService, sanitizePII, validateClassification } from '../src/application/TriageService.js';
import { LegacyInventoryAdapter, LegacyInventoryClient } from '../src/infrastructure/LegacyInventoryAdapter.js';
import { CircuitBreaker, ResilientInventory } from '../src/infrastructure/CircuitBreaker.js';
import { MessageBroker } from '../src/infrastructure/MessageBroker.js';
import { ModelTieringClassifier } from '../src/infrastructure/ModelTieringClassifier.js';

test('State: ciclo de vida completo', () => {
  const t = new Ticket(1, 'x').triage('REDE').assign('Ana').start().resolve().close();
  assert.equal(t.status, 'FECHADO');
  assert.equal(t.history.length, 5);
});
test('State: transição inválida é rejeitada', () => {
  assert.throws(() => new Ticket(1, 'x').close(), IllegalTransitionError);
});
test('Adapter: converte XML legado em DTO', async () => {
  const a = new LegacyInventoryAdapter(new LegacyInventoryClient());
  assert.deepEqual(await a.getAsset('A1'), { assetId: 'A1', model: 'Dell-7420', warranty: true });
});
test('Circuit Breaker: abre após falhas e usa fallback', async () => {
  let t = 0;
  const cb = new CircuitBreaker({ threshold: 2, resetMs: 1000, now: () => t });
  const bad = { getAsset: async () => { throw new Error('down'); } };
  const inv = new ResilientInventory(bad, cb);
  await inv.getAsset('A'); await inv.getAsset('A');
  assert.equal(cb.state, 'OPEN');
  assert.equal((await inv.getAsset('A')).model, 'desconhecido');
  t = 1500;
  assert.equal(cb.state, 'HALF_OPEN');
});
test('Broker: retry exponencial e DLQ', async () => {
  const b = new MessageBroker({ maxRetries: 3, baseDelayMs: 100, sleep: async () => {} });
  b.publish('m1');
  await b.consume(async () => { throw new Error('falha'); });
  assert.deepEqual(b.delays, [100, 200, 400]);
  assert.equal(b.dlq.length, 1);
});
test('Guardrails: PII removida e saída inválida vira fallback', () => {
  assert.equal(sanitizePII('a@b.com'), '[EMAIL]');
  assert.equal(validateClassification({ category: 'XYZ', confidence: 2 }).category, 'GERAL');
});
test('Triagem ponta a ponta com Model Tiering', async () => {
  const svc = new TriageService(new ModelTieringClassifier(), new LegacyInventoryAdapter(new LegacyInventoryClient()));
  const t = new Ticket(1, 'sem acesso à VPN');
  const r = await svc.triage(t, 'A1');
  assert.equal(r.category, 'REDE');
  assert.equal(t.status, 'TRIADO');
});

import { Consultant } from '../src/domain/routing/Consultant.js';
import { RoutingService } from '../src/application/RoutingService.js';
import { FirstAvailableStrategy } from '../src/domain/routing/RoutingStrategy.js';

const team = [
  new Consultant({ id: 'c1', region: 'SUL', skills: ['HARDWARE'], available: true }),
  new Consultant({ id: 'c2', region: 'SP', skills: ['REDE'], available: true }),
  new Consultant({ id: 'c3', region: 'SP', skills: ['REDE'], available: false }),
];
test('Roteamento: escolhe por habilidade, localização e disponibilidade', () => {
  const t = new Ticket(1, 'vpn').triage('REDE');
  const r = new RoutingService(team).route(t, 'SP');
  assert.deepEqual(r, { routed: true, consultant: 'c2' });
  assert.equal(t.status, 'ATRIBUIDO');
});
test('Roteamento: sem ninguém disponível o chamado continua registrado', () => {
  const t = new Ticket(2, 'x').triage('REDE');
  const r = new RoutingService([new Consultant({ id: 'z', region: 'SP', skills: [], available: false })]).route(t, 'SP');
  assert.equal(r.routed, false);
  assert.equal(t.status, 'TRIADO');
});
test('Roteamento: estratégia é intercambiável (OCP)', () => {
  const t = new Ticket(3, 'x').triage('REDE');
  assert.equal(new RoutingService(team, new FirstAvailableStrategy()).route(t, 'SP').consultant, 'c1');
});
