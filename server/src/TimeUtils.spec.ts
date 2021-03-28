import { Day, daysBetween, destructDate, destructDateUTC, getTimestamp, isLaborable, isTomorrowLaborable, Month, utcToLocal } from "./TimeUtils";

it('month enum', () => {
    expect(Month.JANUARY).toBe(0);
    expect(Month.FEBRUARY).toBe(1);
    expect(Month.MARCH).toBe(2);
    expect(Month.APRIL).toBe(3);
    expect(Month.MAY).toBe(4);
    expect(Month.JUNE).toBe(5);
    expect(Month.JULY).toBe(6);
    expect(Month.AUGUST).toBe(7);
    expect(Month.SEPTEMBER).toBe(8);
    expect(Month.OCTOBER).toBe(9);
    expect(Month.NOVEMBER).toBe(10);
    expect(Month.DECEMBER).toBe(11);
});
it('day enum', () => {
    expect(Day.MONDAY).toBe(1);
    expect(Day.TUESDAY).toBe(2);
    expect(Day.WEDNESDAY).toBe(3);
    expect(Day.THURSDAY).toBe(4);
    expect(Day.FRIDAY).toBe(5);
    expect(Day.SATURDAY).toBe(6);
    expect(Day.SUNDAY).toBe(0);
});

it('destruct date UTC 0', () => {
    const { year, month, day, hours, minutes, seconds, dweek } = destructDateUTC(new Date(0));

    expect(year).toBe(1970);
    expect(month).toBe(Month.JANUARY);
    expect(day).toBe(1);
    expect(hours).toBe(0);
    expect(minutes).toBe(0);
    expect(seconds).toBe(0);
    expect(dweek).toBe(Day.THURSDAY);
});

const testDate = new Date(1993, Month.MAY, 21, 8, 34, 0);
const testDate2 = new Date(1993, Month.MAY, 23, 8, 34, 0);
it('destruct testDate UTC', () => {
    const { year, month, day, hours, minutes, seconds, dweek } = destructDateUTC(testDate);

    expect(year).toBe(1993);
    expect(month).toBe(Month.MAY);
    expect(day).toBe(21);
    expect(hours).toBe(6);
    expect(minutes).toBe(34);
    expect(seconds).toBe(0);
    expect(dweek).toBe(Day.FRIDAY);
});

it('destruct testDate', () => {
    const { year, month, day, hours, minutes, seconds, dweek } = destructDate(testDate);

    expect(year).toBe(1993);
    expect(month).toBe(Month.MAY);
    expect(day).toBe(21);
    expect(hours).toBe(8);
    expect(minutes).toBe(34);
    expect(seconds).toBe(0);
    expect(dweek).toBe(Day.FRIDAY);
});

it('destruct testDate2', () => {
    const { year, month, day, hours, minutes, seconds, dweek } = destructDate(testDate2);

    expect(year).toBe(1993);
    expect(month).toBe(Month.MAY);
    expect(day).toBe(23);
    expect(hours).toBe(8);
    expect(minutes).toBe(34);
    expect(seconds).toBe(0);
    expect(dweek).toBe(Day.SUNDAY);
});

it("is laborable", () => {
    const actual = isLaborable(testDate);
    expect(actual).toBeTruthy();
})
it("is laborable 2", () => {
    const actual = isLaborable(testDate2);
    expect(actual).toBeFalsy();
})
it("is tomorrow laborable", () => {
    const actual = isTomorrowLaborable(testDate);
    expect(actual).toBeFalsy();
})
it("is tomorrow laborable 2", () => {
    const actual = isTomorrowLaborable(testDate2);
    expect(actual).toBeTruthy();
})

it('UTC to UTlocal', () => {
    const dateUTC = new Date(testDate.getUTCFullYear(), testDate.getUTCMonth(), testDate.getUTCDate(), testDate.getUTCHours(), testDate.getUTCMinutes());
    const actual = utcToLocal(dateUTC);
    const expected = testDate;
    expect(actual).toEqual(expected);
});
it('daysBetween itself', () => {
    const actual = daysBetween(testDate, testDate);
    const expected = 0;
    expect(actual).toBe(expected);
});
it('daysBetween', () => {
    const actual = daysBetween(testDate, testDate2);
    const expected = 2;
    expect(actual).toBe(expected);
});

it("getTimestamp", () => {
    const actual = getTimestamp(testDate);
    const expected = "19930521083400";

    expect(actual).toBe(expected);
})