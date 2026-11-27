# ADR-006: Ecossistema de agentes, tiering e limites de autonomia

**Status:** Proposto — revisão e aceite da equipe pendentes.

## Contexto
O enunciado exige classificação por IA multiagente. O código LocalSlmClassifier utiliza regex; CloudLlmClassifier retorna resultado fixo. São simuladores e não modelos reais.

## Decisão
Projetar agente classificador e agente validador com contratos separados, coordenados por um orquestrador. Validar categoria e confiança; desacordo/baixa confiança encaminham à revisão humana. Agentes não podem executar comandos ou encerrar chamados. Tiering pode escolher modelos dentro de um agente, sem substituir a coordenação multiagente.

## Alternativas rejeitadas
Chamar um único LLM pode não atender ao desafio multiagente. Regex serve para testes, não comprova classificação por modelo. Autonomia irrestrita amplia risco sem necessidade.

## Consequências e trade-offs
Dois agentes adicionam custo e latência. Sanitização atual cobre somente alguns padrões de PII; não garante remoção de todos os dados pessoais. Integração com provedor, credenciais, avaliação de precisão, limites de custo e observabilidade estão pendentes. Não há RAG/pgvector implementado.

## Validação e aceite
Identificar os testes pertinentes, responsáveis e evidências antes do aceite. Não confundir arquitetura projetada com infraestrutura implantada.
