# Checklist da consolidação final — Gabriel França

Nenhuma caixa está marcada automaticamente. Gabriel e os revisores devem conferir e registrar evidências reais.

## Histórico e documentação
- [ ] Confirmar responsáveis: Rafael/Sprint 1, Daniel/Sprint 2, Lucas/Sprint 3, Gabriel/Sprint 4.
- [ ] Preservar ADR 004 como resiliência e usar ADR 008 para DDD/ACL.
- [ ] Conferir ADR 007 Markdown contra o PDF original.
- [ ] Registrar aceites novos com responsáveis, datas e evidências reais.
- [ ] Conferir links do README e dos diagramas após todos os merges.

## Requisitos técnicos
- [ ] C1, C2 e C3 coerentes e renderizáveis; componentes propostos identificados.
- [ ] State e invariantes testados na contribuição de Daniel.
- [ ] Resiliência e integração testadas na contribuição de Lucas.
- [ ] Resolver a exigência de ArchUnit; node:test não é ArchUnit.
- [ ] RabbitMQ real com retry/DLQ demonstrado, ou requisito explicitamente pendente.
- [ ] IA multiagente real demonstrada, ou requisito explicitamente pendente.
- [ ] Remover afirmações de RAG, pgvector ou API real não implementados.
- [ ] Revisar saída HTML baseada em dados do usuário antes de uso externo.

## Governança
- [ ] Todos aceitaram os convites.
- [ ] Main exige PR e pelo menos uma aprovação, sem bypass.
- [ ] Cada integrante possui contribuição técnica em PR próprio.
- [ ] Cada integrante comentou tecnicamente e revisou PR de colega.
- [ ] Gabriel revisou o PR de Daniel ou outro colega, além de receber revisão no próprio.
- [ ] Conferir conflitos entre o template do PR #1 e o que foi enviado no PR #2.
- [ ] Executar npm test na main final e registrar commit, data e resultado.
- [ ] Enviar ao professor URL do repositório e links dos PRs individuais.

## Matriz de evidências
| Requisito | Arquivo ou link | Situação e evidência |
|---|---|---|
| C4 | docs/c4/ | Conferir e registrar renderização |
| ADRs | docs/adr/ | Sintetizadas, propostas e histórico diferenciados |
| DDD / ACL | docs/ddd.md e ADR 008 | Conferir coerência com código |
| State | src/domain/ticket/ | Conferir testes de Daniel |
| RabbitMQ | MessageBroker.js é simulador | Integração real ainda não comprovada |
| Multiagentes | ModelTieringClassifier.js é simulado | Coordenação real ainda não comprovada |
| Fitness functions / ArchUnit | tests/ e evidências | Diferença de linguagem a resolver |
| PRs e reviews | GitHub | Inserir links reais após execução |
