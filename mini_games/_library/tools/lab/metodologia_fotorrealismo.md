# Metodologia: jogos procedurais fotorrealistas

**Status:** em teste. Ainda **não** é o método do projeto. O teste vive só neste laboratório (`_library/tools/lab/`), isolado dos jogos
(o sync não copia `tools/`). Exemplo funcionando: [monstro_foto.html](monstro_foto.html). Como abrir: [README.md](README.md).

O texto abaixo é a referência original (colada em 17/11/2026), guardada sem alterações. Depois dele vêm o mapa de como o teste aplica cada
técnica e o que não coube.

---

## Como Deixar Jogos Procedurais Fotorrealistas: 7 Técnicas Combinadas

O desenho/geração procedural por si só cria apenas a estrutura matemática (a forma bruta e a distribuição). O segredo do fotorrealismo nos jogos modernos é usar o procedural como esqueleto e empilhar camadas de renderização física, iluminação e micro-detalhes por cima.

Você pode combinar 7 técnicas principais em um único pipeline:

### 1. Materiais PBR (Physically Based Rendering) + Ruído Procedural

Em vez de pintar objetos com uma cor sólida ou textura simples, o PBR simula como a luz interage fisicamente com cada superfície usando múltiplos mapas gerados proceduralmente (via Perlin/Simplex/Voronoi Noise):

- **Albedo (Cor Base):** Sem sombras pintadas, apenas a cor pura do material.
- **Roughness (Rugosidade):** Define onde a superfície é espelhada (molhada/polida) ou fosca (terra/pedra seca). Variar a rugosidade com ruído procedural elimina o aspecto "de plástico".
- **Normal Map & Height/Parallax:** Cria micro-relevos (poros da pedra, veios da madeira, rachaduras) sem precisar adicionar mais polígonos.
- **Metallic (Metalicidade):** Separa o que é metal puro (ferro, ouro) do que é dielétrico (madeira, pele, tecido).

### 2. Triplanar Mapping & Texture Splatting (Adeus Esticamento)

Um dos maiores problemas de terrenos e rochas procedurais é a textura ficar esticada em penhascos íngremes.

- **Triplanar Mapping:** Projeta texturas dos eixos X, Y e Z simultaneamente com base na inclinação da superfície.
- **Height-Based Blending:** Mistura materiais pela altura e inclinação — por exemplo, coloca grama no topo plano, rocha nas encostas íngremes e lama/areia perto da água automaticamente.

### 3. Iluminação Global Dinâmica (GI) e Ambient Occlusion (SSAO / GTAO)

Mesmo um modelo simples parece real quando a luz rebate corretamente no ambiente:

- **Global Illumination (GI):** Simula a luz que bate no chão colorido e ilumina suavemente a parede próxima (como o Lumen na Unreal 5 ou Voxel/Probe GI).
- **Ambient Occlusion (SSAO / HBAO+):** Escurece automaticamente os cantos, frestas entre pedras, embaixo de móveis e dobras de roupas onde a luz ambiente tem dificuldade de entrar.

### 4. Instancing Procedural de Micro-Detalhes (Foliage & Scattering)

O mundo real nunca é "limpo" ou uniforme. Use algoritmos como Poisson Disk Sampling para espalhar milhares de pequenos objetos com variação aleatória de escala, rotação e cor:

- Pedrinhas, galhos caídos, tufos de grama, musgo e folhas secas.
- **Subsurface Scattering (SSS):** Faz a luz atravessar materiais translúcidos como folhas de árvores, orelhas, pele e cera, dando aquele brilho orgânico vivo.

### 5. 3D Gaussian Splatting Híbrido (Cenários Escaneados + Assets Procedurais)

Você pode misturar fotogrametria / Gaussian Splatting com objetos procedurais:

- Use Gaussian Splatting para o fundo distante, montanhas ou vegetação ultra-densa capturada do mundo real.
- Use Malhas PBR Procedurais no primeiro plano onde o jogador interage, colide e projeta sombras dinâmicas.

### 6. Shaders Atmosféricos e Volumétricos

O ar entre a câmera e o objeto muda completamente a percepção de escala e realismo:

- **Volumetric Fog & God Rays:** Neblina que reage aos feixes de luz do sol passando entre árvores ou janelas.
- **Atmospheric Scattering:** Simula fisicamente a cor do céu e a névoa azulada nas montanhas distantes (perspectiva aérea).
- **Screen-Space Reflections (SSR) / Planar Reflections:** Reflexos reais em poças d'água, rios e pisos molhados.

### 7. Pós-Processamento Cinematográfico (O Toque Final)

A câmera real tem imperfeições ópticas que nosso cérebro associa imediatamente ao realismo:

- **ACES Filmic Tone Mapping:** Converte luzes muito brilhantes (HDR) para a tela sem estourar as cores, mantendo contraste cinematográfico.
- **Bloom Sutil:** Halo luminoso natural ao redor de tochas, janelas e reflexos solares.
- **Color Grading (LUTs), Depth of Field (Desfoque de Fundo) e Anti-Aliasing Temporal (TAA/DLSS):** Suaviza serrilhados e integra todos os elementos na mesma paleta visual.

### Resumo: A Receita Ideal para seu Jogo

Geometria Procedural (forma base) + PBR com Ruído (textura física) + Ambient Occlusion & GI (sombras de contato) + Volumetric Fog & ACES Tone Mapping (atmosfera de cinema).

---

## Como o teste aplica cada técnica

O exemplo é o **Golem de Brasa e Musgo** ([monstro_foto.html](monstro_foto.html), código em `monstro_foto.js`): um monstro novo, todo gerado por
código (nenhuma imagem, nenhum modelo 3D baixado), renderizado em WebGL com Three.js. Cada técnica tem uma caixa para ligar e desligar na página, para
ver o que ela sozinha acrescenta.

Legenda: **feito** = implementado como na técnica; **aproximado** = o efeito é imitado por um atalho; **fora** = não coube neste teste.

| # | Técnica | No teste | Onde |
|---|---|---|---|
| 1 | PBR + ruído procedural | **feito.** Albedo, rugosidade, normal map, altura e emissivo gerados por ruído Simplex (tileável) e Voronoi (rachaduras). Metalicidade 0 na pedra e no musgo (dielétricos); o núcleo é um cristal translúcido. | `construirTexturas` |
| 2 | Triplanar + mistura por altura/inclinação | **feito.** Shader próprio (`onBeforeCompile`) projeta as texturas pelos 3 eixos, sem esticar; o musgo cresce nas faces viradas para cima e a lava nas rachaduras. | `aplicarTriplanar` |
| 3 | GI e Ambient Occlusion | AO **feito** (GTAO em tela cheia). GI **aproximado**: luz de céu e de chão (hemisfério), mapa de ambiente e uma luz laranja que sai do núcleo e tinge o entorno. Não é GI de verdade (sem Lumen nem sondas). | `GTAOPass`, `luzes` |
| 4 | Instancing procedural + SSS | Espalhamento **feito** (Poisson Disk em 2D → `InstancedMesh` de pedrinhas, folhas secas e lâminas de grama, com escala, giro e cor aleatórios). SSS **aproximado**: luz de contraluz somada à cor do musgo e da grama, sem a física do espalhamento. | `poisson`, `espalhar` |
| 5 | Gaussian Splatting híbrido | **fora.** Precisa de uma captura escaneada de verdade. O fundo é feito de camadas de montanhas e árvores em silhueta com névoa, só para dar profundidade. | `fundo` |
| 6 | Atmosfera e volumétricos | Névoa exponencial **feita**; feixes de luz (god rays) **aproximados** com cones aditivos animados e poeira flutuando; perspectiva aérea pela névoa azulada. Reflexos em tela (SSR) **fora**. | `atmosfera` |
| 7 | Pós-processamento | **feito:** tone mapping ACES, bloom, profundidade de campo (Bokeh), FXAA (no lugar do TAA), granulação, vinheta e gradação de cor. | `compositor` |

### O que aprendi com o teste

Imagens de comparação em `exemplos/`: `golem_tudo_desligado.png` (só a forma, luz simples), `golem_so_pbr.png` e `golem_tudo_ligado.png`.

- Custo: só medi em WebGL por software (SwiftShader, ~10 fps a 1280x720), que não diz nada sobre GPU real nem celular. Os passes mais caros são AO, bloom e profundidade de campo; não medi em hardware de verdade.
- O que mais mudou a cara do monstro: a textura PBR com rachaduras e o musgo por inclinação (a forma "de massinha" virou pedra), junto com a luz do núcleo, a névoa e o contraluz. Sem essas camadas, a mesma malha parece argila.
- O que não valeu o custo (a confirmar em GPU real): profundidade de campo e FXAA/granulação, efeito sutil perto do preço.
- Dá para levar para os jogos 2D? Não direto: os jogos são Canvas 2D. O caminho realista é usar o laboratório para gerar imagens/sprites de referência, e imitar no 2D só o que é barato (sombra de contato, brilho do núcleo, gradação de cor).

### Personagens de longe: LOD, mipmap e perspectiva aérea

**Origem (estudo de 25/11/2026):** a técnica que usa **ASCII 3D** em jogos se chama *ASCII 3D rendering* ou *ASCII post-processing shader*
(*3D ASCII raymarching/raycasting* quando a cena é traçada por raios). A técnica de reduzir detalhe conforme o objeto se afasta é o **LOD**
(Level of Detail). Quando cor e textura se misturam pela distância, entram também o **mipmapping** e a **perspectiva aérea / fog**.

**Ideia central:** de longe, o olho não quer mais detalhe, quer **leitura**: silhueta clara, contraste certo e cor atmosférica. Detalhe
fino demais de longe vira ruído (cintilação) e parece *menos* real. A lista abaixo é o que dá para somar ao Golem e aos monstros 2D.

| # | Técnica | O que faz de longe | Custo | Serve no 2D? |
|---|---|---|---|---|
| 8 | **LOD de malha** (3 níveis: perto, médio, longe) | Troca por uma malha com menos triângulos; some pele, dedos, dobras. | baixo | Sim, como 3 sprites por monstro |
| 9 | **LOD de shader** | Desliga o que não se vê: normal map fino, parallax, subsurface e rachaduras pequenas somem pela distância. | baixo | Parcial |
| 10 | **Mipmapping + filtro anisotrópico** | Textura se reduz sozinha pela distância (sem serrilhado nem cintilação); o anisotrópico mantém o chão e a pele nítidos em ângulo. | grátis | Sim, ao reduzir sprites |
| 11 | **Perspectiva aérea por personagem** | Cor se aproxima da cor da névoa, contraste e saturação caem, tom puxa para o azul. Já existe na cena; falta aplicar **no próprio monstro** pela distância. | baixo | Sim, é só um filtro de cor |
| 12 | **Specular antialiasing** | Quando o normal map fica pequeno demais, a rugosidade sobe junto. Evita os brilhos piscando e dá o aspecto fosco de longe. | baixo | Não |
| 13 | **Impostor / billboard** | Renderiza o monstro em imagem (atlas com vários ângulos) e desenha só um quadrado. Para multidões e horda distante. | muito baixo | **Sim, é o que o jogo já faz** |
| 14 | **Dithered LOD crossfade** | A troca entre níveis é feita com padrão pontilhado, sem "pulo" visível. | baixo | Sim (mistura de 2 sprites) |
| 15 | **Luz de borda (rim light) mantida** | O contorno iluminado é a última coisa a sumir; segura a silhueta contra a névoa. | baixo | Sim, contorno fino claro |
| 16 | **Sombra de contato e AO de baixo custo** | Elipse escura sob os pés mantém o personagem "pisando" no chão mesmo sem detalhe. | muito baixo | Sim, a melhor relação custo/efeito |
| 17 | **Reforço de silhueta** | Contorno sutil que escurece com a distância, para o monstro não se perder no fundo. | baixo | Sim |
| 18 | **ASCII / pós-processamento estilizado** | Luminância vira caractere (rampa tipo ` .:-=+*#%@`) em blocos de tela. É **estilo**, não realismo: por isso ganhou metodologia própria, [metodologia_ascii.md](metodologia_ascii.md). | médio | Sim, em Canvas 2D |

**Como combinar (receita para distância):**

1. Três distâncias: **perto** (tudo ligado), **médio** (sem parallax, normal map fraco, sem SSS), **longe** (impostor + cor atmosférica + sombra de contato).
2. A cor atmosférica é uma única fórmula: `cor = mistura(cor, corDaNévoa, 1 - exp(-densidade * distância))`, igual à névoa da cena.
3. Troque de nível com *crossfade* curto, nunca de uma vez; o salto de detalhe é o que denuncia o LOD.
4. Meça com horda: o ganho de LOD só aparece com muitos monstros ao mesmo tempo.

**Para os jogos 2D (Canvas):** gerar cada monstro do laboratório em **3 tamanhos já filtrados** (mipmap feito na mão, reduzindo com
filtro bom em vez de deixar o navegador encolher um sprite grande), aplicar o filtro de cor atmosférica pela posição na tela, manter a
sombra de contato e a luz de borda. É barato e entrega o que mais pesa na leitura de longe. ASCII fica como efeito opcional.

**Teste em 25/11/2026:** o [Cavaleiro Ossário](cavaleiro_foto.html) (`cavaleiro_foto.js`) implementa 8 (3 níveis de LOD, escolhidos pela distância da
câmera), 10 (mipmap + anisotrópico, com caixa), 11 (a névoa da cena aplicada no personagem, com caixa), 12 (relevo some e rugosidade sobe),
15 (luz de borda que cresce com a distância) e 16 (sombra de contato mais forte de longe). Uma fileira de cavaleiros a 14, 24, 36, 52 e 72 m mostra
tudo numa imagem, com rótulo de distância, nível e triângulos. Número medido (WebGL por software, sem GPU real): os 3 níveis têm 17.692, 4.832 e 2.076
triângulos; a cena de 6 cavaleiros tem 33.584 triângulos com LOD automático e 106.152 com tudo no nível 0.

Ainda **não** feitos: 9 (LOD de shader além do relevo/rugosidade), 13 (impostor), 14 (troca de nível com pontilhado: hoje a troca é seca) e 17
(contorno que escurece). O ASCII (18) saiu desta lista e virou [metodologia_ascii.md](metodologia_ascii.md). Sem medida em GPU de verdade nem em celular, e ninguém comparou ainda "ligado x desligado"
a olho com calma: o botão "Desligar as 5 técnicas" existe para isso.

### Limites e cuidados antes de adotar

- O projeto hoje é **Canvas 2D** (monstros desenhados em sprites, leves para celular fraco). Esta técnica é **WebGL 3D** com pós-processamento: pesa
  muito mais. Ela serve de ferramenta de arte (gerar imagens e sprites de referência) bem antes de servir para rodar no jogo.
- No celular fraco, AO em tela cheia, bloom e profundidade de campo juntos derrubam o desempenho: a página tem um seletor de qualidade para medir.
- Três.js fica **copiado** em `lab/vendor/three/` (versão 0.160.0, licença MIT em `LICENSE`), então o exemplo funciona sem internet. Nenhum jogo usa isso.
