# Sysop Squad - Suporte Técnico e Ticketing

> Architectural Kata nº 5 | Arquitetura de Software, 6º Período, Engenharia de Software | Sprint 4

## Equipe
| Integrante | Função na Sprint 4 | GitHub |
|---|---|---|
| Rafael Romero | Líder & Arquiteto Principal | @Rafabigode |
| Lucas Martins | Pesquisador & Modelagem DDD | @[usuario-github] |
| Daniel Armando | Executor & Resiliência/Integração | @[usuario-github] |
| Gabriel França | Executor & QA & Fitness Functions | @[usuario-github] |

## 1. Visão Geral
**Contexto:** o Sysop Squad é o motor de suporte técnico de uma rede varejista com **1.000 lojas de eletrônicos**. Os chamados são direcionados aos consultores de TI considerando **localização, habilidade e disponibilidade**, respeitando a **LGPD** (coleta mínima de dados dos consultores). Uptime é requisito de operação.

**Desafio:** criar a triagem e o roteamento inteligente de chamados técnicos com **IA multi-agente**, integrada a um **sistema legado de inventário** (XML), mantendo tolerância a falhas nos picos de submissão.

**Solução:** monólito modular (Ticketing, Triage/AI, Inventory) com um worker assíncrono. Chamados entram por REST, são publicados no **RabbitMQ** (com retry exponencial e DLQ) e classificados por agentes de IA com **Model Tiering** (SLM local, LLM em nuvem só se a confiança for baixa) e guardrails (PII e schema). O inventário legado é isolado por uma **ACL** (Adapter + Circuit Breaker). O ciclo de vida do chamado usa o padrão **State**.

## 2. Atributos de Qualidade (QAW)
| Atributo | Cenário (Fonte → Estímulo → Artefato → Ambiente → Resposta) | Medida |
|---|---|---|
| 1. Disponibilidade | Usuários das lojas → abrem/consultam chamados → Sysop Squad → produção → continua recebendo chamados | Uptime alto; abertura de ticket nunca depende do roteamento |
| 2. Resiliência | Mecanismo de roteamento/inventário indisponível → falha → Router/ACL → produção → chamado fica registrado aguardando roteamento (fila, Circuit Breaker, fallback) | 0 tickets perdidos |
| 3. Escalabilidade | Lojas → pico simultâneo de abertura/consulta → Sysop Squad → pico de uso → processa sem ficar indisponível | ~25 req/s de pico, taxa de erro < 1% |

**Análise BOTE (Sprint 1):** 1.000 lojas × 10 tickets/dia = 10.000 tickets/dia; × 20 requisições por ticket = 200.000 req/dia ≈ 2,3 req/s; pico de 10× ≈ **23 a 25 req/s**. Armazenamento: 250 KB/ticket → 2,5 GB/dia → ≈ 912 GB/ano → **≈ 4,5 TB em 5 anos**. Essa carga não justifica microsserviços (ver ADR-001).

## 3. Modelo C4
- Nível 1, Contexto: [`docs/c4/nivel1-contexto.puml`](docs/c4/nivel1-contexto.puml)
- Nível 2, Contêineres (com container de IA e banco vetorial): [`docs/c4/nivel2-conteineres.puml`](docs/c4/nivel2-conteineres.puml)
- Nível 3, Componentes: [`docs/c4/nivel3-componentes.puml`](docs/c4/nivel3-componentes.puml)

Renderize colando os arquivos em <https://www.plantuml.com/plantuml>.

## 4. DDD
Veja [`docs/ddd.md`](docs/ddd.md).
- **Core:** triagem e roteamento inteligente · **Supporting:** notificações/SLA · **Generic:** SSO, LLM de terceiros.
- **ACL:** `src/infrastructure/LegacyInventoryAdapter.js` isola o XML legado.

## 5. SOLID e GoF
- **DIP:** o domínio declara `InventoryPort` e `ClassifierPort` (`src/domain/ports.js`); a infraestrutura implementa.
- **OCP:** novo estado ou classificador sem alterar o código existente.

| Padrão | Categoria | Local | Problema resolvido |
|---|---|---|---|
| State | Comportamental | `src/domain/ticket/TicketState.js` | Ciclo de vida do chamado sem `if/else` |
| Adapter | Estrutural | `src/infrastructure/LegacyInventoryAdapter.js` | Traduz XML legado para DTO |
| Strategy (roteamento) | Comportamental | `src/domain/routing/RoutingStrategy.js` | Escolhe o consultor por habilidade, localização e disponibilidade |
| Strategy (tiering) | Comportamental | `src/infrastructure/ModelTieringClassifier.js` | Alterna SLM e LLM |
| Decorator | Estrutural | `src/infrastructure/CircuitBreaker.js` | Adiciona resiliência ao inventário |

## 6. Resiliência e IA-Native
- **Circuit Breaker + Fallback:** `CircuitBreaker.js` (estados CLOSED, OPEN e HALF_OPEN).
- **Mensageria:** `MessageBroker.js` simula o RabbitMQ com **retry exponencial** (100, 200, 400 ms) e **DLQ**.
- **IA:** Model Tiering (SLM local, LLM em nuvem) e RAG sobre pgvector. **Guardrails:** `sanitizePII` e `validateClassification` em `TriageService.js`.

## 7. ADRs
| ADR | Título | Status | Data |
|---|---|---|---|
| [001](docs/adr/ADR-001-estilo-arquitetural.md) | Monólito Modular + Worker | Aprovado | 2026-11-26 |
| [002](docs/adr/ADR-002-dip-e-gof.md) | DIP e padrões GoF | Aprovado | 2026-11-26 |
| [003](docs/adr/ADR-003-protocolos-integracao.md) | REST e RabbitMQ | Aprovado | 2026-11-26 |
| [004](docs/adr/ADR-004-bounded-contexts-acl.md) | Contextos e ACL | Aprovado | 2026-11-26 |
| [005](docs/adr/ADR-005-stack-tecnologica.md) | Stack tecnológica | Aprovado | 2026-11-26 |
| [006](docs/adr/ADR-006-ia-guardrails-tiering.md) | IA, Tiering e Guardrails | Aprovado | 2026-11-26 |

## 8. Fitness Functions
`tests/architecture.test.js` (equivalente ao ArchUnit em JS, usando `node:test`):
1. Domínio não importa Infraestrutura.
2. Domínio não importa Aplicação.
3. Aplicação não importa Infraestrutura (só portas).
4. Implementações de porta estendem a abstração do domínio.

## Como executar
```bash
npm test        # testes de unidade + fitness functions
npm run demo    # fluxo no terminal
npm start       # interface web em http://localhost:8080/public/
```
Requer Node 20+ (sem dependências externas). O workflow `.github/workflows/ci.yml` executa `npm test` (incluindo as Fitness Functions) a cada Pull Request.

## Fluxo de Git
Nada de commit direto na `main`. Use `feature/nome-aluno`, abra o PR com o template e peça revisão de um colega.
