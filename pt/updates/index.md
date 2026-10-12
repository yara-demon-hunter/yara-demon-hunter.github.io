---
layout: default
title: Atualizações do Projeto
lang: pt
translation_id: updates
description: Acompanhe novidades, mudanças e novas páginas do projeto Yara, Caçadora de Demônios.
last_updated: 2026-10-12
hide_recent_updates: true
---

<section class="updates-archive">
    <p class="section-label">Diário do projeto</p>
    <h1>Atualizações do Projeto</h1>
    <p class="updates-archive__intro">
        Acompanhe as novidades e mudanças no universo de Yara, Caçadora de Demônios.
    </p>

    <ol class="updates-archive__list">
        {% assign updates = site.data.updates | sort: "date" | reverse %}
        {% for update in updates %}
            <li class="updates-archive__item">
                <article>
                    <time datetime="{{ update.date | date: '%Y-%m-%d' }}">
                        {{ update.date | date: "%d/%m/%Y" }}
                    </time>
                    <h2>
                        <a href="{{ update.url.pt | relative_url }}">
                            {{ update.title.pt }}
                        </a>
                    </h2>
                    <p>{{ update.summary.pt }}</p>
                    <a class="updates-archive__link" href="{{ update.url.pt | relative_url }}">
                        Ver página atualizada <span aria-hidden="true">→</span>
                    </a>
                </article>
            </li>
        {% endfor %}
    </ol>
</section>
