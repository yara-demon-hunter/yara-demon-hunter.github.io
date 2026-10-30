import { createPlayerState } from '../../data_model/character.js';
import { CORE_MODEL } from '../../data_model/core.js';
import { createPassives } from '../../data_model/passives.js';
import { createPowers } from '../../data_model/powers.js';
import { FRENZY_NOVA_SKILL, createAttributes } from '../../data_model/skills.js';
import { SoundEngine } from '../audio/sound-engine.js';

// --- OBJETOS COMPARTILHADOS ---
export const canvas = document.getElementById('gameCanvas');
// alpha: false — o fundo é sempre pintado por inteiro, então o navegador não precisa misturar o canvas com a página
export let ctx = canvas.getContext('2d', { alpha: false });

// Desenha em outro canvas (geração de sprites). Quem importa ctx passa a ver o novo destino. Devolve o anterior.
export function setDrawTarget(target) {
    const previous = ctx;
    ctx = target;
    return previous;
}

export const audio = new SoundEngine();
export const attributes = createAttributes();
export const passives = createPassives();
export const powers = createPowers();

// Heroi & Light Trail
export const player = createPlayerState();

// Shadow Clone (passiva): só existe com a passiva comprada. active = vivo e na tela;
// respawnTimer > 0 = morto, esperando para voltar.
export const shadowClone = {
    active: false,
    hp: 0, maxHp: 0,
    respawnTimer: 0,
    spawnTime: 0,
    x: 0, y: 0,
    angle: 0,
    attackTimer: 0,             // recarga do golpe próprio do clone
    comboStep: 1,
    frenzy: false,              // Fúria ativa no quadro anterior (para soltar as lâminas junto)
    iFrames: 0,
    hitDirX: 0, hitDirY: 0, hitTime: -100000
};

// Teclas pressionadas
export const keys = {};

// Direção do joystick virtual (-1..1 em cada eixo; 0,0 = solto)
export const joystick = { x: 0, y: 0 };

export const maxUltEnergy = FRENZY_NOVA_SKILL.maximumEnergy;

// --- VARIÁVEIS DE ESTADO ---
// Tudo que muda durante a partida fica neste objeto para ser compartilhado entre os módulos.
export const state = {
    // START, PLAYING, PAUSED (status e árvore), CAMP (acampamento), GAMEOVER
    gameState: 'START',
    // Fase dentro de PLAYING: HUNT (caçada), CLEAR (onda de fogo no fim da hora), DYING (morte), DAWN (amanhecer)
    phase: 'HUNT',
    phaseTimer: 0,
    gameOverReason: '',
    // Tamanho do MUNDO (unidades do jogo), não da janela. Veja data_model/world.js
    width: 0,
    height: 0,
    // Como o mundo é mostrado na tela (escala e deslocamento em px do navegador)
    view: { scale: 1, offsetX: 0, offsetY: 0, cssWidth: 0, cssHeight: 0, pixelRatio: 1, mobile: false },

    // Nível de detalhe: 0 = cheio, 1 = reduzido (celular começa aqui), 2 = mínimo.
    // js/game.js desce sozinho se o aparelho não acompanhar (data_model/world.js)
    quality: 0,
    redraw: true,               // fora da partida o canvas fica parado; true pede um quadro novo

    // Screen Shake, soco de zoom e clarão de tela
    shakeIntensity: 0,
    zoomPunch: 0,
    flash: { color: '#ffffff', alpha: 0 },

    // Hit stop (segundos congelado), câmera lenta (segundos e escala) e relógio da partida
    hitStop: 0,
    slowMoTimer: 0,
    slowMoScale: 1,
    runTime: 0,

    // Dados de Progresso (turn = hora da noite; targetScore fecha a hora)
    turn: 1,
    scoreTurn: 0,
    targetScore: 0,
    totalScore: 0,
    coins: 0,
    hourPlan: null,
    omen: null,
    nextOmen: null,
    bossPending: 0,             // segundos até o boss surgir (0 = nenhum a caminho)
    endless: false,             // jogador escolheu continuar depois do amanhecer
    dawn: 0,                    // 0 a 1: a noite clareando

    // Números da partida (tela final, Trials, brasas)
    run: { kills: 0, damage: 0, bestStreak: 0, bosses: 0, elites: 0, goldEarned: 0, evolutions: 0, victory: false, revivesUsed: 0, embersBanked: 0, killsByType: {} },
    streak: 0,
    streakTimer: 0,
    streakTierShown: 0,
    revives: 0,
    skillPoints: 0,             // pontos para gastar na árvore (medalhão de status)
    levelPointsCarry: 0,        // fração de ponto acumulada (relíquias que dão pontos extras)
    tree: {},                   // níveis dos nós de efeito simples (data_model/tree.js, kind 'mod')
    pickupPity: 0,

    // Level & XP
    playerLevel: 1,
    playerXp: 0,
    playerMaxXp: 0,

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
    pickups: [],
    currentBoss: null,
    goldVacuum: false,          // fim da hora: todas as moedas voam até o herói
    lastStand: false,           // cota da hora fechada: não nasce mais nada, falta matar o que sobrou
    magnetTimer: 0,             // ímã pego no chão: o mesmo, por alguns segundos

    // Efeitos (js/systems/effects.js, desenhados em js/render/effects.js)
    gibs: [],
    stains: [],
    shockwaves: [],
    floaters: [],
    telegraphs: [],             // avisos no chão: círculos (slam) e linhas (espectro)
    dashGhosts: [],
    clearWaveRadius: 0,

    // Poderes (js/systems/powers.js, desenhados em js/render/powers.js)
    orbitAngle: 0,
    trailDistance: 0,
    groundFires: [],
    lightning: [],
    bolts: [],
    stars: [],
    powerTimers: {},
    blastBudget: 0,

    // Animação de level up em andamento: { age, label } ou null
    levelUpFx: null,

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
