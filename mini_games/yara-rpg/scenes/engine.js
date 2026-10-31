// Motor de cenas curtas: relógio, legendas, som procedural e pular.
// Cada cena fica em library/, é desenhada em código e não usa imagens.
// Classic browser script, sem dependências do jogo; ver README.md.
window.YaraScenes = (() => {
    const registry = new Map();
    const MAX_FRAME_SECONDS = 0.1;
    const MAX_RENDER_SCALE = 4;

    const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
    // Sobe de 0 a 1 entre start e end, com início e fim suaves.
    const ease = (t, start, end) => {
        const progress = clamp((t - start) / (end - start));
        return progress * progress * (3 - 2 * progress);
    };
    // Gerador com semente: a mesma cena sai igual em toda execução.
    const seededRandom = (seed) => () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
    };

    function createAudio() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return { bell() {}, rumble() {}, close() {} };
        const audio = new AudioContext();
        const master = audio.createGain();
        master.gain.value = 0.5;
        master.connect(audio.destination);

        function tone(frequency, peak, seconds, type = 'sine') {
            const oscillator = audio.createOscillator();
            const gain = audio.createGain();
            oscillator.type = type;
            oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(peak, audio.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + seconds);
            oscillator.connect(gain).connect(master);
            oscillator.start();
            oscillator.stop(audio.currentTime + seconds);
        }

        return {
            // Sino: parciais inarmônicos com decaimento longo.
            bell(frequency = 110) {
                [[1, .5, 5], [2, .3, 4], [2.4, .22, 3], [3, .16, 2.5], [4.2, .1, 1.6], [5.4, .06, 1]]
                    .forEach(([ratio, peak, seconds]) => tone(frequency * ratio, peak, seconds));
            },
            rumble() {
                tone(44, .35, 3.5, 'triangle');
            },
            close() {
                audio.close();
            }
        };
    }

    function register(scene) {
        registry.set(scene.id, scene);
    }

    // Toca a cena dentro de container. Com `frozenAt`, desenha só aquele instante.
    function play(id, { container = document.body, language = 'pt', sound = true, fullscreen = false, frozenAt = null, onEnd = null } = {}) {
        const scene = registry.get(id);
        if (!scene) throw new Error(`Unknown scene: ${id}`);

        const root = document.createElement('div');
        root.className = fullscreen ? 'yara-scene yara-scene-fullscreen' : 'yara-scene';
        const canvas = document.createElement('canvas');
        canvas.className = 'yara-scene-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        const caption = document.createElement('p');
        caption.className = 'yara-scene-caption';
        caption.setAttribute('aria-live', 'polite');
        const skip = document.createElement('button');
        skip.type = 'button';
        skip.className = 'yara-scene-skip';
        skip.textContent = language === 'en' ? 'Skip ›' : 'Pular ›';
        root.append(canvas, caption, skip);
        container.append(root);

        // A cena desenha em coordenadas lógicas; o canvas acompanha a resolução real da tela.
        const pixelWidth = root.clientWidth * (window.devicePixelRatio || 1);
        const scale = clamp(pixelWidth / scene.width, 1, MAX_RENDER_SCALE);
        canvas.width = Math.round(scene.width * scale);
        canvas.height = Math.round(scene.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        const frame = {
            ctx,
            scale,
            width: scene.width,
            height: scene.height,
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            state: scene.setup?.({ seededRandom, scale, width: scene.width, height: scene.height }) ?? {}
        };
        const audio = sound && frozenAt === null ? createAudio() : null;
        const cues = [...(scene.cues || [])].sort((a, b) => a.at - b.at);
        let cueIndex = 0;
        let time = 0;
        let lastNow = null;
        let frameId = null;
        let finished = false;
        let shownCaption = null;

        function renderCaption(t) {
            const active = scene.captions?.find((entry) => t >= entry.from && t < entry.to) || null;
            if (active === shownCaption) return;
            shownCaption = active;
            caption.classList.toggle('yara-scene-caption-visible', Boolean(active));
            if (active) caption.textContent = active.text[language] ?? active.text.pt;
        }

        function draw(t) {
            ctx.setTransform(scale, 0, 0, scale, 0, 0);
            scene.draw(frame, t);
            renderCaption(t);
        }

        function finish() {
            if (finished) return;
            finished = true;
            cancelAnimationFrame(frameId);
            window.removeEventListener('keydown', onKey);
            audio?.close();
            root.remove();
            onEnd?.();
        }

        function onKey(event) {
            if (event.key === 'Escape') finish();
        }

        function tick(now) {
            time += lastNow === null ? 0 : Math.min(MAX_FRAME_SECONDS, (now - lastNow) / 1000);
            lastNow = now;
            while (cueIndex < cues.length && cues[cueIndex].at <= time) {
                if (audio) cues[cueIndex].run(audio);
                cueIndex++;
            }
            if (time >= scene.duration) {
                finish();
                return;
            }
            draw(time);
            frameId = requestAnimationFrame(tick);
        }

        skip.addEventListener('click', finish);
        window.addEventListener('keydown', onKey);
        if (frozenAt !== null) draw(frozenAt);
        else frameId = requestAnimationFrame(tick);
        return { stop: finish };
    }

    return { register, play, clamp, ease, list: () => [...registry.values()] };
})();
