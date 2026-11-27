import { Ticket } from '../src/domain/ticket/Ticket.js';
import { TriageService } from '../src/application/TriageService.js';
import { ModelTieringClassifier } from '../src/infrastructure/ModelTieringClassifier.js';
import { LegacyInventoryAdapter, LegacyInventoryClient } from '../src/infrastructure/LegacyInventoryAdapter.js';
import { ResilientInventory } from '../src/infrastructure/CircuitBreaker.js';

const service = new TriageService(
  new ModelTieringClassifier(),
  new ResilientInventory(new LegacyInventoryAdapter(new LegacyInventoryClient())),
);
let id = 0;
document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('desc');
  const t = new Ticket(++id, input.value);
  const { category } = await service.triage(t, 'ASSET-42');
  const li = document.createElement('li');
  const render = () => {
    li.innerHTML = `#${t.id} ${t.description} <span class="badge">${t.status}</span> (${category}) `;
    const next = { TRIADO: ['assign', 'Atribuir'], ATRIBUIDO: ['start', 'Iniciar'], EM_ATENDIMENTO: ['resolve', 'Resolver'], RESOLVIDO: ['close', 'Fechar'] }[t.status];
    if (next) {
      const b = document.createElement('button');
      b.textContent = next[1];
      b.onclick = () => { next[0] === 'assign' ? t.assign('Técnico') : t[next[0]](); render(); };
      li.append(b);
    }
  };
  render();
  document.getElementById('list').prepend(li);
  input.value = '';
});
