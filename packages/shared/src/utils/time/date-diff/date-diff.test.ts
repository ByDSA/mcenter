import { calculateDateDifference } from "./date-diff";

describe("calculateDateDifference", () => {
  const createUtcDate = (year: number, month: number, day: number, hour: number =
  0, minute: number = 0, second: number = 0, ms: number = 0) => {
    return new Date(year, month, day, hour, minute, second, ms);
  };

  it("debe devolver cero en todos los campos y signo 0 si las fechas son idénticas", () => {
    const date = createUtcDate(2025, 5, 15, 10, 30, 0, 0);
    const now = createUtcDate(2025, 5, 15, 10, 30, 0, 0);
    const result = calculateDateDifference(date, now);

    expect(result).toEqual( {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      ms: 0,
      sign: 0,
    } );
  } );

  it(
    "debe calcular 1 mes exacto del día 4 al día 4, independientemente de la duración del mes",
    () => {
      const date = createUtcDate(2025, 1, 4);
      const now = createUtcDate(2025, 0, 4);
      const result = calculateDateDifference(date, now);

      expect(result.years).toBe(0);
      expect(result.months).toBe(1);
      expect(result.days).toBe(0);
    },
  );

  it("debe calcular 1 mes y 1 día (del 4 al 5 del mes siguiente)", () => {
    const date = createUtcDate(2025, 0, 4);
    const now = createUtcDate(2025, 1, 5);
    const result = calculateDateDifference(date, now);

    expect(result.years).toBe(0);
    expect(result.months).toBe(1);
    expect(result.days).toBe(1);
    expect(result.sign).toBe(-1);
  } );

  it("debe calcular 30 días y no un mes, porque es menos de un mes", () => {
    const date = createUtcDate(2025, 0, 4);
    const now = createUtcDate(2025, 1, 3);
    const result = calculateDateDifference(date, now);

    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
    expect(result.days).toBe(30);
    expect(result.sign).toBe(-1);
  } );

  it("debe calcular 1 año exacto (del 1/Mar/2024 al 1/Mar/2025), ignorando el bisiesto", () => {
    const date = createUtcDate(2024, 2, 1);
    const now = createUtcDate(2025, 2, 1);
    const result = calculateDateDifference(date, now);

    expect(result.years).toBe(1);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
  } );

  it("debe manejar el 29 de febrero bisiesto correctamente", () => {
    const date = createUtcDate(2024, 1, 29);
    const now = createUtcDate(2025, 1, 28);
    const result = calculateDateDifference(date, now);

    expect(result.years).toBe(0);
    expect(result.months).toBe(11);
    expect(result.days).toBe(30);
    expect(result.sign).toBe(-1);
  } );

  it("debe calcular una diferencia completa y compleja", () => {
    const date = createUtcDate(2022, 9, 20, 10, 30, 15, 500);
    const now = createUtcDate(2025, 5, 25, 14, 50, 45, 900);
    const result = calculateDateDifference(date, now);

    expect(result.years).toBe(2);
    expect(result.months).toBe(8);
    expect(result.days).toBe(5);
    expect(result.hours).toBe(4);
    expect(result.minutes).toBe(20);
    expect(result.seconds).toBe(30);
    expect(result.ms).toBe(400);
    expect(result.sign).toBe(-1);
  } );

  it("debe calcular solo tiempo y milisegundos si es el mismo día", () => {
    const date = createUtcDate(2025, 5, 15, 10, 0, 0, 100);
    const now = createUtcDate(2025, 5, 15, 11, 30, 1, 200);
    const result = calculateDateDifference(date, now);

    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
    expect(result.hours).toBe(1);
    expect(result.minutes).toBe(30);
    expect(result.seconds).toBe(1);
    expect(result.ms).toBe(100);
    expect(result.sign).toBe(-1);
  } );

  it("debe devolver signo 1 si date es mayor que now", () => {
    const date = createUtcDate(2025, 5, 16);
    const now = createUtcDate(2025, 5, 15);
    const result = calculateDateDifference(date, now);

    expect(result.sign).toBe(1);
  } );

  it("debe calcular la diferencia a través de un cambio de año", () => {
    const date = createUtcDate(2024, 11, 31, 23, 0, 0, 0);
    const now = createUtcDate(2025, 0, 1, 1, 0, 0, 0);
    const result = calculateDateDifference(date, now);

    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
    expect(result.hours).toBe(2);
    expect(result.sign).toBe(-1);
  } );
} );
