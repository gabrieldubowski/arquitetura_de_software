# ADR-006: Agentes de IA, Model Tiering e Guardrails

- **Status:** Aprovado
- **Data:** 2026-11-26

## Contexto
Classificar chamados por IA com custo controlado e sem expor dados pessoais.

## Decisão
**Model Tiering**: SLM local primeiro; escala ao LLM em nuvem se a confiança for < 0,7. **Guardrails**: higienização de PII antes do envio, validação de schema da saída e fallback para categoria `GERAL` (revisão humana).

## Alternativas rejeitadas
- Somente LLM em nuvem: custo/latência altos e risco de privacidade.
- Somente regras: baixa cobertura semântica.

## Consequências / Trade-offs
(+) Custo menor, privacidade, saída previsível.
(-) Duas rotas de modelo para manter; SLM pode errar em casos novos (mitigado pelo escalonamento).
