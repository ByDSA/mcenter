export function getDateStr(date: Date) {
  return `${getWeekDay(date.getDay())}, ${date.getDate().toString()
    .padStart(2, "0")} / ${(date.getMonth() + 1).toString()
    .padStart(2, "0")} / ${date.getFullYear()}`;
}

function getWeekDay(weekDay: number): string {
  switch (weekDay) {
    case 0:
      return "Domingo";
    case 1:
      return "Lunes";
    case 2:
      return "Martes";
    case 3:
      return "Miércoles";
    case 4:
      return "Jueves";
    case 5:
      return "Viernes";
    case 6:
      return "Sábado";
    default:
      throw new Error(`Invalid weekDay: ${weekDay}`);
  }
}
