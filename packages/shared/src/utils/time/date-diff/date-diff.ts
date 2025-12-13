export type DateDiff = {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    ms: number;
    sign: -1 | 0 | 1;
};

export function calculateDateDifference(date: Date, now: Date = new Date()): DateDiff {
  // 1. Determinar el orden y el signo
  const isDateGreater = date.getTime() > now.getTime();
  // eslint-disable-next-line no-nested-ternary
  const sign = isDateGreater
    ? 1
    : (
      date.getTime() < now.getTime()
        ? -1
        : 0
    );

  if (sign === 0) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      ms: 0,
      sign: 0,
    };
  }

  // Usaremos 'later' y 'earlier' para simplificar la lógica del cálculo
  let later = isDateGreater ? new Date(date.getTime()) : new Date(now.getTime());
  let earlier = isDateGreater ? new Date(now.getTime()) : new Date(date.getTime());
  // Inicializar el resultado
  let years = 0;
  let months = 0;
  let days = 0;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let ms = 0;

  // --- CÁLCULO DE AÑOS Y MESES (Lógica "día a día") ---
  // 1. Calcular AÑOS
  while (
    later.getFullYear() > earlier.getFullYear() || (
      later.getFullYear() === earlier.getFullYear() && (later.getMonth() > earlier.getMonth()
      || (later.getMonth() === earlier.getMonth() && later.getDate() >= earlier.getDate()))
    )
  ) {
    // Clonar la fecha anterior para simular el avance de un año
    const testDate = new Date(earlier.getTime());

    testDate.setFullYear(earlier.getFullYear() + 1);

    // Si al avanzar un año, no hemos sobrepasado la fecha 'later', incrementamos los años
    if (testDate.getTime() <= later.getTime()) {
      years++;
      earlier.setFullYear(earlier.getFullYear() + 1); // Avanzar 'earlier' un año
    } else
      break; // Salir del bucle de años si el siguiente paso lo sobrepasa
  }

  // 2. Calcular MESES
  while (
    later.getFullYear() > earlier.getFullYear() || later.getMonth() > earlier.getMonth()
    || (later.getMonth() === earlier.getMonth() && later.getDate() >= earlier.getDate())
  ) {
    // Clonar la fecha anterior para simular el avance de un mes
    const testDate = new Date(earlier.getTime());

    // setMonth(earlier.getMonth() + 1) maneja correctamente los saltos de año
    testDate.setMonth(earlier.getMonth() + 1);

    // Si al avanzar un mes, no hemos sobrepasado la fecha 'later', incrementamos los meses
    if (testDate.getTime() <= later.getTime()) {
      months++;
      earlier.setMonth(earlier.getMonth() + 1); // Avanzar 'earlier' un mes
    } else
      break; // Salir del bucle de meses si el siguiente paso lo sobrepasa
  }

  let remainingMs = later.getTime() - earlier.getTime();
  // 3. Calcular DÍAS
  // Los milisegundos en un día (1000 * 60 * 60 * 24)
  const msInDay = 86400000;

  days = Math.floor(remainingMs / msInDay);
  remainingMs %= msInDay;

  // 4. Calcular HORAS
  // Los milisegundos en una hora (1000 * 60 * 60)
  const msInHour = 3600000;

  hours = Math.floor(remainingMs / msInHour);
  remainingMs %= msInHour;

  // 5. Calcular MINUTOS
  // Los milisegundos en un minuto (1000 * 60)
  const msInMinute = 60000;

  minutes = Math.floor(remainingMs / msInMinute);
  remainingMs %= msInMinute;

  // 6. Calcular SEGUNDOS
  // Los milisegundos en un segundo (1000)
  const msInSecond = 1000;

  seconds = Math.floor(remainingMs / msInSecond);
  remainingMs %= msInSecond;

  // 7. Milisegundos restantes
  ms = remainingMs;

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    ms,
    sign,
  };
}
