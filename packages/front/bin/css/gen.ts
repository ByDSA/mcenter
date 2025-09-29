/* eslint-disable no-mixed-operators */
interface ColorConfig {
  name: string;
  hue: number;
  lightnessAdjust?: number; // Ajuste específico para percepción visual
}

interface PaletteOptions {
  levels: number[];
  lightness: {
    range: [number, number]; // [min, max] - del más oscuro al más claro
    base: number; // valor en 500
    easing: "ease-in-out" | "ease-in" | "ease-out" | "linear";
  };
  chroma: {
    range: [number, number]; // [min, max] - del menos saturado al más saturado
    easing: "ease-in-out" | "ease-in" | "ease-out" | "linear";
  };
  convertToHex?: boolean;
}

class OKLCHColorGenerator {
  private defaultOptions: PaletteOptions = {
    levels: [25, 50, 100, 150, 200, 300, 400, 500, 550, 600, 700, 750, 800, 900],
    lightness: {
      range: [0, 1],
      base: 0.7, // Base en 500
      easing: "linear",
    },
    chroma: {
      range: [0, 0.4], // De sin saturación (0) a muy saturado (0.4)
      easing: "linear",
    },
  };

  private colorConfigs: Record<string, ColorConfig> = {
    red: {
      name: "red",
      hue: 30,
    },
    orange: {
      name: "orange",
      hue: 95,
      lightnessAdjust: 0.05,
    },
    yellow: {
      name: "yellow",
      hue: 110,
      lightnessAdjust: 0.35,
    },
    green: {
      name: "green",
      hue: 140,
      lightnessAdjust: 0.1,
    },
    teal: {
      name: "teal",
      hue: 190,
      lightnessAdjust: 0.2,
    },
    blue: {
      name: "blue",
      hue: 255,
    },
    indigo: {
      name: "indigo",
      hue: 285,
    },
    purple: {
      name: "purple",
      hue: 310,
      lightnessAdjust: -0.3,
    },
    pink: {
      name: "pink",
      hue: 350,
      lightnessAdjust: 0.03,
    },
  };

  private easingFunctions = {
    linear: (t: number) => t,
    "ease-in": (t: number) => t * t,
    "ease-out": (t: number) => 1 - (1 - t) ** 2,
    "ease-in-out": (t: number) => t < 0.5 ? 2 * t * t : -1 + ((4 - (2 * t)) * t),
  };

  private lerp(start: number, end: number, t: number): number {
    return start + ((end - start) * t);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private generateColorPalette(
    config: ColorConfig,
    options: PaletteOptions = this.defaultOptions,
  ): Record<string, string> {
    const palette: Record<string, string> = {};
    const { levels, lightness, chroma } = options;
    const baseLevel = 500;
    const ligntnessBase = lightness.base + (config.lightnessAdjust ?? 0);

    levels.forEach((level) => {
      let finalLightness: number;
      let finalChroma: number;
      let localT: number = 0;

      if (level < baseLevel) {
        // Segmento 500 -> 0
        localT = 1 - level / baseLevel;
      } else {
        // Segmento 500 -> 1000
        localT = (level - baseLevel) / (1000 - baseLevel);
      }

      // Calculate lightness - interpolación por segmentos
      if (level < baseLevel) {
        // Segmento 500 -> 0
        const easedT = this.easingFunctions[lightness.easing](localT);

        finalLightness = this.lerp(ligntnessBase, lightness.range[1], easedT);
      } else if (level === baseLevel) {
        // Exactamente en 500
        finalLightness = ligntnessBase;
      } else {
        // Segmento 500 -> 1000
        const easedT = this.easingFunctions[lightness.easing](localT);

        finalLightness = this.lerp(ligntnessBase, lightness.range[0], easedT);
      }

      // Calculate chroma - con extremos en 0 y máximo en 500
      if (level === baseLevel) {
        // Exactamente en 500 - usar chroma máximo
        finalChroma = chroma.range[1];
      } else {
        // Aplicar easing con 500 como t=0 y extremos como t=1
        const easedT = this.easingFunctions[chroma.easing](localT);

        // Interpolar desde chroma máximo (t=0) hasta 0 (t=1)
        finalChroma = this.lerp(chroma.range[1], 0, easedT);
      }

      // Apply constraints and color-specific adjustments
      finalLightness = this.clamp(
        finalLightness,
        0.05,
        0.98,
      );
      finalChroma = this.clamp(finalChroma, 0.005, 0.4);

      // Format OKLCH values
      const l = Math.round(finalLightness * 100 * 100) / 100;
      const c = Math.round(finalChroma * 1000) / 1000;
      const h = config.hue;
      let value: string;

      if (options.convertToHex)
        value = oklchToHex(l / 100, c, h);
      else
        value = `oklch(${l}% ${c} ${h})`;

      palette[`--color-${config.name}-${level}`] = value;
    } );

    return palette;
  }

  public generateAllPalettes(options?: Partial<PaletteOptions>): Record<string, string> {
    const finalOptions = {
      ...this.defaultOptions,
      ...options,
    };
    const allVariables: Record<string, string> = {};

    Object.values(this.colorConfigs).forEach(config => {
      const palette = this.generateColorPalette(config, finalOptions);

      Object.assign(allVariables, palette);
    } );

    return allVariables;
  }

  public generateCSS(options?: Partial<PaletteOptions>): string {
    const variables = this.generateAllPalettes(options);
    let css = ":root {\n";
    const colorGroups: Record<string, string[]> = {};

    Object.entries(variables).forEach(([varName, value]) => {
      const colorName = varName.split("-")[2];

      if (!colorGroups[colorName])
        colorGroups[colorName] = [];

      colorGroups[colorName].push(`  ${varName}: ${value};`);
    } );

    Object.entries(colorGroups).forEach(([colorName, vars]) => {
      css += `\n  /* ${colorName.charAt(0).toUpperCase() + colorName.slice(1)} */\n`;
      css += vars.join("\n") + "\n";
    } );

    css += this.generateSemanticAliases(options);
    css += "}\n";

    return css;
  }

  private generateSemanticAliases(options?: Partial<PaletteOptions>): string {
    return `
    /* Semantic Aliases */
    --color-red: var(--color-red-500);
    --color-red-hover: var(--color-red-200);
    --color-green: var(--color-green-500);
    --color-green-hover: var(--color-green-300);
    --color-teal: var(--color-teal-500);
    --color-yellow: var(--color-yellow-500);
    --color-yellow-hover: var(--color-yellow-100);
    --color-orange: var(--color-orange-500);
    --color-blue: var(--color-blue-500);
    --color-blue-hover: var(--color-blue-400);
    --color-purple: var(--color-purple-500);


  --color-primary-50: var(--color-blue-50);
  --color-primary-100: var(--color-blue-100);
  --color-primary-200: var(--color-blue-200);
  --color-primary-300: var(--color-blue-300);
  --color-primary-400: var(--color-blue-400);
  --color-primary-500: var(--color-blue-500);
  --color-primary-600: var(--color-blue-600);
  --color-primary-700: var(--color-blue-700);
  --color-primary-800: var(--color-blue-800);
  --color-primary-900: var(--color-blue-900);
  --color-primary: var(--color-blue-500);
  --color-primary-hover: var(--color-blue-hover);

  --color-primary2-100: var(--color-yellow-100);
  --color-primary2-200: var(--color-yellow-200);
  --color-primary2-300: var(--color-yellow-300);
  --color-primary2-400: var(--color-yellow-400);
  --color-primary2-500: var(--color-yellow-500);
  --color-primary2-600: var(--color-yellow-600);
  --color-primary2-700: var(--color-yellow-700);
  --color-primary2-800: var(--color-yellow-800);
  --color-primary2-900: var(--color-yellow-900);
  --color-primary2: var(--color-yellow-500);
  --color-primary2-hover: var(--color-yellow-hover);


  --color-success: var(--color-green-500);
  --color-warning: var(--color-yellow-500);
  --color-error: var(--color-red-500);
  --color-info: var(--color-blue-500);

  ${generateColorInterpolations(
    "#FFFFFF",
    "#000000",
    [0, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
    options?.convertToHex,
  ).join("\n  ")}

  --color-border: var(--color-gray-200);
`;
  }

  public generateSingleColor(
    colorName: string,
    options?: Partial<PaletteOptions>,
  ): Record<string, string> {
    const config = this.colorConfigs[colorName];

    if (!config)
      throw new Error(`Color configuration not found: ${colorName}`);

    const finalOptions = {
      ...this.defaultOptions,
      ...options,
    };

    return this.generateColorPalette(config, finalOptions);
  }
}

export function generateOKLCHPalette(options?: Partial<PaletteOptions>): string {
  const generator = new OKLCHColorGenerator();

  return generator.generateCSS(options);
}

if (typeof require !== "undefined" && require.main === module) {
  const generator = new OKLCHColorGenerator();

  console.log(generator.generateCSS( {
    convertToHex: true,
  } ));
}

/**
 * Convierte valores OKLCH a código HEX
 * @param L Luminosidad (0-1)
 * @param C Croma (0-0.4 aproximadamente)
 * @param H Matiz en grados (0-360)
 * @returns Código de color en formato HEX
 */
function oklchToHex(L: number, C: number, H: number): string {
  // Convertir OKLCH a OKLAB
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  // Convertir OKLAB a LMS usando las matrices correctas
  const lPrime = L + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = L - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = L - 0.0894841775 * a - 1.2914855480 * b;
  // Convertir LMS' a LMS (elevar al cubo)
  const lLms = lPrime ** 3;
  const mLms = mPrime ** 3;
  const sLms = sPrime ** 3;
  // Convertir LMS a RGB lineal usando la matriz correcta
  const rLinear = +4.0767416621 * lLms - 3.3077115913 * mLms + 0.2309699292 * sLms;
  const gLinear = -1.2684380046 * lLms + 2.6097574011 * mLms - 0.3413193965 * sLms;
  const bLinear = -0.0041960863 * lLms - 0.7034186147 * mLms + 1.7076147010 * sLms;
  // Convertir RGB lineal a sRGB (aplicar gamma)
  const toSrgb = (c: number): number => {
    if (c >= 0.0031308)
      return 1.055 * c ** (1 / 2.4) - 0.055;
    else
      return 12.92 * c;
  };
  let r = toSrgb(rLinear);
  let g = toSrgb(gLinear);
  let bRgb = toSrgb(bLinear);

  // Clamp valores entre 0 y 1
  r = Math.max(0, Math.min(1, r));
  g = Math.max(0, Math.min(1, g));
  bRgb = Math.max(0, Math.min(1, bRgb));

  // Convertir a 0-255 y luego a HEX
  const rHex = Math.round(r * 255).toString(16)
    .padStart(2, "0");
  const gHex = Math.round(g * 255).toString(16)
    .padStart(2, "0");
  const bHex = Math.round(bRgb * 255).toString(16)
    .padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`.toUpperCase();
}

function generateColorInterpolations(
  whiteHex: string,
  blackHex: string,
  keys: number[],
  convertToHex: boolean = false,
): string[] {
  const result: string[] = [];

  // Generar las interpolaciones para cada key
  keys.forEach(key => {
    const percentage = keyToPercentage(key);
    const colorValue = interpolateColors(whiteHex, blackHex, percentage, convertToHex);

    result.push(`--color-gray-${key}: ${colorValue};`);
  } );

  return result;
}

// Función para convertir hex a RGB
function hexToRgb(hex: string): { r: number;
g: number;
b: number; } {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return {
    r,
    g,
    b,
  };
}

// Función para convertir RGB a hex
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(n).toString(16)
    .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Función para interpolar entre dos colores
function interpolateColors(
  white: string,
  black: string,
  percentage: number,
  convertToHex: boolean,
): string {
  if (!convertToHex) {
    // Usar color-mix CSS
    if (percentage === 0)
      return white;
    else if (percentage === 100)
      return black;
    else
      return `color-mix(in srgb, ${white}, ${black} ${percentage}%)`;
  } else {
    // Convertir a hex directamente
    const whiteRgb = hexToRgb(white);
    const blackRgb = hexToRgb(black);
    const factor = percentage / 100;
    const r = whiteRgb.r + (blackRgb.r - whiteRgb.r) * factor;
    const g = whiteRgb.g + (blackRgb.g - whiteRgb.g) * factor;
    const b = whiteRgb.b + (blackRgb.b - whiteRgb.b) * factor;

    return rgbToHex(r, g, b);
  }
}

// Función para convertir key a porcentaje
function keyToPercentage(key: number): number {
  if (key === 0)
    return 0;

  if (key === 1000)
    return 100;

  if (key === 25)
    return 2.5;

  if (key === 50)
    return 5;

  // Para el resto, dividir por 10 (100 -> 10%, 200 -> 20%, etc.)
  return key / 10;
}
