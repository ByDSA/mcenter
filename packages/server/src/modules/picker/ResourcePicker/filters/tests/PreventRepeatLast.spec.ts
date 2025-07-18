import { assertIsDefined } from "$shared/utils/validation";
import { ResourceEntity } from "$shared/models/resource";
import { compareEpisodeId } from "$shared/models/episodes/episode";
import { EpisodeId } from "#episodes/models";
import { stringifyEpisodeId } from "#episodes/tests";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures";
import { PreventRepeatLastFilter } from "../PreventRepeatLastFilter";

const DEFAULT_EPISODE = EPISODES_SIMPSONS[0];
const OTHER_EPISODE = EPISODES_SIMPSONS[1];

assertIsDefined(DEFAULT_EPISODE);
assertIsDefined(OTHER_EPISODE);

type Case<ID> = {
  lastId: ID | undefined;
  resource: ResourceEntity;
  expected: boolean;
};

type CaseEpisode = Case<EpisodeId>;

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
  it(`should return ${expected} when lastId = ${lastId ? stringifyEpisodeId(lastId) : undefined} and current episode is ${stringifyEpisodeId(resource.id)}`, async () => {
    const filter = new PreventRepeatLastFilter( {
      lastId,
      compareId: compareEpisodeId,
    } );
    const result = await filter.filter(resource);

    expect(result).toBe(expected);
  } );
} );
