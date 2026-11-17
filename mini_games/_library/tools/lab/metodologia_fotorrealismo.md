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

### Limites e cuidados antes de adotar

- O projeto hoje é **Canvas 2D** (monstros desenhados em sprites, leves para celular fraco). Esta técnica é **WebGL 3D** com pós-processamento: pesa
  muito mais. Ela serve de ferramenta de arte (gerar imagens e sprites de referência) bem antes de servir para rodar no jogo.
- No celular fraco, AO em tela cheia, bloom e profundidade de campo juntos derrubam o desempenho: a página tem um seletor de qualidade para medir.
- Três.js fica **copiado** em `lab/vendor/three/` (versão 0.160.0, licença MIT em `LICENSE`), então o exemplo funciona sem internet. Nenhum jogo usa isso.
