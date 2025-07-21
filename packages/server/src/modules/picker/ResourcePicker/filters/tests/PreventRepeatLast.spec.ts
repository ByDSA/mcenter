import { assertIsDefined } from "$shared/utils/validation";
import { compareEpisodeCompKey, Episode, EpisodeCompKey, EpisodeEntity } from "$shared/models/episodes/episode";
import { stringifyEpisodeCompKey } from "#episodes/tests";
import { fixtureEpisodes } from "#tests/main/db/fixtures";
import { PreventRepeatLastFilter } from "../PreventRepeatLastFilter";

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

type CaseEpisode = Case<EpisodeCompKey>;

describe.each([
  {
    lastId: undefined,
    resource: DEFAULT_EPISODE,
    expected: true,
  },
  {
    lastId: DEFAULT_EPISODE.compKey,
    resource: OTHER_EPISODE,
    expected: true,
  },
  {
    lastId: DEFAULT_EPISODE.compKey,
    resource: DEFAULT_EPISODE,
    expected: false,
  },
] as CaseEpisode[])("preventRepeatLastFilter", ( { lastId, resource, expected }: CaseEpisode) => {
  it(`should return ${expected} when lastId = ${
    lastId
      ? stringifyEpisodeCompKey(lastId)
      : undefined
  } and current episode is ${stringifyEpisodeCompKey(resource.compKey)}`, async () => {
    const filter = new PreventRepeatLastFilter<EpisodeCompKey, Episode>( {
      lastId,
      compareId: compareEpisodeCompKey,
      getResourceId: e=>e.compKey,
    } );
    const result = await filter.filter(resource);

    expect(result).toBe(expected);
  } );
} );
