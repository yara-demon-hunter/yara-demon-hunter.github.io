---
layout: update
title: "Last Torch: um início mais claro"
description: "Uma tela de carregamento com barra de progresso de verdade, um círculo tracejado que sempre mostra onde a tocha cura você e uma dica que aparece na hora certa."
lang: pt
translation_id: update-last-torch-clearer-start
permalink: /pt/updates/last-torch-inicio-mais-claro/
date: 2026-11-12
last_updated: 2026-11-12
update_label: "Last Torch · Novos jogadores"
hero: /assets/images/common/mini-game/last_torch/updates/torch-heal-hint.webp
hero_alt: "Um balão em cima da tocha dizendo: Stay near the torch to heal, inside the dashed circle (fique perto da tocha para se curar, dentro do círculo tracejado)"
hero_width: 1280
hero_height: 720
image: /assets/images/common/mini-game/last_torch/updates/torch-heal-hint.webp
hide_recent_updates: true
---

{% assign art = '/assets/images/common/mini-game/last_torch/updates/' | relative_url %}
{% assign media = '/assets/images/common/mini-game/last_torch/' | relative_url %}

O primeiro minuto de um jogo importa. Esta atualização esclarece três coisas que costumavam confundir quem chegava.

## Uma tela de carregamento que mostra o progresso

Enquanto o jogo carrega, você agora vê o título e uma **barra de progresso que enche de verdade** conforme os arquivos do jogo chegam, com a frase "Lighting the torch…" (acendendo a tocha). Antes, a tela inicial aparecia pela metade, com uma barra que não se mexia, o que parecia que o jogo tinha travado.

<div class="update-post__pair">
<figure><img src="{{ art }}start-loading.webp" alt="A tela de carregamento do Last Torch com uma barra de progresso" width="540" height="1169" loading="lazy"><figcaption>A tela de carregamento no celular.</figcaption></figure>
</div>

## A tocha cura você, e agora o jogo avisa

Ficar perto da tocha cura o herói, mas muita gente nunca percebia. Duas mudanças ajudam:

- **O círculo tracejado em volta da tocha fica sempre visível,** mesmo com a vida cheia, para você aprender onde é a área segura.
- **Um balão de dica aparece em cima da tocha:** "Stay near the torch to heal – inside the dashed circle" (fique perto da tocha para se curar, dentro do círculo tracejado). Ele aparece na primeira vez que você leva dano (ou depois de 25 segundos, se ainda não foi atingido), fica na tela por uns nove segundos e depois some.

Depois que você se cura na tocha pela primeira vez, a dica para de aparecer. Você já aprendeu, então ela não atrapalha mais.

## Por que isso importa

Se curar na tocha é um dos hábitos mais importantes de uma boa noite. Com pouca vida, saia da luta, entre no círculo e se recupere antes de voltar.
