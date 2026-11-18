---
layout: update
title: "Last Torch: equilíbrio de relíquias, Altar e skills"
description: "Relíquias com preço fixo que sobe pela árvore, Altar mais caro, skills ativas mais caras, menos bagunça na tela, Shadow Path novo e a Fireballs que carrega."
lang: pt
translation_id: update-last-torch-balance
permalink: /pt/updates/last-torch-equilibrio-reliquias-skills/
date: 2026-11-18
last_updated: 2026-11-18
update_label: "Last Torch · Equilíbrio"
hero: /assets/images/common/mini-game/last_torch/updates/camp-relics.webp
hero_alt: "Acampamento com a árvore de relíquias e preços"
hero_width: 1000
hero_height: 582
image: /assets/images/common/mini-game/last_torch/updates/camp-relics.webp
hide_recent_updates: true
---

{% assign art = '/assets/images/common/mini-game/last_torch/updates/' | relative_url %}

O objetivo desta semana foi um jogo **mais gostoso de jogar e menos enjoativo**: o jogador faz escolhas de verdade, sente que evolui a cada onda e a tela fica mais limpa. Nada do que o jogo já tinha foi trocado; ajustamos preços, ritmo e alguns detalhes.

## Relíquias com preço fixo, que sobe pela árvore

Antes era fácil comprar a loja inteira numa partida. Agora cada relíquia tem **preço fixo** (que nunca sobe com a onda) e ele **cresce pela posição na árvore**: as primeiras de cada linha custam **300**, e as do fim chegam a **6.500**. Os monstros também dão menos ouro. Testando com um piloto automático, uma partida compra de 1 a 4 relíquias por onda e **nunca a loja toda**: dá sempre uma nova escolha a cada onda.


## Altar mais caro

As melhorias do Altar custam mais em cada nível (a primeira ainda sai com uma noite curta, as últimas pedem dezenas de noites), e cada **estrela** tirada nas ondas rende **1 Brasa**. O **Extra Dash** saiu do Altar, e a **Swiftness** ficou em +1% por nível (Might, Arcane, Vitality e Fury Power em +2%).

## Skills ativas custam mais pontos

Não existe limite de skills, mas as que agem sozinhas em campo (atiram, explodem, invocam) agora custam **1 ponto a mais por nível**, e as evoluções mais fortes (Sun Spire, Solar Wall, Event Horizon) custam 5. Numa noite dá para levar uns 3 ou 4 poderes fortes, e **empilhar tudo fica quase impossível**. O XP também ficou mais gradual: o herói chega ao nível 8, e não ao 10, na onda 1.

## Menos bagunça na tela

As skills que atiravam o tempo todo agora **atiram menos e com mais força**: Flame Sentinel, Sun Spire (era ~6 bolas por segundo e agora ~2), Grave Wisp, Storm Sigil e as bolas das fênix. O dano total quase não muda, mas a tela fica bem mais limpa.

## Shadow Path reorganizado

A primeira linha tem o **Return Fire** e o **Shadow Raven**. A segunda concentra todas as de adaga: **Ricochet → Death Mark → Dagger Mastery → Fan of Knives**.

<figure><img src="{{ art }}tree-shadow-path.webp" alt="A árvore do Shadow Path com a linha de cima e a linha das adagas" width="640" height="320" loading="lazy"><figcaption>O Shadow Path novo.</figcaption></figure>

## Fireballs agora carrega

O **Charged Dagger Throw** saiu (a adaga carregada atravessava tudo e anulava o Ricochet). A mecânica foi para a **Fireballs**: **segure o botão da adaga** para carregar uma **bola de fogo gigante**, com até 2,4 vezes o tamanho e 4 vezes o dano. A bola carregada não ricocheteia, e a descrição avisa isso em vermelho.

<figure><img src="{{ art }}fireballs-warning.webp" alt="Descrição da Fireballs com o aviso em vermelho de que a bola carregada não ricocheteia" width="544" height="660" loading="lazy"><figcaption>O aviso em vermelho na Fireballs.</figcaption></figure>

## Outros ajustes de equilíbrio

- **Keen Eye** foi para o fim da linha de aço e ficou um pouco mais fraca.
- **Holy Water** lança no máximo 1 frasco, e a **Blessed Rain** não substitui mais os frascos: eles continuam, e a chuva cai a cada 40 segundos.
- **Hearth Ring** e **Event Horizon** perderam um pouco de força; **Corpse Burst** e **Soul Nova** ganharam.

Veja também as [ondas e o resultado com estrelas](/pt/updates/last-torch-ondas-boss-estrelas/) e as [criaturas novas](/pt/updates/last-torch-golem-treant-fenix/).
