# Peça: Lagoa de pântano

- **id:** `swamp_pool` (`registerProp` em `../swamp_pool.js`; valores padrão em `../swamp_pool_visual.js`)
- **Tipo:** estática
- **Papel:** a água parada do pântano; dá para pôr, mover, girar, mudar o tamanho e apagar
- **Feito a partir de:** as lagoas que eram desenhadas fixas no chão do cenário `swamp` (2026-11-22), a pedido do usuário: "poderia ser um objeto clicável, como as poças".

## Como é desenhada

Uma elipse de água com gradiente (do centro para a borda), uma borda de lama um pouco maior e pontinhos de lentilha-d'água espalhados (quantidade proporcional ao tamanho; densidade sorteada por lagoa). Vista de cima e de frente: achatada.

## O que a paleta controla

`water` (2 cores), `mud`, `weed`, `rx` e `ry` (raios). Os raios aparecem em 📏 Medidas no editor, por objeto; as cores em 🎨 Cores.

## Custo

pintada uma vez; zero por quadro.

## Decisões

- A lagoa é só desenho: não barra ninguém. Para uma lagoa que barra, use uma área de contato por cima.
- Substitui as lagoas fixas do chão de `swamp` (`paintBase`): o desenho antigo só roda enquanto o cenário não tiver nenhum objeto `swamp_pool`.
- As 12 lagoas do `swamp` foram convertidas em objetos nas mesmas posições e tamanhos; a lentilha-d'água de cada uma é sorteada de novo (muda um pouco o desenho dos pontinhos).

## Ajuste

`tools/prop_tuner.html?prop=swamp_pool`; grave com **Copiar alterados**, cole em `swamp_pool_visual.js` e rode `ruby mini_games/_library/sync.rb`.
