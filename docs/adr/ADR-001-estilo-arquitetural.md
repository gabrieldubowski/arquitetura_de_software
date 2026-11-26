# ADR-001: Monólito Modular com processamento assíncrono do roteamento

- **Status:** Aprovado (definido na Sprint 1, mantido na Sprint 4)
- **Data:** 2026-09-03

## Contexto
O Sysop Squad atende uma rede de 1.000 lojas e precisa manter a abertura de chamados disponível sob alta carga ou falhas parciais. O roteamento considera localização, habilidade e disponibilidade dos consultores. A análise BOTE indicou cerca de 25 req/s no pico (10.000 tickets/dia, 20 requisições por ticket, fator de pico 10×), o que não justifica microsserviços. O requisito de degradação graciosa exige que uma falha no roteamento não impeça o registro de novos tickets.

## Decisão
Adotar **Monólito Modular** com módulos de **Tickets**, **Consultores** e **Roteamento**. Após o registro do ticket, um evento de roteamento é publicado em uma **fila** e processado de forma assíncrona. Se o roteamento estiver indisponível, o chamado fica registrado aguardando.

## Alternativas rejeitadas
| Alternativa | Motivo da não escolha |
|---|---|
| Monólito tradicional | Mais simples, porém aumenta o acoplamento e dificulta a evolução. |
| Microsserviços | Maior independência, mas com complexidade de comunicação, implantação e monitoramento injustificada para ~25 req/s. |

## Consequências / Trade-offs
- (+) Menor complexidade, módulos com responsabilidades separadas, tickets registrados mesmo com o roteamento fora do ar, possibilidade de extrair módulos no futuro.
- (-) Módulos na mesma aplicação (escala em conjunto); a fila adiciona complexidade; alguns chamados podem não ser roteados imediatamente.

| Decisão | Ganho | Trade-off |
|---|---|---|
| Monólito modular em vez de microsserviços | Menor complexidade | Menor independência para escalar partes |
| Roteamento assíncrono | Resiliência e degradação graciosa | Roteamento pode não ser imediato |
| Separação em módulos | Organização e manutenção | Exige cuidado com o acoplamento (Fitness Functions) |
