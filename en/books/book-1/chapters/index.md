---
layout: default
title: Chapters
lang: en
book_id: book-1
translation_id: book-1-chapters
chapter_index: true
last_updated: 2026-09-25
---

{% assign book = site.data.books[page.book_id] %}
{% assign prologue = site.pages
    | where: "book_id", page.book_id
    | where: "lang", page.lang
    | where: "chapter_type", "prologue"
    | first
%}

<section class="chapter-index-hero" aria-labelledby="chapter-index-title">
    <div class="chapter-index-hero__cover">
        <img
            src="{{ book.cover | relative_url }}"
            alt="Cover of {{ book.title[page.lang] }}"
        >
    </div>

    <div class="chapter-index-hero__content">
        <p class="section-label">Book {{ book.number }}</p>
        <h1 id="chapter-index-title">Chapters</h1>
        <p class="chapter-index-hero__book-title">{{ book.title[page.lang] }}</p>
        <p class="chapter-index-hero__message">A living fog devours the village streets every night. When a man disappears, the silence that once protected the villagers begins to unravel. Start with the prologue and follow the hunt from its beginning.</p>
        {% if prologue %}
            <a class="chapter-index-hero__link" href="{{ prologue.url | relative_url }}">Start with the prologue</a>
        {% endif %}
    </div>
</section>

<div class="chapter-list">
{% if prologue %}
    {% include chapter-card.html
        type="Prologue"
        title=prologue.title
        description=prologue.description
        image=prologue.image
        url=prologue.url
        status="published"
        link_text="Read"
    %}
{% endif %}

{% assign chapters = site.pages
    | where: "book_id", page.book_id
    | where: "lang", page.lang
    | where: "chapter_type", "chapter"
    | sort: "chapter_number"
%}

{% for chapter in chapters %}
    {% include chapter-card.html
        type="Chapter"
        title=chapter.title
        description=chapter.description
        image=chapter.image
        url=chapter.url
        status=chapter.status
        link_text="Read"
        coming_soon_text="Coming soon"
    %}
{% endfor %}

</div>