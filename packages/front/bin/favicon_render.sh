#!/bin/bash

# Abortar inmediatamente si ocurre cualquier error
set -e

# --- 1. DETECCIÓN INTELIGENTE DE IMAGEMAGICK ---
# Buscamos 'magick' (v7) o 'convert' (v6)
if command -v magick &> /dev/null; then
    CMD="magick"
    echo "✅ ImageMagick detectado (v7+): Usando comando '$CMD'"
elif command -v convert &> /dev/null; then
    CMD="convert"
    echo "✅ ImageMagick detectado (v6): Usando comando '$CMD'"
else
    echo "❌ Error: No se encontró ImageMagick."
    echo "Asegúrate de que está instalado y en el PATH (prueba 'sudo apt install imagemagick')."
    exit 1
fi

# --- 2. CONFIGURACIÓN DE RUTAS ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLIC_DIR="$(realpath "$SCRIPT_DIR/../public")"
INPUT_SVG="$PUBLIC_DIR/favicon.svg"

# Verificar existencia del SVG
if [ ! -f "$INPUT_SVG" ]; then
    echo "❌ Error: No existe el archivo fuente en: $INPUT_SVG"
    exit 1
fi

echo "🎨 Procesando iconos en $PUBLIC_DIR..."

# --- 3. GENERACIÓN DE IMÁGENES ---

# A. Favicon estándar (96x96) - PNG Transparente
# Se asegura fondo transparente (-background none) antes de leer o procesar
$CMD -background none "$INPUT_SVG" -resize 96x96 "$PUBLIC_DIR/favicon-96x96.png"

# B. Apple Icons (180x180) - SIN TRANSPARENCIA
# Usamos -flatten con fondo blanco. Esto es compatible con v6 y v7 y evita fondos negros
# 'apple-touch-icon.png' es el nombre estándar moderno.
# 'apple-icon.png' es un fallback útil.
$CMD -background white "$INPUT_SVG" -resize 180x180 -flatten "$PUBLIC_DIR/apple-touch-icon.png"
cp "$PUBLIC_DIR/apple-touch-icon.png" "$PUBLIC_DIR/apple-icon.png"

# C. Favicon.ico (Legacy) - Multi-capa (16, 32, 48)
# Nota: Si usas v6 muy antigua, 'icon:auto-resize' podría fallar.
$CMD -background none "$INPUT_SVG" -define icon:auto-resize=16,32,48 "$PUBLIC_DIR/favicon.ico"

# 192x192
$CMD -background none "$INPUT_SVG" -resize 192x192 -gravity center -background none "$PUBLIC_DIR/web-app-manifest-192x192.png"

# 512x512
$CMD -background none "$INPUT_SVG" -resize 512x512 -gravity center -background none "$PUBLIC_DIR/web-app-manifest-512x512.png"

# --- FINALIZACIÓN ---

echo "✅ Proceso finalizado correctamente."
# Listar resultados para verificación visual
ls -lh "$PUBLIC_DIR" | grep -E "favicon|apple|web-app"