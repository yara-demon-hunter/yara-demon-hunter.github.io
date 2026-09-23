---
layout: default
title: "Yara, Demon Hunter: The Awakening of Vengeance"
lang: en
book_id: book-1
translation_id: book-1
book_status: published
last_updated: 2026-09-23
---

<section class="page-content">

    <p class="section-label">Book 1</p>

    <h1>Yara, Demon Hunter: The Awakening of Vengeance</h1>

    <p>A dark fantasy story about a young hunter, a world marked by demons, and secrets that should have remained buried.</p>

    <p>
        <a class="story-intro__button" href="{{ '/en/books/book-1/chapters/' | relative_url }}">Start reading</a>
    </p>

    <h2>Chapters</h2>

    {% assign book_chapters = site.pages | where: "book_id", page.book_id | where: "lang", page.lang | where: "chapter_type", "chapter" | sort: "chapter_number" %}
    {% assign prologue = site.pages | where: "book_id", page.book_id | where: "lang", page.lang | where: "chapter_type", "prologue" | first %}

    <div class="chapter-list">
        {% if prologue %}
            {% include chapter-card.html type="Prologue" title=prologue.title description="Before the hunt begins." image=prologue.image url=prologue.url status="published" link_text="Read" %}
        {% endif %}
        {% for chapter in book_chapters %}
            {% include chapter-card.html type="Chapter" title=chapter.title description=chapter.description image=chapter.image url=chapter.url status=chapter.status link_text="Read" coming_soon_text="Coming soon" %}
        {% endfor %}
    </div>

</section>
