# ADR-007: Seleção tecnológica do broker de mensageria

**Status:** Proposto, conforme original de 12/11/2026. **Entrega histórica:** Sprint 4, responsável informado: Gabriel França.

Este Markdown é uma síntese fiel para navegação. O [PDF original completo](../fontes/sprint4-adr007-original.pdf) é a fonte dos detalhes, premissas, sensibilidade, governança e critérios de aceite. Não se registra aprovação que não foi demonstrada.

## Contexto
Tickets devem chegar a equipes especializadas sem condicionar a abertura ao roteamento. A ADR 003 propõe RabbitMQ/AMQP; esta decisão detalha a escolha. O exercício de Content-Based Router com Kafka foi alternativa didática, não autorização de migração.
A estimativa de pico inicial é de 25 req/s. Hipóteses adicionais de payload de 2 KiB, 75 mensagens/s de pico e ausência de ordem global obrigatória precisam de validação. Requisição/s não equivale automaticamente a mensagem/s sustentada.

## Decisão proposta
Manter RabbitMQ com AMQP 0-9-1, topic exchange, filas duráveis por especialidade, mensagens persistentes, publisher confirms e ACK manual. O roteador da aplicação classifica o conteúdo e produz a routing key; o broker não interpreta JSON arbitrário.

Para alta disponibilidade, propor três nós em domínios distintos e quorum queues, condicionados a piloto e custo. A API deve registrar ticket e outbox na mesma transação. Consumidores devem persistir idempotência junto ao efeito de negócio. Essas medidas não estão implementadas pelo simulador JavaScript.

## Alternativas e matriz ponderada
Notas de 1 a 10, pesos de 1 a 5; pontuação máxima de 240. Julgamentos arquiteturais do estudo, não medições.

| Critério | Peso | RabbitMQ | Kafka | AWS SQS |
|---|---:|---:|---:|---:|
| Aderência ao fluxo e resiliência | 5 | 9 | 7 | 8 |
| TCO estimado em três anos | 4 | 8 | 5 | 9 |
| Maturidade e ecossistema | 3 | 9 | 9 | 9 |
| Ramp-up e continuidade | 4 | 8 | 5 | 6 |
| Governança e segurança | 4 | 8 | 8 | 9 |
| Portabilidade e operação | 4 | 8 | 6 | 5 |
| Total ponderado | 24 | 200 | 158 | 183 |
| Média ponderada | — | 8,33 | 6,58 | 7,63 |

RabbitMQ preserva AMQP e o fluxo transacional. Kafka oferece retenção/replay, requisitos não confirmados; sua rejeição não decorre de um limite técnico de 25 req/s. SQS tem menor custo simulado, mas adaptações AWS e portabilidade pesam contra no cenário atual. Se a estratégia se tornar exclusivamente AWS, reavaliar pesos e escolha.

## TCO — simulação acadêmica, sem cotação
Hipótese do orçamento: 25 mensagens/s por 8 h/dia e 22 dias/mês, total de 15.840.000 mensagens/mês. Não é regime comprovado pela BOTE. Mão de obra alocada: R$ 80/h. Valores nominais, sem correção.

| Componente (R$) | RabbitMQ | Kafka | AWS SQS |
|---|---:|---:|---:|
| Implantação | 3.200,00 | 5.120,00 | 3.840,00 |
| Infra/serviços mensais | 1.050,00 | 1.700,00 | 298,80 |
| Operação mensal | 480,00 | 800,00 | 240,00 |
| Recorrente mensal | 1.530,00 | 2.500,00 | 538,80 |
| TCO em 1 ano | 21.560,00 | 35.120,00 | 10.305,60 |
| TCO em 2 anos | 39.920,00 | 65.120,00 | 16.771,20 |
| TCO em 3 anos | 58.280,00 | 95.120,00 | 23.236,80 |

Fórmula: implantação + 12 × anos × recorrente mensal. O coeficiente SQS de R$ 2,50/milhão de operações é hipotético, não tarifa oficial. Não estão incluídos SNS, tributos, inflação, plantão 24×7, recuperação entre regiões e desenvolvimento comum do sistema. Valores são premissas, não gastos realizados.

## Consequências e trade-offs
Aceita-se TCO simulado maior que SQS em troca da continuidade AMQP e portabilidade. A equipe assume operação do cluster, contratos, segurança e tratamento de reentrega. Não se promete exactly-once ponta a ponta. DLQ não substitui banco de tickets nem arquivo histórico.
Riscos: duplicatas, publicação sem destino, acúmulo de backlog, saturação de disco, falha de maioria, retry infinito e exposição de PII. Mitigar com outbox, confirms, publicação mandatory, consumidores idempotentes, tentativas limitadas, permissões mínimas e métricas. As mitigações ainda precisam de implementação e validação reais.

## Validação proposta
- Confirmar rotas válidas, desconhecidas em triagem e inválidas isoladas.
- Executar 25 msg/s por 60 min e 75 msg/s por 15 min; p95 até 1 s entre publicação confirmada e início do consumo, backlog drenado em até 10 min.
- Interromper publicador, consumidor e um nó; conciliar eventos aceitos e efeitos duplicados; meta de retomada em até 60 s para falha de um nó.
- Verificar timeout, retries, breaker, fallback, DLQ, TLS e autorização.
- Registrar ambiente, commit, logs, parâmetros e custo observado.

São metas propostas, não resultados. Manter Proposto até registrar aceite e evidências. Revisar escolha se surgir replay obrigatório, estratégia exclusiva AWS, carga sustentada acima de 75 msg/s ou custo observado mais de 30% acima do orçamento por dois meses.

## Fontes técnicas do registro original
- https://www.rabbitmq.com/docs/exchanges
- https://www.rabbitmq.com/docs/quorum-queues
- https://kafka.apache.org/41/getting-started/introduction/
- https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html
- https://docs.aws.amazon.com/sns/latest/dg/sns-message-filtering.html

As referências sustentam comportamento das tecnologias. Não validam os preços hipotéticos ou as notas atribuídas.
