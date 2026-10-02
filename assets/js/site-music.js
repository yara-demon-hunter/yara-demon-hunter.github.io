(() => {
    const audio = document.getElementById("site-music-audio");
    const toggle = document.getElementById("site-music-toggle");
    const icon = document.getElementById("site-music-icon");
    if (!audio || !toggle || !icon) return;

    const isPortuguese = document.documentElement.lang.startsWith("pt");
    const labels = isPortuguese
        ? { play: "Tocar trilha sonora", pause: "Pausar trilha sonora" }
        : { play: "Play soundtrack", pause: "Pause soundtrack" };
    const storageKey = "yara-site-music-state";
    let savedState = {};

    try {
        savedState = JSON.parse(sessionStorage.getItem(storageKey) || "{}");
    } catch {
        savedState = {};
    }

    let resumeOnLoad = savedState.playing === true;
    let shouldAutoplay = savedState.playing !== false;
    let waitingForInteraction = shouldAutoplay;
    const resumePosition = Number(savedState.currentTime) || 0;
    let lastSavedAt = 0;
    audio.volume = 0.32;

    function saveState() {
        try {
            sessionStorage.setItem(storageKey, JSON.stringify({
                playing: resumeOnLoad,
                currentTime: audio.currentTime || 0
            }));
        } catch {
            // Storage can be unavailable in private browsing contexts.
        }
    }

    function updateToggle() {
        const isPlaying = !audio.paused && !audio.ended;
        toggle.setAttribute("aria-pressed", String(isPlaying));
        toggle.setAttribute("aria-label", isPlaying ? labels.pause : labels.play);
        toggle.title = isPlaying ? labels.pause : labels.play;
        icon.textContent = isPlaying ? "Ⅱ" : "▶";
    }

    function startPlayback(isAutomatic = false) {
        resumeOnLoad = true;
        audio.play().catch(() => {
            if (isAutomatic && savedState.playing !== true) {
                resumeOnLoad = false;
            }
            saveState();
            updateToggle();
        });
    }

    function clearInteractionFallback() {
        if (!waitingForInteraction) return;
        waitingForInteraction = false;
        document.removeEventListener("pointerdown", startAfterInteraction);
        document.removeEventListener("keydown", startAfterInteraction);
    }

    function startAfterInteraction(event) {
        if (event.target instanceof Element && event.target.closest("#site-music-toggle")) return;
        clearInteractionFallback();
        startPlayback();
    }

    function restorePlayback() {
        if (Number.isFinite(audio.duration) && audio.duration > 0 && resumePosition > 0) {
            audio.currentTime = resumePosition % audio.duration;
        }
        if (shouldAutoplay) {
            shouldAutoplay = false;
            startPlayback(true);
        }
    }

    toggle.addEventListener("click", () => {
        clearInteractionFallback();
        if (audio.paused) {
            startPlayback();
        } else {
            resumeOnLoad = false;
            audio.pause();
            saveState();
        }
    });

    audio.addEventListener("play", updateToggle);
    audio.addEventListener("pause", updateToggle);
    audio.addEventListener("ended", updateToggle);
    audio.addEventListener("loadedmetadata", restorePlayback, { once: true });
    audio.addEventListener("timeupdate", () => {
        const now = Date.now();
        if (now - lastSavedAt >= 3000) {
            lastSavedAt = now;
            saveState();
        }
    });
    window.addEventListener("pagehide", saveState);

    if (waitingForInteraction) {
        document.addEventListener("pointerdown", startAfterInteraction);
        document.addEventListener("keydown", startAfterInteraction);
    }

    if (audio.readyState >= 1) {
        restorePlayback();
    } else if (shouldAutoplay) {
        audio.load();
    }
    updateToggle();
})();