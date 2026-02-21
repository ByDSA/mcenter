#!/usr/bin/env bash

# ── Configuración ────────────────────────────────────────────────────────────
IMG_W=300
IMG_H=300
BG_COLOR="#202020"
SVG_COLOR="#F0F0F0"
SVG_FIT_DIM="width"
SVG_FIT_PX=200
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

usage() { echo "Uso: $0 <archivo.svg> [salida.png]"; exit 1; }
[[ $# -lt 1 ]] && usage

SVG_IN="$1"
OUTPUT="${2:-output.png}"
[[ -f "$SVG_IN" ]] || { echo "Error: no se encuentra '$SVG_IN'"; exit 1; }

echo "[1/4] Detectando herramientas..."
python3 -c "import playwright" 2>/dev/null \
    || { echo "Error: playwright no instalado. Ejecuta: pip install playwright && playwright install chromium"; exit 1; }

SVG_TMP=$(mktemp /tmp/svg_XXXXXX.svg)
HTML_TMP=$(mktemp /tmp/svg_XXXXXX.html)
trap 'rm -f "$SVG_TMP" "$HTML_TMP"' EXIT

RND=$(cat /proc/sys/kernel/random/uuid 2>/dev/null | tr -d '-' || echo "$RANDOM$RANDOM$RANDOM")
ID1="sid_${RND:0:10}"
ID2="sid_${RND:10:10}x"

echo "[2/4] Aplicando sustituciones al SVG..."
python3 - "$SVG_IN" "$SVG_TMP" "$SVG_COLOR" "$ID1" "$ID2" << 'PYEOF'
import re, sys

src, dst, color, id1, id2 = sys.argv[1:]

with open(src, encoding='utf-8') as f:
    txt = f.read()

txt = txt.replace('__ID2__', id2).replace('__ID__', id1)

def replace_masks(t):
    out, pos = [], 0
    for m in re.finditer(r'<mask[\s>]', t):
        start = m.start()
        out.append(t[pos:start].replace('currentColor', color))
        end = t.find('</mask>', start)
        end = len(t) if end == -1 else end + len('</mask>')
        out.append(t[start:end].replace('currentColor', 'white'))
        pos = end
    out.append(t[pos:].replace('currentColor', color))
    return ''.join(out)

txt = replace_masks(txt)

with open(dst, 'w', encoding='utf-8') as f:
    f.write(txt)
PYEOF

echo "[3/4] Calculando dimensiones del SVG..."
VIEWBOX=$(grep -oP 'viewBox="\K[^"]+' "$SVG_TMP" | head -1 || true)
if [[ -n "$VIEWBOX" ]]; then
    read -r NVB_X NVB_Y NVB_W NVB_H <<< "$(echo "$VIEWBOX" | tr ',' ' ')"
    SVG_NAT_W=$(awk "BEGIN{printf \"%d\", ($NVB_W - $NVB_X) + 0.5}")
    SVG_NAT_H=$(awk "BEGIN{printf \"%d\", ($NVB_H - $NVB_Y) + 0.5}")
    echo "      -> viewBox: \"$VIEWBOX\""
    echo "         min=(${NVB_X},${NVB_Y})  size=(${NVB_W}x${NVB_H})  -> dims reales: ${SVG_NAT_W}x${SVG_NAT_H}"
else
    echo "Error: no se encontró viewBox en el SVG"; exit 1
fi

if [[ "$SVG_FIT_DIM" == "width" ]]; then
    RSVG_W=$SVG_FIT_PX
    RSVG_H=$(awk "BEGIN{printf \"%d\", $SVG_NAT_H * $SVG_FIT_PX / $SVG_NAT_W + 0.5}")
else
    RSVG_H=$SVG_FIT_PX
    RSVG_W=$(awk "BEGIN{printf \"%d\", $SVG_NAT_W * $SVG_FIT_PX / $SVG_NAT_H + 0.5}")
fi
echo "      -> SVG escalado: ${RSVG_W}x${RSVG_H}"

SVG_CONTENT=$(cat "$SVG_TMP")

cat > "$HTML_TMP" << HTMLEOF
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
    width: ${IMG_W}px;
    height: ${IMG_H}px;
    background: ${BG_COLOR};
    display: flex;
    align-items: center;
    justify-content: center;
}
svg {
    width: ${RSVG_W}px;
    height: ${RSVG_H}px;
}
</style>
</head>
<body>
${SVG_CONTENT}
</body>
</html>
HTMLEOF

echo "      -> HTML generado en: $HTML_TMP"

echo "[4/4] Renderizando con Playwright..."
python3 - "$HTML_TMP" "$OUTPUT" "$IMG_W" "$IMG_H" << 'PYEOF'
import sys
from playwright.sync_api import sync_playwright

html_path, output, w, h = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])

with sync_playwright() as p:
    browser = p.chromium.launch(args=["--force-device-scale-factor=1"])
    page = browser.new_page(viewport={"width": w, "height": h})

    # Cargamos el HTML y esperamos a que la red esté idle y el DOM listo
    page.goto(f"file://{html_path}", wait_until="networkidle")

    # Esperamos a que el SVG esté en el DOM y sea visible
    page.wait_for_selector("svg", state="visible")

    # Forzamos dos frames de animación para garantizar que el compositor
    # haya completado el paint antes de capturar
    page.evaluate("""() => {
        return new Promise(resolve => {
            requestAnimationFrame(() => requestAnimationFrame(resolve));
        });
    }""")

    # Screenshot del viewport exacto, sin full_page para no capturar overflow
    page.screenshot(
        path=output,
        clip={"x": 0, "y": 0, "width": w, "height": h},
        full_page=False,
    )
    browser.close()

print(f"      -> Captura guardada: {output}")
PYEOF

echo ""
echo "Guardado: $OUTPUT"
echo "HTML debug: ${OUTPUT%.png}.html"
echo "  Canvas : ${IMG_W}x${IMG_H}  bg=${BG_COLOR}"
echo "  SVG    : ${SVG_NAT_W}x${SVG_NAT_H} -> ${RSVG_W}x${RSVG_H}"