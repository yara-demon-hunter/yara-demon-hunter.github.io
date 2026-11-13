---
layout: update
title: "Last Torch: the torch gets a new look"
description: "The torch you defend is now a hero-sized wooden pole with a cage of fire. The flame shrinks as the torch weakens, and it covers whoever walks behind it."
lang: en
translation_id: update-last-torch-new-torch
permalink: /en/updates/last-torch-new-2-5d-torch/
date: 2026-11-13
last_updated: 2026-11-13
update_label: "Last Torch · Visuals"
hero: /assets/images/common/mini-game/last_torch/updates/torch-life-states.webp
hero_alt: "The new torch with its flame at full, half and almost out"
hero_width: 700
hero_height: 513
image: /assets/images/common/mini-game/last_torch/updates/torch-life-states.webp
hide_recent_updates: true
---

{% assign art = '/assets/images/common/mini-game/last_torch/updates/' | relative_url %}
{% assign media = '/assets/images/common/mini-game/last_torch/' | relative_url %}

The torch is the heart of Last Torch, so it deserved a better face. It is now a **wooden pole with a cage of fire on top**, about the size of the hero, seen from slightly above like the characters.

## A flame that tells you how the torch is doing

The fire is made of layers, from red at the edge to a pale yellow core, with sparks floating up. It also shrinks with the torch's health:

- **Full health:** a tall, bright flame.
- **Half health:** a smaller flame.
- **Almost out:** just a little fire in the cage. Time to protect it!

The health bar now sits **above the torch**, right over the flame, where you naturally look.

## It has depth

Because the torch stands on the ground, it now respects depth. When you or a monster walk **behind** it, the torch covers you. When you are **in front**, you walk over it. Fights around the torch look more like a real place instead of flat shapes.

## Light on the game

The flame animation is drawn in just a few frames ahead of time, so the new torch costs almost nothing, even on a phone. Details like the cage and the pole are drawn once and reused.

The dashed circle around the torch still shows where it heals you. Read more in [a clearer start](/en/updates/last-torch-clearer-start/).
