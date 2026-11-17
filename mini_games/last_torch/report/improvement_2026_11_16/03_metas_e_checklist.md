# 3. Metas, medição e checklist do relançamento

## 3.1 Metas para o próximo Basic Launch

Metas com folga acima do degrau mínimo, para passar "com certeza" mesmo com a variação de um dia para o outro.

### Desktop (hoje 6/15)

| Métrica | Hoje | Degrau seguinte | Meta |
|---|---|---|---|
| Average Playtime | 8m54s | 9m53s | **11m+** |
| Retention D1 | 1,64% | 3,23% | **4%+** |
| Gameplay Conversion | 49,38% | 57,89% | **65%+** |

### Mobile & Tablet (hoje 4/15)

| Métrica | Hoje | Degrau seguinte | Meta |
|---|---|---|---|
| Average Playtime | 3m48s | 4m58s | **8m+** |
| Retention D1 | 1,16% | 1,59% | **3%+** |
| Gameplay Conversion | 17,88% | 23,24% | **50%+** |

### CTR (novo, a partir de 23/11)

| Métrica | Hoje | Meta |
|---|---|---|
| CTR geral | 1,3% (Mid Range) | top 20% da categoria Strategy |
| CTR Homepage | 0,2% | 1%+ |

### Técnico

| Item | Hoje | Meta |
|---|---|---|
| Carregamento médio | 6,0s (pico 7,7s) | **< 3s** |
| Arquivos JS no pacote | 287 | **1–3** |
| Crash | 0% | 0% |

## 3.2 Como medir antes de enviar

Atualizações durante o Basic Launch são aprovadas sozinhas, e o painel atualiza uma vez por dia. Medir em casa primeiro economiza dias.

1. **Carregamento:** servir `standalone-build/` com hypercorn + TLS + gzip (Chrome headless + Playwright) e medir com Chrome headless em três condições: sem limite, 4G rápido, 4G lento com CPU 4x mais lenta. Anotar o tempo até o PLAY acender e até o primeiro quadro da caçada.
2. **Primeiro minuto:** rodar os bots (wander, chase, engaged) só na primeira noite de um save vazio. Anotar: segundo do primeiro abate, do primeiro nível, da primeira morte do herói, e a onda alcançada. Meta: nenhum bot morre antes dos 90s.
3. **Celular real:** um Android comum, rede móvel, jogo publicado na CrazyGames. Uma pessoa que nunca jogou, sem explicação. Observar onde ela trava ou fica perdida.
4. **D1:** não dá para medir em casa. Conferir que o save sobrevive a fechar e abrir a aba, e que no dia seguinte aparecem o baú e o desafio novos (mudar a data do sistema para testar).
5. **Desempenho:** medir ms por quadro e MB de canvas antes e depois de cada mudança.

## 3.3 Quando relançar

- Relançar só quando as fases 1, 2 e 3 estiverem prontas e medidas. A fase 4 é muito desejável; a 5 é obrigatória se o relançamento for depois de 23/11 (CTR conta).
- Enviar as mudanças **todas de uma vez** antes de começar o novo período. Mudar no meio do Basic Launch mistura dias bons e ruins na média dos últimos 7 dias.
- Conferir no painel, antes de relançar, o mínimo de pontos das regras novas (4 métricas).
- Se o desktop passar e o celular não, verificar no portal se dá para liberar o Full Launch só para desktop enquanto o celular melhora.

## 3.4 Checklist

No [06_checklist.md](06_checklist.md): é o único lugar onde o progresso é marcado.
