---
layout: default
title: Capítulos
lang: pt
book_id: book-1
translation_id: book-1-chapters
chapter_index: true
---

# Capítulos

Acompanhe a história de Yara, Caçadora de Demônios: O Despertar da Vingança.

{% assign prologue = site.pages
    | where: "book_id", page.book_id
    | where: "lang", page.lang
    | where: "chapter_type", "prologue"
    | first
%}

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