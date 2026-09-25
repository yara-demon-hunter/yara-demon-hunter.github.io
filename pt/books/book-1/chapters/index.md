---
layout: default
title: Capítulos
lang: pt
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
            alt="Capa de {{ book.title[page.lang] }}"
        >
    </div>

    <div class="chapter-index-hero__content">
        <p class="section-label">Livro {{ book.number }}</p>
        <h1 id="chapter-index-title">Capítulos</h1>
        <p class="chapter-index-hero__book-title">{{ book.title[page.lang] }}</p>
        <p class="chapter-index-hero__message">Uma névoa viva devora as ruas todas as noites. Quando um homem desaparece, o silêncio do vilarejo já não pode protegê-lo. Comece pelo prólogo e acompanhe a caçada desde o início.</p>
        {% if prologue %}
            <a class="chapter-index-hero__link" href="{{ prologue.url | relative_url }}">Começar pelo prólogo</a>
        {% endif %}
    </div>
</section>

<div class="chapter-list">
{% if prologue %}
    {% include chapter-card.html
        type="Prólogo"
        title=prologue.title
        description="Antes da caçada começar."
        image=prologue.image
        url=prologue.url
        status="published"
        link_text="Ler"
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
        type="Capítulo"
        title=chapter.title
        description=chapter.description
        image=chapter.image
        url=chapter.url
        status=chapter.status
        link_text="Ler"
        coming_soon_text="Em breve"
    %}
{% endfor %}

</div>