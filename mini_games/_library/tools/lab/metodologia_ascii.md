# Metodologia: jogos em ASCII (estilo, não realismo)

**Status:** primeiro teste feito em 25/11/2026 em [ascii_foto.html](ascii_foto.html) (Espectro Encapuzado, `ascii_foto.js`). Nasceu em 25/11/2026 ao separar o ASCII de [metodologia_fotorrealismo.md](metodologia_fotorrealismo.md)
(técnica 18 de lá): ele não deixa nada mais real, ele dá **outro estilo visual**. Por isso tem metodologia própria, com as técnicas que combinam com ele.
Fica só neste laboratório (`_library/tools/lab/`), isolado dos jogos. 

## O que é

*ASCII 3D rendering* ou *ASCII post-processing shader*: a cena é desenhada normalmente (3D ou 2D) e a tela é dividida em **células**. Cada célula vira
um caractere, escolhido pela luminância (rampa tipo ` .:-=+*#%@`, do mais vazio ao mais denso). Variante: *3D ASCII raymarching/raycasting*, em que
os raios já devolvem o caractere, sem desenhar a imagem antes.

Para que serve no projeto (nada disso é o visual normal dos jogos):

- tela de morte ou de "memória" do herói;
- visão do Zeph Falso, ligada à história do livro (o que ele ainda não recorda aparece "quebrado" em caracteres);
- efeito de dano, portal ou corrupção (a imagem vira texto por um instante);
- modo especial desbloqueável, tipo "terminal".

## As técnicas (A1 a A12)

Legenda de custo: **baixo** = barato em celular fraco; **médio** = precisa de cuidado; **alto** = só em GPU boa.

| # | Técnica | O que faz | Custo | Combina com |
|---|---|---|---|---|
| A1 | **Rampa de luminância** | Luminância da célula escolhe o caractere. Medir a densidade real de cada glifo da fonte (pixels acesos) e ordenar por isso, em vez de confiar na ordem de um texto pronto. | baixo | tudo |
| A2 | **Célula na proporção da fonte** | Caracteres são ~1:2 (mais altos que largos). Células quadradas deformam a imagem; use células 1:2 ou compense a proporção. | baixo | A1 |
| A3 | **Tamanho da célula por distância (LOD)** | De perto, células pequenas (mais detalhe). De longe, células maiores e rampa mais curta (` .:#`). O LOD da fotorrealismo vira "resolução de texto". | baixo | LOD, névoa |
| A4 | **Bordas por Sobel** | Detecta o contorno na imagem e usa caracteres direcionais (`/ \ \| - _`) nas bordas. Segura a silhueta, que é o que mais some no ASCII. | médio | luz de borda, silhueta |
| A5 | **Dithering (Bayer)** | Soma um padrão de limiar antes de escolher o caractere. Gradientes ficam suaves em vez de faixas. | baixo | A1 |
| A6 | **Profundidade vira caractere** | Usa o buffer de profundidade: o que está longe esvazia para `.` e `,`; perto usa glifos densos. É a perspectiva aérea do ASCII. | baixo | névoa, perspectiva aérea |
| A7 | **Glifos por material** | Com um buffer de ID de material, cada coisa tem seu conjunto de caracteres: osso `o0O`, metal `#%@`, fogo `^*"`, água `~=`. Dá leitura sem cor. | médio | PBR (os mapas já separam materiais) |
| A8 | **Cor controlada** | Três modos: monocromático (verde sobre preto), paleta curta (4 a 8 cores, posterizada) e cor da célula mantida no caractere. Menos cor lê melhor. | baixo | gradação de cor |
| A9 | **Brilho e bloom de texto** | Células muito claras ganham halo (sombra do texto, ou o mesmo bloom da cena aplicado antes). Olhos, alma e runas continuam acesos. | médio | bloom, tone mapping |
| A10 | **Tone mapping e contraste antes da rampa** | Aplicar ACES e um ajuste de contraste local antes de converter. Sem isso, cenas escuras viram um mar de espaços. | baixo | ACES, gradação |
| A11 | **Atlas de glifos (desempenho)** | Desenhar cada caractere uma vez num atlas e copiar pedaços (`drawImage` no Canvas 2D, ou textura no shader). `fillText` por célula a cada quadro é lento. | baixo | os jogos Canvas 2D |
| A12 | **Animação do texto** | Piscar de glifos, rastro vertical tipo "chuva de código" na morte, tremor de linha (CRT), troca de caractere por ruído temporal. | baixo | estilo |

## Como combinar (receitas)

1. **ASCII de longe, imagem de perto.** Perto do herói: render normal. Conforme a distância cresce, a mistura vai para ASCII (A3 + A6). Parece que o mundo "se desfaz em texto" no horizonte.
2. **Visão do Zeph Falso.** A1 + A8 (monocromático) + A4 (bordas) + A12 (glifos trocando por ruído). Rostos conhecidos ficam nítidos, o resto vira texto instável.
3. **Tela de morte.** Imagem congelada → A5 + A8 → "chuva" de caracteres escorrendo (A12). Barato: roda em Canvas 2D com A11.
4. **Modo terminal.** Tudo em ASCII o tempo todo, com A7 (glifos por material) para o jogador ainda distinguir monstro, chão e item.

## Como aplicar ao Canvas 2D (os jogos de hoje)

Os jogos são Canvas 2D, sem shader. O caminho barato:

1. desenhar o quadro normal num canvas fora da tela;
2. reduzir para uma grade pequena (uma célula = um pixel), por exemplo 160x60;
3. ler os pixels (`getImageData`) e calcular a luminância;
4. escolher o glifo (A1, com A5 se quiser) e copiar do atlas (A11) para o canvas visível.

Custo a medir antes de adotar: o `getImageData` por quadro é a parte cara. Alternativa: atualizar o ASCII a 15 ou 20 quadros por segundo, só em telas
paradas (morte, memória), nunca durante a ação.

## O que medir quando testar

- tempo por quadro (ms) em celular fraco, com o atlas de glifos e sem ele;
- legibilidade: dá para distinguir herói, monstro e chão só pelos caracteres? (A4 e A7 existem para isso);
- se a silhueta do personagem sobrevive de longe com células grandes;
- tamanho mínimo de célula que ainda lê bem no celular em pé.

## Limites e cuidados

- É **estilo**: não substitui as técnicas de fotorrealismo, vem por cima delas (usa a imagem final como entrada).
- Cena escura demais vira texto vazio; a ordem certa é tone mapping (A10) e só depois a rampa.
- Texto muito miúdo no celular não lê; célula mínima de 6 a 8 px de largura.
- Ordem sugerida de adoção: A1, A2, A11 (base e desempenho), depois A4 e A6 (leitura), depois A8, A9, A12.

## O que o teste mostrou (25/11/2026)

`ascii_foto.js` implementa A1 a A12 com o caminho Canvas 2D: a cena 3D vai para três alvos minúsculos (cor, profundidade empacotada, id de material),
o JS lê os pixels, converte e copia glifos de um atlas por cor para um canvas. A2 sai de graça: a grade tem 1 pixel por célula e a célula tem 1:2.

- Grade de 213 x 60 células (célula 6x12 px) em 1280x720. Quadro medido em WebGL **por software** (SwiftShader): 100 a 230 ms, número que não vale para GPU real nem
  celular; falta medir lá. A conversão em si (JS + atlas) é barata; o peso medido vem da renderização por software e das leituras de pixels (3 por quadro).
- A1 funcionou: a rampa medida (`` `-,~^!*<lL1I3XE``) escolhe glifos por densidade real da fonte. Não foi comparada a olho com a rampa pronta com calma.
- A4 (bordas) e A7 (glifos por material) foram o que mais ajudou a leitura: o cajado vira `=#%`, os cristais `<>/\`, as runas amarelas, e a silhueta do manto aparece.
- A3: de longe a célula cresce e a figura vira poucas linhas e pontos; a 40 m ainda dá para ver capuz, orbe e cristais.
- A12 (chuva e dissolução) lê bem como efeito de morte.
- Fraquezas: o manto, que é cor uniforme, fica pouco distinto no meio da imagem (pouco contraste entre rampa e fundo); cenas mais escuras pedem mais exposição.
- Não testado: celular, ASCII só em telas paradas com `getImageData` de um jogo Canvas 2D real, e as técnicas de raymarching direto.
