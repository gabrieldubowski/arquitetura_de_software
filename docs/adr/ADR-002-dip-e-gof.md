# ADR-002: Desacoplamento com DIP e padrões GoF

- **Status:** Aprovado
- **Data:** 2026-11-26

## Contexto
O domínio não pode depender de infraestrutura (LLM, legado, broker); regras de negócio mudam com frequência.

## Decisão
Aplicar **DIP** (portas `InventoryPort`, `ClassifierPort` no domínio), **State** (ciclo do chamado), **Adapter** (inventário legado) e **Strategy/Tiering** (classificadores).

## Alternativas rejeitadas
- Condicionais `if/else` por status: viola OCP e cresce sem controle.
- Instanciar clientes diretamente nos serviços: acoplamento e dificuldade de teste.

## Consequências / Trade-offs
(+) Testabilidade, OCP (novo estado/classificador sem alterar o existente).
(-) Mais classes e indireção.
