document.addEventListener("DOMContentLoaded", () => {
    const scrollArea = document.querySelector(".book-reader__book");
    const source = document.querySelector(".book-reader__source");
    const counter = document.querySelector(".book-reader__page-number");

    if (!scrollArea || !source || !counter) {
        return;
    }

    let displayedPage = 0;
    let displayedTotal = 0;

    function updateCounter() {
        const readingHeight =
            scrollArea.clientHeight - counter.offsetHeight;

        if (readingHeight <= 0) {
            return;
        }

        const totalPages = Math.max(
            1,
            Math.ceil(source.scrollHeight / readingHeight)
        );
        const isAtEnd =
            scrollArea.scrollTop + readingHeight >= source.scrollHeight - 1;
        const currentPage = isAtEnd
            ? totalPages
            : Math.floor(scrollArea.scrollTop / readingHeight) + 1;

        if (
            currentPage === displayedPage &&
            totalPages === displayedTotal
        ) {
            return;
        }

        displayedPage = currentPage;
        displayedTotal = totalPages;

        const label = counter.dataset.language === "pt"
            ? "Página estimada"
            : "Estimated page";

        counter.textContent = `${label} ${currentPage} / ${totalPages}`;
    }

    let updateScheduled = false;

    function scheduleCounterUpdate() {
        if (updateScheduled) {
            return;
        }

        updateScheduled = true;

        window.requestAnimationFrame(() => {
            updateScheduled = false;
            updateCounter();
        });
    }

    scrollArea.addEventListener("scroll", scheduleCounterUpdate, {
        passive: true
    });
    window.addEventListener("resize", scheduleCounterUpdate);

    if ("ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(scheduleCounterUpdate);
        resizeObserver.observe(scrollArea);
        resizeObserver.observe(source);
    }

    updateCounter();
});