// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/sounds/index.js e rode o sync.
// Sons da biblioteca: o motor genérico mais os efeitos agrupados por assunto.
// Cada jogo importa a própria cópia (ex.: last_torch/library/sounds/index.js) e entrega as próprias músicas e opções:
//
//   import { SoundEngine } from '../../library/sounds/index.js';
//   export const audio = new SoundEngine({ moods: MOODS, getSettings: () => save.settings });
export { SCALE, SoundEngineBase } from './core/engine.js';
export { MusicEngine, midi } from './core/music.js';
import { SoundEngineBase } from './core/engine.js';
import { combatSfx } from './sfx/combat.js';
import { skillsSfx } from './sfx/skills.js';
import { progressSfx } from './sfx/progress.js';
import { nightSfx } from './sfx/night.js';
import { retentionSfx } from './sfx/retention.js';

export const SFX_GROUPS = { combat: combatSfx, skills: skillsSfx, progress: progressSfx, night: nightSfx, retention: retentionSfx };

export class SoundEngine extends SoundEngineBase { }
for (const group of Object.values(SFX_GROUPS)) Object.assign(SoundEngine.prototype, group);
