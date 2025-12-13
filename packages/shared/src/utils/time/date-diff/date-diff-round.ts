/* eslint-disable daproj/max-len */
import { DateDiff } from "./date-diff";

// Definimos la configuración opcional
export interface RoundConfig {
  ticks?: number; // El paso del redondeo (ej: 1, 0.5, 15, etc.)
}

export interface DateDiffRoundOptions {
  years?: RoundConfig;
  months?: RoundConfig;
  days?: RoundConfig;
  hours?: RoundConfig;
  minutes?: RoundConfig;
  seconds?: RoundConfig;
}

/**
 * Función genérica para redondear un valor a un "tick" específico.
 * Ej: valor 1.33, tick 0.5 -> 1.5
 * Ej: valor 12, tick 5 -> 10
 */
function snapToTick(value: number, tick: number): number {
  if (tick === 0)
    return value;

  return Math.round(value / tick) * tick;
}

// Resetea las unidades menores a 0
function clearLowerUnits(dateDiff: DateDiff, fromUnit: keyof DateDiff) {
  // Recorremos de menor a mayor, si encontramos la unidad, paramos (porque esa se preserva)
  // Pero aquí queremos limpiar las menores a "fromUnit".
  // Es más fácil hacerlo explícito:
  if (fromUnit === "years") {
    dateDiff.months = 0;
    dateDiff.days = 0;
    dateDiff.hours = 0;
    dateDiff.minutes = 0;
    dateDiff.seconds = 0;
    dateDiff.ms = 0;
  }

  if (fromUnit === "months") {
    dateDiff.days = 0;
    dateDiff.hours = 0;
    dateDiff.minutes = 0;
    dateDiff.seconds = 0;
    dateDiff.ms = 0;
  }

  if (fromUnit === "days") {
    dateDiff.hours = 0;
    dateDiff.minutes = 0;
    dateDiff.seconds = 0;
    dateDiff.ms = 0;
  }

  if (fromUnit === "hours") {
    dateDiff.minutes = 0;
    dateDiff.seconds = 0;
    dateDiff.ms = 0;
  }

  if (fromUnit === "minutes") {
    dateDiff.seconds = 0;
    dateDiff.ms = 0;
  }

  if (fromUnit === "seconds")
    dateDiff.ms = 0;
}

function propagateOverflow(dateDiff: DateDiff, value: number, limit: number, nextUnit: keyof DateDiff) {
  if (value >= limit) {
    const extra = Math.floor(value / limit);

    dateDiff[nextUnit] += extra;

    return value % limit;
  }

  return value;
}

// --- FUNCIONES DE REDONDEO ACTUALIZADAS PARA GESTIONAR REBALSE ---
function roundSeconds(dateDiff: DateDiff, config?: RoundConfig): void {
  const tick = config?.ticks ?? 1;
  const totalSeconds = dateDiff.seconds + (dateDiff.ms / 1000);
  const rounded = snapToTick(totalSeconds, tick);

  // Asignamos y manejamos rebalse (60s -> 1m)
  dateDiff.seconds = rounded;
  dateDiff.ms = 0;

  // Propagación hacia arriba si nos pasamos de 60
  dateDiff.seconds = propagateOverflow(dateDiff, dateDiff.seconds, 60, "minutes");
}

function roundMinutes(dateDiff: DateDiff, config?: RoundConfig): void {
  const tick = config?.ticks ?? 1;
  const totalMinutes = dateDiff.minutes + (dateDiff.seconds / 60) + (dateDiff.ms / 60000);
  const rounded = snapToTick(totalMinutes, tick);

  dateDiff.minutes = Math.floor(rounded);

  // Manejo de decimales (si tick es 0.5, etc)
  const remainderMinutes = rounded - dateDiff.minutes;

  if (remainderMinutes > 0) {
    dateDiff.seconds = Math.round(remainderMinutes * 60);
    dateDiff.ms = 0;
  } else
    clearLowerUnits(dateDiff, "minutes");

  // Propagación (60m -> 1h)
  dateDiff.minutes = propagateOverflow(dateDiff, dateDiff.minutes, 60, "hours");
}

function roundHours(dateDiff: DateDiff, config?: RoundConfig): void {
  const tick = config?.ticks ?? 1;
  const totalHours = dateDiff.hours + (dateDiff.minutes / 60) + (dateDiff.seconds / 3600);
  const rounded = snapToTick(totalHours, tick);

  dateDiff.hours = Math.floor(rounded);

  const remainder = rounded - dateDiff.hours;

  if (remainder > 0) {
    dateDiff.minutes = Math.round(remainder * 60);
    clearLowerUnits(dateDiff, "minutes"); // Limpiamos lo que esté debajo de mins
  } else
    clearLowerUnits(dateDiff, "hours");

  // Propagación (24h -> 1d)
  dateDiff.hours = propagateOverflow(dateDiff, dateDiff.hours, 24, "days");
}

function roundDays(dateDiff: DateDiff, config?: RoundConfig): void {
  const tick = config?.ticks ?? 1;
  // Simplificación estándar: 1 año = 12 meses, 1 mes = 30 días, etc. para redondeo
  const totalDays = dateDiff.days + (dateDiff.hours / 24) + (dateDiff.minutes / 1440);
  const rounded = snapToTick(totalDays, tick);

  dateDiff.days = Math.floor(rounded);

  const remainder = rounded - dateDiff.days;

  if (remainder > 0) {
    dateDiff.hours = Math.round(remainder * 24);
    clearLowerUnits(dateDiff, "hours");
  } else
    clearLowerUnits(dateDiff, "days");

  // Propagación (30d -> 1m) - APROXIMADO
  // Nota: DateDiff puro no sabe de meses de 28/31 días, usamos 30 como estándar de redondeo
  dateDiff.days = propagateOverflow(dateDiff, dateDiff.days, 30, "months");
}

function roundMonths(dateDiff: DateDiff, config?: RoundConfig): void {
  const tick = config?.ticks ?? 1;
  const totalMonths = dateDiff.months + (dateDiff.days / 30);
  const rounded = snapToTick(totalMonths, tick);

  dateDiff.months = Math.floor(rounded);

  const remainder = rounded - dateDiff.months;

  if (remainder > 0) {
    dateDiff.days = Math.round(remainder * 30);
    clearLowerUnits(dateDiff, "days");
  } else
    clearLowerUnits(dateDiff, "months");

  // Propagación (12m -> 1y)
  dateDiff.months = propagateOverflow(dateDiff, dateDiff.months, 12, "years");
}

function roundYears(dateDiff: DateDiff, config?: RoundConfig): void {
  const tick = config?.ticks ?? 1;
  const totalYears = dateDiff.years + (dateDiff.months / 12);
  const rounded = snapToTick(totalYears, tick);

  dateDiff.years = Math.floor(rounded);

  const remainder = rounded - dateDiff.years;

  if (remainder > 0) {
    dateDiff.months = Math.round(remainder * 12);
    clearLowerUnits(dateDiff, "months");
  } else
    clearLowerUnits(dateDiff, "years");
}

// --- LÓGICA PRINCIPAL CORREGIDA ---
export function dateDiffRound(dateDiff: DateDiff, options?: DateDiffRoundOptions): DateDiff {
  // 1. MODO EXPLÍCITO: Si el usuario pasa configuración, respetamos la unidad más alta configurada.
  if (options && Object.keys(options).length > 0) {
    // Verificamos en orden descendente. Si hay configuración para una unidad, esa es la "unidad de corte".
    // Al ejecutar roundX, esa función absorberá las unidades inferiores, pero NO tocará las superiores.
    if (options.years) {
      roundYears(dateDiff, options.years);

      return dateDiff;
    }

    if (options.months) {
      roundMonths(dateDiff, options.months);

      return dateDiff;
    }

    if (options.days) {
      roundDays(dateDiff, options.days);

      return dateDiff;
    }

    if (options.hours) {
      roundHours(dateDiff, options.hours);

      return dateDiff;
    }

    if (options.minutes) {
      roundMinutes(dateDiff, options.minutes);

      return dateDiff;
    }

    if (options.seconds) {
      roundSeconds(dateDiff, options.seconds);

      return dateDiff;
    }
  }

  // 2. MODO AUTOMÁTICO (Fallback): Si no hay opciones, mantenemos el comportamiento de "Resumen"
  // Buscamos la unidad más grande que tenga valor y colapsamos todo ahí.
  if (dateDiff.years >= 1)
    roundYears(dateDiff);
  else if (dateDiff.months >= 1)
    roundMonths(dateDiff);
  else if (dateDiff.days >= 1)
    roundDays(dateDiff);
  else if (dateDiff.hours >= 1)
    roundHours(dateDiff);
  else if (dateDiff.minutes >= 1)
    roundMinutes(dateDiff);
  else
    roundSeconds(dateDiff);

  return dateDiff;
}
