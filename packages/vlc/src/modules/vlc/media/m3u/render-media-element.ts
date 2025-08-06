import type { MediaElement } from "#modules/models";

export function render(element: MediaElement): string {
  const { path, startTime, stopTime, title, length, artist } = element;
  let sb = `#EXTM3U
#EXTINF:${length ?? 0},${artist ?? ""},${title ?? "TITLE"}`;

  if (startTime)
    sb += "\n" + `#EXTVLCOPT:start-time=${startTime}`;

  if (stopTime)
    sb += "\n" + `#EXTVLCOPT:stop-time=${stopTime}`;

  sb += `\n${ encodeURI(path) }\n`;

  return sb;
}
