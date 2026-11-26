# DDD - Subdomínios e Mapa de Contexto

| Tipo | Subdomínio |
|---|---|
| Core | Triagem e roteamento inteligente de chamados (classificação por IA + ciclo de vida) |
| Supporting | Notificações, SLA e relatórios |
| Generic | Autenticação SSO, LLM de terceiros |

## Bounded Contexts
- **Ticketing** (core): `Ticket`, estados, categoria. Linguagem: "chamado", "triagem".
- **Routing** (core): escolhe o consultor por habilidade, localização e disponibilidade (Strategy).
- **Consultants** (supporting, dados do RH): LGPD, só id, região, habilidades e disponibilidade.
- **Triage/AI**: classificação, guardrails, base de conhecimento.
- **Inventory** (legado): "ativo", "garantia" em XML. **Isolado por ACL**.

```
[Ticketing] <-- (mensagens AMQP) --> [Triage/AI]
[Triage/AI] --> [ACL: LegacyInventoryAdapter] --> [Inventário Legado (XML)]
```
O relacionamento com o Inventário é **Conformist evitado via ACL**: o modelo legado nunca vaza para o domínio.
