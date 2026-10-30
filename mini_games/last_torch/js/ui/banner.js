// --- AVISOS NA TELA ---
// Faixa grande no meio (início de hora, boss, hordas), grito de sequência e notificações no canto.
// São elementos do HTML animados por CSS (css/components/banner.css): a fonte fica nítida e o canvas não paga por isso.
let bannerTimer = 0;

// style: hour, danger, warn, gold
export function showBanner(eyebrow, title, sub, style = 'hour') {
    const banner = document.getElementById('banner');
    document.getElementById('bannerEyebrow').innerText = eyebrow;
    document.getElementById('bannerTitle').innerText = title;
    document.getElementById('bannerSub').innerText = sub;
    banner.className = `banner-${style}`;
    void banner.offsetWidth;
    banner.classList.add('is-showing');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => banner.classList.remove('is-showing'), 2300);
}

export function showCallout(text, color) {
    const callout = document.getElementById('callout');
    callout.innerText = text;
    callout.style.setProperty('--tone', color);
    callout.classList.remove('is-showing');
    void callout.offsetWidth;
    callout.classList.add('is-showing');
}

export function showToast(icon, title, sub) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon"></span><div><b></b><span></span></div>`;
    toast.querySelector('.toast-icon').textContent = icon;
    toast.querySelector('b').textContent = title;
    toast.querySelector('b + span').textContent = sub;
    const layer = document.getElementById('toasts');
    layer.appendChild(toast);
    setTimeout(() => toast.remove(), 3600);
}
