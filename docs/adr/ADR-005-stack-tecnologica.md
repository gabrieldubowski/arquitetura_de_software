# ADR-005: Seleção de stack (Node.js, RabbitMQ, PostgreSQL + pgvector)

- **Status:** Aprovado
- **Data:** 2026-11-26

## Contexto
Entrega acadêmica com prazo curto, equipe com conhecimento em JavaScript.

## Decisão
**Node.js/JavaScript** (ES Modules) + HTML/CSS, **RabbitMQ**, **PostgreSQL com pgvector** (um só banco para relacional e vetorial) e API Gateway leve em Node.

## Alternativas rejeitadas
- Java/.NET: maior robustez, mas curva e tempo de setup maiores.
- Banco vetorial dedicado (Pinecone, Milvus): custo e complexidade operacional extras.

## Consequências / Trade-offs
(+) Rapidez de entrega, menos peças móveis.
(-) Tipagem fraca em JS (mitigada por testes); pgvector escala menos que soluções dedicadas.
