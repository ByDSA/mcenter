import { SetMetadata } from "@nestjs/common";

export const M3U8_FORMAT_USE_NEXT = "m3u8-format-use-next";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const M3u8FormatUseNext = () => SetMetadata(M3U8_FORMAT_USE_NEXT, true);
