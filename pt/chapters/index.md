---
layout: default
title: Capítulos
lang: pt
translation: /en/chapters/
---

# Capítulos

Acompanhe a história de Yara, Caçadora de Demônios.

{% assign prologue = site.pages
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
        url=prologue.url
        status="published"
        link_text="Ler"
    %}
{% endif %}


{% assign chapters = site.pages
    | where: "lang", page.lang
    | where: "chapter_type", "chapter"
    | sort: "chapter_number"
%}

{% for chapter in chapters %}
    {% include chapter-card.html
        type="Capítulo"
        title=chapter.title
        description=chapter.description
        url=chapter.url
        status=chapter.status
        link_text="Ler"
        coming_soon_text="Em breve"
    %}
{% endfor %}

</div>