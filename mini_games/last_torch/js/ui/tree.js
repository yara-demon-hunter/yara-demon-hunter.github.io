import { TREE_BRANCHES, TREE_LAYOUT, TREE_NODES } from '../../data_model/tree.js';
import { RELIC_BRANCHES, RELIC_LAYOUT, RELIC_NODES } from '../../data_model/relics.js';
import { state } from '../core/state.js';
import { buyNode, getBlockText, getNextText, getNodeInfo, getNodeState } from '../systems/tree.js';

// --- ÁRVORES (tela) ---
// Uma fábrica monta cada árvore: skills (tela de status) e relíquias (acampamento). O mapa é montado uma
// vez: cada nó é um botão posicionado pela grade dos dados e as ligações são um SVG na mesma grade, então
// nada precisa ser medido. Depois só as classes mudam.
const el = (id) => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';

// cfg: nodes, branches, layout, mapId, prefix dos ids do painel de detalhe, requiredState (estado do jogo em que
// dá para comprar), buyLabel (função com o custo), emptyHint
function createTreeView(cfg) {
    const { nodes, branches, layout, prefix, requiredState } = cfg;
    const byId = Object.fromEntries(nodes.map(node => [node.id, node]));
    const map = el(cfg.mapId);
    const buttons = new Map();
    const lines = [];
    let selected = null;
    let built = false;
    const view = { onChange: null };

    const detail = (name) => el(`${prefix}${name}`);

    function nodePosition(node) {
        const { labelWidth, rows, branchGap } = layout;
        const branchIndex = Object.keys(branches).indexOf(node.branch);
        return { x: labelWidth + node.x + 0.5, y: branchIndex * (rows + branchGap) + node.y + 0.5 };
    }

    function build() {
        built = true;
        const { labelWidth, tiers, rows, branchGap } = layout;
        const branchKeys = Object.keys(branches);
        const width = labelWidth + tiers;
        const height = branchKeys.length * (rows + branchGap) - branchGap;
        map.style.setProperty('--w', width);
        map.style.setProperty('--h', height);
        map.style.setProperty('--label', labelWidth);

        branchKeys.forEach((key, i) => {
            const b = branches[key];
            const band = document.createElement('div');
            band.className = 'tree-band';
            band.style.setProperty('--tone', b.color);
            band.style.setProperty('--y', i * (rows + branchGap));
            band.style.setProperty('--rows', rows);
            band.innerHTML = '<span class="tree-band-icon"></span><span class="tree-band-name"></span>';
            band.querySelector('.tree-band-icon').textContent = b.icon;
            band.querySelector('.tree-band-name').textContent = b.name;
            map.appendChild(band);
        });

        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.classList.add('tree-lines');
        nodes.forEach(node => {
            const to = nodePosition(node);
            node.requires.forEach(id => {
                const from = nodePosition(byId[id]);
                const line = document.createElementNS(NS, 'line');
                line.setAttribute('x1', from.x);
                line.setAttribute('y1', from.y);
                line.setAttribute('x2', to.x);
                line.setAttribute('y2', to.y);
                line.style.setProperty('--tone', branches[node.branch].color);
                svg.appendChild(line);
                lines.push({ line, from: byId[id], to: node });
            });
        });
        map.appendChild(svg);

        nodes.forEach(node => {
            const pos = nodePosition(node);
            const info = getNodeInfo(node);
            const button = document.createElement('button');
            button.className = `tnode tnode-${node.kind}`;
            button.dataset.node = node.id;
            button.setAttribute('aria-label', info.name);
            button.style.setProperty('--x', pos.x);
            button.style.setProperty('--y', pos.y);
            button.style.setProperty('--tone', branches[node.branch].color);
            button.innerHTML = '<span class="tnode-icon"></span><i class="tnode-level"></i>';
            button.querySelector('.tnode-icon').textContent = info.icon;
            map.appendChild(button);
            buttons.set(node.id, button);
        });
    }

    const isSingle = (node) => node.kind === 'passive' || node.kind === 'relic';

    function levelText(node, st) {
        if (node.kind === 'evolve') return st.maxed ? 'EVOLVED' : 'EVOLUTION';
        if (node.kind === 'relic') return st.maxed ? 'OWNED' : 'RELIC';
        if (node.kind === 'passive') return st.maxed ? 'LEARNED' : 'PASSIVE SKILL';
        return `Lv. ${st.level}/${st.max}`;
    }

    function renderDetail() {
        const node = selected ? byId[selected] : null;
        const buy = detail('Buy');
        if (!node) {
            detail('Icon').textContent = cfg.emptyIcon;
            detail('Name').textContent = cfg.emptyTitle;
            detail('Level').textContent = '';
            detail('Desc').textContent = cfg.emptyHint;
            detail('Next').textContent = '';
            detail('Note').textContent = '';
            buy.classList.add('hidden');
            return;
        }
        const st = getNodeState(node);
        const info = getNodeInfo(node);
        const next = st.maxed ? '' : getNextText(node);
        detail('Icon').textContent = info.icon;
        detail('Name').textContent = info.name;
        detail('Level').textContent = levelText(node, st);
        detail('Desc').textContent = info.desc;
        detail('Next').textContent = next ? `Next: ${next}` : '';
        detail('Note').textContent = st.maxed ? '✔ Complete' : getBlockText(node, st);
        buy.classList.toggle('hidden', st.maxed);
        buy.disabled = !st.canBuy;
        const symbol = st.currency === 'gold' ? '🪙' : '⚡';
        const verb = st.currency === 'gold' ? 'BUY' : 'LEARN';
        buy.textContent = st.open ? `${verb}  ${symbol} ${st.cost}` : 'LOCKED';
        buy.classList.toggle('is-short', st.open && !st.canBuy);
    }

    // Atualiza o visual de cada nó e das ligações
    view.render = function render() {
        if (!built) build();
        nodes.forEach(node => {
            const st = getNodeState(node);
            const button = buttons.get(node.id);
            button.classList.toggle('is-owned', st.level > 0 && !st.maxed);
            button.classList.toggle('is-maxed', st.maxed);
            button.classList.toggle('is-ready', st.canBuy);
            button.classList.toggle('is-open', st.open && !st.canBuy);
            button.classList.toggle('is-locked', !st.unlocked);
            button.classList.toggle('is-selected', node.id === selected);
            button.querySelector('.tnode-level').textContent = st.unlocked && node.kind !== 'evolve' && !isSingle(node) ? `${st.level}/${st.max}` : '';
        });
        lines.forEach(({ line, from, to }) => {
            const fromState = getNodeState(from);
            const toState = getNodeState(to);
            line.classList.toggle('is-lit', fromState.level > 0);
            line.classList.toggle('is-owned', fromState.level > 0 && toState.level > 0);
        });
        renderDetail();
    };

    view.select = function select(id) {
        selected = id;
        view.render();
        buttons.get(id)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };

    // Ao abrir: já mostra o primeiro nó que dá para comprar, se houver
    view.open = function open() {
        if (!built) build();
        const ready = nodes.find(node => getNodeState(node).canBuy);
        const keep = selected && getNodeState(byId[selected]).canBuy;
        selected = keep ? selected : ready?.id ?? selected;
        view.render();
        if (selected) buttons.get(selected)?.scrollIntoView({ block: 'center', inline: 'center' });
    };

    view.buySelected = function buySelected() {
        if (!selected || state.gameState !== requiredState) return false;
        const bought = buyNode(selected);
        view.render();
        view.onChange?.();
        return bought;
    };

    view.setup = function setup() {
        map.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-node]');
            if (button) view.select(button.dataset.node);
        });
        detail('Buy').addEventListener('click', view.buySelected);
    };

    return view;
}

// Skills: pontos, tela de status
export const skillTree = createTreeView({
    nodes: TREE_NODES, branches: TREE_BRANCHES, layout: TREE_LAYOUT,
    mapId: 'treeMap', prefix: 'td', requiredState: 'PAUSED',
    emptyIcon: '🌳', emptyTitle: 'Skill tree',
    emptyHint: 'Tap a node to see what it does. Glowing nodes can be learned now.'
});

// Relíquias: ouro, acampamento
export const relicTree = createTreeView({
    nodes: RELIC_NODES, branches: RELIC_BRANCHES, layout: RELIC_LAYOUT,
    mapId: 'relicMap', prefix: 'rd', requiredState: 'CAMP',
    emptyIcon: '🏺', emptyTitle: 'Relic tree',
    emptyHint: 'Tap a relic to read it. Gold buys relics, and each one opens the next.'
});
