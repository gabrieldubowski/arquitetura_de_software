# ADR-001: Monólito modular e roteamento assíncrono

**Status:** Aceito na Sprint 1, conforme o documento recebido; mantido nesta consolidação.

## Contexto
A Sprint 1 estima aproximadamente 25 req/s em pico. As lojas precisam abrir chamados mesmo quando o roteamento falha. 1.000 lojas é premissa da BOTE, não dado de operação.

## Decisão
Manter núcleo modular com Tickets, Consultores e solicitação de Roteamento. O serviço separado processa o despacho efetivo por fila; evita-se duplicar a seleção do consultor no núcleo e no worker.

## Alternativas rejeitadas
Monólito sem limites amplia acoplamento. Microsserviços completos aumentam operação e coordenação sem ganho confirmado para o volume estimado.

## Consequências e trade-offs
Núcleo escala em conjunto; worker pode evoluir separadamente. Consistência eventual. A garantia de manter tickets confirmados depende de banco e publicação confiáveis, ausentes no simulador.

## Validação e aceite
Identificar os testes pertinentes, responsáveis e evidências antes do aceite. Não confundir arquitetura projetada com infraestrutura implantada.
