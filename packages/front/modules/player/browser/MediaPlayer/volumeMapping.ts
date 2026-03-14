/**
 * Mapeo entre la posición visual normalizada del slider [0, 1]
 * y el volumen real [0, 1].
 *
 * Modificar estas funciones para cambiar el comportamiento de
 * TODOS los sliders de volumen (bottom player y fullscreen Effects).
 */

/** Posición visual normalizada [0,1] → volumen real [0,1] */
export const visualToVolume = (visual: number): number => visual;

/** Volumen real [0,1] → posición visual normalizada [0,1] */
export const volumeToVisual = (volume: number): number => volume;
