import { TREE_BRANCHES, TREE_LAYOUT, TREE_NODES } from '../../data_model/tree.js';
import { RELIC_BRANCHES, RELIC_LAYOUT, RELIC_NODES } from '../../data_model/relics.js';
import { state } from '../core/state.js';
import { buyNode, getNextText, getNodeInfo, getNodeState } from '../systems/tree.js';

// --- ÁRVORES (tela) ---
// Uma fábrica monta cada árvore: skills (tela de status) e relíquias (acampamento). O mapa é montado uma
// vez: cada ramo é um bloco com a própria grade, onde cada nó é um botão posicionado pelos dados e as ligações
// são um SVG, então nada precisa ser medido. Depois só as classes mudam. Como os blocos são independentes, o
// CSS decide como eles aparecem (um por vez, em abas, ou todos à vista) e calcula o tamanho da célula.
const el = (id) => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';

// cfg: nodes, branches, layout, mapId, railId (abas de ramo; opcional), prefix dos ids do painel de detalhe,
// requiredState (estado do jogo em que dá para comprar), buyLabel (função com o custo), emptyHint
function createTreeView(cfg) {
    const { nodes, branches, layout, prefix, requiredState } = cfg;
    const byId = Object.fromEntries(nodes.map(node => [node.id, node]));
    const map = el(cfg.mapId);
    const rail = cfg.railId ? el(cfg.railId) : null;
    const buttons = new Map();
    const blocks = new Map();
    const tabs = new Map();
    const lines = [];
    let selected = null;
    let activeBranch = Object.keys(branches)[0];
    let built = false;
    const view = { onChange: null };

    const detail = (name) => el(`${prefix}${name}`);

    const branchNodes = (key) => nodes.filter(node => node.branch === key);
    const branchRows = (key) => Math.max(...branchNodes(key).map(node => node.y)) + 1;
    const nodePosition = (node) => ({ x: node.x + 0.5, y: node.y + 0.5 });

    function buildBranch(key) {
        const b = branches[key];
        const { tiers } = layout;
        const rows = branchRows(key);
        const block = document.createElement('div');
        block.className = 'tree-branch';
        block.style.setProperty('--tone', b.color);
        block.style.setProperty('--branch-rows', rows);
        block.innerHTML = '<div class="tree-band"><span class="tree-band-icon"></span><span class="tree-band-name"></span></div><div class="tree-grid"></div>';
        block.querySelector('.tree-band-icon').textContent = b.icon;
        block.querySelector('.tree-band-name').textContent = b.name;
        const grid = block.querySelector('.tree-grid');

        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('viewBox', `0 0 ${tiers} ${rows}`);
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.classList.add('tree-lines');
        branchNodes(key).forEach(node => {
            const to = nodePosition(node);
            node.requires.forEach(({ id, lvl }) => {
                const parent = byId[id];
                if (!parent) return;
                const from = nodePosition(parent);
                const line = document.createElementNS(NS, 'line');
                line.setAttribute('x1', from.x);
                line.setAttribute('y1', from.y);
                line.setAttribute('x2', to.x);
                line.setAttribute('y2', to.y);
                svg.appendChild(line);
                lines.push({ line, from: parent, to: node, need: lvl });
            });
        });
        grid.appendChild(svg);

        branchNodes(key).forEach(node => {
            const pos = nodePosition(node);
            const info = getNodeInfo(node);
            const button = document.createElement('button');
            button.className = `tnode tnode-${node.kind}`;
            button.dataset.node = node.id;
            button.setAttribute('aria-label', info.name);
            button.style.setProperty('--x', pos.x);
            button.style.setProperty('--y', pos.y);
            button.innerHTML = '<span class="tnode-icon"></span><i class="tnode-level"></i>';
            button.querySelector('.tnode-icon').textContent = info.icon;
            grid.appendChild(button);
            buttons.set(node.id, button);
        });
        map.appendChild(block);
        blocks.set(key, block);
    }

    function buildTab(key) {
        const b = branches[key];
        const tab = document.createElement('button');
        tab.className = 'tree-tab';
        tab.dataset.branch = key;
        tab.style.setProperty('--tone', b.color);
        tab.innerHTML = '<span class="tree-band-icon"></span><span class="tree-band-name"></span><i></i>';
        tab.querySelector('.tree-band-icon').textContent = b.icon;
        tab.querySelector('.tree-band-name').textContent = b.name;
        rail.appendChild(tab);
        tabs.set(key, tab);
    }

    function build() {
        built = true;
        const { labelWidth, tiers, branchGap } = layout;
        const branchKeys = Object.keys(branches);
        const rows = branchKeys.map(branchRows);
        map.style.setProperty('--label', labelWidth);
        map.style.setProperty('--tiers', tiers);
        map.style.setProperty('--gap', branchGap);
        map.style.setProperty('--w', labelWidth + tiers);
        map.style.setProperty('--rows', Math.max(...rows));
        map.style.setProperty('--h', rows.reduce((sum, n) => sum + n, 0) + (branchKeys.length - 1) * branchGap);
        branchKeys.forEach(buildBranch);
        if (rail) branchKeys.forEach(buildTab);
    }

    const isSingle = (node) => node.kind === 'passive' || node.kind === 'relic';

    function levelText(node, st) {
        if (node.kind === 'evolve') return st.maxed ? 'EVOLVED' : 'EVOLUTION';
        if (node.kind === 'relic') return st.maxed ? 'OWNED' : 'RELIC';
        if (node.kind === 'passive') return st.maxed ? 'LEARNED' : 'PASSIVE SKILL';
        return `Lv. ${st.level}/${st.max}`;
    }

    // Lista do que falta (e do que já foi cumprido), uma linha por pedido. Vazia se tudo está cumprido.
    function renderNote(st) {
        const note = detail('Note');
        note.replaceChildren();
        const add = (met, text) => {
            const line = document.createElement('span');
            line.classList.toggle('is-met', met);
            line.textContent = `${met ? '✔' : '✖'} ${text}`;
            note.appendChild(line);
        };
        if (st.maxed) add(true, 'Complete');
        else if (!st.reached) st.checks.forEach(c => add(c.met, `${c.label}${c.showCount && !c.met ? ` (${c.have}/${c.need})` : ''}`));
    }

    function renderDetail() {
        const node = selected ? byId[selected] : null;
        const buy = detail('Buy');
        if (!node) {
            detail('Icon').textContent = cfg.emptyIcon;
            detail('Name').textContent = cfg.emptyTitle;
            detail('Level').textContent = '';
            detail('Desc').textContent = cfg.emptyHint;
            if (detail('Branch')) detail('Branch').textContent = '';
            detail('Next').textContent = '';
            detail('Note').replaceChildren();
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
        if (detail('Branch')) detail('Branch').textContent = branches[node.branch].style;
        detail('Next').textContent = next ? `Next: ${next}` : '';
        renderNote(st);
        buy.classList.toggle('hidden', st.maxed);
        buy.disabled = !st.canBuy;
        const symbol = st.currency === 'gold' ? '🪙' : '⚡';
        const verb = st.currency === 'gold' ? 'BUY' : 'LEARN';
        // Bloqueado também mostra o custo, para dar para planejar
        buy.textContent = `${st.open ? verb : 'LOCKED'}  ${symbol} ${st.cost}`;
        buy.classList.toggle('is-short', st.open && !st.canBuy);
    }

    function renderBranches() {
        blocks.forEach((block, key) => block.classList.toggle('is-active', key === activeBranch));
        tabs.forEach((tab, key) => {
            const ready = branchNodes(key).filter(node => getNodeState(node).canBuy).length;
            tab.classList.toggle('is-on', key === activeBranch);
            tab.querySelector('i').textContent = ready || '';
        });
    }

    // Atualiza o visual de cada nó e das ligações
    view.render = function render() {
        if (!built) build();
        renderBranches();
        nodes.forEach(node => {
            const st = getNodeState(node);
            const button = buttons.get(node.id);
            button.classList.toggle('is-owned', st.level > 0 && !st.maxed);
            button.classList.toggle('is-maxed', st.maxed);
            button.classList.toggle('is-ready', st.canBuy);
            button.classList.toggle('is-open', st.open && !st.canBuy);
            button.classList.toggle('is-selected', node.id === selected);
            // Corrente: só quando falta um pré-requisito ou kills (não quando falta só ponto)
            button.classList.toggle('is-chained', !st.reached && !st.maxed);
            button.querySelector('.tnode-level').textContent = node.kind !== 'evolve' && !isSingle(node) ? `${st.level}/${st.max}` : '';
        });
        lines.forEach(({ line, from, to, need }) => {
            const fromLevel = getNodeState(from).level;
            line.classList.toggle('is-lit', fromLevel >= need);
            line.classList.toggle('is-owned', fromLevel >= need && getNodeState(to).level > 0);
        });
        renderDetail();
    };

    view.select = function select(id) {
        selected = id;
        activeBranch = byId[id].branch;
        view.render();
    };

    // Trocar de ramo já mostra algo dele no detalhe: o que dá para comprar ou, senão, a raiz
    function showBranch(key) {
        if (key === activeBranch) return;
        const members = branchNodes(key);
        view.select((members.find(node => getNodeState(node).canBuy) ?? members[0]).id);
    }

    // Ao abrir: já mostra o primeiro nó que dá para comprar, se houver
    view.open = function open() {
        if (!built) build();
        const ready = nodes.find(node => getNodeState(node).canBuy);
        const keep = selected && getNodeState(byId[selected]).canBuy;
        selected = keep ? selected : ready?.id ?? selected;
        if (selected) activeBranch = byId[selected].branch;
        view.render();
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
        rail?.addEventListener('click', (e) => {
            const tab = e.target.closest('button[data-branch]');
            if (tab) showBranch(tab.dataset.branch);
        });
        detail('Buy').addEventListener('click', view.buySelected);
    };

    return view;
}

// Skills: pontos, tela de status
export const skillTree = createTreeView({
    nodes: TREE_NODES, branches: TREE_BRANCHES, layout: TREE_LAYOUT,
    mapId: 'treeMap', railId: 'treeRail', prefix: 'td', requiredState: 'PAUSED',
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
