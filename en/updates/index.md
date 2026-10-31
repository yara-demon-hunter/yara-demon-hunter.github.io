---
layout: default
title: Project Updates
lang: en
translation_id: updates
description: Follow news, changes, and new pages from the Yara, Demon Hunter project.
last_updated: 2026-10-31
hide_recent_updates: true
---

<section class="updates-archive">
    <p class="section-label">Project log</p>
    <h1>Project Updates</h1>
    <p class="updates-archive__intro">
        Follow the latest additions and changes to the world of Yara, Demon Hunter.
    </p>

    <ol class="updates-archive__list">
        {% assign updates = site.data.updates | sort: "date" | reverse %}
        {% for update in updates %}
            <li class="updates-archive__item">
                <article>
                    <time datetime="{{ update.date | date: '%Y-%m-%d' }}">
                        {{ update.date | date: "%B %-d, %Y" }}
                    </time>
                    <h2>
                        <a href="{{ update.url.en | relative_url }}">
                            {{ update.title.en }}
                        </a>
                    </h2>
                    <p>{{ update.summary.en }}</p>
                    <a class="updates-archive__link" href="{{ update.url.en | relative_url }}">
                        Read the updated page <span aria-hidden="true">→</span>
                    </a>
                </article>
            </li>
        {% endfor %}
    </ol>
</section>
