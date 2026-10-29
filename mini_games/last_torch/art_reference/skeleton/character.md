# Monstro: Esqueleto

- **id no jogo:** skeleton (`MONSTER_MODELS.SKELETON`)
- **Papel:** monstro normal, o mais comum. Liberado desde o turno 1, velocidade média, corre para o herói quando ele está perto e, se não, para a tocha.
- **Substitui:** o antigo SPIRIT (círculo vermelho), com o mesmo balanceamento.

## Aparência

- **Silhueta / forma geral:** morto-vivo magro, curvado para a frente, com os dois braços esticados à frente como quem tenta agarrar. Vista de cima, a leitura é: crânio na frente, ombros largos e ossudos, caixa torácica aberta mostrando a coluna, bacia estreita e pés aparecendo a cada passo.
- **Cabeça e rosto:** crânio rachado, um pouco grande para o corpo (estilo caricato e legível). Duas órbitas fundas e escuras com uma **chama verde fantasma** no fundo de cada uma. Mandíbula solta que bate (chacoalha) enquanto anda. Uma rachadura em zigue-zague no topo do crânio.
- **Tronco:** coluna de vértebras do pescoço até a bacia; 4 pares de costelas curvas saindo da coluna; clavículas cruzando os ombros. **Dentro da caixa torácica flutua a alma**: uma chama verde que pulsa, visível entre as costelas.
- **Braços:** úmero, cotovelo saliente e antebraço; mãos ossudas com 3 dedos em garra, abertas para a frente.
- **Pernas:** fêmur e canela finos, joelhos com nó, pés ossudos e compridos. Andam alternados, de forma dura e travada.
- **Vestuário:** trapo de pano marrom podre preso à bacia, com 3 tiras rasgadas arrastando para trás. Nada mais: os ossos são o destaque.
- **Partes que se movem separadamente:** crânio (balança e dá trancos de lado), mandíbula (chacoalha), braços (balançam duros, alternados com as pernas), pernas/pés (passada), tiras do trapo (tremulam), chama da alma e dos olhos (pulsam).
- **Tamanho relativo:** um pouco maior que o morcego (com asas), parecido com a bruxa. Raio de colisão 14 (igual ao antigo SPIRIT).
- **Detalhes que NÃO podem faltar:** olhos verdes brilhando nas órbitas, chama verde dentro das costelas, braços esticados à frente, mandíbula batendo, rachadura no crânio.
- **Detalhes que podem ser simplificados:** dedos dos pés, vértebras pequenas, ossos do pulso, dentes individuais (bastam 2 ou 3 riscos).

## Cores

- **Osso:** #e3dcc6, sombra #a89f86, contorno e rachaduras #5c5444
- **Órbitas e boca:** #120f0a
- **Alma e olhos:** chama #86efac, núcleo #f0fdf4, brilho rgba(74, 222, 128, 0.55)
- **Aura:** #22c55e (fraca, só para destacar no escuro)
- **Trapo:** #3b2f25, borda #57463a
- **Cor do monstro no jogo (barra de vida e partículas):** #d9d2bc

## Personalidade e estilo

Dark fantasy com um toque caricato. Persistente e desajeitado: anda duro e travado, cambaleia de um lado para o outro, dá trancos repentinos com a cabeça e chacoalha a mandíbula como se estivesse rindo. Não é rápido nem inteligente, mas nunca para de vir. Contrasta com o herói (azul neon) pelo verde doentio da alma.

## Animações

| Animação | Quando acontece | O que se move | Duração / ritmo | Imagens (a adicionar) |
|---|---|---|---|---|
| andar | sempre | pernas alternadas com passada dura; braços balançam ao contrário das pernas, sempre esticados à frente; corpo cambaleia de um lado para o outro; tiras do trapo arrastam | ~1,8 passos por segundo (acelera com a velocidade) | images/skeleton-walk-1.png, images/skeleton-walk-2.png |
| mandíbula | sempre | mandíbula abre e fecha (chacoalha) | ~6 batidas por segundo | — |
| tranco de cabeça | de vez em quando (alguns segundos entre um e outro) | crânio vira rápido para um lado e volta | ~0,3s | — |
| alma pulsando | sempre | chama nas costelas e nos olhos aumenta e diminui | ~1,2 pulsos por segundo | — |
| levar dano | ao perder vida | todos os ossos tremem desencontrados (chacoalhar) e ficam brancos por um instante | ~0,25s | images/skeleton-hurt.png |
| morrer | ao zerar a vida | explosão de partículas cor de osso (efeito já existente do jogo). Futuro: desmontar em uma pilha de ossos que some | ~0,5s | images/skeleton-death.png |

## Imagens sugeridas (ainda não adicionadas)

Coloque em `images/` quando tiver:

- `skeleton-top.png`: visão principal, de cima (como aparece no jogo)
- `skeleton-3-4.png`: (opcional) vista 3/4 para entender o volume do crânio e das costelas
- `skeleton-walk-1.png` / `skeleton-walk-2.png`: as duas poses-chave da passada
- `skeleton-hurt.png`, `skeleton-death.png`: poses de dano e morte
- (futuro) `skeleton-rise.png`: surgir da terra. Hoje os monstros nascem fora da tela, então essa animação não apareceria; só vale se eles passarem a nascer dentro da arena.
- `inspiration-*.png`: referências de estilo

## Implementação

- **Dados visuais:** `data_model/visuals/monsters/skeleton_visual.js` (`SKELETON_VISUALS`)
- **Desenho:** `js/render/skeleton.js` (`renderSkeleton`)
- **Balanceamento:** `data_model/monsters.js` (`MONSTER_MODELS.SKELETON`) e `data_model/difficulty.js` (`monsterUnlockTurn.SKELETON`)
- Coordenadas locais do desenho: +x é a frente do esqueleto, +y é o lado direito; medidas em múltiplos do raio.
