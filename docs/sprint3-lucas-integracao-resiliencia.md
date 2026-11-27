# Sprint 3 — contribuição de Lucas Martins

## Escopo desta contribuição
Evoluir a base JavaScript enviada no PR #2: retry exponencial, DLQ demonstrativa, tempo limite no inventário e proteção do Circuit Breaker. São melhorias reais ao código existente, sem nova implementação em Java nem duplicação do projeto inteiro.

## Alterações
- MessageBroker: espera padrão de 200, 400 e 800 ms, três retentativas após a tentativa inicial; validação de configuração.
- CircuitBreaker: recuperação padrão após 30 segundos e somente um probe simultâneo em Half-Open. Sucesso de uma chamada antiga não fecha indevidamente um circuito aberto.
- ResilientInventory: timeout de 1,5 segundo e fallback já compatível com o consumidor existente.
- Timeout: espera limitada com limpeza do timer. Não cancela a operação subjacente.
- 14 testes com node:test e assert, sem dependências adicionais.

## Relação com as decisões anteriores
A ADR 003 da Sprint 3 propõe REST/JSON e RabbitMQ/AMQP. A ADR 004 original é de resiliência; o PR #2 usa o mesmo número para DDD/ACL, conflito que precisa de correção pela equipe na consolidação. A ADR 007, entregue como Sprint 4, mantém RabbitMQ. Esta contribuição não renumera ou aprova ADRs históricas.

## Limitações e trade-offs
O MessageBroker do PR #2 é um simulador em memória: não conecta a RabbitMQ, não implementa AMQP, confirmações, persistência ou cluster. Os testes demonstram a lógica local e não atestam operação de RabbitMQ. Jitter e falhas reais de transporte permanecem pendentes.

O breaker desta base usa falhas consecutivas, e não a taxa maior que 50% em janela de 10 s da ADR 004 original. A escolha foi manter a interface existente e registrar a divergência, sem afirmar conformidade completa. O timeout limita a espera; clients reais precisam implementar cancelamento e limites de conexões para evitar acumular tarefas pendentes.

O legado XML é simulado. O fallback usa modelo desconhecido e garantia false; esse false não deve ser interpretado como prova de ausência de garantia. Em produção, usar estado de garantia desconhecido e informação explícita de indisponibilidade. Não fechar chamados com base somente nesse fallback.

Esta contribuição não comprova uso de IA generativa real. O ambiente de agentes e sua governança são outra frente da entrega. Os testes Node.js também não substituem ArchUnit, exigido no enunciado para Java; a equipe deve resolver essa diferença com a stack adotada e o professor.

## Validação
Executar na raiz do projeto: `npm test`. Para executar apenas estes testes: `node --test tests/integracao-resiliencia.test.js`.
Evidência local: [resultado dos testes](evidence/lucas-testes.txt).
Os tempos de retry são verificados por injeção de uma espera simulada; não representam medição de latência de rede. Os testes de timeout usam timers locais, sem acesso a serviços externos.
