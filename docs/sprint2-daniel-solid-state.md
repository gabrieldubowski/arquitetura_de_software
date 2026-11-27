# Contribuição de Daniel Armando — SOLID e State

O usuário identificou Daniel como responsável pela Sprint 2. Esta contribuição complementa a base JavaScript do PR #2; não é um documento histórico de aprovação da ADR 002.

## Alterações reais
Validação de categoria e técnico nas classes State, sem avançar ou modificar dados quando inválidos. Preservadas as transições da base: ABERTO, TRIADO, ATRIBUIDO, EM_ATENDIMENTO, RESOLVIDO, FECHADO. Reabertura de RESOLVIDO retorna a EM_ATENDIMENTO mantendo o técnico; FECHADO é terminal.

Testes de ciclo e ações inválidas, injeção de Strategy, indisponibilidade de consultor e verificações estáticas de dependências. InventoryPort e ClassifierPort ficam no domínio e recebem implementações na infraestrutura. Isso materializa DIP e permite testar serviços sem clients reais.

## Trade-offs e limitações
State distribui as regras em classes e exige mais arquivos. A validação impede técnico vazio e categoria não permitida no fluxo público. Entretanto state e setState continuam acessíveis na entidade; este é um demonstrador, não uma fronteira de segurança contra alteração arbitrária pelo chamador.

A Strategy atual pontua habilidade e região, mas pode selecionar um consultor sem a habilidade quando não houver especialista disponível. A equipe deve definir se isso é permitido; este pacote não altera a regra silenciosamente.

As fitness functions são testes JavaScript de imports estáticos e herança. Não são ArchUnit, não cobrem imports dinâmicos nem constituem equivalência aceita automaticamente pelo professor. A exigência de ArchUnit permanece pendente de resolução pela equipe.

## Executar
`npm test` na raiz; teste individual: `node --test tests/estado-chamado.test.js tests/architecture.test.js`. A preparação local acompanha resultado em docs/evidence/daniel-testes.txt. Cada autor deve conferir a contribuição e registrar apenas as execuções que realmente realizou.
