#!/usr/bin/env bash

# Directorio donde reside este script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

name=$(basename "$(realpath "$SCRIPT_DIR/..")")
"${SCRIPT_DIR}"/../../bin/flatten.sh "$name"