# Sons da biblioteca

Efeitos e motor de música sintetizados na hora (Web Audio API), sem arquivo de áudio. A teoria está em
`metodologia_de_sound_design_e_reten_o_em_jogos.md`; aqui está como ela virou código.

## Como um jogo usa

```js
import { SoundEngine } from '../../library/sounds/index.js';      // a CÓPIA do jogo, nunca _library
export const audio = new SoundEngine({ moods: MOODS, getSettings: () => save.settings });
```

`MOODS` (as músicas) e `getSettings` (volumes salvos) são do jogo. No Last Torch: `js/audio/sound-engine.js` e `js/audio/music.js`.
Depois de mexer aqui: `ruby mini_games/_library/sync.rb`. Para ouvir tudo: **Ateliê > Sons** (`tools/sounds.html`).

## Pastas

```
core/engine.js     o motor: canais, tone/burst, variação de tom, limite de vozes, ducking, muffle
core/music.js      o sequenciador (pad, baixo, bateria, arpejo, sino); as músicas vêm do jogo
sfx/combat.js      golpes, hit, kill (sobe com a sequência), dano, tocha, dash, lama
sfx/skills.js      habilidades dos ramos e poderes
sfx/progress.js    moeda (escada), level up, cartas, baú, compra, rush, reviver
sfx/night.js       fim de onda, corneta, boss (aviso, rugido, ataque, morte), sino, game over
sfx/retention.js   o que é novo para dar vontade de continuar: início de partida e de onda, morte com corte,
                   convite de nova tentativa, recorde, clique de interface, coração do perigo
```

## Regras do motor (valem para todo som)

| Regra | Como | Por quê |
| :-- | :-- | :-- |
| Variação de tom | `vary: 0.06` em `tone`/`burst` (±6%) | o mesmo som dezenas de vezes por minuto cansa o ouvido |
| Limite de vozes | sons curtos (`decay <= 0.2`) novos são descartados com 40 vozes | enxame não vira parede de ruído; sons longos (boss, morte) sempre passam |
| Ducking | `audio.duck({ depth, hold, release })` | a música cede para o som importante aparecer (Weber-Fechner) |
| Muffle | `audio.muffle({ freq, hold, release })` | o corte seco da morte: mundo abafado, silêncio, só então o grave |
| Limite por som | `throttled(chave, segundos)` | spam de uma ação não empilha |
| Graves | só em boss, morte, explosão; hit e kill ficam nos médios | celular e notebook não reproduzem grave; embola o mix |

## Mapa momento → som (o que o Last Torch liga)

| Momento | Som | Onde é chamado |
| :-- | :-- | :-- |
| Início de partida | `playRunStart` | `startGame` (ui/screens.js) |
| Início de onda | `playWaveStart(progresso)` | `startHour` (systems/night.js), da onda 2 em diante |
| Morte do jogador | `playDeath` (abafa) + `playGameOver` (termina em `playRetryInvite`) | `beginDeath`, `triggerGameOver` |
| Monstro morrendo | `playKill(streak)` | systems/enemies.js |
| Hit | `playHit`, `playCrit` | combat.js, damage.js |
| Boss | `playBossWarning`, `playBossRoar` (ambos com ducking) | night.js, spawner.js |
| Level up | `playLevelUp` (ducking leve) | progression.js |
| Moeda | `playCoin` (escada) | gold.js |
| Vitória da onda | `playHourClear` | night.js |
| Recorde | `playRecord` | ui/record_celebration.js |
| Interface | `playClick` | ui/buttons.js (qualquer botão) |
| Perigo | `playHeartbeat` (vida do herói abaixo de 25%) | systems/player.js |

## Como criar um som novo

1. Escolha o grupo em `sfx/` (ou crie um e registre em `index.js`, em `SFX_GROUPS`).
2. Escreva o método com `this.tone(...)` (oscilador) e `this.burst(...)` (ruído filtrado). Sons que se repetem ganham `vary` e `throttled`.
3. Abra o Ateliê > Sons, ouça, aperte várias vezes e rode o teste de enxame.
4. `ruby mini_games/_library/sync.rb` e ligue no jogo (a chamada `audio.playAlgo()` fica no código do jogo).
