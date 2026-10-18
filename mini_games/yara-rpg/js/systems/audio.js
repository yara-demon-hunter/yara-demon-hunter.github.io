// Music playback, visibility handling, and sound effects.
// Classic browser script; state is initialized by game.js before user actions run.

const gameMusic = document.getElementById('game-music');
const gameMusicSource = gameMusic.querySelector('source');
const normalMusicSource = gameMusicSource.getAttribute('src');
const musicToggle = document.getElementById('music-toggle');
const musicIcon = document.getElementById('music-icon');
const SOUND_EFFECTS = Object.freeze({
    dodge: new Audio('audio/sfx/dodge.mp3'),
    parry: new Audio('audio/sfx/parry.mp3'),
    basicAttack: new Audio('audio/sfx/basic-attack.mp3'),
    // Placeholder path for the critical hit sound currently being created.
    criticalHit: new Audio('audio/sfx/critical-hit.mp3'),
    // Placeholder path for the stun sound currently being created.
    stun: new Audio('audio/sfx/stun.mp3'),
    specialAttack: new Audio('audio/sfx/special-attack.mp3'),
    levelUp: new Audio('audio/sfx/level-up.mp3'),
    chestDiscovery: new Audio('audio/sfx/chest_discovery_dark_fantasy.mp3'),
    monsterDefeated: new Audio('audio/sfx/monster_defeated_dark_fantasy.mp3'),
    regionDiscovered: new Audio('audio/sfx/new_region_discovered_dark_fantasy.mp3'),
    deathLaugh: new Audio('audio/sfx/risada_diabolica.mp3')
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

function setBossMusic(isBoss) {
    const nextSource = isBoss ? 'audio/sfx/boss_song.mpga' : normalMusicSource;
    if (gameMusicSource.getAttribute('src') === nextSource) return;
    gameMusic.pause();
    gameMusicSource.setAttribute('src', nextSource);
    gameMusic.load();
    if (musicEnabled && !document.hidden) {
        playBackgroundMusic();
    }
}

function playBackgroundMusic() {
    gameMusic.muted = false;
    gameMusic.volume = 1;
    let playback;
    try {
        playback = gameMusic.play();
    } catch (error) {
        handleMusicPlaybackError(error);
        return Promise.resolve(false);
    }
    if (!playback) {
        updateMusicButton(true);
        return Promise.resolve(true);
    }
    return playback
        .then(() => {
            musicEnabled = true;
            updateMusicButton(true);
            return true;
        })
        .catch(handleMusicPlaybackError);
}

function handleMusicPlaybackError(error) {
    musicEnabled = false;
    updateMusicButton(false);
    console.error('Não foi possível iniciar a música de fundo:', gameMusic.currentSrc, error);
    return false;
}

function startGameMusic() {
    musicEnabled = true;
    return playBackgroundMusic();
}

musicToggle.addEventListener('click', () => {
    if (!musicEnabled || gameMusic.paused) {
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
        playBackgroundMusic();
    }
});

gameMusic.addEventListener('play', () => updateMusicButton(true));
gameMusic.addEventListener('pause', () => updateMusicButton(false));
gameMusic.addEventListener('error', () => {
    musicEnabled = false;
    updateMusicButton(false);
});
