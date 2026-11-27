# ADR-004: Resiliência nas dependências externas

**Status:** Proposto na Sprint 3; parcialmente demonstrado, sem aceite presumido.

## Contexto
A ADR 004 original da Sprint 3 trata de falhas nas chamadas a Localização e RH. A mesma preocupação se aplica ao inventário e futuros agentes.

## Decisão
Política original proposta: timeout de 1,5 s, até 3 retentativas com backoff 200/400/800 ms e jitter; breaker acima de 50% de falhas numa janela de 10 s; após 30 s, poucas chamadas de teste em Half-Open. Fallback mantém ticket aguardando roteamento.

## Alternativas rejeitadas
Esperar indefinidamente esgota recursos. Retentar sem limite agrava sobrecarga. Descartar ticket ou simular atendimento concluído viola a degradação graciosa.

## Consequências e trade-offs
Mais latência e configuração. O código de base usa contagem consecutiva de falhas; o pacote do Lucas acrescenta timeout, recuperação em 30 s e probe único. Jitter e janela percentual ainda não estão implementados. A fila é simulada. O fallback de inventário com warranty=false não comprova ausência de garantia.

## Validação e aceite
Identificar os testes pertinentes, responsáveis e evidências antes do aceite. Não confundir arquitetura projetada com infraestrutura implantada.
