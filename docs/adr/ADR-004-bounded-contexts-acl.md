# ADR-004: Contextos Delimitados e Camada Anti-Corrupção

- **Status:** Aprovado
- **Data:** 2026-11-26

## Contexto
O inventário legado fala XML e usa outro vocabulário (`assetId`, `warranty`).

## Decisão
Isolar o legado em um contexto próprio com **ACL** implementada por um **Adapter** protegido por **Circuit Breaker** com fallback.

## Alternativas rejeitadas
- Chamar o legado diretamente do domínio: corrompe a linguagem ubíqua.
- Reescrever o legado: fora do escopo e do prazo.

## Consequências / Trade-offs
(+) Domínio limpo; falhas do legado não derrubam a triagem (degradação graciosa).
(-) Camada extra de tradução para manter.
