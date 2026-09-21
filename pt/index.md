---
layout: default
title: Yara, Caçadora de Demônios
lang: pt
---

<section class="story-intro">

    <div class="story-intro__content">

        <p class="section-label">
            Uma História de Fantasia Sombria
        </p>

        <h1>
            Yara
        </h1>

        <p class="story-intro__subtitle">
            Caçadora de Demônios
        </p>

        <div class="story-intro__divider"></div>

        <p class="story-intro__description">
            Uma jovem caçadora.<br>
            Um mundo marcado por demônios.<br>
            Segredos que deveriam permanecer enterrados.
        </p>

        <a
            class="story-intro__button"
            href="{{ '/pt/chapters/001/' | relative_url }}"
        >
            Começar a ler
        </a>

    </div>

</section>


<section class="home-section">

    <p class="section-label">
        A História
    </p>

    <h2>
        O Mundo de Yara
    </h2>

    <p>
        Em um mundo onde criaturas sobrenaturais caminham entre os vivos,
        Yara dedica sua vida à caça dos demônios que ameaçam aqueles que
        não podem enfrentá-los.
    </p>

    <p>
        Mas algumas coisas deveriam permanecer esquecidas.
    </p>

</section>


<section class="home-section home-section--chapters">

    <p class="section-label">
        Acompanhe a História
    </p>

    <h2>
        Últimos Capítulos
    </h2>

    <div class="home-chapters">

        {% include chapter-card.html
            type="Capítulo 1"
            title="Capítulo 1"
            description="O primeiro capítulo da história."
            url="/pt/chapters/001/"
            link_text="Ler"
        %}

        {% include chapter-card.html
            type="Capítulo 2"
            title="Capítulo 2"
            description="Este capítulo ainda está em desenvolvimento."
            url="/pt/chapters/002/"
            link_text="Em breve"
        %}

    </div>

</section>