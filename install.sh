#!/bin/bash
set -e

DEST="$HOME/pefi"
SRC="build/bin/pefi"

if [ ! -f "$SRC" ]; then
    echo "Build not found. Run 'wails build' first."
    exit 1
fi

mkdir -p "$(dirname "$DEST")"
cp -f "$SRC" "$DEST"
chmod +x "$DEST"
echo "Installed to $DEST"
