// Ícones desenhados em SVG para os botões de ação (no lugar dos emojis).
// Uso no HTML: <span data-icon="compass" aria-hidden="true">🧭</span> — o emoji fica só como reserva.
// Todos seguem a mesma regra: grade 24x24, contorno escuro, luz vindo de cima à esquerda.
window.YaraIcons = (() => {
    const INK = '#120d08';
    const line = `stroke="${INK}" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"`;

    // Lâmina vertical centrada em x=12 (a ponta em cima), reaproveitada pelas armas.
    const dagger = `
        <path d="M12 2 L14 5 V14 H10 V5 Z" fill="#dfe4ea" ${line}/>
        <path d="M12 2 L14 5 V14 H12 Z" fill="#9aa4b1"/>
        <path d="M12 4.5 V13" stroke="#6f7884" stroke-width=".7"/>
        <rect x="7.5" y="14" width="9" height="2" rx="1" fill="#e5b956" ${line}/>
        <rect x="11" y="16" width="2" height="3.6" fill="#7a4a2a" ${line}/>
        <circle cx="12" cy="20.6" r="1.4" fill="#e5b956" ${line}/>`;

    const ICONS = {
        compass: `
            <circle cx="12" cy="12" r="9.6" fill="#c9973f" ${line}/>
            <circle cx="12" cy="12" r="9.6" fill="none" stroke="#f3d48a" stroke-width=".8" stroke-dasharray="15 46" transform="rotate(200 12 12)"/>
            <circle cx="12" cy="12" r="7.4" fill="#2f4a4c" ${line}/>
            <path d="M12 5.4 V6.8 M18.6 12 H17.2 M12 18.6 V17.2 M5.4 12 H6.8" stroke="#cfd8d4" stroke-width=".9" stroke-linecap="round"/>
            <path d="M12 5.2 L14.4 12 H9.6 Z" fill="#e0503c" ${line}/>
            <path d="M12 18.8 L9.6 12 H14.4 Z" fill="#ece5d2" ${line}/>
            <circle cx="12" cy="12" r="1.2" fill="#e5b956" ${line}/>`,

        campfire: `
            <path d="M12 3 C15 7 18.2 9 17.4 13.6 C16.9 16.6 14.6 18.2 12 18.2 C9.4 18.2 7.2 16.6 6.7 13.6 C6.3 10.6 8.8 9.4 9.4 7 C10.9 8.6 10.9 10 11.4 11 C12.6 9 12.6 6 12 3 Z" fill="#f08a24" ${line}/>
            <path d="M12 9.2 C14 11.6 15 13.1 14.6 15 C14.2 16.6 13.1 17.3 12 17.3 C10.6 17.3 9.6 16.4 9.5 15 C9.4 13.5 10.5 12.8 11 11.6 C11.8 12.6 12.3 11 12 9.2 Z" fill="#ffd75e"/>
            <rect x="3.5" y="17" width="17" height="3.2" rx="1.6" fill="#8a5530" ${line} transform="rotate(-14 12 18.6)"/>
            <rect x="3.5" y="17" width="17" height="3.2" rx="1.6" fill="#6e4224" ${line} transform="rotate(14 12 18.6)"/>
            <circle cx="5.2" cy="20.3" r=".9" fill="#d7a36b"/>
            <circle cx="18.8" cy="20.3" r=".9" fill="#d7a36b"/>`,

        potion: `
            <path d="M10 4.2 H14 V8.8 A6.6 6.6 0 1 1 10 8.8 Z" fill="#2a3640" ${line}/>
            <path d="M5.5 14.2 Q12 12.6 18.5 14.2 A6.5 6.5 0 0 1 5.5 14.2 Z" fill="#d9324a"/>
            <path d="M6.6 17.3 Q12 19.4 17.4 17.3 A6.4 6.4 0 0 1 6.6 17.3 Z" fill="#9d1f33"/>
            <path d="M10 4.2 H14 V8.8 A6.6 6.6 0 1 1 10 8.8 Z" fill="none" ${line}/>
            <ellipse cx="9" cy="12.8" rx=".9" ry="2.2" fill="#fff" opacity=".55" transform="rotate(25 9 12.8)"/>
            <rect x="9.3" y="1.8" width="5.4" height="3" rx=".9" fill="#a87a4a" ${line}/>`,

        quickAttack: `
            <path d="M2.5 15.5 H6 M3.5 19 H7.5 M5 12 H7" stroke="#cfe3e0" stroke-width="1.1" stroke-linecap="round" opacity=".8"/>
            <g transform="rotate(45 12 12) translate(1 0)">${dagger}</g>`,

        heavyAttack: `
            <path d="M20.5 19 A14 14 0 0 0 5 3.5" fill="none" stroke="#e05a3a" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>
            <path d="M19 20.2 A14 14 0 0 0 4 5" fill="none" stroke="#ffb066" stroke-width=".9" stroke-linecap="round" opacity=".8"/>
            <g transform="rotate(45 12 12)">
                <path d="M12 1 L15.2 4.4 V15 H8.8 V4.4 Z" fill="#dfe4ea" ${line}/>
                <path d="M12 1 L15.2 4.4 V15 H12 Z" fill="#9aa4b1"/>
                <path d="M12 3.6 V14" stroke="#6f7884" stroke-width=".8"/>
                <rect x="5" y="15" width="14" height="2.3" rx="1.1" fill="#e5b956" ${line}/>
                <rect x="10.9" y="17.3" width="2.2" height="3.6" fill="#7a4a2a" ${line}/>
                <circle cx="12" cy="22" r="1.6" fill="#e5b956" ${line}/>
            </g>`,

        parry: `
            <g transform="rotate(42 12 12) scale(.92) translate(1 1)">${dagger}</g>
            <g transform="rotate(-42 12 12) scale(.92) translate(1 1)">${dagger}</g>
            <path d="M12 2.2 L12.9 5 L15.6 5.6 L12.9 6.4 L12 9.2 L11.1 6.4 L8.4 5.6 L11.1 5 Z" fill="#ffe27a" stroke="#b9852a" stroke-width=".5" stroke-linejoin="round"/>`,

        dodge: `
            <g fill="none" stroke-linecap="round">
                <path d="M3 9 H14 A3 3 0 1 0 11 6" stroke="${INK}" stroke-width="3.4"/>
                <path d="M3 13.5 H18 A3 3 0 1 1 15 16.5" stroke="${INK}" stroke-width="3.4"/>
                <path d="M3 18 H9" stroke="${INK}" stroke-width="3.4"/>
                <path d="M3 9 H14 A3 3 0 1 0 11 6" stroke="#7fe0d2" stroke-width="1.7"/>
                <path d="M3 13.5 H18 A3 3 0 1 1 15 16.5" stroke="#bff3ea" stroke-width="1.7"/>
                <path d="M3 18 H9" stroke="#7fe0d2" stroke-width="1.7"/>
            </g>`,

        flee: `
            <path d="M1.8 9.5 H6 M1 13.5 H6.2 M2.5 17.5 H6.8" stroke="#cfd8d4" stroke-width="1.1" stroke-linecap="round" opacity=".75"/>
            <path d="M8.5 4.5 H14.5 V12 L19.4 14.4 Q21.4 15.4 21.4 17.6 V19.2 H8.5 Z" fill="#8a5530" ${line}/>
            <path d="M14.5 12 L19.4 14.4 Q21.4 15.4 21.4 17.6 V19.2 H15.5 Z" fill="#6e4224"/>
            <path d="M8.5 4.5 H14.5 V12 L19.4 14.4 Q21.4 15.4 21.4 17.6 V19.2 H8.5 Z" fill="none" ${line}/>
            <rect x="7.8" y="19" width="14.2" height="2.4" rx=".8" fill="#2b2420" ${line}/>
            <rect x="7.6" y="3" width="7.6" height="2.8" rx=".8" fill="#e5b956" ${line}/>
            <path d="M10 8.5 H13 M10 10.5 H13" stroke="#c48a55" stroke-width=".9" stroke-linecap="round"/>`
    };

    function svg(name) {
        const body = ICONS[name];
        return body ? `<svg class="game-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>` : null;
    }

    function apply(root = document) {
        root.querySelectorAll('[data-icon]').forEach((holder) => {
            const markup = svg(holder.dataset.icon);
            if (markup) holder.innerHTML = markup;
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => apply());
    else apply();

    return { svg, apply, names: Object.keys(ICONS) };
})();
