import { useEffect } from "react";

export function measureTextAreaWidth(textarea: HTMLTextAreaElement): number {
  // Obtener estilos computados del textarea
  const style = window.getComputedStyle(textarea);
  const paddingLeft = parseFloat(style.paddingLeft || "0");
  const paddingRight = parseFloat(style.paddingRight || "0");

  // Si el textarea es visible, usar medición directa y descontar padding
  if (textarea.offsetWidth > 0)
    return textarea.clientWidth - paddingLeft - paddingRight;

  // Recopilar todos los padres hasta llegar a body
  const elementsToShow: Array<{
    element: HTMLElement;
    originalDisplay: string;
    originalVisibility: string;
  }> = [];
  let current: HTMLElement | null = textarea;

  // Recorrer hacia arriba hasta encontrar el primer elemento visible o llegar a body
  while (current && current !== document.body) {
    const computedStyle = window.getComputedStyle(current);
    const isHidden = computedStyle.display === "none"
                    || computedStyle.visibility === "hidden"
                    || current.offsetWidth === 0;

    if (isHidden) {
      elementsToShow.push( {
        element: current,
        originalDisplay: current.style.display,
        originalVisibility: current.style.visibility,
      } );
    }

    current = current.parentElement;
  }

  // Hacer visible temporalmente todos los elementos ocultos
  for (const item of elementsToShow) {
    item.element.style.display = item.element.style.display === "none"
      ? "block"
      : item.element.style.display;
    item.element.style.visibility = "visible";
  }

  // Forzar reflow
  textarea.offsetHeight;

  // Obtener el ancho y descontar padding
  const width = textarea.clientWidth - paddingLeft - paddingRight;

  // Restaurar estados originales en orden inverso
  for (let i = elementsToShow.length - 1; i >= 0; i--) {
    const item = elementsToShow[i];

    item.element.style.display = item.originalDisplay;
    item.element.style.visibility = item.originalVisibility;
  }

  return width;
}

// Caché para medidas de texto con límite de 200 entradas
const textMeasureCache = new Map<string, number>();
const CACHE_LIMIT = 200;

function getCacheKey(fontSpec: string, maxWidth: number, text: string): string {
  return `${fontSpec}|${maxWidth}|${text}`;
}

function addToCache(key: string, value: number): void {
  // Si la caché está llena, eliminar la entrada más antigua
  if (textMeasureCache.size >= CACHE_LIMIT) {
    const firstKey = textMeasureCache.keys().next().value;

    textMeasureCache.delete(firstKey);
  }

  textMeasureCache.set(key, value);
}

function getTextWidth(
  ctx: CanvasRenderingContext2D,
  fontSpec: string,
  maxWidth: number,
  text: string,
): number {
  const cacheKey = getCacheKey(fontSpec, maxWidth, text);
  const cachedWidth = textMeasureCache.get(cacheKey);

  if (cachedWidth !== undefined)
    return cachedWidth;

  const { width } = ctx.measureText(text);

  addToCache(cacheKey, width);

  return width;
}

export function getVisualLines(
  textarea: HTMLTextAreaElement,
  sentence: string,
): number {
  const styles = window.getComputedStyle(textarea);
  const fontSpec = `${styles.fontSize} ${styles.fontFamily}`;
  const maxWidth = measureTextAreaWidth(textarea);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  ctx.font = fontSpec;

  const words = sentence.split(" ");
  let visualLineCount = 1;
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine === "" ? word : currentLine + " " + word;
    // El -1 se ha puesto de forma empírica:
    const testWidth = getTextWidth(ctx, fontSpec, maxWidth, testLine) - 1;

    if (testWidth > maxWidth) {
      // Si hay contenido en la línea actual, necesitamos una nueva línea
      if (currentLine !== "") {
        visualLineCount++;
        currentLine = "";
      }

      // Verificar si la palabra sola es más ancha que el contenedor
      const wordWidth = getTextWidth(ctx, fontSpec, maxWidth, word);

      if (wordWidth > maxWidth) {
        // Palabra muy larga, necesita ser partida por caracteres
        const { lines, lastLine } = breakLongWord(ctx, word, maxWidth, fontSpec);

        visualLineCount += lines;
        currentLine = lastLine;
      } else {
        // Palabra normal, va en la nueva línea
        currentLine = word;
      }
    } else {
      // La palabra cabe en la línea actual
      currentLine = testLine;
    }
  }

  return visualLineCount;
}

function breakLongWord(
  ctx: CanvasRenderingContext2D,
  word: string,
  maxWidth: number,
  fontSpec: string,
): { lines: number;
lastLine: string; } {
  let lines = 0;
  let currentPart = "";

  for (const char of word) {
    const testPart = currentPart + char;
    const testWidth = getTextWidth(ctx, fontSpec, maxWidth, testPart);

    if (testWidth > maxWidth && currentPart !== "") {
      lines++;
      currentPart = char;
    } else
      currentPart = testPart;
  }

  return {
    lines,
    lastLine: currentPart,
  };
}

/**
 * Hook que dispara callback la primera vez que el elemento entra en viewport,
 * y re-calcula al redimensionar.
 */
export function useFirstTimeVisible<E extends Element>(
  ref: React.RefObject<E>,
  callback: (current: E)=> void,
) {
  useEffect(() => {
    const onResize = () => {
      if (ref.current)
        callback(ref.current);
    };
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting && ref.current) {
            callback(ref.current);
            window.addEventListener("resize", onResize);
            observer.disconnect();
            break;
          }
        }
      },
      {
        threshold: 0.1,
      },
    );

    if (ref.current)
      observer.observe(ref.current);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);
}

export const updateHeight = (
  { value, element }: { value: string;
element: HTMLTextAreaElement; },
) => {
  const rows = Math.max(getVisualLines(element, value), 1);
  const styles = window.getComputedStyle(element);
  const padding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);

  element.style.height = `calc(${rows * 1.3}em + ${padding}px)`;
};
