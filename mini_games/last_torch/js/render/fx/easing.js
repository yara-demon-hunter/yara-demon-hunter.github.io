// --- EASING ---
// t de 0 a 1.
export const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export function easeOutBack(t, overshoot = 1.70158) {
    const c3 = overshoot + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2);
}

// Interpola ângulos pelo caminho mais curto.
export function lerpAngle(from, to, amount) {
    let diff = to - from;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return from + diff * amount;
}
