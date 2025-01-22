/* eslint-disable prefer-destructuring */
import { assertIsDefined } from "#shared/utils/validation";
import PreventRepeatLastFilter from "../PreventRepeatLastFilter";
import { EpisodeId, compareEpisodeId as compareId } from "#modules/episodes";
import { stringifyEpisodeId } from "#modules/episodes/tests";
import { Resource } from "#modules/resources";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures";

const DEFAULT_EPISODE = EPISODES_SIMPSONS[0];
const OTHER_EPISODE = EPISODES_SIMPSONS[1];

assertIsDefined(DEFAULT_EPISODE);
assertIsDefined(OTHER_EPISODE);

type Case<ID> = {
  lastId: ID | undefined;
  resource: Resource<ID>;
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
      compareId,
    } );
    const result = await filter.filter(resource);

    expect(result).toBe(expected);
  } );
} );
