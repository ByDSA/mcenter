import type { Stream } from "#modules/streams";
import type { EpisodeHistoryEntryEntity } from "#episodes/history/models";
import { deepFreeze } from "$shared/utils/objects";
import { StreamMode, StreamOriginType } from "#modules/streams";
import { SAMPLE1 as DATE_SAMPLE1 } from "./dates";

export const HISTORY_ENTRIES_WITH_NO_ENTRIES: EpisodeHistoryEntryEntity[] = deepFreeze([]);

export const HISTORY_ENTRY_SIMPSONS1: EpisodeHistoryEntryEntity = {
  id: "1",
  episodeId: {
    code: "1x01",
    serieId: "simpsons",
  },
  date: DATE_SAMPLE1,
};

export const STREAM_SIMPSONS: Stream = deepFreeze( {
  id: "simpsons",
  group: {
    origins: [
      {
        type: StreamOriginType.SERIE,
        id: "simpsons",
      },
    ],
  },
  mode: StreamMode.RANDOM,
} satisfies Stream);

export const HISTORY_ENTRIES_SIMPSONS: EpisodeHistoryEntryEntity[] = deepFreeze([
  HISTORY_ENTRY_SIMPSONS1,
] satisfies EpisodeHistoryEntryEntity[]);
