// Music playback, visibility handling, and sound effects.
// Classic browser script; state is initialized by game.js before user actions run.

const gameMusic = document.getElementById('game-music');
const gameMusicSource = gameMusic.querySelector('source');
const normalMusicSource = gameMusicSource.getAttribute('src');
const AUDIO_SETTINGS_KEY = 'yara-rpg-settings-v1';
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

function readAudioSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(AUDIO_SETTINGS_KEY) || 'null');
        return {
            music: typeof saved?.music === 'boolean' ? saved.music : true,
            soundEffects: typeof saved?.soundEffects === 'boolean' ? saved.soundEffects : true
        };
    } catch (error) {
        console.error('Unable to read Yara RPG audio settings.', error);
        return { music: true, soundEffects: true };
    }
}

let soundEffectsEnabled = true;

function showSettingsStatus(messageKey = '') {
    const status = document.getElementById('settings-status');
    status.textContent = messageKey ? t(messageKey) : '';
    status.hidden = !messageKey;
}

function saveAudioSettings() {
    try {
        localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify({
            music: musicEnabled,
            soundEffects: soundEffectsEnabled
        }));
        showSettingsStatus();
        return true;
    } catch (error) {
        console.error('Unable to save Yara RPG audio settings.', error);
        showSettingsStatus('settingsSaveError');
        return false;
    }
}

function renderAudioSettings() {
    const musicToggle = document.getElementById('settings-music-toggle');
    const sfxToggle = document.getElementById('settings-sfx-toggle');
    [[musicToggle, musicEnabled], [sfxToggle, soundEffectsEnabled]].forEach(([button, enabled]) => {
        button.textContent = t(enabled ? 'settingsOn' : 'settingsOff');
        button.setAttribute('aria-pressed', String(enabled));
    });
}

function initializeAudioSettings() {
    const saved = readAudioSettings();
    musicEnabled = saved.music;
    soundEffectsEnabled = saved.soundEffects;
    renderAudioSettings();
}

function setMusicPreference(enabled) {
    musicEnabled = enabled;
    renderAudioSettings();
    saveAudioSettings();
    if (!enabled) {
        gameMusic.pause();
    } else if (!document.getElementById('game-main').hidden) {
        startGameMusic();
    }
}

function setSoundEffectsPreference(enabled) {
    soundEffectsEnabled = enabled;
    renderAudioSettings();
    saveAudioSettings();
}

function playSound(effect) {
    if (!soundEffectsEnabled) return;
    const sound = SOUND_EFFECTS[effect];
    if (!sound) return;
    sound.pause();
    sound.currentTime = 0;
    sound.play().catch(() => {});
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
    if (!musicEnabled) {
        gameMusic.pause();
        return Promise.resolve(false);
    }
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
        return Promise.resolve(true);
    }
    return playback
        .then(() => true)
        .catch(handleMusicPlaybackError);
}

function handleMusicPlaybackError(error) {
    musicEnabled = false;
    renderAudioSettings();
    saveAudioSettings();
    console.error('Não foi possível iniciar a música de fundo:', gameMusic.currentSrc, error);
    return false;
}

function startGameMusic() {
    if (!musicEnabled) {
        gameMusic.pause();
        return Promise.resolve(false);
    }
    return playBackgroundMusic();
}

document.getElementById('open-settings').addEventListener('click', () => {
    showSettingsStatus();
    document.getElementById('settings-dialog').showModal();
});
document.querySelectorAll('[data-settings-close]').forEach((button) => {
    button.addEventListener('click', () => document.getElementById('settings-dialog').close());
});
document.getElementById('settings-music-toggle').addEventListener('click', () => {
    setMusicPreference(!musicEnabled);
});
document.getElementById('settings-sfx-toggle').addEventListener('click', () => {
    setSoundEffectsPreference(!soundEffectsEnabled);
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

gameMusic.addEventListener('error', () => {
    musicEnabled = false;
    renderAudioSettings();
    saveAudioSettings();
});
