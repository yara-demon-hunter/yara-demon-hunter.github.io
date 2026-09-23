---
layout: default
title: Chapters
lang: en
book_id: book-1
translation_id: book-1-chapters
chapter_index: true
---

# Chapters

Follow the story of Yara, Demon Hunter: The Awakening of Vengeance.

{% assign prologue = site.pages
    | where: "book_id", page.book_id
    | where: "lang", page.lang
    | where: "chapter_type", "prologue"
    | first
%}

<div class="chapter-list">

{% if prologue %}
    {% include chapter-card.html
        type="Prologue"
        title=prologue.title
        description="Before the hunt begins."
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