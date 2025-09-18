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

      palette[`--color-${config.name}-${level}`] = `oklch(${l}% ${c} ${h})`;
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

    css += this.generateSemanticAliases();
    css += "}\n";

    return css;
  }

  private generateSemanticAliases(): string {
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
    --color-blue-hover: var(--color-blue-300);
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

  --color-black: #000000;
  --color-white: #ffffff;

  --color-gray-0: var(--color-white);
  --color-gray-25: color-mix(in srgb, var(--color-white), var(--color-black) 2.5%);
  --color-gray-50: color-mix(in srgb, var(--color-white), var(--color-black) 5%);
  --color-gray-100: color-mix(in srgb, var(--color-white), var(--color-black) 10%);
  --color-gray-200: color-mix(in srgb, var(--color-white), var(--color-black) 20%);
  --color-gray-300: color-mix(in srgb, var(--color-white), var(--color-black) 30%);
  --color-gray-400: color-mix(in srgb, var(--color-white), var(--color-black) 40%);
  --color-gray-500: color-mix(in srgb, var(--color-white), var(--color-black) 50%);
  --color-gray-600: color-mix(in srgb, var(--color-white), var(--color-black) 60%);
  --color-gray-700: color-mix(in srgb, var(--color-white), var(--color-black) 70%);
  --color-gray-800: color-mix(in srgb, var(--color-white), var(--color-black) 80%);
  --color-gray-900: color-mix(in srgb, var(--color-white), var(--color-black) 90%);
  --color-gray-1000: var(--color-black);

  --color-surface: var(--color-gray-50);
  --color-surface-dark: var(--color-gray-100);
  --color-border: var(--color-gray-200);
  --color-text: var(--color-gray-900);
  --color-text-muted: var(--color-gray-600);
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

  console.log(generator.generateCSS());
}
