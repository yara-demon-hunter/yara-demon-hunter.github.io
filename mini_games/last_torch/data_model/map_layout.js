// --- O MAPA ENTRE AS TELAS: LAYOUT ---
// Gravado pelo editor do mapa (Ateliê: _library/tools/map_editor.html, pelo servidor tools/serve.py). Pode editar à mão também.
// Tudo em PIXELS da imagem do mapa (images/map/map.webp, 1375 x 767); o jogo converte para porcentagem, então vale em qualquer tela.
//   screens  as 6 telas na ordem: id do cenário, nome (aparece no jogo), node (onde fica no mapa) e leg (o caminho daqui até a PRÓXIMA tela; o 1º e o
//            último ponto são os nós das duas telas; null na última)
//   labels   textos por cima do mapa: text, x, y (centro), size (altura da letra em pixels do mapa), color, font ('cinzel' ou 'inter'), weight, italic,
//            rot (graus), shadow (true/false), opacity (0 a 1)
//   marker   o retrato do herói que anda: size (% da largura do mapa), border (cor), borderWidth (px)
//   nodes    as bolinhas das telas: size (% da largura), done (já passou), idle (ainda não), next (a próxima)
//   walk     seconds: quanto dura a caminhada
//   texts    title / sub / button: {to} e {from} viram o nome das telas
export const MAP_LAYOUT = {
    screens: [
        {
            id: "dark_forest_2",
            name: "Dark Forest",
            node: [173, 476],
            leg: [
                [173, 476],
                [232, 486],
                [273, 490],
                [315, 463],
                [337, 419],
                [364, 390],
                [434, 383]
            ]
        },
        {
            id: "river_crossing_2",
            name: "River Crossing",
            node: [434, 383],
            leg: [
                [434, 383],
                [500, 370],
                [534, 342],
                [576, 315],
                [616, 308],
                [661, 316],
                [700, 354]
            ]
        },
        {
            id: "swamp",
            name: "Swamp",
            node: [700, 354],
            leg: [
                [700, 354],
                [723, 403],
                [736, 460],
                [747, 509],
                [773, 544],
                [839, 545],
                [907, 537]
            ]
        },
        {
            id: "graveyard_2",
            name: "Graveyard",
            node: [907, 537],
            leg: [
                [907, 537],
                [947, 548],
                [1010, 590],
                [1070, 580],
                [1103, 516],
                [1148, 494],
                [1163, 448]
            ]
        },
        {
            id: "village_gate_3",
            name: "Village",
            node: [1163, 448],
            leg: [
                [1163, 448],
                [1105, 382],
                [1059, 347],
                [1044, 294],
                [1080, 255],
                [1151, 248],
                [1192, 217]
            ]
        },
        {
            id: "castle_gate_2",
            name: "Castle",
            node: [1192, 217],
            leg: null
        }
    ],
    labels: [
        {
            text: "Dark Forest",
            x: 187,
            y: 618,
            size: 34,
            color: "#3b2a14",
            font: "cinzel",
            weight: 700,
            italic: false,
            rot: 0,
            shadow: true,
            opacity: 1
        },
        {
            text: "River Crossing",
            x: 434,
            y: 266,
            size: 34,
            color: "#3b2a14",
            font: "cinzel",
            weight: 700,
            italic: false,
            rot: 0,
            shadow: true,
            opacity: 1
        },
        {
            text: "Swamp",
            x: 734,
            y: 197,
            size: 34,
            color: "#3b2a14",
            font: "cinzel",
            weight: 700,
            italic: false,
            rot: 0,
            shadow: true,
            opacity: 1
        },
        {
            text: "Graveyard",
            x: 910,
            y: 420,
            size: 34,
            color: "#3b2a14",
            font: "cinzel",
            weight: 700,
            italic: false,
            rot: 0,
            shadow: true,
            opacity: 1
        },
        {
            text: "Village",
            x: 1187,
            y: 566,
            size: 34,
            color: "#3b2a14",
            font: "cinzel",
            weight: 700,
            italic: false,
            rot: 0,
            shadow: true,
            opacity: 1
        },
        {
            text: "Castle",
            x: 1092,
            y: 83,
            size: 34,
            color: "#3b2a14",
            font: "cinzel",
            weight: 700,
            italic: false,
            rot: 0,
            shadow: true,
            opacity: 1
        }
    ],
    marker: {
        size: 6,
        border: "#50dc04",
        borderWidth: 3
    },
    nodes: {
        size: 2.1,
        done: "#22c55e",
        idle: "rgba(92, 64, 36, 0.55)",
        next: "#b91c1c"
    },
    walk: {
        seconds: 3
    },
    texts: {
        title: "ON TO THE {to}",
        sub: "{from}  ▶  {to}",
        button: "CONTINUE ▶"
    }
};
