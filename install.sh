#!/bin/bash
set -e

DEST="$HOME/pefi"
SRC="build/bin/pefi"

echo "Building..."
wails build

mkdir -p "$(dirname "$DEST")"
cp -f "$SRC" "$DEST"
chmod +x "$DEST"
echo "Installed to $DEST"
