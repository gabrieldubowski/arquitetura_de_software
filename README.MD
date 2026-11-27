# Sysop Squad: Suporte Técnico e Ticketing

> **Architectural Kata nº 5** · Arquitetura de Software · 6º Período, Engenharia de Software · UniSENAI PR
> **Sprint 4: Final do Projeto por Equipes**

---

## Sumário

1. [Equipe e responsabilidades](#1-equipe-e-responsabilidades)
2. [Como o trabalho foi feito](#2-como-o-trabalho-foi-feito)
3. [Visão geral do sistema](#3-visão-geral-do-sistema)
4. [Atributos de qualidade e QAW](#4-atributos-de-qualidade-e-qaw)
5. [Modelo C4](#5-modelo-c4)
6. [Domain-Driven Design](#6-domain-driven-design)
7. [SOLID e padrões GoF](#7-solid-e-padrões-gof)
8. [Resiliência, integração e IA](#8-resiliência-integração-e-ia)
9. [ADRs](#9-adrs)
10. [Testes e Fitness Functions](#10-testes-e-fitness-functions)
11. [Estrutura do repositório](#11-estrutura-do-repositório)
12. [Como executar](#12-como-executar)
13. [Fluxo de Git](#13-fluxo-de-git)

---

## 1. Equipe e responsabilidades

Os papéis abaixo são os definidos pela equipe na Sprint 1 e mantidos até a Sprint 4.

| Integrante | Papel | O que fez |
|---|---|---|
| **Rafael Romero** | Líder | Decisão arquitetural, elaboração e defesa do ADR e dos trade-offs. Reuniu e organizou o repositório e o Pull Request. |
| **Lucas Martins** | Pesquisador | Levantamento do domínio, definição dos atributos de qualidade, QAW e apoio à análise das alternativas arquiteturais. |
| **Gabriel França** | Executor | Elaboração e organização dos modelos C4, garantindo coerência com o QAW e os ADRs. |
| **Daniel Armando** | Executor | Elaboração e organização dos modelos C4, garantindo coerência com o QAW e os ADRs. |

---

## 2. Como o trabalho foi feito

**A equipe trabalhou com um único computador.** A Sprint 4 foi desenvolvida em grupo, reunida em torno de uma só máquina, e por isso **todos os commits e o Pull Request saem da conta de Rafael Romero (`Rafabigode`)**. O histórico do Git, portanto, não mostra a participação individual de cada integrante. Ela está descrita na tabela da seção 1.

As decisões de arquitetura (estilo, atributos de qualidade, ADRs, C4) vêm da Sprint 1 e foram discutidas e validadas pela equipe. Elas foram traduzidas em código, diagramas e testes na Sprint 4.

---

## 3. Visão geral do sistema

**Contexto.** O Sysop Squad é o motor de suporte técnico de uma rede varejista com **1.000 lojas de eletrônicos**. Os chamados são direcionados aos consultores de TI considerando **localização, habilidade e disponibilidade**, respeitando a **LGPD** (coleta mínima de dados dos consultores). Uptime é requisito de operação, não luxo.

**Desafio da kata.** Criar a triagem e o roteamento inteligente de chamados técnicos com **IA multi-agente**, integrada a um **sistema legado de inventário** (XML), mantendo tolerância a falhas nos picos de submissão.

**Solução em resumo.**
- Arquitetura de **Monólito Modular** (módulos Tickets, Consultores e Roteamento) com processamento **assíncrono** do roteamento.
- O chamado é registrado primeiro e o pedido de roteamento vai para uma **fila** (RabbitMQ, com retry exponencial e DLQ). Se o roteamento falhar, o chamado continua registrado.
- Agentes de IA com **Model Tiering** (modelo local primeiro; LLM em nuvem só se a confiança for baixa) e **guardrails** (higienização de PII e validação de schema).
- O inventário legado é isolado por uma **Camada Anti-Corrupção** (Adapter + Circuit Breaker).
- O ciclo de vida do chamado usa o padrão **State**.

---

## 4. Atributos de qualidade e QAW

| Prioridade | Atributo | Cenário (Fonte → Estímulo → Artefato → Ambiente → Resposta) | Medida da resposta |
|---|---|---|---|
| 1 | Disponibilidade | Usuários das lojas → abrem/consultam chamados → Sysop Squad → produção → continua recebendo chamados | Abertura de ticket nunca depende do roteamento |
| 2 | Resiliência | Roteamento ou inventário indisponível → falha → Router/ACL → produção → chamado fica registrado aguardando | 0 tickets perdidos |
| 3 | Escalabilidade | Lojas → pico simultâneo de abertura/consulta → Sysop Squad → pico de uso → processa sem ficar indisponível | ~25 req/s de pico, erro < 1% |

### Análise BOTE (Sprint 1)

| Item | Valor |
|---|---|
| Lojas | 1.000 |
| Tickets por loja/dia | 10 |
| Tickets por dia | 10.000 |
| Requisições por ticket | 20 |
| Requisições por dia | 200.000 (≈ 2,3 req/s na média) |
| Fator de pico | 10× → **≈ 23 a 25 req/s** |
| Tamanho médio por ticket | 250 KB |
| Armazenamento | 2,5 GB/dia → ≈ 912 GB/ano → **≈ 4,5 TB em 5 anos** |

Essa carga não justifica microsserviços (ver [ADR-001](docs/adr/ADR-001-estilo-arquitetural.md)).

---

## 5. Modelo C4

Os diagramas estão em PlantUML (Diagrams-as-Code) e podem ser renderizados colando o conteúdo em <https://www.plantuml.com/plantuml>.

| Nível | Diagrama | Arquivo |
|---|---|---|
| 1 | Contexto (Lojas, Consultores, Email, Localização, RH, LLM, Inventário) | [`docs/c4/nivel1-contexto.puml`](docs/c4/nivel1-contexto.puml) |
| 2 | Contêineres (Gateway, monólito modular, RabbitMQ, worker, IA, banco vetorial, ACL) | [`docs/c4/nivel2-conteineres.puml`](docs/c4/nivel2-conteineres.puml) |
| 3 | Componentes (State, ports, TriageService, adapter, circuit breaker, broker) | [`docs/c4/nivel3-componentes.puml`](docs/c4/nivel3-componentes.puml) |

---

## 6. Domain-Driven Design

Documentação completa em [`docs/ddd.md`](docs/ddd.md).

| Tipo | Subdomínio |
|---|---|
| **Core** | Triagem e roteamento inteligente de chamados |
| **Supporting** | Consultores (dados do RH), notificações e SLA |
| **Generic** | Autenticação SSO, LLM de terceiros |

**Camada Anti-Corrupção (ACL):** `src/infrastructure/LegacyInventoryAdapter.js` isola o XML do inventário legado e impede que o vocabulário dele entre no domínio.

---

## 7. SOLID e padrões GoF

**DIP (Dependency Inversion).** O domínio declara `InventoryPort` e `ClassifierPort` em `src/domain/ports.js`; a infraestrutura implementa.

**OCP (Open/Closed).** Um novo estado, regra de roteamento ou classificador entra como nova classe, sem alterar o código existente.

| Padrão | Categoria | Local | Problema resolvido |
|---|---|---|---|
| State | Comportamental | `src/domain/ticket/TicketState.js` | Ciclo de vida do chamado sem `if/else` |
| Strategy (roteamento) | Comportamental | `src/domain/routing/RoutingStrategy.js` | Escolhe o consultor por habilidade, localização e disponibilidade |
| Strategy (tiering) | Comportamental | `src/infrastructure/ModelTieringClassifier.js` | Alterna entre modelo local e LLM |
| Adapter | Estrutural | `src/infrastructure/LegacyInventoryAdapter.js` | Traduz XML legado para DTO |
| Decorator | Estrutural | `src/infrastructure/CircuitBreaker.js` | Adiciona resiliência ao inventário |

---

## 8. Resiliência, integração e IA

### Resiliência
| Padrão | Onde | Efeito |
|---|---|---|
| Circuit Breaker + Fallback | `src/infrastructure/CircuitBreaker.js` | Estados CLOSED, OPEN e HALF_OPEN; a triagem continua com o legado fora do ar |
| Retry exponencial | `src/infrastructure/MessageBroker.js` | Tentativas com espera de 100, 200 e 400 ms |
| Dead Letter Queue | `src/infrastructure/MessageBroker.js` | Mensagens que esgotam as tentativas ficam na DLQ, sem perda |
| Degradação graciosa | `src/application/RoutingService.js` | Sem consultor disponível, o chamado fica registrado aguardando |

### IA
- **Model Tiering:** modelo local primeiro; LLM em nuvem apenas se a confiança for menor que 0,7.
- **Guardrails** em `src/application/TriageService.js`: `sanitizePII` remove e-mail e CPF antes de enviar ao modelo; `validateClassification` valida a saída e usa a categoria `GERAL` como fallback seguro.
- Os modelos de IA são **simulados** nesta entrega (regras simples), para demonstrar a arquitetura sem depender de serviços externos.

---

## 9. ADRs

| ADR | Título | Status | Data |
|---|---|---|---|
| [001](docs/adr/ADR-001-estilo-arquitetural.md) | Monólito Modular com roteamento assíncrono | Aprovado | 2026-09-03 |
| [002](docs/adr/ADR-002-dip-e-gof.md) | Desacoplamento com DIP e padrões GoF | Aprovado | 2026-11-26 |
| [003](docs/adr/ADR-003-protocolos-integracao.md) | Protocolos de integração (REST e RabbitMQ) | Aprovado | 2026-11-26 |
| [004](docs/adr/ADR-004-bounded-contexts-acl.md) | Contextos delimitados e ACL | Aprovado | 2026-11-26 |
| [005](docs/adr/ADR-005-stack-tecnologica.md) | Stack tecnológica | Aprovado | 2026-11-26 |
| [006](docs/adr/ADR-006-ia-guardrails-tiering.md) | IA, Model Tiering e Guardrails | Aprovado | 2026-11-26 |

---

## 10. Testes e Fitness Functions

Executados com `node:test`, sem dependências externas. O CI do GitHub roda tudo a cada Pull Request.

| Arquivo | O que verifica |
|---|---|
| `tests/system.test.js` | State, Adapter, Circuit Breaker, retry e DLQ, guardrails, triagem e roteamento |
| `tests/architecture.test.js` | **Fitness Functions** de arquitetura (abaixo) |
| `tests/stress.test.js` | Teste de estresse: pico de 25 req/s e sobrecarga de 10× com falhas injetadas |

**Fitness Functions** (equivalente ao ArchUnit em JavaScript):
1. O Domínio não importa a Infraestrutura.
2. O Domínio não importa a Aplicação.
3. A Aplicação não importa a Infraestrutura (só portas).
4. Implementações de porta estendem a abstração do domínio.

**Teste de estresse.** Simula 250 chamados (pico) e 2.500 (10×), com o inventário legado caindo, mensagens transitórias e mensagens "venenosas". Verifica que nenhum chamado se perde, que só as venenosas vão para a DLQ e que o p95 e a taxa de erro ficam dentro do alvo. É feito em memória, com broker simulado, e valida a lógica de resiliência, não a capacidade de uma infraestrutura real.

---

## 11. Estrutura do repositório

```
.
├── README.md
├── package.json
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/ci.yml          ← roda os testes no GitHub
├── docs/
│   ├── c4/                       ← níveis 1, 2 e 3 (PlantUML)
│   ├── adr/                      ← 6 ADRs
│   └── ddd.md                    ← subdomínios e mapa de contexto
├── src/
│   ├── domain/                   ← regras de negócio (ticket, routing, ports)
│   ├── application/              ← casos de uso (triagem, roteamento)
│   └── infrastructure/           ← adapters, circuit breaker, broker, IA
├── tests/                        ← unitários, arquitetura e estresse
└── public/                       ← página web de demonstração
```

---

## 12. Como executar

Requer **Node 20 ou mais novo** para os testes e a demo.

```bash
npm test        # testes, fitness functions e teste de estresse
npm run demo    # fluxo de triagem no terminal
npm start       # página web em http://localhost:8080/public/ (requer Python)
```

---

## 13. Fluxo de Git

- Nenhum commit direto na `main`, que é protegida (Pull Request com no mínimo 1 aprovação).
- O trabalho está na branch `feature/rafael-romero` e entra na `main` por Pull Request.
- Cada integrante revisa o Pull Request de pelo menos um colega (Files changed, comentários e Approve).
