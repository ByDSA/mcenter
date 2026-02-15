import { ResourcePickerSequential } from "./resource-picker-sequential";
import { Episode } from "#episodes/models";
import { fixtureEpisodes } from "#episodes/tests";

const EPISODES = fixtureEpisodes.SampleSeries.Episodes.List;

type Model = Episode;

it("should pick 1x02 when lastEp is 1x01", async () => {
  const episodes = EPISODES;
  const lastEp = EPISODES[0];
  const expected = EPISODES[1];
  const seq = new ResourcePickerSequential( {
    resources: episodes,
    lastId: lastEp.id,
    getId: e=>e.id,
  } );
  const actualEpisodes: Model[] = await seq.pick();

  expect(actualEpisodes).toHaveLength(1);

  expect(actualEpisodes[0]).toEqual(expected);
} );

it("should pick 1x01 (first one) when lastEp is undfined", async () => {
  const episodes = EPISODES;
  const lastId = null;
  const expected = EPISODES[0];
  const seq = new ResourcePickerSequential( {
    resources: episodes,
    lastId,
    getId: e=>e.id,
  } );
  const actualEpisodes: Model[] = await seq.pick();

  expect(actualEpisodes).toHaveLength(1);

  expect(actualEpisodes[0]).toEqual(expected);
} );

it("should pick 1x01 (first one) when lastEp is last", async () => {
  const episodes = EPISODES;
  const lastEp = EPISODES.at(-1);
  const expected = EPISODES[0];
  const seq = new ResourcePickerSequential( {
    resources: episodes,
    lastId: lastEp?.id ?? null,
    getId: e=>e.id,
  } );
  const actualEpisodes: Model[] = await seq.pick();

  expect(actualEpisodes).toHaveLength(1);

  expect(actualEpisodes[0]).toEqual(expected);
} );

it("should pick last and 1x01 (first one) when lastEp\
is previous to last and pick 2 episodes", async () => {
  const episodes = EPISODES;
  const lastEp = EPISODES.at(-2);
  const expected = [EPISODES.at(-1), EPISODES[0]];
  const seq = new ResourcePickerSequential( {
    resources: episodes,
    lastId: lastEp?.id ?? null,
    getId: e=>e.id,
  } );
  const actualEpisodes: Model[] = await seq.pick(2);

  expect(actualEpisodes).toHaveLength(2);

  expect(actualEpisodes).toEqual(expected);
} );
