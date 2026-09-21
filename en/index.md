---
layout: default
title: Yara, Demon Hunter
lang: en
---

<section class="story-intro">

    <div class="story-intro__content">

        <p class="section-label">
            A Dark Fantasy Story
        </p>

        <h1>
            Yara
        </h1>

        <p class="story-intro__subtitle">
            Demon Hunter
        </p>

        <div class="story-intro__divider"></div>

        <p class="story-intro__description">
            A young hunter.<br>
            A world marked by demons.<br>
            Secrets that should have remained buried.
        </p>

        <a
            class="story-intro__button"
            href="{{ '/en/chapters/001/' | relative_url }}"
        >
            Start reading
        </a>

    </div>

</section>


<section class="home-section">

    <p class="section-label">
        The Story
    </p>

    <h2>
        Yara's World
    </h2>

    <p>
        In a world where supernatural creatures walk among the living,
        Yara has dedicated her life to hunting the demons that threaten
        those who cannot face them.
    </p>

    <p>
        But some things should remain forgotten.
    </p>

</section>


<section class="home-section home-section--chapters">

    <p class="section-label">
        Follow the Story
    </p>

    <h2>
        Latest Chapters
    </h2>

    <div class="home-chapters">

        {% include chapter-card.html
            type="Chapter 1"
            title="Chapter 1"
            description="The first chapter of the story."
            url="/en/chapters/001/"
            link_text="Read"
        %}

        {% include chapter-card.html
            type="Chapter 2"
            title="Chapter 2"
            description="This chapter is still in development."
            url="/en/chapters/002/"
            link_text="Coming soon"
        %}

    </div>

</section>