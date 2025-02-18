export type MediaElement = {
    title?: string;
    path: string;
    startTime?: number;
    stopTime?: number;
    length?: number;
};

export function render(element: MediaElement): string {
  let { title, length } = element;
  const { path, startTime, stopTime } = element;

  if (title === undefined)
    title = "TITLE";

  if (length === undefined)
    length = 0;

  let sb = `\
#EXTM3U
#EXTINF:${length},${renderComma(element)}${title}`;

  if (startTime)
    sb += "\n" + `#EXTVLCOPT:start-time=${startTime}`;

  if (stopTime)
    sb += "\n" + `#EXTVLCOPT:stop-time=${stopTime}`;

  sb += `\n${ encodeURI(path) }\n`;

  return sb;
}

function renderComma(element: MediaElement): string {
  if (element.title !== undefined && element.title.includes(","))
    return ",";

  return "";
}
