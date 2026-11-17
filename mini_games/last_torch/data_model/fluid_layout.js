// --- LAYOUT FLUIDO DO HUD E DOS CONTROLES ---
// Gerado a partir do que o dono ajustou no HUD tuner (_sandbox/tuner.js). Três perfis: portrait (celular e tablet em pé, eixo =
// ALTURA da tela), landscape (celular deitado, altura até 520 px, eixo = LARGURA) e desktop (telas deitadas mais altas que isso,
// eixo = LARGURA); por dentro, o portrait tem um quarto balde (tablet) para largura a partir de 600 px. Cada ponto de referência ("at") é uma tela ajustada; entre dois pontos o jogo INTERPOLA, e fora deles escala
// proporcionalmente (js/ui/fluid_layout.js).
//   hud[peça] = [dx, dy, escala]: quanto a peça anda (px, a partir do centro) e cresce em relação ao layout base do CSS
//   ctl[controle] = [tamanho, afastamento lateral, afastamento de baixo], em px (joystick: da esquerda; adaga e dash: da direita)
// Não edite à mão: o tuner exporta os ajustes e esta tabela é regerada a partir deles.
export const FLUID_LAYOUT = {
    portrait: { axis: 'height', anchors: [
        { at: 640, screen: '360x640',
          hud: {heroCard: [0.0, 0.0, 1], btnPause: [0.0, 0.0, 1], hudButtons: [0.0, 0.0, 1], bossHpContainer: [-43.67, -7.57, 0.7415], hudBottom: [0.0, 0.0, 1], hudScore: [3.02, 68.97, 1.2339], hudStreak: [8.7, -26.75, 0.88]},
          ctl: {joystick: [64.48, 42.48, 65.29], knifeButton: [62.2, 41.6, 69.6], dashButton: [38.0, 100.19, 121.09]} },
        { at: 740, screen: '360x740',
          hud: {heroCard: [0.0, 0.0, 1], btnPause: [0.0, 0.0, 1], hudButtons: [0.0, 0.0, 1], bossHpContainer: [-40.79, -7.43, 0.756], hudBottom: [0.0, 0.0, 1], hudScore: [1.22, 83.23, 1.2006], hudStreak: [0.97, -18.88, 1]},
          ctl: {joystick: [77.19, 35.69, 68.48], knifeButton: [65.89, 31.41, 69.8], dashButton: [37.89, 91.5, 125.89]} },
        { at: 844, screen: '390x844',
          hud: {heroCard: [0.0, 0.0, 1], btnPause: [0.0, 0.0, 1], hudButtons: [0.0, 0.0, 1], bossHpContainer: [-46.24, -7.98, 0.77], hudBottom: [0.0, 0.0, 1], hudScore: [0.54, 75.48, 1.1791], hudStreak: [4.0, -24.16, 1]},
          ctl: {joystick: [87.65, 39.11, 71.92], knifeButton: [60.7, 42.62, 89.92], dashButton: [41.66, 96.59, 141.59]} },
        { at: 915, screen: '412x915',
          hud: {heroCard: [0.0, 0.0, 1], btnPause: [0.0, 0.0, 1], hudButtons: [0.0, 0.0, 1], bossHpContainer: [-48.13, -6.87, 0.755], hudBottom: [0.0, 0.0, 1], hudScore: [0.02, 84.78, 1.1389], hudStreak: [6.41, -14.39, 1]},
          ctl: {joystick: [94.0, 51.34, 77.66], knifeButton: [79.41, 49.28, 89.43], dashButton: [45.94, 117.86, 159.56]} }
    ] },
    tablet: { axis: 'width', anchors: [
        { at: 768, screen: '768x1024',
          hud: {heroCard: [0.0, 0.0, 1], btnPause: [0.0, 0.0, 1], hudButtons: [0.0, 0.0, 1], bossHpContainer: [-54.41, -0.25, 1.3724], hudBottom: [0.0, 0.0, 1], hudScore: [-20.13, 145.65, 1.6693], hudStreak: [-30.21, 16.41, 1.5699]},
          ctl: {joystick: [124.0, 78.3, 85.2], knifeButton: [102.91, 90.28, 99.0], dashButton: [67.64, 176.56, 186.05]} }
    ] },
    landscape: { axis: 'width', anchors: [
        { at: 640, screen: '640x360',
          hud: {heroCard: [0.01, 0.0, 0.86], btnPause: [-16.5, -0.41, 0.8901], hudButtons: [-22.1, 1.23, 0.8699], bossHpContainer: [27.56, -3.07, 0.76], hudBottom: [-9.73, -1.21, 0.8], hudScore: [3.31, 44.98, 1], hudStreak: [4.02, -18.91, 1]},
          ctl: {joystick: [64.0, 46.3, 40.55], knifeButton: [56.95, 41.58, 38.89], dashButton: [34.42, 95.6, 84.52]} },
        { at: 740, screen: '740x360',
          hud: {heroCard: [-16.89, 1.99, 0.74], btnPause: [-41.21, 2.16, 0.87], hudButtons: [-44.92, 2.94, 0.8198], bossHpContainer: [10.64, -0.0, 0.83], hudBottom: [-26.69, -2.36, 0.78], hudScore: [0.59, 54.56, 1], hudStreak: [-2.45, -14.57, 1.1201]},
          ctl: {joystick: [64.0, 54.33, 54.2], knifeButton: [64.0, 48.53, 46.19], dashButton: [35.92, 113.5, 99.0]} },
        { at: 844, screen: '844x390',
          hud: {heroCard: [0.0, 0.0, 1], btnPause: [0.0, 0.0, 1], hudButtons: [0.0, 0.0, 1], bossHpContainer: [14.14, 0.02, 0.88], hudBottom: [0.0, 0.0, 1], hudScore: [1.63, 66.81, 1.0644], hudStreak: [-11.85, -6.67, 1.4039]},
          ctl: {joystick: [76.16, 61.47, 40.32], knifeButton: [57.58, 64.83, 52.42], dashButton: [34.91, 122.29, 99.09]} },
        { at: 915, screen: '915x412',
          hud: {heroCard: [-13.01, 0.62, 0.82], btnPause: [-30.27, 4.16, 1], hudButtons: [-32.99, 5.06, 1], bossHpContainer: [-0.0, -0.0, 0.92], hudBottom: [-8.18, 2.54, 0.89], hudScore: [1.01, 62.67, 1.1704], hudStreak: [-2.78, -10.53, 1.1701]},
          ctl: {joystick: [71.03, 70.05, 48.34], knifeButton: [57.59, 76.28, 53.58], dashButton: [36.92, 132.86, 97.89]} }
    ] },
    desktop: { axis: 'width', anchors: [
        { at: 1024, screen: '1024x768',
          hud: {heroCard: [-4.92, -3.26, 0.88], btnPause: [-21.06, 0.67, 1], hudButtons: [-11.43, -1.19, 1.2801], bossHpContainer: [-42.22, -9.79, 1.3793], hudBottom: [0.0, 0.0, 1], hudScore: [-16.35, 121.82, 1.4501], hudStreak: [-25.49, -0.22, 1.36]},
          ctl: {joystick: [122.77, 97.61, 63.34], knifeButton: [92.98, 82.79, 88.91], dashButton: [61.89, 175.36, 156.52]} },
        { at: 1280, screen: '1280x720',
          hud: {heroCard: [-6.54, -0.0, 0.82], btnPause: [-24.58, 1.79, 0.9601], hudButtons: [-17.41, 1.06, 0.8301], bossHpContainer: [-488.65, -10.92, 1.4759], hudBottom: [-7.03, 5.04, 0.89], hudScore: [-10.45, 74.67, 1.3562], hudStreak: [-34.63, -43.89, 1.6239]},
          ctl: {} },
        { at: 1920, screen: '1920x1080',
          hud: {heroCard: [73.73, 20.1, 1.2638], btnPause: [143.44, 22.07, 1.4966], hudButtons: [200.27, 25.4, 1.671], bossHpContainer: [-822.02, 3.19, 1.7794], hudBottom: [0.0, 0.0, 1], hudScore: [-27.33, 113.43, 1.7701], hudStreak: [-65.55, -19.66, 1.9198]},
          ctl: {} }
    ] }
};
