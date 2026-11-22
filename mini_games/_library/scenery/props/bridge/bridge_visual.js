// --- DADOS VISUAIS: peça Ponte de madeira (bridge) ---
export const BRIDGE_VISUALS = {
    plank: ['#564533', '#463828', '#5f4e3a'],    // as tábuas (cada uma sorteia um tom, e ainda varia de claro a escuro)
    rail: '#2a1d10',                             // o corrimão e os mourões das laterais
    beam: '#241709',                             // as vigas de baixo, que aparecem onde falta tábua
    water: 'rgba(7, 22, 31, 0.78)',              // a água escura por baixo, onde falta tábua
    moss: 'rgba(78, 120, 62, 0.42)',             // musgo nas pontas e nas beiras
    stain: 'rgba(8, 6, 3, 0.22)',                // manchas de umidade
    length: 289,                                 // comprimento: no sentido de cima para baixo da tela (a travessia). Gire a ponte para atravessar de lado.
    width: 216,                                  // largura do tabuleiro
    brokenChance: 0.2,                           // chance de cada tábua estar quebrada (faltando, pela metade ou rachada)
    postMissing: 0.14                            // chance de um mourão estar faltando
};
