#!/usr/bin/env bash
# builds frontend, backend.exe and the Electron installer (see electron_create_exe_file.txt)
set -eu
BUMP="${1:-}"
usage() {
  cat <<USAGE
usage: $0 [major|minor|patch] [-h|--help]

Builds the ArrowRank Windows installer: frontend (pnpm build) -> backend.exe
(PyInstaller) -> copied into electron/backend/ -> electron-builder.
Output: electron/dist/ArrowRank-Setup-<version>.exe

args:
  major|minor|patch   bump electron/package.json version first (no git tag)
  (none)              build at the current version
  -h, --help          show this help
USAGE
}

case "$BUMP" in
  ''|major|minor|patch) ;;
  -h|--help) usage; exit 0 ;;
  *) usage >&2; exit 1 ;;
esac

ROOT="$(dirname "$0")"
cd "$ROOT"
ROOT="$PWD"

if [ -n "$BUMP" ]; then
  echo "== bump version ($BUMP) =="
  cd "$ROOT/electron"
  pnpm version "$BUMP" --no-git-tag-version
fi

echo "== build frontend =="
cd "$ROOT/frontend"
pnpm build

echo "== build backend =="
cd "$ROOT/backend"
# ponytail: .exe launcher exits silently in Git Bash, module form works
./.venv/Scripts/python.exe -m PyInstaller backend.spec --noconfirm
cp "$ROOT/backend/dist/backend.exe" "$ROOT/electron/backend/backend.exe"

echo "== build electron =="
cd "$ROOT/electron"
rm -rf dist
pnpm build

ls -1 "$ROOT"/electron/dist/*.exe
