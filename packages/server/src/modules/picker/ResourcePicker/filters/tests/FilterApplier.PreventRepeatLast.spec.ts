import { compareEpisodeCompKey, Episode, EpisodeCompKey } from "#episodes/models";
import { FilterApplier } from "../FilterApplier";
import { PreventRepeatLastFilter } from "../PreventRepeatLastFilter";
import { fixtureEpisodes } from "#episodes/tests";

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.List;
const TWO_EPS = [
  EPISODES_SIMPSONS[0],
  EPISODES_SIMPSONS[1],
];
const ONE_EP = [
  EPISODES_SIMPSONS[0],
];

describe("preventRepeatLastFilter", () => {
  describe("with lastEp = 0", () => {
    const filterApplierWithLastEp0 = new FilterApplier();

    filterApplierWithLastEp0.add(new PreventRepeatLastFilter<EpisodeCompKey, Episode>( {
      compareId: compareEpisodeCompKey,
      lastId: EPISODES_SIMPSONS[0].compKey,
      getResourceId: e=>e.compKey,
    } ));

    it("with empty list", async () => {
      const ret = await filterApplierWithLastEp0.apply([]);

      expect(ret).toEqual([]);
    } );

    it("with same episode", async () => {
      const ret = await filterApplierWithLastEp0.apply(ONE_EP);

      expect(ret).toEqual([]);
    } );

    it("with different episode", async () => {
      const ret = await filterApplierWithLastEp0.apply(TWO_EPS);

      expect(ret).toEqual([EPISODES_SIMPSONS[1]]);
    } );
  } );
} );
