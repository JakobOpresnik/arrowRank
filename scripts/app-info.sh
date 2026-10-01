#!/usr/bin/env bash
# prints ArrowRank app metadata read from electron/package.json and the repo
set -euo pipefail

if [[ -t 1 && -z "${NO_COLOR:-}" ]]; then
  BOLD=$'\e[1m' DIM=$'\e[2m' CYAN=$'\e[36m' GREEN=$'\e[32m' YELLOW=$'\e[33m' RESET=$'\e[0m'
else
  BOLD='' DIM='' CYAN='' GREEN='' YELLOW='' RESET=''
fi
row() { printf '%s%-11s%s %s\n' "$DIM" "$1" "$RESET" "$2"; }

cd "$(dirname "${BASH_SOURCE[0]}")/.."
pkg() { node -p "require('./electron/package.json').$1"; }

NAME="$(pkg build.productName)"
VERSION="$(pkg version)"
INSTALLER="electron/dist/$NAME-Setup-$VERSION.exe"
if [[ -f "$INSTALLER" ]]; then STATUS="${GREEN}(built)$RESET"; else STATUS="${YELLOW}(not built)$RESET"; fi

printf '%s%s%s %sv%s%s\n\n' "$BOLD$CYAN" "$NAME" "$RESET" "$BOLD" "$VERSION" "$RESET"
row "App ID:" "$(pkg build.appId)"
row "Electron:" "$(pkg devDependencies.electron)"
row "Backend:" "FastAPI on http://127.0.0.1:8000"
row "Branch:" "$(git rev-parse --abbrev-ref HEAD)"
row "Commit:" "$(git log -1 --format='%h %s')"
row "Last tag:" "$(git describe --tags --abbrev=0 2>/dev/null || echo none)"
row "Installer:" "$INSTALLER $STATUS"
