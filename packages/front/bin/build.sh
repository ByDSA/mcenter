#!/bin/sh

# Salir si hay errores (excepto los que manejamos)
set -e

TSCONFIG="tsconfig.json"
BACKUP="tsconfig.json.bak"

# Función de limpieza: se ejecuta al salir, pase lo que pase
cleanup() {
  if [ -f "$BACKUP" ]; then
    echo "Restaurando $TSCONFIG original..."
    mv "$BACKUP" "$TSCONFIG"
  fi
}

# Registrar la función de limpieza para capturar interrupciones (Ctrl+C, errores, etc.)
trap cleanup EXIT INT TERM

echo "Preparando build de producción..."

# 1. Crear backup del tsconfig
cp "$TSCONFIG" "$BACKUP"

# 2. Eliminar la línea del alias que apunta a /src/
# Buscamos la línea que contiene "$shared" o "@my-project/shared" y la eliminamos
# Nota: Adaptamos el patrón según el nombre exacto que uses en tu paths
sed -i.tmp '/"\$shared\/\*":/d' "$TSCONFIG"
# Eliminar archivo temporal residual de sed en algunos sistemas (como macOS)
rm -f "$TSCONFIG.tmp"

echo "Alias de desarrollo eliminados temporalmente."

# 3. Ejecutar el build real de Next.js
echo "Iniciando next build..."
npx next build --webpack

# Al terminar, 'trap' ejecutará cleanup() automáticamente