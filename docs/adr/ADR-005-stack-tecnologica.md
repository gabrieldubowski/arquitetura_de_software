# ADR-005: Stack do demonstrador e infraestrutura projetada

**Status:** Proposto — revisão e aceite da equipe pendentes.

## Contexto
A base do PR #2 usa JavaScript ES Modules, HTML/CSS, Node.js e servidor estático Python. Não há comprovação de domínio prévio de uma linguagem pela equipe.

## Decisão
Manter essa stack para a demonstração existente. RabbitMQ, banco persistente e gateway são componentes projetados, não conectados no código atual. Decidir se PostgreSQL/pgvector é realmente necessário antes de incluir como dependência; RAG não é requisito comprovado deste demonstrador.

## Alternativas rejeitadas
Uma migração completa de linguagem exige avaliar prazo e esforço. Banco vetorial sem busca implementada adiciona uma responsabilidade sem evidência de benefício.

## Consequências e trade-offs
JavaScript facilita reprodução local mas não atende por si só à exigência de ArchUnit. Resolver com professor/implementação Java antes de declarar conformidade. A base Java anteriormente preparada é alternativa distinta e não deve ser misturada sem revisão.

## Validação e aceite
Identificar os testes pertinentes, responsáveis e evidências antes do aceite. Não confundir arquitetura projetada com infraestrutura implantada.
