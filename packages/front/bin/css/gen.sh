#!/bin/bash

# Ruta del propio script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Ejecutar tsx desde la ruta relativa al script
tsx "$SCRIPT_DIR/gen.ts" > "$SCRIPT_DIR/../../styles/globals-colors.css"

