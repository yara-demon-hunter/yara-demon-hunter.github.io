// Music playback, visibility handling, and sound effects.
// Classic browser script; state is initialized by game.js before user actions run.

const gameMusic = document.getElementById('game-music');
const musicToggle = document.getElementById('music-toggle');
const musicIcon = document.getElementById('music-icon');
const SOUND_EFFECTS = Object.freeze({
    dodge: new Audio('audio/sfx/dodge.mp3'),
    parry: new Audio('audio/sfx/parry.mp3'),
    basicAttack: new Audio('audio/sfx/basic-attack.mp3'),
    specialAttack: new Audio('audio/sfx/special-attack.mp3'),
    levelUp: new Audio('audio/sfx/level-up.mp3')
});
Object.values(SOUND_EFFECTS).forEach((sound) => {
    sound.preload = 'none';
});

function playSound(effect) {
    const sound = SOUND_EFFECTS[effect];
    if (!sound) return;
    sound.pause();
    sound.currentTime = 0;
    sound.play().catch(() => {});
}

function updateMusicButton(isPlaying) {
    const label = t(isPlaying ? 'musicPause' : 'musicPlay');
    musicIcon.innerText = isPlaying ? '🔊' : '🔇';
    musicToggle.setAttribute('aria-label', label);
    musicToggle.title = label;
}

function setCombatMusic(isCombat) {
    if (!musicEnabled) return;
    if (isCombat) gameMusic.dataset.combat = 'true';
    else delete gameMusic.dataset.combat;
}

function startGameMusic() {
    musicEnabled = true;
    gameMusic.play()
        .then(() => updateMusicButton(true))
        .catch(() => updateMusicButton(false));
}

musicToggle.addEventListener('click', () => {
    if (gameMusic.paused) {
        musicEnabled = true;
        startGameMusic();
    } else { musicEnabled = false; gameMusic.pause(); }
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        gameMusic.pause();
        return;
    }
    if (musicEnabled && document.getElementById('game-main').hidden === false) {
        gameMusic.play().catch(() => {});
    }
});

gameMusic.addEventListener('play', () => updateMusicButton(true));
gameMusic.addEventListener('pause', () => updateMusicButton(false));
gameMusic.addEventListener('error', () => updateMusicButton(false));
