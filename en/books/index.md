---
layout: default
title: Books
lang: en
translation_id: books-index
---

<section class="page-content">

    <p class="section-label">Yara, Demon Hunter</p>

    <h1>Books</h1>

    <div class="chapter-list">
        {% for book_entry in site.data.books %}
            {% assign book_id = book_entry[0] %}
            {% include book-card.html
                book_id=book_id
                lang="en"
                link_text="Read book"
                coming_soon_text="Coming soon"
            %}
        {% endfor %}
    </div>

</section>
