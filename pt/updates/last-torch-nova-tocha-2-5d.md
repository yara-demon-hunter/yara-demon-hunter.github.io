---
layout: update
title: "Last Torch: a tocha ganhou um visual novo"
description: "A tocha que você defende agora é um poste de madeira do tamanho do herói, com uma gaiola de fogo. A chama encolhe quando a tocha enfraquece e cobre quem passa atrás dela."
lang: pt
translation_id: update-last-torch-new-torch
permalink: /pt/updates/last-torch-nova-tocha-2-5d/
date: 2026-11-13
last_updated: 2026-11-13
update_label: "Last Torch · Visual"
hero: /assets/images/common/mini-game/last_torch/updates/torch-life-states.webp
hero_alt: "A tocha nova com a chama cheia, pela metade e quase apagada"
hero_width: 700
hero_height: 513
image: /assets/images/common/mini-game/last_torch/updates/torch-life-states.webp
hide_recent_updates: true
---

{% assign art = '/assets/images/common/mini-game/last_torch/updates/' | relative_url %}
{% assign media = '/assets/images/common/mini-game/last_torch/' | relative_url %}

A tocha é o coração do Last Torch, então merecia um visual melhor. Agora ela é um **poste de madeira com uma gaiola de fogo em cima**, do tamanho do herói, vista um pouco de cima, como os personagens.

## Uma chama que mostra como a tocha está

O fogo é feito de camadas, do vermelho na borda a um miolo amarelo claro, com faíscas subindo. Ele também encolhe com a vida da tocha:

- **Vida cheia:** uma chama alta e brilhante.
- **Pela metade:** uma chama menor.
- **Quase apagada:** só um pouco de fogo na gaiola. Hora de protegê-la!

A barra de vida agora fica **em cima da tocha**, bem acima da chama, onde você naturalmente olha.

## Ela tem profundidade

Como a tocha está de pé no chão, ela agora respeita a profundidade. Quando você ou um monstro passa **atrás** dela, a tocha cobre quem está atrás. Quando você está **na frente**, passa por cima. As lutas em volta da tocha parecem mais um lugar de verdade, e não formas chapadas.

## Leve para o jogo

A animação da chama é desenhada em poucos quadros com antecedência, então a tocha nova custa quase nada, até no celular. Detalhes como a gaiola e o poste são desenhados uma vez só e reaproveitados.

O círculo tracejado em volta da tocha continua mostrando onde ela cura você. Leia mais em [um início mais claro](/pt/updates/last-torch-inicio-mais-claro/).
