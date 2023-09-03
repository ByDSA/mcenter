import { Model } from "#modules/episodes/models";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures";
import RemoveWeightLowerOrEqualThan from "./RemoveWeightLowerOrEqualThanFilter";

const MODEL_DEFAULT: Model = EPISODES_SIMPSONS[0];

describe("RemoveWeightLowerOrEqualThan", () => {
  it("should not filter model with weight greater than the given number", async () => {
    const filter = new RemoveWeightLowerOrEqualThan(5);
    const model: Model = {
      ...MODEL_DEFAULT,
      weight: 10,
    };

    expect(await filter.filter(model)).toBe(true);
  } );

  it("should filter model with weight equal to the given number", async () => {
    const filter = new RemoveWeightLowerOrEqualThan(5);
    const model: Model = {
      ...MODEL_DEFAULT,
      weight: 5,
    };

    expect(await filter.filter(model)).toBe(false);
  } );

  it("should filter model with weight lower than the given number", async () => {
    const filter = new RemoveWeightLowerOrEqualThan(5);
    const model: Model = {
      ...MODEL_DEFAULT,
      weight: 3,
    };

    expect(await filter.filter(model)).toBe(false);
  } );

  it("should not filter model with weight equal to the maximum allowed value", async () => {
    const filter = new RemoveWeightLowerOrEqualThan(5);
    const model: Model = {
      ...MODEL_DEFAULT,
      weight: Number.MAX_VALUE,
    };

    expect(await filter.filter(model)).toBe(true);
  } );

  it("should filter model with weight equal to the minimum allowed value", async () => {
    const filter = new RemoveWeightLowerOrEqualThan(5);
    const model: Model = {
      ...MODEL_DEFAULT,
      weight: Number.MIN_VALUE,
    };

    expect(await filter.filter(model)).toBe(false);
  } );
} );
