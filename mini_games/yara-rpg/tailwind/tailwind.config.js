// Configuração do Tailwind CLI usada só para gerar css/tailwind.css (versão standalone).
// Reaproveita o tema de ../js/tailwind.config.js, que o site continua usando via CDN.
// Rode a partir de mini_games/yara-rpg (ver build-tailwind.sh): os caminhos abaixo são relativos a essa pasta.
globalThis.tailwind = {};
require('../js/tailwind.config.js');

module.exports = {
    ...globalThis.tailwind.config,
    content: [
        './partials/**/*.html',
        './components/**/*.html',
        './js/data/**/*.js',
        './js/systems/**/*.js',
        './js/game.js',
    ],
};
