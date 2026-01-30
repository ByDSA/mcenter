import { svgRawReplaceIds, svgRawToSvgJsx } from "#modules/episodes/series/SeriesIcon/SeriesIcon";
import svg from "./favicon.svg?raw";

export const Favicon = () => {
  const raw = svgRawReplaceIds(svg);

  return svgRawToSvgJsx(raw);
};
