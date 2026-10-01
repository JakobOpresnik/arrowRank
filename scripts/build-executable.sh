#!/usr/bin/env bash
# builds frontend, backend.exe and the Electron installer (see electron_create_exe_file.txt)
set -euo pipefail

if [[ -t 1 && -z "${NO_COLOR:-}" ]]; then
  BOLD=$'\e[1m' CYAN=$'\e[36m' GREEN=$'\e[32m' RED=$'\e[31m' RESET=$'\e[0m'
else
  BOLD='' CYAN='' GREEN='' RED='' RESET=''
fi
step() { printf '%s==> %s%s\n' "$BOLD$CYAN" "$1" "$RESET"; }
trap 'printf "%sBuild failed (line %s)%s\n" "$BOLD$RED" "$LINENO" "$RESET" >&2' ERR

usage() {
  cat <<USAGE
usage: $(basename "$0") [<version>|major|minor|patch] [-h|--help]

Builds the ArrowRank Windows installer: frontend (pnpm build) -> backend.exe
(PyInstaller) -> copied into electron/backend/ -> electron-builder.
Output: electron/dist/ArrowRank-Setup-<version>.exe

args:
  <version>           set electron/package.json version first, e.g. 2.3.0 (no git tag)
  major|minor|patch   bump electron/package.json version first (no git tag)
  (none)              same as patch
  -h, --help          show this help
USAGE
}

ARG="${1:-patch}"
VERSION="${ARG#v}"
case "$VERSION" in
  -h|--help) usage; exit 0 ;;
esac
if [[ -n "$VERSION" && ! "$VERSION" =~ ^(major|minor|patch)$ && ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$ ]]; then
  printf '%sInvalid version: %s%s\n' "$RED" "$ARG" "$RESET" >&2
  usage >&2
  exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

CURRENT="$(cd "$ROOT/electron" && node -p "require('./package.json').version")"
if [[ -n "$VERSION" && "$VERSION" != "$CURRENT" ]]; then
  if [[ "$VERSION" =~ ^(major|minor|patch)$ ]]; then step "Bump version ($VERSION)"; else step "Set version $CURRENT -> $VERSION"; fi
  cd "$ROOT/electron"
  pnpm version "$VERSION" --no-git-tag-version --no-git-checks
fi

step "Build frontend"
cd "$ROOT/frontend"
pnpm build

step "Build backend"
cd "$ROOT/backend"
# ponytail: .exe launcher exits silently in Git Bash, module form works
./.venv/Scripts/python.exe -m PyInstaller backend.spec --noconfirm
cp "$ROOT/backend/dist/backend.exe" "$ROOT/electron/backend/backend.exe"

step "Build electron"
cd "$ROOT/electron"
rm -rf dist
pnpm build

printf '%sDone:%s %s\n' "$BOLD$GREEN" "$RESET" "$(ls -1 "$ROOT"/electron/dist/*.exe)"
