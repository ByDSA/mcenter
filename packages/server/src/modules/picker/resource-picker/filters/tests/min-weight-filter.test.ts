import { Pickable } from "#modules/resources/models";
import { RemoveWeightLowerOrEqualThanFilter } from "../min-weight-filter";

const W3: Pickable = {
  weight: 3,
};
const W7: Pickable = {
  weight: 7,
};
const W_99: Pickable = {
  weight: -99,
};
const W_100: Pickable = {
  weight: -100,
};
const W_2: Pickable = {
  weight: -2,
};
const W0: Pickable = {
  weight: 0,
};

type Case = [Pickable, number, boolean];

describe.each([
  [W_99, -99, true],
  [W_100, -99, false],
  [W_2, -99, true],
  [W3, 2, true],
  [W0, 0, true],
  [W7, 0, true],
] as Case[])("minWeightFilter", (self, num, expected) => {
  it(`should return ${expected} when weight = ${self.weight} and min = ${num}`, async () => {
    const filter = new class extends RemoveWeightLowerOrEqualThanFilter<Pickable> {
      getWeight(s: Pickable): number {
        return s.weight;
      }
    }(num);
    const result = await filter.filter(self);

    expect(result).toBe(expected);
  } );
} );
