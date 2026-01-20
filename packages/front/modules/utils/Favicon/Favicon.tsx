import { svgRawReplaceIds, svgRawToSvgJsx } from "#modules/series/SeriesIcon";
import svg from "./favicon.svg?raw";

export const Favicon = () => {
  const raw = svgRawReplaceIds(svg);

  return svgRawToSvgJsx(raw);
};
