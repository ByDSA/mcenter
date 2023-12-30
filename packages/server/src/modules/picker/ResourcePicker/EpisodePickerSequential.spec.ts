import { Episode, compareEpisodeFullId, episodeFullIdOf } from "#shared/models/episodes";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures";
import ResourcePickerSequential from "./ResourcePickerSequential";

type Model = Episode;
const fullIdOf = episodeFullIdOf;

it("should pick 1x02 when lastEp is 1x01", async () => {
  const episodes = EPISODES_SIMPSONS;
  const lastEp = EPISODES_SIMPSONS[0];
  const expected = EPISODES_SIMPSONS[1];
  // eslint-disable-next-line no-undef
  const seq = new ResourcePickerSequential( {
    resources: episodes,
    lastId: lastEp ? fullIdOf(lastEp) : undefined,
    compareResourceWithId: compareEpisodeFullId,
  } );
  const actualEpisodes: Model[] = await seq.pick();

  expect(actualEpisodes.length).toBe(1);

  expect(actualEpisodes[0]).toEqual(expected);
} );

it("should pick 1x01 (first one) when lastEp is undfined", async () => {
  const episodes = EPISODES_SIMPSONS;
  const lastEp = undefined;
  const expected = EPISODES_SIMPSONS[0];
  const seq = new ResourcePickerSequential( {
    resources: episodes,
    lastId: lastEp ? fullIdOf(lastEp) : undefined,
    compareResourceWithId: compareEpisodeFullId,
  } );
  const actualEpisodes: Model[] = await seq.pick();

  expect(actualEpisodes.length).toBe(1);

  expect(actualEpisodes[0]).toEqual(expected);
} );

it("should pick 1x01 (first one) when lastEp is last", async () => {
  const episodes = EPISODES_SIMPSONS;
  const lastEp = EPISODES_SIMPSONS.at(-1);
  const expected = EPISODES_SIMPSONS[0];
  const seq = new ResourcePickerSequential( {
    resources: episodes,
    lastId: lastEp ? fullIdOf(lastEp) : undefined,
    compareResourceWithId: compareEpisodeFullId,
  } );
  const actualEpisodes: Model[] = await seq.pick();

  expect(actualEpisodes.length).toBe(1);

  expect(actualEpisodes[0]).toEqual(expected);
} );

it("should pick last and 1x01 (first one) when lastEp is previous to last and pick 2 episodes", async () => {
  const episodes = EPISODES_SIMPSONS;
  const lastEp = EPISODES_SIMPSONS.at(-2);
  const expected = [EPISODES_SIMPSONS.at(-1), EPISODES_SIMPSONS[0]];
  const seq = new ResourcePickerSequential( {
    resources: episodes,
    lastId: lastEp ? fullIdOf(lastEp) : undefined,
    compareResourceWithId: compareEpisodeFullId,
  } );
  const actualEpisodes: Model[] = await seq.pick(2);

  expect(actualEpisodes.length).toBe(2);

  expect(actualEpisodes).toEqual(expected);
} );