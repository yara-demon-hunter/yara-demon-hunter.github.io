---
layout: default
title: Arquivo de Personagens
lang: pt
book_id: book-1
translation_id: characters-index
last_updated: 2026-09-26
---

<section class="character-directory">
    <p class="character-hero__eyebrow">O mundo de Yara, Caçadora de Demônios</p>
    <h1>Arquivo de Personagens</h1>
    <p class="character-directory__intro">Conheça quem dá forma à história.</p>

    <div class="character-directory__list">
        {% assign character_pages = site.pages | where: "layout", "character" | where: "lang", page.lang %}
        {% for profile_page in character_pages %}
            {% if profile_page.character.directory %}
                {% include character-card.html profile_page=profile_page %}
            {% endif %}
        {% endfor %}
    </div>
</section>
