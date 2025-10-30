import { svgRawReplaceIds, svgRawToSvgJsx } from "#modules/series/SeriesIcon";
import svg from "./MusicsIcon.svg?raw";

/* eslint-disable @typescript-eslint/naming-convention */
export const MusicsIcon = () => {
  const raw = svgRawReplaceIds(svg);

  return svgRawToSvgJsx(raw);
};
