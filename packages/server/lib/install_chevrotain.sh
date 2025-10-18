#!/bin/sh
set -e

# Instala la dependencia "chevrotain" para que sea compatible con CommonJS

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

# Determina la arquitectura más concreta para builds de Docker
get_platform() {
    os=$(uname -s | tr '[:upper:]' '[:lower:]')
    arch=$(uname -m)

    # Normaliza la arquitectura
    case "$arch" in
        x86_64)
            arch="amd64"
            ;;
        aarch64|arm64)
            arch="arm64"
            ;;
        armv7l)
            arch="armv7"
            ;;
    esac

    echo "${os}-${arch}"
}

PLATFORM=$(get_platform)

get_latest_version() {
    version=$(curl -s https://raw.githubusercontent.com/Chevrotain/chevrotain/master/packages/chevrotain/package.json 2>/dev/null | grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n1 | sed 's/.*"\([^"]*\)".*/\1/')
    echo "$version"
}

# Función común para usar artifacts
use_artifact() {
    artifact_path="$1"
    echo "Usando artifact: $(basename "$artifact_path")"
    rm -rf "$SCRIPT_DIR/chevrotain"
    tar -xzf "$artifact_path" -C "$SCRIPT_DIR"
    echo "Fin!"
}

echo "Platform detectada: $PLATFORM"
echo "Verificando última versión en GitHub..."
VERSION=$(get_latest_version)

if [ -n "$VERSION" ]; then
    echo "Versión obtenida: $VERSION"
else
    echo "No se pudo obtener la versión desde GitHub."
fi

if [ -z "$VERSION" ]; then
    echo "Buscando artifact local más reciente..."
    ARTIFACT_NAME=$(find "$SCRIPT_DIR" -maxdepth 1 -name "chevrotain-*-${PLATFORM}.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -n1 | cut -d' ' -f2-)
    if [ -n "$ARTIFACT_NAME" ] && [ -f "$ARTIFACT_NAME" ]; then
        use_artifact "$ARTIFACT_NAME"
        exit 0
    else
        echo "No se encontró artifact local. Abortando."
        exit 1
    fi
fi

ARTIFACT_NAME="chevrotain-${VERSION}-${PLATFORM}.tar.gz"

if [ -f "$SCRIPT_DIR/$ARTIFACT_NAME" ]; then
    echo "Artifact encontrado: $ARTIFACT_NAME"
    echo "Extrayendo..."
    use_artifact "$SCRIPT_DIR/$ARTIFACT_NAME"
    exit 0
fi

echo "No se encontró artifact. Procediendo con el build..."

echo "Carpeta del script: $SCRIPT_DIR"

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

echo "Creando artifact ..."
tar -czf "$SCRIPT_DIR/$ARTIFACT_NAME" chevrotain
echo "Artifact guardado como: $ARTIFACT_NAME"

echo "Fin!"