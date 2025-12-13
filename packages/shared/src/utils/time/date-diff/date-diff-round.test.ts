import { DateDiff } from "./date-diff";
import { dateDiffRound } from "./date-diff-round";

const positiveBase: DateDiff = {
  years: 0,
  months: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  ms: 0,
  sign: 1,
};
const zeroBase: DateDiff = {
  years: 0,
  months: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  ms: 0,
  sign: 0,
};

describe("dateDiffRound", () => {
  it("should round seconds up if milliseconds are 500 or more", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      seconds: 5,
      ms: 500,
    };
    const expected: DateDiff = {
      ...positiveBase,
      seconds: 6,
      ms: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should round seconds down if milliseconds are less than 500", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      seconds: 5,
      ms: 499,
    };
    const expected: DateDiff = {
      ...positiveBase,
      seconds: 5,
      ms: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should round minutes up if seconds are 30 or more (and minutes >= 1)", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      minutes: 1,
      seconds: 30,
    };
    const expected: DateDiff = {
      ...positiveBase,
      minutes: 2,
      seconds: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should round minutes down if seconds are less than 30 (and minutes >= 1)", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      minutes: 1,
      seconds: 29,
    };
    const expected: DateDiff = {
      ...positiveBase,
      minutes: 1,
      seconds: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should round hours up if minutes are 30 or more (and hours >= 1)", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      hours: 1,
      minutes: 30,
    };
    const expected: DateDiff = {
      ...positiveBase,
      hours: 2,
      minutes: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should round hours down if minutes are less than 30 (and hours >= 1)", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      hours: 1,
      minutes: 29,
    };
    const expected: DateDiff = {
      ...positiveBase,
      hours: 1,
      minutes: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should round days up if hours are 12 or more (and days >= 1)", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      days: 1,
      hours: 12,
    };
    const expected: DateDiff = {
      ...positiveBase,
      days: 2,
      hours: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should round days down if hours are less than 12 (and days >= 1)", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      days: 1,
      hours: 11,
      minutes: 59,
      seconds: 59,
      ms: 999,
    };
    const expected: DateDiff = {
      ...positiveBase,
      days: 1,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should round months up if days are 15 or more (and months >= 1)", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      months: 1,
      days: 15,
    };
    const expected: DateDiff = {
      ...positiveBase,
      months: 2,
      days: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should round months down if days are less than 15 (and months >= 1)", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      months: 1,
      days: 14,
      hours: 23,
      minutes: 59,
      seconds: 59,
      ms: 999,
    };
    const expected: DateDiff = {
      ...positiveBase,
      months: 1,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should round years up if months are 6 or more (and years >= 1)", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      years: 1,
      months: 6,
    };
    const expected: DateDiff = {
      ...positiveBase,
      years: 2,
      months: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should round years down if months are less than 6 (and years >= 1)", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      years: 1,
      months: 5,
      days: 30,
    };
    const expected: DateDiff = {
      ...positiveBase,
      years: 1,
      months: 0,
      days: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should handle propagation from seconds to minutes (minutes >= 1)", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      minutes: 1,
      seconds: 29,
      ms: 500,
    };
    const expected: DateDiff = {
      ...positiveBase,
      minutes: 1,
      seconds: 0,
      ms: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should handle full propagation from ms to years", () => {
    const dateDiff: DateDiff = {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      ms: 500,
      sign: 1,
    };
    const expected: DateDiff = {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
      ms: 0,
      sign: 1,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should select years rounding if years >= 1", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      years: 1,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      ms: 0,
    };
    const expected: DateDiff = {
      ...positiveBase,
      years: 1,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      ms: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should select months rounding if months >= 1 and years = 0", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      months: 1,
      days: 0,
    };
    const expected: DateDiff = {
      ...positiveBase,
      months: 1,
      days: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should select days rounding if days >= 1 and months = 0 and years = 0", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      days: 1,
      hours: 0,
    };
    const expected: DateDiff = {
      ...positiveBase,
      days: 1,
      hours: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should select hours rounding if hours >= 1 and days = 0, months = 0, years = 0", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      hours: 1,
      minutes: 0,
    };
    const expected: DateDiff = {
      ...positiveBase,
      hours: 1,
      minutes: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it(
    "should select minutes rounding if minutes >= 1 and hours = 0, days = 0, months = 0, years = 0",
    () => {
      const dateDiff: DateDiff = {
        ...positiveBase,
        minutes: 1,
        seconds: 0,
      };
      const expected: DateDiff = {
        ...positiveBase,
        minutes: 1,
        seconds: 0,
      };

      expect(dateDiffRound(dateDiff)).toEqual(expected);
    },
  );

  it(
    "should select seconds rounding if minutes = 0, hours = 0, days = 0, months = 0, years = 0",
    () => {
      const dateDiff: DateDiff = {
        ...positiveBase,
        seconds: 1,
        ms: 500,
      };
      const expected: DateDiff = {
        ...positiveBase,
        seconds: 2,
        ms: 0,
      };

      expect(dateDiffRound(dateDiff)).toEqual(expected);
    },
  );

  it("should not round up to the next unit if the current unit is 0 and sub-unit rounds up", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      seconds: 29,
      ms: 500,
    };
    const expected: DateDiff = {
      ...positiveBase,
      seconds: 30,
      ms: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should handle sign 0 and remain sign 0 if all time units are 0", () => {
    const dateDiff: DateDiff = zeroBase;
    const expected: DateDiff = zeroBase;

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );
} );

describe("dateDiffRound ticks", () => {
  it("should round to nearest half hour using ticks: 0.5", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      hours: 1,
      minutes: 20, // 1h 20m = 1.33h
    };
    // Con tick 0.5, 1.33 está más cerca de 1.5 que de 1.0
    // 1.5h = 1h 30m
    const expected: DateDiff = {
      ...positiveBase,
      hours: 1,
      minutes: 30,
      seconds: 0,
    };
    const result = dateDiffRound(dateDiff, {
      hours: {
        ticks: 0.5,
      },
    } );

    expect(result).toEqual(expected);
  } );

  it("should round to nearest 15 minutes using ticks: 15", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      minutes: 10,
    };
    // 10 está más cerca de 15 que de 0
    const expected: DateDiff = {
      ...positiveBase,
      minutes: 15,
    };
    const result = dateDiffRound(dateDiff, {
      minutes: {
        ticks: 15,
      },
    } );

    expect(result).toEqual(expected);
  } );

  it("should round down to 0 minutes if closer using ticks: 15", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      minutes: 7, // 7 es menor que 7.5 (mitad de 15), baja a 0
    };
    const expected: DateDiff = {
      ...positiveBase,
      minutes: 0,
    };
    const result = dateDiffRound(dateDiff, {
      minutes: {
        ticks: 15,
      },
    } );

    expect(result).toEqual(expected);
  } );

  it("should handle mixed ticks (days 0.5)", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      days: 5,
      hours: 10,
    };
    // 5d 10h = 5.41d.
    // Tick 0.5.
    // 5.41 está más cerca de 5.5 que de 5.0?
    // 5.41 / 0.5 = 10.82 -> Round 11.
    // 11 * 0.5 = 5.5d
    // 5.5d = 5d 12h.
    const expected: DateDiff = {
      ...positiveBase,
      days: 5,
      hours: 12,
    };
    const result = dateDiffRound(dateDiff, {
      days: {
        ticks: 0.5,
      },
    } );

    expect(result).toEqual(expected);
  } );

  it("should round 11 months and 30 days to 1 year (tick month=1)", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      days: 30,
      months: 11,
    };
    const expected: DateDiff = {
      ...positiveBase,
      years: 1,
      months: 0,
    };
    const result = dateDiffRound(dateDiff, {
      months: {
        ticks: 1,
      },
    } );

    expect(result).toEqual(expected);
  } );

  it("should round 59 mins and 59 seconds to 1 hour (tick min=1)", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      minutes: 59,
      seconds: 59,
    };
    const expected: DateDiff = {
      ...positiveBase,
      hours: 1,
      minutes: 0,
      seconds: 0,
    };
    const result = dateDiffRound(dateDiff, {
      minutes: {
        ticks: 1,
      },
    } );

    expect(result).toEqual(expected);
  } );

  it("should round 11 months and 30 days to 1 year (ripple months->years)", () => {
    // Caso reportado: roundMonths suma 1 mes (total 12) -> debe convertir a 1 año
    const dateDiff: DateDiff = {
      ...positiveBase,
      months: 11,
      days: 30,
    };
    const expected: DateDiff = {
      ...positiveBase,
      years: 1,
      months: 0,
      days: 0,
    };
    // Nota: Pasamos el config aunque la implementación hardcoded ya lo soluciona
    const result = dateDiffRound(dateDiff, {
      months: {
        ticks: 1,
      },
    } );

    expect(result).toEqual(expected);
  } );

  it("should round 59 mins and 59 seconds to 1 hour (ripple minutes->hours)", () => {
    // Caso reportado: 59m 59s -> 59m + 1m = 60m -> debe convertir a 1h
    const dateDiff: DateDiff = {
      ...positiveBase,
      minutes: 59,
      seconds: 59,
    };
    const expected: DateDiff = {
      ...positiveBase,
      hours: 1,
      minutes: 0,
      seconds: 0,
    };
    const result = dateDiffRound(dateDiff, {
      minutes: {
        ticks: 1,
      },
    } );

    expect(result).toEqual(expected);
  } );

  it("should round 23 hours and 59 minutes to 1 day (ripple hours->days)", () => {
    // 23h 59m -> 23h + 1h = 24h -> debe convertir a 1d
    const dateDiff: DateDiff = {
      ...positiveBase,
      hours: 23,
      minutes: 59,
    };
    const expected: DateDiff = {
      ...positiveBase,
      days: 1,
      hours: 0,
      minutes: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should round 59 seconds and 999 ms to 1 minute (ripple seconds->minutes)", () => {
    // 59s 999ms -> 60s -> 1m
    const dateDiff: DateDiff = {
      ...positiveBase,
      seconds: 59,
      ms: 999,
    };
    const expected: DateDiff = {
      ...positiveBase,
      minutes: 1,
      seconds: 0,
      ms: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  // --- Casos de Redondeo "Down" Correcto (Sin afectar unidad superior inválida) ---
  it("should round days down correctly without overflowing incorrectly", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      days: 1,
      hours: 11,
      minutes: 59,
    };
    const expected: DateDiff = {
      ...positiveBase,
      days: 1,
      hours: 0,
      minutes: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should round days down (remain same) if hours < 12 after sub-unit cleanup", () => {
    // 1d 11h 29m. roundMinutes -> 11h 29m. roundHours -> 11h. roundDays -> 1d.
    const dateDiff: DateDiff = {
      ...positiveBase,
      days: 1,
      hours: 11,
      minutes: 29,
    };
    const expected: DateDiff = {
      ...positiveBase,
      days: 1,
      hours: 0,
      minutes: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  // --- Casos de Lógica Base (Unitarios) ---
  it("should round seconds up if milliseconds are 500 or more", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      seconds: 5,
      ms: 500,
    };
    const expected: DateDiff = {
      ...positiveBase,
      seconds: 6,
      ms: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should round minutes up if seconds are 30 or more", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      minutes: 1,
      seconds: 30,
    };
    const expected: DateDiff = {
      ...positiveBase,
      minutes: 2,
      seconds: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should round hours up if minutes are 30 or more", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      hours: 1,
      minutes: 30,
    };
    const expected: DateDiff = {
      ...positiveBase,
      hours: 2,
      minutes: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should round days up if hours are 12 or more", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      days: 1,
      hours: 12,
    };
    const expected: DateDiff = {
      ...positiveBase,
      days: 2,
      hours: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should round months up if days are 15 or more", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      months: 1,
      days: 15,
    };
    const expected: DateDiff = {
      ...positiveBase,
      months: 2,
      days: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  it("should round years up if months are 6 or more", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      years: 1,
      months: 6,
    };
    const expected: DateDiff = {
      ...positiveBase,
      years: 2,
      months: 0,
    };

    expect(dateDiffRound(dateDiff)).toEqual(expected);
  } );

  // --- Casos de Selección de Unidad Principal ---
  it("should select years rounding if years >= 1", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      years: 1,
    };

    expect(dateDiffRound(dateDiff).years).toBe(1);
  } );

  it("should select months rounding if months >= 1", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      months: 1,
    };

    expect(dateDiffRound(dateDiff).months).toBe(1);
  } );

  it("should select minutes rounding if minutes >= 1", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      minutes: 1,
    };

    expect(dateDiffRound(dateDiff).minutes).toBe(1);
  } );

  it("should select seconds rounding if only seconds/ms exist", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      seconds: 1,
      ms: 500,
    };

    expect(dateDiffRound(dateDiff).seconds).toBe(2);
  } );

  it("should handle sign 0 and remain sign 0 if all time units are 0", () => {
    expect(dateDiffRound(zeroBase)).toEqual(zeroBase);
  } );

  it("should respect explicit configuration strictly (months)", () => {
    // El caso que te fallaba
    const dateDiff: DateDiff = {
      ...positiveBase,
      years: 1,
      months: 4,
      days: 10,
      hours: 16, // Todo esto es ruido que debe desaparecer
    };
    const expected: DateDiff = {
      ...positiveBase,
      years: 1,
      months: 4, // 4 + 10/30 = 4.33 -> 4
      days: 0,
    };

    expect(dateDiffRound(dateDiff, {
      months: {
        ticks: 1,
      },
    } )).toEqual(expected);
  } );

  it("should propagate overflow to higher unit even in explicit mode", () => {
    const dateDiff: DateDiff = {
      ...positiveBase,
      years: 1,
      months: 11,
      days: 20, // 20 días casi hacen otro mes
    };
    // 11m + 0.66m = 11.66m -> 12m -> +1 año
    const expected: DateDiff = {
      ...positiveBase,
      years: 2,
      months: 0,
      days: 0,
    };

    expect(dateDiffRound(dateDiff, {
      months: {
        ticks: 1,
      },
    } )).toEqual(expected);
  } );
} );
