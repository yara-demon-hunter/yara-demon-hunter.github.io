---
layout: default
title: "Yara, Demon Hunter: The Awakening of Vengeance"
lang: en
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
                alt="Cover of {{ book.title[page.lang] }}"
                fetchpriority="high"
            >
        </div>

        <div class="book-hero__content">
            <p class="section-label">Book {{ book.number }}</p>
            <h1 id="book-title">{{ book.title[page.lang] }}</h1>
            <a class="book-hero__button" href="{{ '/en/books/book-1/chapters/' | relative_url }}">
                Start reading
            </a>

            <div class="book-synopsis" aria-labelledby="book-synopsis-title">
                <p class="section-label">Synopsis</p>
                <h2 id="book-synopsis-title">Vengeance is already in motion</h2>
                <div class="book-synopsis__text" tabindex="0" aria-label="Synopsis text">
                    <p><strong>A creature roams the real world.</strong> Something was taken from it — and the pain of that loss rotted in its soul until it festered into a relentless thirst for vengeance. After decades of searching, it has finally found what it needed to exact its retaliation: an isolated village, surrounded by an impenetrable forest, where a living fog devours the streets every night.</p>

                    <p>There, silence became the law. The villagers learned to turn a blind eye to the bizarre and lock their doors before the fog rolls in — and, for generations, that was enough. They thought they were safe.</p>

                    <p class="book-synopsis__emphasis">They were wrong.</p>

                    <p>When a man disappears into the forest on an ordinary workday, the veil of ignorance finally drops: the hunt has begun. But the creature's revenge will unleash consequences far greater than the fate of a single village — because the disappearance is not the beginning of the story. It is merely the first piece moved in a macabre game already underway, one that will culminate in the altering of destiny itself.</p>
                </div>
            </div>
        </div>
    </section>

</section>
