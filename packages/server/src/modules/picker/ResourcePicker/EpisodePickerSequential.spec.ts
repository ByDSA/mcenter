/* eslint-disable prefer-destructuring */
import { ResourcePickerSequential } from "./ResourcePickerSequential";
import { Episode, compareEpisodeId } from "#episodes/models";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures/models/episode";

type Model = Episode;

it("should pick 1x02 when lastEp is 1x01", async () => {
  const episodes = EPISODES_SIMPSONS;
  const lastEp = EPISODES_SIMPSONS[0];
  const expected = EPISODES_SIMPSONS[1];
  const seq = new ResourcePickerSequential( {
    resources: episodes,
    lastId: lastEp.id,
    compareId: compareEpisodeId,
  } );
  const actualEpisodes: Model[] = await seq.pick();

  expect(actualEpisodes).toHaveLength(1);

  expect(actualEpisodes[0]).toEqual(expected);
} );

it("should pick 1x01 (first one) when lastEp is undfined", async () => {
  const episodes = EPISODES_SIMPSONS;
  const lastEp: Episode | undefined = undefined as Episode | undefined;
  const expected = EPISODES_SIMPSONS[0];
  const seq = new ResourcePickerSequential( {
    resources: episodes,
    lastId: lastEp?.id,
    compareId: compareEpisodeId,
  } );
  const actualEpisodes: Model[] = await seq.pick();

  expect(actualEpisodes).toHaveLength(1);

  expect(actualEpisodes[0]).toEqual(expected);
} );

it("should pick 1x01 (first one) when lastEp is last", async () => {
  const episodes = EPISODES_SIMPSONS;
  const lastEp = EPISODES_SIMPSONS.at(-1);
  const expected = EPISODES_SIMPSONS[0];
  const seq = new ResourcePickerSequential( {
    resources: episodes,
    lastId: lastEp?.id,
    compareId: compareEpisodeId,
  } );
  const actualEpisodes: Model[] = await seq.pick();

  expect(actualEpisodes).toHaveLength(1);

  expect(actualEpisodes[0]).toEqual(expected);
} );

it("should pick last and 1x01 (first one) when lastEp is previous to last and pick 2 episodes", async () => {
  const episodes = EPISODES_SIMPSONS;
  const lastEp = EPISODES_SIMPSONS.at(-2);
  const expected = [EPISODES_SIMPSONS.at(-1), EPISODES_SIMPSONS[0]];
  const seq = new ResourcePickerSequential( {
    resources: episodes,
    lastId: lastEp?.id,
    compareId: compareEpisodeId,
  } );
  const actualEpisodes: Model[] = await seq.pick(2);

  expect(actualEpisodes).toHaveLength(2);

  expect(actualEpisodes).toEqual(expected);
} );
