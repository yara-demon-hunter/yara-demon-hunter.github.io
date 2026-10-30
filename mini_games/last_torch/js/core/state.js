import { CHARACTER_MODEL, createPlayerState } from '../../data_model/character.js';
import { CORE_MODEL } from '../../data_model/core.js';
import { createPassives } from '../../data_model/passives.js';
import { FRENZY_NOVA_SKILL, createAttributes } from '../../data_model/skills.js';
import { SoundEngine } from '../audio/sound-engine.js';

// --- OBJETOS COMPARTILHADOS ---
export const canvas = document.getElementById('gameCanvas');
// alpha: false — o fundo é sempre pintado por inteiro, então o navegador não precisa misturar o canvas com a página
export const ctx = canvas.getContext('2d', { alpha: false });
export const audio = new SoundEngine();
export const attributes = createAttributes();
export const passives = createPassives();

// Heroi & Light Trail
export const player = createPlayerState();

// Teclas pressionadas
export const keys = {};

// Direção do joystick virtual (-1..1 em cada eixo; 0,0 = solto)
export const joystick = { x: 0, y: 0 };

export const maxUltEnergy = FRENZY_NOVA_SKILL.maximumEnergy;

// --- VARIÁVEIS DE ESTADO ---
// Tudo que muda durante a partida fica neste objeto para ser compartilhado entre os módulos.
export const state = {
    gameState: 'START',
    // Tamanho do MUNDO (unidades do jogo), não da janela. Veja data_model/world.js
    width: 0,
    height: 0,
    // Como o mundo é mostrado na tela (escala e deslocamento em px do navegador)
    view: { scale: 1, offsetX: 0, offsetY: 0, cssWidth: 0, cssHeight: 0, pixelRatio: 1, mobile: false },

    // Screen Shake
    shakeIntensity: 0,

    // Dados de Progresso
    turn: 1,
    scoreTurn: 0,
    targetScore: 500,
    totalScore: 0,
    coins: 0,

    // Level & XP
    playerLevel: 1,
    playerXp: 0,
    playerMaxXp: CHARACTER_MODEL.xpToNextLevel,
    skillPoints: 0,

    // Carga da Skill Ult (Frenzy Nova)
    ultEnergy: 0,
    frenzyActiveTimer: 0,
    frenzyDuration: 0,

    // Vida Núcleo
    coreHpMax: CORE_MODEL.initialHp,
    coreHp: CORE_MODEL.initialHp,
    coreX: 0,
    coreY: 0,

    // Entidades
    enemies: [],
    particles: [],
    bladeSlashes: [],
    knives: [],
    enemyProjectiles: [],
    goldDrops: [],
    currentBoss: null,

    // Adaga de arremesso: mira em coordenadas do mundo, se o botão/dedo está pressionado, recarga,
    // instante e direção do último arremesso (animação) e segundos até a adaga sair da mão (null = nenhuma)
    // stick: botão da adaga em telas de toque (x, y de -1 a 1; 0,0 = mira automática; aimAngle = mira atual;
    // fire = dedo acabou de soltar, arremessar no próximo quadro)
    knifeInput: { held: false, x: 0, y: 0, stick: { active: false, x: 0, y: 0, aimAngle: 0, fire: false } },
    knifeTimer: 0,
    knifeThrowTime: -100000,
    knifeThrowAngle: 0,
    knifePending: null,

    spawnTimer: 0
};
