window.YaraRpgData = window.YaraRpgData || {};

// Tempos dos balões de fala em milissegundos. Altere estes valores para ajustar o ritmo.
window.YaraRpgData.dialogueRules = Object.freeze({
    // Tempo que cada balão permanece visível.
    bubbleDurationMs: 5500,
    // Intervalo para tentar novamente enquanto as falas estiverem pausadas.
    inactiveRetry: {
        // Menor tempo de espera antes de verificar novamente.
        minimumMs: 8000,
        // Maior tempo de espera antes de verificar novamente.
        maximumMs: 15000
    },
    // Configurações das falas durante a exploração.
    exploration: {
        // Espera antes da primeira fala ao iniciar a exploração.
        initialDelayMs: 5500,
        // Intervalo aleatório entre as falas de exploração.
        interval: {
            // Menor intervalo entre falas.
            minimumMs: 10000,
            // Maior intervalo entre falas.
            maximumMs: 15000
        }
    },
    // Configurações das falas durante o combate.
    combat: {
        // Intervalo aleatório antes da primeira fala do combate.
        initialDelay: {
            // Menor espera antes da primeira fala.
            minimumMs: 3000,
            // Maior espera antes da primeira fala.
            maximumMs: 6000
        },
        // Intervalo aleatório entre as falas durante o combate.
        interval: {
            // Menor intervalo entre falas.
            minimumMs: 4000,
            // Maior intervalo entre falas.
            maximumMs: 6500
        }
    }
});
