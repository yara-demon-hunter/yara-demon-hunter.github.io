// --- TELA DE VITÓRIA (o jogador zerou a noite) ---
// No lugar do resumo comum (HUNT AGAIN): um final de verdade. O herói em destaque com os números da noite
// (pontos, mortes, nível, skills, bosses, Brasas, tempo, estrelas), as 18 ondas com as estrelas tiradas em cada uma e um botão
// só, MENU. Aparece depois do cartão de resultado da última onda (o amanhecer espera ele fechar). Estilo: css/components/victory.css.
import { audio } from '../core/state.js';
import { showToast } from './banner.js';

const HUNTER_ART = 'images/characters/demon-hunter-small.webp';
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function showVictory({ hero, darkness, waves, stats, rank, onMenu }) {
    document.getElementById('victoryScreen')?.remove();
    const root = document.createElement('div');
    root.id = 'victoryScreen';
    root.className = 'victory';
    waves = waves.map(w => Math.max(0, Math.min(3, w ?? 0)));      // nunca mais de 3 estrelas (saves antigos tinham até 5)
    const totalStars = waves.reduce((sum, w) => sum + (w ?? 0), 0);
    const tiles = [
        ['🏆', 'Score', stats.score],
        ['💀', 'Kills', stats.kills],
        ['⭐', 'Max level', stats.level],
        ['✨', 'Skills learned', stats.skills],
        ['👑', 'Bosses', stats.bosses],
        ['🔥', 'Embers', stats.embers],
        ['⚡', 'Best streak', stats.streak],
        ['⏱️', 'Time', null, clock(stats.seconds)]
    ];
    root.innerHTML = `
      <div class="vic-card" role="dialog" aria-label="Victory">
        <p class="vic-eyebrow">THE NIGHT IS OVER${darkness > 1 ? ` · DARKNESS ${darkness}` : ''}</p>
        <h2 class="vic-title">DAWN</h2>
        <div class="vic-body">
          <div class="vic-hero">
            <div class="vic-art"><img alt="" src="${hero.portraitImage ?? HUNTER_ART}"></div>
            <b class="vic-name">${hero.name.toUpperCase()}</b>
            <span class="vic-sub">kept the last torch alive until dawn</span>
            ${rank ? `<span class="vic-rank">🏆 #${rank} BEST NIGHT</span>` : ''}
          </div>
          <div class="vic-side">
            <div class="vic-stats">${tiles.map(([icon, label, value, text]) => `
              <div class="vic-stat"><span class="vic-ico">${icon}</span><b data-to="${value ?? ''}">${text ?? '0'}</b><em>${label}</em></div>`).join('')}
            </div>
            <p class="vic-waves-title">YOUR NIGHT · ${totalStars}/${waves.length * 3} ★</p>
            <div class="vic-waves">${waves.map((s, i) => `
              <div class="vic-wave${s >= 3 ? ' is-perfect' : ''}" style="--d:${i * 0.07}s"><i>Wave ${i + 1}</i><span><b>${'★'.repeat(s ?? 0)}</b>${'★'.repeat(3 - (s ?? 0))}</span></div>`).join('')}
            </div>
          </div>
        </div>
        <div class="vic-actions">
          <button class="vic-share start-btn" type="button">↗ SHARE</button>
          <button class="vic-menu start-btn start-btn-dark" type="button">MENU</button>
        </div>
      </div>`;
    document.body.appendChild(root);
    requestAnimationFrame(() => root.classList.add('is-in'));
    audio.playLevelUp?.();

    // Os números sobem contando
    const start = performance.now();
    const counters = [...root.querySelectorAll('.vic-stat b[data-to]')].filter(b => b.dataset.to !== '');
    const step = (now) => {
        if (!root.isConnected) return;
        const k = Math.min(1, (now - start) / 1400);
        const e = 1 - (1 - k) ** 3;
        counters.forEach(b => { b.textContent = fmt(+b.dataset.to * e); });
        if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);

    root.querySelector('.vic-share').addEventListener('click', () => shareCard({ hero, darkness, waves, stats, rank, tiles }));
    root.querySelector('.vic-menu').addEventListener('click', () => {
        root.classList.remove('is-in');
        setTimeout(() => root.remove(), 250);
        onMenu();
    });
}

// --- IMAGEM PARA COMPARTILHAR ---
// Desenha o card de vitória num canvas (1080×1420, formato de post) e o entrega: no celular abre o compartilhar do sistema com a imagem;
// no computador baixa o PNG. Tudo de dentro do jogo, sem biblioteca: as fontes já estão carregadas na página.
function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

async function drawCard({ hero, darkness, waves, stats, rank, tiles }) {
    await document.fonts?.ready;
    const W = 1080;
    const H = 1420;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const center = (text, y, font, color, spacing = '0px') => {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.letterSpacing = spacing;
        ctx.fillText(text, W / 2, y);
    };

    // Fundo: noite escura com o brilho da tocha embaixo
    let g = ctx.createRadialGradient(W / 2, H * 1.05, 50, W / 2, H * 1.05, H * 0.8);
    g.addColorStop(0, 'rgba(251, 146, 60, 0.55)');
    g.addColorStop(1, 'rgba(251, 146, 60, 0)');
    ctx.fillStyle = '#07090d';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    center('DEMON HUNTER: LAST TORCH', 78, '800 30px Cinzel, Georgia, serif', '#fdba74', '8px');
    center(`THE NIGHT IS OVER${darkness > 1 ? ` · DARKNESS ${darkness}` : ''}`, 128, '800 24px Inter, sans-serif', '#fbbf24', '7px');
    center('DAWN', 245, '800 130px Cinzel, Georgia, serif', '#fff7d6', '18px');

    // Herói
    const size = 430;
    const x = (W - size) / 2;
    const y = 290;
    const art = await loadImage(hero.portraitImage ?? HUNTER_ART);
    ctx.save();
    ctx.shadowColor = 'rgba(251, 146, 60, 0.8)';
    ctx.shadowBlur = 60;
    roundRect(ctx, x, y, size, size, 40);
    ctx.fillStyle = '#0b0f14';
    ctx.fill();
    ctx.restore();
    ctx.save();
    roundRect(ctx, x, y, size, size, 40);
    ctx.clip();
    if (art) ctx.drawImage(art, x, y, size, size);
    ctx.restore();
    roundRect(ctx, x, y, size, size, 40);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();
    center(hero.name.toUpperCase(), y + size + 62, '800 52px Cinzel, Georgia, serif', '#fdba74', '8px');
    center(rank ? `kept the last torch alive until dawn · 🏆 #${rank} best night` : 'kept the last torch alive until dawn', y + size + 106, '600 26px Inter, sans-serif', '#94a3b8');

    // Números: 4 × 2
    const top = 905;
    const tw = 235;
    const th = 118;
    const gap = 20;
    const left = (W - (tw * 4 + gap * 3)) / 2;
    tiles.forEach(([icon, label, value, text], i) => {
        const tx = left + (i % 4) * (tw + gap);
        const ty = top + Math.floor(i / 4) * (th + gap);
        roundRect(ctx, tx, ty, tw, th, 20);
        ctx.fillStyle = 'rgba(12, 10, 6, 0.85)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.stroke();
        ctx.textAlign = 'center';
        ctx.font = '34px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.letterSpacing = '0px';
        ctx.fillText(icon, tx + tw / 2, ty + 42);
        ctx.font = '800 38px Cinzel, Georgia, serif';
        ctx.fillStyle = '#fff7d6';
        ctx.fillText(text ?? fmt(value), tx + tw / 2, ty + 84);
        ctx.font = '600 16px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.letterSpacing = '1px';
        ctx.fillText(label.toUpperCase(), tx + tw / 2, ty + 108);
    });

    // As 12 ondas com as estrelas
    const total = waves.reduce((sum, w) => sum + (w ?? 0), 0);
    ctx.textAlign = 'left';
    ctx.font = '800 22px Inter, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.letterSpacing = '5px';
    ctx.fillText(`YOUR NIGHT · ${total}/${waves.length * 3} ★`, left, 1218);
    const ww = (tw * 4 + gap * 3 - 5 * 14) / 6;
    waves.forEach((st, i) => {
        const wx = left + (i % 6) * (ww + 14);
        const wy = 1238 + Math.floor(i / 6) * 52;
        roundRect(ctx, wx, wy, ww, 44, 10);
        ctx.fillStyle = 'rgba(8, 12, 16, 0.85)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = (st ?? 0) >= 3 ? 'rgba(250, 204, 21, 0.85)' : 'rgba(148, 163, 184, 0.25)';
        ctx.stroke();
        ctx.textAlign = 'center';
        ctx.letterSpacing = '0px';
        ctx.font = '700 15px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`W${i + 1}`, wx + 26, wy + 28);
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('★'.repeat(st ?? 0), wx + ww / 2 + 22, wy + 29);
    });
    return canvas;
}

async function shareCard(data) {
    try {
        const canvas = await drawCard(data);
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (!blob) throw new Error('no image');
        const file = new File([blob], 'last-torch-dawn.png', { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: 'Last Torch', text: 'I kept the last torch alive until dawn.' });
            return;
        }
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'last-torch-dawn.png';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 2000);
        showToast('📷', 'Image saved', 'Your victory card is in your downloads');
    } catch (e) {
        if (e?.name !== 'AbortError') showToast('⚠️', 'Could not create the image', 'Try again in a moment');
    }
}
