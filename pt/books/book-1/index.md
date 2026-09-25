---
layout: default
title: "Yara, Caçadora de Demônios: O Despertar da Vingança"
lang: pt
book_id: book-1
translation_id: book-1
book_status: published
last_updated: 2026-09-23
---

{% assign book = site.data.books[page.book_id] %}

<section class="page-content book-page">

    <section class="book-hero" aria-labelledby="book-title">
        <div class="book-hero__cover">
            <img
                src="{{ book.cover | relative_url }}"
                alt="Capa de {{ book.title[page.lang] }}"
                fetchpriority="high"
            >
        </div>

        <div class="book-hero__content">
            <p class="section-label">Livro {{ book.number }}</p>
            <h1 id="book-title">{{ book.title[page.lang] }}</h1>
            <a class="book-hero__button" href="{{ '/pt/books/book-1/chapters/' | relative_url }}">
                Começar a ler
            </a>

            <div class="book-synopsis" aria-labelledby="book-synopsis-title">
                <p class="section-label">Sinopse</p>
                <h2 id="book-synopsis-title">A vingança já está em movimento</h2>

                <div class="book-synopsis__text" tabindex="0" aria-label="Texto da sinopse">
                    <p><strong>Há uma criatura vagando pelo mundo real.</strong> Algo foi tirado dela — e a dor dessa perda apodreceu em sua alma até se tornar uma sede implacável de vingança. Após décadas de busca, ela finalmente encontrou o que precisava para concretizar sua retaliação: um vilarejo isolado, cercado por uma floresta impenetrável, onde uma névoa viva devora as ruas todas as noites.</p>

                    <p>Ali, o silêncio virou lei. Os moradores aprenderam a fechar os olhos para o bizarro e a trancar suas portas antes que a névoa chegue — e, por gerações, isso bastou. Eles achavam que estavam a salvo.</p>

                    <p class="book-synopsis__emphasis">Estavam errados.</p>

                    <p>Quando um homem desaparece na floresta em um dia comum de trabalho, o véu de ignorância finalmente cai: a caçada começou. Mas a vingança da criatura vai desencadear consequências muito maiores do que o destino de um vilarejo — porque o desaparecimento não é o início da história. É apenas a primeira peça movida num jogo macabro que já está em curso, e que vai culminar na mudança do destino.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="book-chapters" aria-labelledby="book-chapters-title">
        <h2 id="book-chapters-title">Capítulos</h2>

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

</section>
