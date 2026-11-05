#!/usr/bin/env bash
# Roda uma cena do Blender sem abrir a janela.
#   ./run.sh scenes/zeph_render.py [--only quadro1,quadro2] [--smooth | --realista]
# Use BLENDER=/caminho/do/blender se não estiver no PATH.
cd "$(dirname "$0")" || exit 1
script="${1:?uso: ./run.sh scenes/<cena>.py [args]}"
shift
"${BLENDER:-blender}" -b --factory-startup --python-exit-code 1 -P "$script" -- "$@" 2>&1 \
    | grep -vE '^(Fra:|Saved:|Time:|$)'
exit "${PIPESTATUS[0]}"
