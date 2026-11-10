---
layout: default
title: Livros
description: "Conheça os livros da série de fantasia sombria Yara, Caçadora de Demônios e comece a ler os capítulos publicados de O Despertar da Vingança."
lang: pt
translation_id: books-index
last_updated: 2026-11-10
---

<section class="page-content">

    <p class="section-label">Yara, Caçadora de Demônios</p>

    <h1>Livros</h1>

    <div class="chapter-list">
        {% for book_entry in site.data.books %}
            {% assign book_id = book_entry[0] %}
            {% include book-card.html
                book_id=book_id
                lang="pt"
                link_text="Ler livro"
                coming_soon_text="Em breve"
            %}
        {% endfor %}
    </div>

</section>
