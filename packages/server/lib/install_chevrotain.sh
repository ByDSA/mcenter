#!/bin/sh
set -e

# Instala la dependencia "chevrotain" para que sea compatible con CommonJS

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
. "$SCRIPT_DIR/../../bin/artifacts/lib/utils.sh"

compress_artifact() {
  artifact_path="$1"
  tar -czf "$artifact_path" chevrotain
}

decompress_artifact() {
    artifact_path="$1"
    rm -rf "$SCRIPT_DIR/chevrotain"
    tar -xzf "$artifact_path" -C "$SCRIPT_DIR"
}

build_artifact() {
  TEMP_DIR=$(mktemp -d)
  trap 'rm -rf "$TEMP_DIR"' EXIT
  cd "$TEMP_DIR"

  echo "Clonando repositorio desde git ..."
  git clone https://github.com/Chevrotain/chevrotain  > /dev/null
  cd chevrotain

  echo "Instalando dependencias ..."
  pnpm i

  echo "Compilando ..."
  pnpm compile

  echo "Modificando package.json ..."
  cd packages/chevrotain
  sed -i '/"bundle": "npm-run-all bundle:\*\*",/a \ \ \ \ "bundle:cjs:regular": "esbuild ./lib/src/api.js --bundle --sourcemap --format=cjs --outfile=lib/chevrotain.cjs",\n    "bundle:cjs:min": "esbuild ./lib/src/api.js --bundle --minify --format=cjs --sourcemap --outfile=lib/chevrotain.min.cjs",' package.json

  echo "Generando bundles ..."
  pnpm bundle:cjs:regular  > /dev/null
  pnpm bundle:cjs:min  > /dev/null

  echo "Modificando package.json con los nuevos bundles ..."
  sed -i '/"import": ".\/lib\/src\/api.js",/a \ \ \ \ \ \ "require": ".\/lib\/chevrotain.cjs",' package.json

  echo "Eliminando archivos no necesarios ..."
  rm -rf benchmark_web node_modules scripts test tsconfig.json .c8rc.json .mocharc.cjs

  cd "$SCRIPT_DIR"
  rm -rf chevrotain

  echo "Moviendo carpeta chevrotain para que pueda ser usada ..."
  mv "$TEMP_DIR"/chevrotain/packages/chevrotain ./
}

get_latest_version() {
    version=$(wget -qO- https://raw.githubusercontent.com/Chevrotain/chevrotain/master/packages/chevrotain/package.json 2>/dev/null | grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n1 | sed 's/.*"\([^"]*\)".*/\1/')
    echo "$version"
}

# ============================================
# Script principal
# ============================================
ARTIFACT_NAME="chevrotain"
PLATFORM=$(get_platform)
VERSION=$(get_latest_version)

run_artifact_workflow "$ARTIFACT_NAME" "$VERSION" "$PLATFORM"