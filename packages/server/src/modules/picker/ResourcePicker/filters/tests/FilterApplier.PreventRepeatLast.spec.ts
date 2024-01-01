import { compareEpisodeId } from "#shared/models/episodes";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures";
import FilterApplier from "../FilterApplier";
import PreventRepeatLastFilter from "../PreventRepeatLastFilter";

const TWO_EPS = [
  EPISODES_SIMPSONS[0],
  EPISODES_SIMPSONS[1],
];
const ONE_EP = [
  EPISODES_SIMPSONS[0],
];

describe("PreventRepeatLastFilter", () => {
  describe("with lastEp = 0", () => {
    const FILTER_APPLIER_WITH_LAST_EP0 = new FilterApplier();

    FILTER_APPLIER_WITH_LAST_EP0.add(new PreventRepeatLastFilter( {
      compareId: compareEpisodeId,
      lastId: EPISODES_SIMPSONS[0].id,
    } ));
    it("with empty list", async () => {
      const ret = await FILTER_APPLIER_WITH_LAST_EP0.apply([]);

      expect(ret).toEqual([]);
    } );

    it("with same episode", async () => {
      const ret = await FILTER_APPLIER_WITH_LAST_EP0.apply(ONE_EP);

      expect(ret).toEqual([]);
    } );

    it("with different episode", async () => {
      const ret = await FILTER_APPLIER_WITH_LAST_EP0.apply(TWO_EPS);

      expect(ret).toEqual([EPISODES_SIMPSONS[1]]);
    } );
  } );
} );