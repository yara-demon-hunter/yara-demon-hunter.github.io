window.YaraRpgData = window.YaraRpgData || {};

// Tempos dos balões de fala em milissegundos. Altere estes valores para ajustar o ritmo.
window.YaraRpgData.dialogueRules = Object.freeze({
    // Tempo que cada balão permanece visível.
    bubbleDurationMs: 3200,
    // Intervalo para tentar novamente enquanto as falas estiverem pausadas.
    inactiveRetry: {
        // Menor tempo de espera antes de verificar novamente.
        minimumMs: 3500,
        // Maior tempo de espera antes de verificar novamente.
        maximumMs: 7000
    },
    // Configurações das falas durante a exploração.
    exploration: {
        // Espera antes da primeira fala ao iniciar a exploração.
        initialDelayMs: 2500,
        // Intervalo aleatório entre as falas de exploração.
        interval: {
            // Menor intervalo entre falas.
            minimumMs: 5000,
            // Maior intervalo entre falas.
            maximumMs: 9000
        }
    },
    // Configurações das falas durante o combate.
    combat: {
        // Intervalo aleatório antes da primeira fala do combate.
        initialDelay: {
            // Menor espera antes da primeira fala.
            minimumMs: 1500,
            // Maior espera antes da primeira fala.
            maximumMs: 3000
        },
        // Intervalo aleatório entre as falas durante o combate.
        interval: {
            // Menor intervalo entre falas.
            minimumMs: 3500,
            // Maior intervalo entre falas.
            maximumMs: 5500
        }
    }
});
