#!/usr/bin/env bash

# Directorio donde reside este script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Sacar el directorio .opencode a partir del PATH
OPENCODE_BIN=$(locate "opencode" | grep -m1 "\.opencode/bin$")
OPENCODE_DIR="${OPENCODE_BIN%/bin}"
OUT_DIR=${3:-${SCRIPT_DIR}/..}

# Timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

"${OPENCODE_DIR}/skills/merge-files/scripts/project_flattener.sh" \
  --base $(realpath "${SCRIPT_DIR}/../") \
  "${SCRIPT_DIR}/../$1" \
  > "$OUT_DIR/_merged_${2}_${TIMESTAMP}"
