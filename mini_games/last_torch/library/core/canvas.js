// --- ONDE A BIBLIOTECA DESENHA ---
// Todo desenho da biblioteca usa este ctx. O jogo liga o canvas dele com setCtx ao abrir e pode trocar o destino
// por um instante (gerar sprites num canvas fora da tela): quem importa ctx passa a ver o novo destino.
export let ctx = null;

// Devolve o destino anterior, para o jogo voltar a ele depois
export function setCtx(target) {
    const previous = ctx;
    ctx = target;
    return previous;
}
