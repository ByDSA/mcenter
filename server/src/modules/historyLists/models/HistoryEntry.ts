import { EpisodeFullId } from "#modules/episodes";
import { throwErrorPopStack } from "#utils/errors";
import { DateType } from "#utils/time";
import { assertIsDefined } from "#utils/validation";

export default interface Entry extends EpisodeFullId {
  date: DateType;
}

export function assertIsEntry(entry: Entry): asserts entry is Entry {
  try {
    assertIsDefined(entry);

    if (typeof entry !== "object")
      throw new Error("entry is not an object");

    const {episodeId, serieId, date } = entry;

    if (typeof episodeId !== "string")
      throw new Error("entry.episodeId is not a string");

    if (typeof serieId !== "string")
      throw new Error("entry.serieId is not a string");

    assertIsDefined(date);
  } catch (e) {
    if (e instanceof Error)
      throwErrorPopStack(e);

    throw e;
  }
}