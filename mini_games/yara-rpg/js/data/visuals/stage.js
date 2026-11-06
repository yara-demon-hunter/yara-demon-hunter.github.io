window.YaraRpgData = window.YaraRpgData || {};
window.YaraRpgData.visuals = window.YaraRpgData.visuals || {};

// --- DADOS VISUAIS: palco 2.5D (js/stage/) ---
// Tudo o que dá para ajustar sem mexer no código do palco: câmera, posições, tempos de cada ação,
// o boneco de cada personagem e o cenário de cada região.
(() => {
    window.YaraRpgData.visuals.stage = Object.freeze({
        // Câmera de diorama: olha a trilha de cima, inclinada. Unidades = as do boneco (o herói tem ~25 de altura).
        camera: {
            pitchDeg: 34,          // inclinação: 0 = de lado, 90 = de cima
            distance: 85,          // distância até os personagens: maior = menos perspectiva
            actorLine: 0.84,       // altura dos pés dos personagens (fração do palco, de cima para baixo)
            center: 0.48,          // centro óptico (fração do palco)
            heroHeight: 0.5,       // altura do herói na tela (fração do palco)
            heroTop: 25            // altura do topo da cabeça do herói (unidades)
        },

        // Posições na trilha (unidades a partir do centro da tela, na profundidade dos personagens)
        layout: {
            heroExplore: -14,      // herói explorando (sem monstro)
            heroCombat: -24,       // herói em combate
            monster: 24,           // monstro
            reach: 19,             // distância do golpe: o herói para a essa distância do monstro
            petBehind: 11,         // pet atrás do herói
            campfire: 13           // fogueira à frente do herói
        },

        // Direção para onde o herói olha (radianos): 0 = direita; positivo vira o rosto para a câmera (3/4)
        facing: { right: 0.42, left: Math.PI - 0.42 },

        // explore: velocidade da caminhada (unidades/s). runPx: a mesma caminhada para a animação do boneco
        // (px/s na escala do Last Torch: 220 = corrida solta; menos que isso = passo mais contido)
        speed: { explore: 42, runPx: 150 },

        // Duração de cada ação (segundos). O palco encena o turno: golpe → reação do monstro → contra-ataque.
        timing: {
            explore: 1.15,         // caminhada ao explorar
            monsterEnter: 0.7,     // o monstro surge da névoa
            dashIn: 0.16,          // avanço até o monstro
            swingImpact: 0.12,     // do começo do golpe até o corte acertar
            settle: 0.18,          // pausa depois do golpe
            dashBack: 0.22,        // volta para o lugar
            enemyWindup: 0.18,     // o monstro recua antes de avançar
            enemyLunge: 0.16,      // o monstro avança até o herói
            enemyRecover: 0.35,
            rest: 2.6,
            potion: 1.1,
            guard: 1.1,
            dodge: 0.32,
            fleeOut: 0.55,
            fleeBack: 0.6,
            death: 0.9,            // o monstro se desfaz na névoa
            numberLife: 1.1        // números de dano flutuando
        },

        // Boneco de cada personagem do RPG (id de js/data/characters.js).
        // model: 'hunter' (Demon Hunter), 'azael' ou 'yara'. colors: troca só o que muda na paleta do boneco.
        // Quem ainda não tem boneco próprio usa o do Demon Hunter com as cores do seu retrato (provisório).
        characters: {
            'demon-hunter': { model: 'hunter' },
            'mysterious-creature': { model: 'azael' },
            zeph: {
                model: 'hunter',
                colors: {
                    cape: '#2b3a1e', capeFold: '#34472a', capeEdge: '#4a5e33', capeInner: '#1d2914',
                    body: '#2a2418', sleeve: '#3d4a2a', sash: '#6b4f2a', hood: '#2b3a1e', hoodFold: '#3d5229',
                    boots: '#2a1c10', glove: '#3a2a1a', strap: '#5a4026'
                }
            },
            oskar: {
                model: 'hunter',
                colors: {
                    cape: '#3b2416', capeFold: '#4a2e1c', capeEdge: '#6b4226', capeInner: '#26170d',
                    body: '#2b1d13', sleeve: '#4a3020', sash: '#7f1d1d', hood: '#3b2416', hoodFold: '#55351f',
                    boots: '#1f140c', glove: '#2b1d13', strap: '#5c3a22',
                    blade: '#d1d5db', bladeCore: '#f9fafb', runes: '#f9fafb', bladeGlow: '#9ca3af',
                    bladeGlowSoft: 'rgba(209, 213, 219, 0.35)'
                }
            },
            yara: { model: 'yara' }
        },

        // Cenário de cada região (id de js/data/regions.js). Uma região sem cenário usa o de fallback.
        // Hoje só a primeira fase tem cenário próprio; as outras entram aos poucos (ver js/stage/README.md).
        fallbackScene: 'dark-forest',
        scenes: {
            'dark-forest': {
                // Floresta da Névoa: azul-esverdeada, árvores retorcidas, luz fria do portal ao fundo
                sky: ['#9cc9cf', '#3f7480', '#16323a'],          // névoa do fundo (alto → baixo)
                ground: ['#1d3a40', '#132a30', '#0b1a1f'],       // chão (longe → perto)
                path: { color: '#2a3f3d', light: '#3c5450', edge: '#0d1d21', halfWidth: 8 },
                fog: '#7fb2ba',                                   // cor da névoa entre as camadas
                light: { color: 'rgba(200, 240, 245, 0.55)', x: 0.62 },   // feixe de luz do portal
                trunk: '#08161b', trunkLight: '#1f4651', leaf: '#0c2229',
                moss: '#2f5a4a', rock: '#22363b', rockLight: '#3b5a60',
                fern: '#173a33', fernLight: '#2c5a4c', grass: '#264a45',
                mushroom: '#8ef0ff',                               // cogumelos que brilham
                motes: 'rgba(170, 240, 255, 0.9)',                 // esporos flutuando
                monsterMist: 'rgba(120, 170, 180, 0.55)',
                // Fileiras de adereços. y: faixa da tela (fração da altura, 0 = topo) onde fica a base de cada um;
                // a câmera converte em profundidade. Ou dr (profundidade direta) e z (altura da base, para o que pende do alto).
                // Acima de 1 = base abaixo da borda (só a parte de cima aparece: moldura em primeiro plano).
                // cell: largura de cada célula na trilha (unidades); chance: probabilidade de ter algo;
                // kinds: [tipo, peso] (desenhos em js/stage/scenery.js); scale: tamanho; fog: névoa por cima (0 a 1)
                // layer: 'back' (atrás dos personagens) ou 'front' (na frente)
                rows: [
                    { y: [0.06, 0.16], cell: 7, chance: 0.95, kinds: [['tree', 3], ['pine', 2]], scale: 1.15, fog: 0.62, layer: 'back' },
                    { y: [0.27, 0.4], cell: 15, chance: 0.8, kinds: [['tree', 5], ['pine', 1], ['rock', 1]], scale: 1, fog: 0.3, layer: 'back' },
                    // Copa: galhos retorcidos pendurados no alto (dr: profundidade; z: altura de onde pendem)
                    { dr: [34, 46], z: [23, 27], cell: 26, chance: 0.7, kinds: [['canopy', 1]], scale: 1, fog: 0.12, layer: 'back' },
                    { y: [0.5, 0.62], cell: 8, chance: 0.78, kinds: [['fern', 4], ['rock', 2], ['mushrooms', 2], ['stump', 1]], scale: 1, fog: 0, layer: 'back' },
                    { y: [0.66, 0.7], cell: 4.5, chance: 0.75, kinds: [['grass', 5], ['pebbles', 2], ['root', 1]], scale: 1, fog: 0, layer: 'back' },
                    { y: [0.98, 1.04], cell: 5, chance: 0.75, kinds: [['grass', 5], ['pebbles', 2]], scale: 1.1, fog: 0, layer: 'front' },
                    { y: [1.25, 1.45], cell: 64, chance: 0.45, kinds: [['frontTrunk', 1], ['frontFern', 3]], scale: 1, fog: 0, layer: 'front' }
                ]
            }
        }
    });
})();
