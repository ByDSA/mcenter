import { RemoverPicker } from "./RemoverPicker";

it(`picked number disappears from picker`, () => {
    const data = [1, 2, 3, 4, 5, 6];
    const picker = new RemoverPicker(data);

    const picked = picker.pickOne();

    expect(data).not.toContain(picked);
    expect(data.length).toBe(5);
});

it(`pick all`, () => {
    const data = [1, 2, 3, 4, 5, 6];
    const picker = new RemoverPicker(data);

    const picked = picker.pick(data.length);
    expect(data.length).toBe(0);
});

it(`pick more than all`, () => {
    const data = [1, 2, 3, 4, 5, 6];
    const picker = new RemoverPicker(data);

    picker.pick(data.length);
    const picked = picker.pickOne();
    expect(picked).toBeUndefined();
    expect(data.length).toBe(0);
});