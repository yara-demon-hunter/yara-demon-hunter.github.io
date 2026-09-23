---
layout: default
title: "Yara, Caçadora de Demônios: O Despertar da Vingança"
lang: pt
book_id: book-1
translation_id: book-1
book_status: published
---

<section class="page-content">

    <p class="section-label">Livro 1</p>

    <h1>Yara, Caçadora de Demônios: O Despertar da Vingança</h1>

    <p>Uma história de fantasia sombria sobre uma jovem caçadora, um mundo marcado por demônios e segredos que deveriam permanecer enterrados.</p>

    <p>
        <a class="story-intro__button" href="{{ '/pt/books/book-1/chapters/' | relative_url }}">Começar a ler</a>
    </p>

    <h2>Capítulos</h2>

    {% assign book_chapters = site.pages | where: "book_id", page.book_id | where: "lang", page.lang | where: "chapter_type", "chapter" | sort: "chapter_number" %}
    {% assign prologue = site.pages | where: "book_id", page.book_id | where: "lang", page.lang | where: "chapter_type", "prologue" | first %}

    <div class="chapter-list">
        {% if prologue %}
            {% include chapter-card.html type="Prólogo" title=prologue.title description="Antes da caçada começar." image=prologue.image url=prologue.url status="published" link_text="Ler" %}
        {% endif %}
        {% for chapter in book_chapters %}
            {% include chapter-card.html type="Capítulo" title=chapter.title description=chapter.description image=chapter.image url=chapter.url status=chapter.status link_text="Ler" coming_soon_text="Em breve" %}
        {% endfor %}
    </div>

</section>
