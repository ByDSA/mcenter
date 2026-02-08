import { musicToMediaElement } from "$shared/models/player/media-element/adapters";

type Options = NonNullable<Parameters<typeof musicToMediaElement>[1]>;

export {
  Options as M3u8ViewOptions,
};
