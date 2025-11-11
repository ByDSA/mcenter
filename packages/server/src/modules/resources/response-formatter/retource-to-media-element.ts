import { EpisodeEntity, episodeEntityWithFileInfosSchema } from "$shared/models/episodes";
import { MusicEntity, musicEntitySchema } from "$shared/models/musics";
import { musicToMediaElement, episodeToMediaElement } from "$shared/models/player/media-element/adapters";
import { MediaElement } from "$shared/models/player/media-element/media-element";

export function resourceToMediaElement(picked: object, options?: Options): MediaElement {
  const type = getTypeFromObj(picked);

  switch (type) {
    case "audio":
      return musicToMediaElement(picked as MusicEntity, options);
    case "video":
      return episodeToMediaElement(picked as EpisodeEntity, options);
    default:
      throw new Error("Invalid media type for M3U8 generation");
  }
}

function getTypeFromObj(obj: object): NonNullable<MediaElement["type"]> {
  if (episodeEntityWithFileInfosSchema.safeParse(obj).success)
    return "video";

  if (musicEntitySchema.safeParse(obj).success)
    return "audio";

  throw new Error("Invalid object type for media element");
}

type Options = NonNullable<Parameters<typeof musicToMediaElement>[1]>;

export {
  Options as M3u8ViewOptions,
};
