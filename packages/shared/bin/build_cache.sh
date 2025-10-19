#!/bin/sh
set -e

# Instala la dependencia "chevrotain" para que sea compatible con CommonJS

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
. "$SCRIPT_DIR/../../bin/artifacts/lib/utils.sh"

decompress_artifact() {
    artifact_path="$1"

    # Limpia el directorio de build si existe
    rm -rf "$BUILD_DIR"

    # Descomprime el artifact
    tar -xzf "$artifact_path" -C "$SCRIPT_DIR/../"
}

# Función específica para comprimir artifacts
# Puede incluir múltiples archivos/directorios
compress_artifact() {
    artifact_path="$1"

    # Ejemplo simple: solo el directorio build
    tar -czf "$artifact_path" -C "$SCRIPT_DIR/../" "build"
}

# Función específica para construir el artifact
build_artifact() {
    echo "Ejecutando build con pnpm..."
    pnpm build
}


# ============================================
# Script principal
# ============================================
ARTIFACT_NAME="shared"
PLATFORM=$(get_platform)
PACKAGE_JSON="$SCRIPT_DIR/../../package.json"
VERSION=$(get_version_from_package "$PACKAGE_JSON")
BUILD_DIR="$SCRIPT_DIR/../build"

run_artifact_workflow "$ARTIFACT_NAME" "$VERSION" "$PLATFORM"