#!/usr/bin/env bash
# Gera css/tailwind.css (Tailwind compilado, minificado) para a versão standalone, que não usa CDN.
# Rode novamente sempre que mudar classes Tailwind em partials/ ou em js/.
#
# Requer o Tailwind CLI standalone v3 (um único executável, sem Node). Baixe uma vez, por exemplo:
#   curl -sLo tailwindcss https://github.com/tailwindlabs/tailwindcss/releases/download/v3.4.17/tailwindcss-linux-x64
#   chmod +x tailwindcss
# e deixe-o no PATH ou em mini_games/yara-rpg/tailwind/tailwindcss (outros sistemas: veja a página de releases).
set -euo pipefail
cd "$(dirname "$0")"

CLI="${TAILWIND_CLI:-}"
if [ -z "$CLI" ]; then
  if [ -x tailwind/tailwindcss ]; then CLI=tailwind/tailwindcss
  elif command -v tailwindcss >/dev/null 2>&1; then CLI=tailwindcss
  else
    echo "Tailwind CLI não encontrado. Veja as instruções no topo de $0." >&2
    exit 1
  fi
fi

"$CLI" -c tailwind/tailwind.config.js -i tailwind/input.css -o css/tailwind.css --minify
echo "Gerado: css/tailwind.css ($(wc -c < css/tailwind.css) bytes)"
