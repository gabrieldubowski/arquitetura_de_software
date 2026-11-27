import test from 'node:test';
import assert from 'node:assert/strict';
import { Ticket } from '../src/domain/ticket/Ticket.js';
import { IllegalTransitionError } from '../src/domain/ticket/TicketState.js';
import { SkillLocationAvailabilityStrategy, FirstAvailableStrategy } from '../src/domain/routing/RoutingStrategy.js';
import { RoutingService } from '../src/application/RoutingService.js';

test('chamado nasce aberto', () => { assert.equal(new Ticket(1, 'teste').status, 'ABERTO'); });
test('ciclo completo respeita os estados e registra histórico', () => {
  const t = new Ticket(1, 'teste'); t.triage('REDE').assign('A').start().resolve().close();
  assert.equal(t.status, 'FECHADO'); assert.equal(t.history.length, 5);
});
test('não pode fechar chamado aberto', () => {
  const t = new Ticket(1, 'teste'); assert.throws(() => t.close(), IllegalTransitionError);
  assert.equal(t.status, 'ABERTO'); assert.equal(t.history.length, 0);
});
test('não pode iniciar antes de atribuir', () => {
  const t = new Ticket(1, 'teste').triage('REDE'); assert.throws(() => t.start(), IllegalTransitionError);
});
test('categoria inválida não modifica o chamado', () => {
  const t = new Ticket(1, 'teste'); assert.throws(() => t.triage('INVENTADA'), TypeError);
  assert.equal(t.category, null); assert.equal(t.status, 'ABERTO');
});
test('atribuição vazia não avança o estado', () => {
  const t = new Ticket(1, 'teste').triage('REDE'); assert.throws(() => t.assign('   '), TypeError);
  assert.equal(t.technician, null); assert.equal(t.status, 'TRIADO');
});
test('atribuição exige identificador textual', () => {
  const t = new Ticket(1, 'teste').triage('REDE'); assert.throws(() => t.assign(null), TypeError);
});
test('resolvido pode reabrir para atendimento mantendo técnico', () => {
  const t = new Ticket(1, 'teste').triage('REDE').assign('A').start().resolve().reopen();
  assert.equal(t.status, 'EM_ATENDIMENTO'); assert.equal(t.technician, 'A');
});
test('fechado é terminal', () => {
  const t = new Ticket(1, 'teste').triage('REDE').assign('A').start().resolve().close();
  assert.throws(() => t.reopen(), IllegalTransitionError);
});
test('roteamento sem consultor mantém chamado triado', () => {
  const t = new Ticket(1, 'teste').triage('REDE'); const r = new RoutingService([]).route(t, 'SUL');
  assert.equal(r.routed, false); assert.equal(t.status, 'TRIADO');
});
test('estratégia prioriza habilidade e região entre disponíveis', () => {
  const cs = [{id:'A', available:true, skills:['REDE'],region:'NORTE'}, {id:'B',available:true,skills:['REDE'],region:'SUL'}, {id:'C',available:false,skills:['REDE'],region:'SUL'}];
  const t = new Ticket(1, 'teste').triage('REDE');
  assert.equal(new SkillLocationAvailabilityStrategy().choose(t, cs, 'SUL').id, 'B');
});
test('outra Strategy pode ser injetada sem mudar RoutingService', () => {
  const cs = [{id:'A', available:true, skills:['REDE'],region:'NORTE'}];
  const t = new Ticket(1, 'teste').triage('REDE');
  const r = new RoutingService(cs, new FirstAvailableStrategy()).route(t, 'SUL');
  assert.equal(r.routed, true); assert.equal(t.technician, 'A');
});
