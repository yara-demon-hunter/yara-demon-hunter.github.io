const menuToggle = document.querySelector(".site-menu-toggle");
const siteNav = document.querySelector("#site-nav");
const languageToggle = document.querySelector(".language-selector__toggle");
const languageOptions = document.querySelector(".language-selector__options");

const closeLanguageOptions = () => {
    if (languageToggle && languageOptions) {
        languageToggle.setAttribute("aria-expanded", "false");
        languageOptions.hidden = true;
    }
};

if (menuToggle && siteNav) {
    const closeMenu = () => {
        siteNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        closeLanguageOptions();
    };

    menuToggle.addEventListener("click", () => {
        const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!isOpen));
        siteNav.classList.toggle("is-open", !isOpen);
    });

    siteNav.addEventListener("click", (event) => {
        if (event.target instanceof HTMLAnchorElement) {
            closeMenu();
        }
    });
}

if (languageToggle && languageOptions) {
    languageToggle.addEventListener("click", () => {
        const isOpen = languageToggle.getAttribute("aria-expanded") === "true";
        languageToggle.setAttribute("aria-expanded", String(!isOpen));
        languageOptions.hidden = isOpen;
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".language-selector")) {
            closeLanguageOptions();
        }
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeLanguageOptions();

        if (menuToggle && siteNav) {
            siteNav.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
        }
    }
});