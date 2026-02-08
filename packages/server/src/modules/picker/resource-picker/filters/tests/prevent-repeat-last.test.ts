import { assertIsDefined } from "$shared/utils/validation";
import { EpisodeEntity } from "$shared/models/episodes/episode";
import { fixtureEpisodes } from "$sharedSrc/models/episodes/tests";
import { PreventRepeatLastFilter } from "../prevent-repeat-last-filter";

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.List;
const DEFAULT_EPISODE = EPISODES_SIMPSONS[0];
const OTHER_EPISODE = EPISODES_SIMPSONS[1];

assertIsDefined(DEFAULT_EPISODE);
assertIsDefined(OTHER_EPISODE);

type Case<ID> = {
  lastId: ID | undefined;
  resource: EpisodeEntity;
  expected: boolean;
};

type CaseEpisode = Case<string>;

describe.each([
  {
    lastId: undefined,
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
] as CaseEpisode[])("preventRepeatLastFilter", ( { lastId, resource, expected }: CaseEpisode) => {
  it(`should return ${expected} when lastId = ${
    lastId
  } and current episode is ${resource.id}`, async () => {
    const filter = new PreventRepeatLastFilter<string, EpisodeEntity>( {
      lastId,
      compareId: (a, b)=>a === b,
      getResourceId: e=>e.id,
    } );
    const result = await filter.filter(resource);

    expect(result).toBe(expected);
  } );
} );
