# ADR-003: Protocolos de comunicação

**Status:** Proposto na Sprint 3; implementação integral não comprovada.

## Contexto
A Sprint 3 registra a ADR 003 como Proposto. Chamadas imediatas e processamento de roteamento têm necessidades diferentes.

## Decisão
REST/JSON para interações síncronas; RabbitMQ/AMQP para solicitações assíncronas. Registrar o ticket antes do envio. A ADR 007 detalha broker e outbox proposta.

## Alternativas rejeitadas
REST integralmente síncrono acopla disponibilidade. Kafka e gRPC interno não justificaram complexidade adicional no cenário estudado; não são incapazes de suportar a carga.

## Consequências e trade-offs
Consistência eventual, contratos versionados, filas observáveis. DLQ não garante zero perda; confirmar publicação, tratar reentrega e persistir efeitos. O MessageBroker.js atual simula filas e não implementa AMQP.

## Validação e aceite
Identificar os testes pertinentes, responsáveis e evidências antes do aceite. Não confundir arquitetura projetada com infraestrutura implantada.
