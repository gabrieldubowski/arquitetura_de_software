# ADR-003: Protocolos de integração (REST e AMQP/RabbitMQ)

- **Status:** Aprovado
- **Data:** 2026-11-26

## Contexto
Precisamos de interação síncrona com a UI e processamento assíncrono resiliente de triagem.

## Decisão
**REST/JSON** entre UI, gateway e API. **AMQP (RabbitMQ)** entre API e worker, com filas **DLQ** e **retry exponencial** (100ms, 200ms, 400ms...).

## Alternativas rejeitadas
- gRPC: ganho de desempenho desnecessário neste cenário e UI web.
- Kafka: poder de streaming excessivo; RabbitMQ atende melhor filas de trabalho com DLQ.

## Consequências / Trade-offs
(+) Load leveling nos picos de meia-noite, mensagens nunca perdidas (DLQ).
(-) Consistência eventual; é preciso monitorar a DLQ.
