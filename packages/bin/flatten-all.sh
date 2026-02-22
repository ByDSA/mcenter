#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "$0")" 2>/dev/null && pwd || dirname "$(readlink -f "$0")")"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"

FLATTEN_BINS=$(
  find "$PARENT_DIR" -mindepth 1 -maxdepth 1 -type d \
    ! -name "bin" ! -name "lib" ! -name "node_modules" ! -name ".*" \
  | while read -r subdir; do
      find "$subdir" -path "*/bin/flatten.sh" -type f 2>/dev/null
    done
)

if [[ -z "$FLATTEN_BINS" ]]; then
  echo "Error: no se encontró flatten.sh en $PARENT_DIR/*/bin/"
  exit 1
fi

while IFS= read -r FLATTEN_BIN <&3; do
  MIDDLE_DIR=$(echo "$FLATTEN_BIN" | sed "s|$PARENT_DIR/||" | cut -d'/' -f1)
  echo "Ejecutando flatten de $MIDDLE_DIR ..."
  bash "$FLATTEN_BIN" "$@"
done 3<<< "$FLATTEN_BINS"
