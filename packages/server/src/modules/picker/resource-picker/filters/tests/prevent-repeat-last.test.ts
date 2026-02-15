import { assertIsDefined } from "$shared/utils/validation";
import { EpisodeEntity } from "$shared/models/episodes/episode";
import { fixtureEpisodes } from "$sharedSrc/models/episodes/tests";
import { PreventRepeatLastFilter } from "../prevent-repeat-last-filter";

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.Episodes.List;
const DEFAULT_EPISODE = EPISODES_SIMPSONS[0];
const OTHER_EPISODE = EPISODES_SIMPSONS[1];

assertIsDefined(DEFAULT_EPISODE);
assertIsDefined(OTHER_EPISODE);

type Case = {
  lastId: string | null;
  resource: EpisodeEntity;
  expected: boolean;
};

describe.each([
  {
    lastId: null,
    resource: DEFAULT_EPISODE,
    expected: true,
  },
  {
    lastId: DEFAULT_EPISODE.id,
    resource: OTHER_EPISODE,
    expected: true,
  },
  {
    lastId: DEFAULT_EPISODE.id,
    resource: DEFAULT_EPISODE,
    expected: false,
  },
] as Case[])("preventRepeatLastFilter", ( { lastId, resource, expected }: Case) => {
  it(`should return ${expected} when lastId = ${
    lastId
  } and current episode is ${resource.id}`, async () => {
    const filter = new PreventRepeatLastFilter<EpisodeEntity>( {
      lastId,
      getId: e=>e.id,
    } );
    const result = await filter.filter(resource);

    expect(result).toBe(expected);
  } );
} );
