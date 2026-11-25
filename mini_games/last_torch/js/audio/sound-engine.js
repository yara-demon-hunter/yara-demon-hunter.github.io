import { save } from '../core/save.js';
import { SoundEngine as LibrarySoundEngine } from '../../library/sounds/index.js';
import { MOODS } from './music.js';

// Os sons e o motor vêm da biblioteca (mini_games/_library/sounds, copiada para library/sounds por sync.rb). Aqui só o que é do jogo:
// as músicas e as opções salvas do jogador.
export class SoundEngine extends LibrarySoundEngine {
    constructor() {
        super({ moods: MOODS, getSettings: () => save.settings, firstMood: 'menu' });
    }
}
