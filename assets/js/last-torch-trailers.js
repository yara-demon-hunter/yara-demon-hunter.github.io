const desktopQuery = window.matchMedia("(min-width: 721px)");
const trailerVideos = document.querySelectorAll("[data-trailer-device]");

function updateTrailerPlayback() {
    const activeDevice = desktopQuery.matches ? "desktop" : "mobile";

    trailerVideos.forEach((video) => {
        if (video.dataset.trailerDevice === activeDevice) {
            video.play().catch((error) => {
                if (error.name !== "NotAllowedError") {
                    console.error("Could not autoplay the Last Torch trailer.", error);
                }
            });
        } else {
            video.pause();
        }
    });
}

updateTrailerPlayback();
desktopQuery.addEventListener("change", updateTrailerPlayback);
