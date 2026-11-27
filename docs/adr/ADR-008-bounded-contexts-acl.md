# ADR-008: Contextos delimitados e ACL de inventário

**Status:** Proposto — revisão e aceite da equipe pendentes.

## Contexto
O PR #2 criou esse conteúdo como ADR 004, em conflito com o registro histórico de resiliência. Este documento reorganiza a proposta sem apagar essa história.

## Decisão
Separar limites lógicos de Chamados, Triagem/Despacho, Inventário, Consultores e Notificações. Isolar inventário pela porta InventoryPort e um Adapter que traduz XML/DTO. Dependências técnicas não devem contaminar o domínio.

## Alternativas rejeitadas
Acessar contrato legado diretamente pelo domínio aumenta acoplamento. Reescrever legado real foge ao escopo; o cliente atual é apenas um simulador.

## Consequências e trade-offs
Mais uma camada para manter, contratos e validação. O uso de regex para XML é demonstrativo e requer revisão antes de contrato legado real. Preservar proteção definida na ADR 004 e esclarecer semântica de dados desconhecidos.

## Validação e aceite
Identificar os testes pertinentes, responsáveis e evidências antes do aceite. Não confundir arquitetura projetada com infraestrutura implantada.
