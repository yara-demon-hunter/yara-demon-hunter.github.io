// --- BAÚ DIÁRIO ---
// Um baú por dia (data local do jogador), pago em Brasas. Abrir em dias seguidos sobe a sequência do dia 1 ao dia 7;
// pular um dia volta ao dia 1. Depois do dia 7 o ciclo recomeça no dia 1 sem perder nada.
// É o "motivo marcado no relógio" do plano de retenção (report/improvement_2026_11_16/05_retencao_d1_d7.md, 5.4):
// quem joga hoje vê na tela final quanto o baú de amanhã vale.

// Brasas de cada dia da sequência: 100, 200, 300... até 700 no dia 7 (27/11/2026; antes 20, 30, 40, 55, 70, 90 e 200). Uma semana inteira rende 2.800.
// Junto com os preços dos heróis (Avgustino 1.000, Gudran 2.000, Kuro 5.000: data_model/characters/) a conta é: Avgustino no dia 4 (100+200+300+400),
// Gudran no dia 6 (2.100) e o Kuro na 2ª semana. As Brasas das noites jogadas somam por cima. Pular um dia volta ao dia 1 (dailyStatus).
export const DAILY_REWARDS = [100, 200, 300, 400, 500, 600, 700];

// Dia local como número (dias desde 1970), para comparar "hoje", "ontem" e "pulou"
export function dayNumber(date = new Date()) {
    return Math.floor((date.getTime() - date.getTimezoneOffset() * 60000) / 86400000);
}

// Situação do baú hoje. save.daily = { lastDay, streak } (streak = dia da sequência do último baú aberto, 1 a 7)
export function dailyStatus(save, today = dayNumber()) {
    const { lastDay = null, streak = 0 } = save.daily ?? {};
    const claimed = lastDay === today;
    const kept = lastDay === today - 1;
    // Dia do baú de hoje (se ainda não abriu) ou de amanhã (se já abriu)
    const nextDay = claimed ? (streak % 7) + 1 : (kept ? (streak % 7) + 1 : 1);
    return {
        claimed,
        day: claimed ? streak : nextDay,            // o dia mostrado nas bolinhas
        reward: DAILY_REWARDS[nextDay - 1],         // o que o próximo baú (hoje ou amanhã) paga
        nextDay,
        lost: !claimed && lastDay !== null && !kept && streak > 1   // a sequência quebrou
    };
}

// Abre o baú de hoje: devolve as Brasas ganhas, ou 0 se já abriu
export function claimDaily(save, today = dayNumber()) {
    const status = dailyStatus(save, today);
    if (status.claimed) return 0;
    save.daily = { lastDay: today, streak: status.nextDay };
    save.embers += status.reward;
    return status.reward;
}

// Horas até a meia-noite local (quando o próximo baú abre)
export function hoursToMidnight(now = new Date()) {
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.max(1, Math.ceil((midnight - now) / 3600000));
}
