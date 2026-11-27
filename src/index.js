import { Ticket } from './domain/ticket/Ticket.js';
import { TriageService } from './application/TriageService.js';
import { ModelTieringClassifier } from './infrastructure/ModelTieringClassifier.js';
import { LegacyInventoryAdapter, LegacyInventoryClient } from './infrastructure/LegacyInventoryAdapter.js';
import { ResilientInventory } from './infrastructure/CircuitBreaker.js';
import { MessageBroker } from './infrastructure/MessageBroker.js';

const inventory = new ResilientInventory(new LegacyInventoryAdapter(new LegacyInventoryClient()));
const service = new TriageService(new ModelTieringClassifier(), inventory);
const broker = new MessageBroker({ sleep: async () => {} });

broker.publish(new Ticket(1, 'Meu notebook não liga, contato: ana@email.com'));
broker.publish(new Ticket(2, 'Sem acesso à VPN'));

await broker.consume(async (t) => {
  const r = await service.triage(t, 'ASSET-42');
  t.assign('Carlos').start().resolve().close();
  console.log(`#${t.id} ${r.category} | ativo: ${r.asset.model} | ${t.history.join(' ; ')}`);
});
