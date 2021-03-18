
export enum Month {
    JANUARY,
    FEBRARY,
    MARCH,
    APRIL,
    MAY,
    JUNE,
    JULY,
    AUGUST,
    SEPTEMBER,
    OCTOBER,
    NOVEMBER,
    DECEMBER
}

export enum Day {
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6,
    SUNDAY = 0
}

export function destructDateUTC(date: Date = new Date()) {
    const day = date.getUTCDate();
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    const dweek = date.getUTCDay();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();

    return {
        day, month, year, hours, minutes, seconds, dweek
    }
}

export function destructDate(date: Date = new Date()) {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const dweek = date.getDay();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    return {
        day, month, year, hours, minutes, seconds, dweek
    }
}


export function isSpecialDay(date = new Date()) {
    const { month, day } = destructDate();
    if (month == 12 && day == 25 || month == 1 && day == 6)
        return true;
    else
        return false;
}

export function isSpecialNight(date = new Date()) {
    const { month, day } = destructDate();
    if (month == 12 && day == 24)
        return true;
    else
        return false;
}

export function isFestivo(date = new Date()) {
    const { month, day } = destructDate(date);
    if (month == 12 && (day == 6 || day == 8 || day == 25) || month == 1 && (day == 1 || day == 6))
        return true;
    else
        return false;
}

export function isLaborable(date = new Date()) {
    const { dweek } = destructDate(date);

    return !isFestivo() && isWeekDay(date);
}

export function isTomorrowLaborable(date = new Date()) {
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return isLaborable(tomorrow);
}

export function isWeekDay(date = new Date()) {
    const { dweek } = destructDate(date);

    let isWeekDay;
    switch (dweek) {
        case Day.SATURDAY:
        case Day.SUNDAY:
            isWeekDay = false;
            break;
        default:
            isWeekDay = true;
    }

    return isWeekDay;
}


export function utcToLocal(date: Date) {
    let result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}

export function daysBetween(startDate: Date, endDate: Date): number {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const timeStartDate = utcToLocal(startDate).getTime()
    const timeEndDate = utcToLocal(endDate).getTime()
    return (timeEndDate - timeStartDate) / millisecondsPerDay;
}