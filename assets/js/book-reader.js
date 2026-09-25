document.addEventListener("DOMContentLoaded", () => {
    const reader = document.querySelector(".book-reader");

    if (!reader) {
        return;
    }

    const source = reader.querySelector(".book-reader__source");
    const pagesContainer = reader.querySelector(".book-reader__pages");
    const previousButton = reader.querySelector(".book-reader__button--previous");
    const nextButton = reader.querySelector(".book-reader__button--next");
    const counter = reader.querySelector(".book-reader__counter");

    if (
        !source ||
        !pagesContainer ||
        !previousButton ||
        !nextButton ||
        !counter
    ) {
        return;
    }

    const elements = Array.from(source.children);

    if (!elements.length) {
        return;
    }

    let pages = [];
    let currentPage = 0;
    const continuousReading = window.matchMedia("(max-width: 600px)");
    let previousReaderWidth = reader.clientWidth;

    /* =========================================
       CREATE PAGE
       ========================================= */

    function createPage() {
        const page = document.createElement("div");

        page.className =
            "book-reader__page book-reader__page--measuring";

        pagesContainer.appendChild(page);

        return page;
    }

    /* =========================================
       BUILD PAGES
       ========================================= */

    function buildPages() {
        const pageToRestore = currentPage;

        pagesContainer.innerHTML = "";

        pages = [];

        let page = createPage();

        elements.forEach((element) => {
            const clone = element.cloneNode(true);

            page.appendChild(clone);

            if (page.scrollHeight > page.clientHeight) {
                page.removeChild(clone);

                page.classList.remove(
                    "book-reader__page--measuring"
                );

                page = createPage();

                page.appendChild(clone);
            }
        });

        const allPages = Array.from(
            pagesContainer.querySelectorAll(
                ".book-reader__page"
            )
        );

        pages = allPages;
        currentPage = Math.min(pageToRestore, pages.length - 1);

        pages.forEach((page) => {
            page.classList.remove(
                "book-reader__page--measuring"
            );
        });

        updateReader();
    }

    /* =========================================
       UPDATE READER
       ========================================= */

    function updateReader() {
        pages.forEach((page, index) => {
            page.classList.toggle(
                "is-active",
                index === currentPage
            );
        });

        counter.textContent =
            `${currentPage + 1} / ${pages.length}`;

        previousButton.disabled =
            currentPage === 0;

        nextButton.disabled =
            currentPage === pages.length - 1;
    }

    /* =========================================
       NEXT PAGE
       ========================================= */

    function nextPage() {
        if (currentPage < pages.length - 1) {
            currentPage++;
            updateReader();
        }
    }

    /* =========================================
       PREVIOUS PAGE
       ========================================= */

    function previousPage() {
        if (currentPage > 0) {
            currentPage--;
            updateReader();
        }
    }

    /* =========================================
       BUTTONS
       ========================================= */

    nextButton.addEventListener("click", () => {
        nextPage();
    });

    previousButton.addEventListener("click", () => {
        previousPage();
    });

    /* =========================================
       KEYBOARD
       ========================================= */

    document.addEventListener("keydown", (event) => {

        if (event.key === "ArrowRight") {
            nextPage();
        }

        if (event.key === "ArrowLeft") {
            previousPage();
        }

    });

    /* =========================================
       TOUCH / SWIPE
       ========================================= */

    let touchStartX = 0;
    let touchStartY = 0;

    reader.addEventListener(
        "touchstart",
        (event) => {

            const touch = event.changedTouches[0];

            touchStartX = touch.screenX;
            touchStartY = touch.screenY;

        },
        {
            passive: true
        }
    );

    reader.addEventListener(
        "touchend",
        (event) => {

            const touch = event.changedTouches[0];

            const touchEndX = touch.screenX;
            const touchEndY = touch.screenY;

            const differenceX =
                touchStartX - touchEndX;

            const differenceY =
                touchStartY - touchEndY;

            /*
             * Ignora movimentos pequenos.
             */
            if (Math.abs(differenceX) < 50) {
                return;
            }

            /*
             * Se o movimento vertical for maior
             * que o horizontal, provavelmente foi
             * um scroll normal da página.
             */
            if (
                Math.abs(differenceY) >
                Math.abs(differenceX)
            ) {
                return;
            }

            /*
             * Arrastou para a esquerda
             * → próxima página
             */
            if (differenceX > 0) {
                nextPage();
            }

            /*
             * Arrastou para a direita
             * → página anterior
             */
            else {
                previousPage();
            }

        },
        {
            passive: true
        }
    );

    /* =========================================
       INITIALIZE
       ========================================= */

    function updateReadingMode() {
        const useContinuousReading = continuousReading.matches;

        reader.classList.toggle(
            "book-reader--continuous",
            useContinuousReading
        );

        if (useContinuousReading) {
            return;
        }

        previousReaderWidth = reader.clientWidth;
        buildPages();
    }

    updateReadingMode();

    continuousReading.addEventListener("change", updateReadingMode);

    /* =========================================
       RESIZE
       ========================================= */

    let resizeTimer;

    window.addEventListener("resize", () => {

        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {
            if (
                !continuousReading.matches &&
                reader.clientWidth !== previousReaderWidth
            ) {
                previousReaderWidth = reader.clientWidth;
                buildPages();
            }
        }, 250);

    });

});