# ADR-002: Desacoplamento com DIP e padrões GoF

**Status:** Proposto — revisão e aceite da equipe pendentes.

## Contexto
O planejamento recebido da Sprint 2 pede SRP, DIP, abstrações e UML. O arquivo final/ADR original da sprint não foi fornecido. Este registro é proposta de consolidação, não reconstrução de aceite histórico.

## Decisão
Portas no domínio; adapters na infraestrutura. State para ciclo, Strategy para atribuição e Adapter/ACL para inventário. A aplicação deve receber dependências por composição.

## Alternativas rejeitadas
Clientes concretos instanciados no domínio prejudicam troca e testes. Switch central de estados concentra transições.

## Consequências e trade-offs
Mais interfaces e classes. OCP exige extensões coerentes com as invariantes; não significa ausência de qualquer alteração no código. Testes de arquitetura e State continuam necessários.

## Validação e aceite
Identificar os testes pertinentes, responsáveis e evidências antes do aceite. Não confundir arquitetura projetada com infraestrutura implantada.
