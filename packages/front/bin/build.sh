#!/bin/sh

# Salir si hay errores
set -e

# Archivos a procesar
TSCONFIG="tsconfig.json"
PACKAGE_JSON="package.json"
PNPM_LOCK="pnpm-lock.yaml"

# Backups
TSCONFIG_BAK="tsconfig.json.bak"
PACKAGE_BAK="package.json.bak"
LOCK_BAK="pnpm-lock.yaml.bak"

# Función de limpieza: restaurar todos los archivos originales
cleanup() {
  echo ""
  if [ -f "$TSCONFIG_BAK" ]; then
    echo "Restaurando $TSCONFIG original..."
    mv "$TSCONFIG_BAK" "$TSCONFIG"
  fi
  if [ -f "$PACKAGE_BAK" ]; then
    echo "Restaurando $PACKAGE_JSON original..."
    mv "$PACKAGE_BAK" "$PACKAGE_JSON"
  fi
  if [ -f "$LOCK_BAK" ]; then
    echo "Restaurando $PNPM_LOCK original..."
    mv "$LOCK_BAK" "$PNPM_LOCK"
  fi
}

# Registrar limpieza para salidas normales, errores o interrupciones
trap cleanup EXIT INT TERM

echo "🚀 Preparando entorno de producción..."

# 1. Crear backups
cp "$TSCONFIG" "$TSCONFIG_BAK"
cp "$PACKAGE_JSON" "$PACKAGE_BAK"
if [ -f "$PNPM_LOCK" ]; then
  cp "$PNPM_LOCK" "$LOCK_BAK"
fi

# 2. Modificar tsconfig.json: Eliminar alias de desarrollo
# Busca la línea con $shared/* y la borra
sed -i.tmp '/"\$shared\/\*":/d' "$TSCONFIG"

# 3. Modificar package.json: Cambiar src por build
# Cambia "$shared": "workspace:../shared/src" -> "$shared": "workspace:../shared/build"
sed -i.tmp 's|"\$shared": "workspace:../shared/src"|"\$shared": "workspace:../shared/build"|g' "$PACKAGE_JSON"

# 4. Modificar pnpm-lock.yaml: Cambiar todas las referencias de src a build
if [ -f "$PNPM_LOCK" ]; then
  sed -i.tmp 's|shared/src|shared/build|g' "$PNPM_LOCK"
fi

# Eliminar archivos temporales de sed (limpieza de archivos .tmp residuales)
rm -f "$TSCONFIG.tmp" "$PACKAGE_JSON.tmp" "$PNPM_LOCK.tmp"

echo "✅ Configuración temporal aplicada (src -> build)."

# 5. Ejecutar el build de Next.js
echo "🏗️  Iniciando next build..."
npx next build --webpack

echo "🎉 Build completado con éxito."
# Al finalizar, cleanup() se ejecuta automáticamente por el trap