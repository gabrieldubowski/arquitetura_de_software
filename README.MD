# Sysop Squad — Suporte Técnico e Ticketing

Architectural Kata 5 — Arquitetura de Software, 6º período de Engenharia de Software, UniSENAI PR.

## Equipe e responsabilidade histórica
| Sprint | Responsável informado pelo grupo | GitHub confirmado |
|---|---|---|
| 1 | Rafael Romero | @Rafabigode |
| 2 | Daniel Armando | Não informado |
| 3 | Lucas Martins | @martinssluc |
| 4 | Gabriel França | @gabrieldubowski |

Gabriel é o responsável pela Sprint 4. Os papéis históricos não substituem a autoria individual registrada nos commits e PRs. A configuração inicial do repositório e do formulário de PR é distinta da contribuição técnica final.

## 1. Contexto e desafio
O sistema registra e encaminha chamados de lojas a consultores, considerando habilidade, localização e disponibilidade. A BOTE da Sprint 1 supõe 1.000 lojas e 10 tickets por loja/dia: são hipóteses acadêmicas, não dados de uma implantação. A estimativa resulta em cerca de 23–25 requisições/s no pico e 4,5 TB de armazenamento em cinco anos.

O desafio final exige triagem e roteamento com classificação por IA multiagente, integração com inventário legado, RabbitMQ com DLQ/retry, ADR de agentes e implementação State. Disponibilidade, resiliência e escalabilidade orientam as decisões.

## 2. Solução proposta e demonstração disponível
A arquitetura proposta mantém núcleo modular e worker de roteamento desacoplado. A interação imediata utiliza REST/JSON; a mensageria projetada utiliza RabbitMQ/AMQP. A ACL protege o domínio das particularidades do inventário. O ciclo dos tickets utiliza State.

A implementação JavaScript atual é uma demonstração local: filas em arrays, inventário XML simulado, repositório de tickets sem banco durável e classificadores por regras/resposta fixa. O navegador executa módulos locais e um servidor Python entrega arquivos estáticos. Não há API REST operacional, RabbitMQ conectado, agentes de modelos reais, PostgreSQL, pgvector ou RAG implementados nesta base.

**Model Tiering não comprova multiagentes.** As classes LocalSlmClassifier e CloudLlmClassifier representam uma alternância simulada de classificadores. A coordenação efetiva de agentes com modelos deve ser implementada e validada, conforme a ADR 006.

## 3. Requisitos de qualidade
| Atributo | Cenário e resposta esperada | Meta proposta, não medida |
|---|---|---|
| Disponibilidade | A loja abre ticket enquanto o roteador falha; núcleo registra e mantém pendência | Conciliar todos os tickets confirmados após recuperação; exige persistência/outbox |
| Resiliência | Inventário fica lento ou indisponível; timeout, breaker e fallback evitam espera indefinida | Timeout 1,5 s e até 3 retries; política completa da ADR 004 ainda não validada |
| Escalabilidade | Aumento de mensagens na carga estimada; fila absorve variação | 25 msg/s por 60 min e 75 msg/s por 15 min; metas da ADR 007 |
| Integridade | Há reentrega após falha; consumidor evita duplicar o efeito de negócio | Idempotência durável e conciliação por evento; não implementadas |

Não usar a existência de DLQ como garantia de zero perda. A demo em memória perde filas ao encerrar o processo.

## 4. Diagramas e domínio
- [C1 — Contexto](docs/c4/nivel1-contexto.puml)
- [C2 — Contêineres](docs/c4/nivel2-conteineres.puml)
- [C3 — Componentes](docs/c4/nivel3-componentes.puml)
- [DDD e contextos](docs/ddd.md)

Os diagramas devem separar recursos projetados de recursos efetivamente implementados. A presença de banco vetorial ou gateway em um desenho não comprova sua execução. A equipe deve conferir a coerência dos três níveis após cada alteração.

## 5. SOLID e padrões
| Elemento | Arquivo | Papel |
|---|---|---|
| DIP — portas | src/domain/ports.js | InventoryPort e ClassifierPort isolam infraestrutura |
| State | src/domain/ticket/TicketState.js | Regras por estado do chamado |
| Adapter / ACL | src/infrastructure/LegacyInventoryAdapter.js | Tradução do XML simulado para DTO |
| Strategy | src/domain/routing/RoutingStrategy.js | Seleção por habilidade, região e disponibilidade |
| Decorator / breaker | src/infrastructure/CircuitBreaker.js | Proteção do inventário e fallback |

A aplicação de padrões não dispensa testes de invariantes. A extensão de estados pode exigir alterações explícitas nas transições e deve ser revisada; não se afirma que toda extensão ocorre sem modificar código existente.

## 6. Decisões arquiteturais
| ADR | Assunto | Situação nesta consolidação |
|---|---|---|
| [001](docs/adr/ADR-001-estilo-arquitetural.md) | Monólito modular e roteamento assíncrono | Aceito na Sprint 1, conforme documento recebido |
| [002](docs/adr/ADR-002-dip-e-gof.md) | DIP e padrões | Proposto; o documento final da Sprint 2 não foi recebido |
| [003](docs/adr/ADR-003-protocolos-integracao.md) | REST/JSON e RabbitMQ/AMQP | Proposto na Sprint 3 |
| [004](docs/adr/ADR-004-resiliencia.md) | Timeout, retry, breaker e fallback | Proposto na Sprint 3 |
| [005](docs/adr/ADR-005-stack-tecnologica.md) | Stack demonstrativa JavaScript | Proposto para consolidação final |
| [006](docs/adr/ADR-006-ia-guardrails-tiering.md) | Ecossistema de agentes e guardrails | Proposto para consolidação final |
| [007](docs/adr/ADR-007-selecao-broker.md) | Seleção do broker e TCO | Proposto na entrega histórica da Sprint 4 |
| [008](docs/adr/ADR-008-bounded-contexts-acl.md) | DDD e ACL do inventário | Proposto; reorganiza o conteúdo que colidia com ADR 004 |

O caminho antigo ADR-004-bounded-contexts-acl.md foi mantido como aviso de migração. Os IDs históricos 003, 004 e 007 e seus status são preservados. A equipe pode registrar aceite posterior com responsável, data e evidência reais; essa aprovação não é presumida pela criação destes arquivos.

## 7. Execução local
Requer Node.js 20+; a configuração de CI da base usa Node 22. A interface estática requer Python 3.

```bash
npm run demo
npm test
npm start
```

Após npm start: http://localhost:8080/public/ . Trata-se de servidor estático e execução local, sem backend persistente. Não inserir dados reais; revisar o uso de innerHTML com descrição do ticket antes de disponibilizar a interface a terceiros.

`npm test` depende de arquivos em tests/. O PR #2 originalmente não os incluía. A contribuição do Lucas adiciona tests/integracao-resiliencia.test.js; a de Daniel deve tratar State e isolamento arquitetural. Executar novamente após integrar todos os PRs, sem declarar que um log isolado comprova a integração final.

## 8. Testes e diferença de stack
Os testes JavaScript com node:test não são ArchUnit. A atividade exige ArchUnit; permanece necessário implementar a parte exigida em Java ou obter do professor aceite explícito e registrado para uma alternativa. Não declarar equivalência automática nem marcar essa exigência como cumprida.

Na preparação da contribuição de Lucas, 14 testes locais foram aprovados. Isso não comprova testes executados pessoalmente pelos demais integrantes nem execução do CI da main. Novos resultados devem incluir comando, versão, data e commit testado.

## 9. Entrega individual e revisão
Usar branches individuais e PRs com defesa técnica. Cada integrante deve revisar pelo menos um colega. A main exige aprovação; não usar aprovação própria ou atribuição fictícia de contribuição.

[Consolidação e checklist de entrega](docs/entrega-final/checklist-gabriel.md) · [Rastreabilidade da ADR 007](docs/entrega-final/registro-consolidacao.md).

## 10. Limitações e próximos passos
- Conectar RabbitMQ real, implementar confirmações, persistência e tratamento de duplicatas.
- Implementar e avaliar coordenação multiagente real, minimização de PII e saída estruturada.
- Completar política percentual do breaker e jitter da ADR 004; o código demonstrativo usa falhas consecutivas.
- Resolver ArchUnit/Java versus stack JavaScript adotada no demonstrador.
- Renderizar/revisar C4 e alinhar modelos ao código real.
- Validar as metas de desempenho, segurança e custos; não há benchmark ou orçamento de produção.

## Fontes
Documentos históricos fornecidos pela equipe; Sprint 4 / ADR 007 original em [docs/fontes/sprint4-adr007-original.pdf](docs/fontes/sprint4-adr007-original.pdf). A Sprint 3 original também está preservada para verificar ADRs 003 e 004.
