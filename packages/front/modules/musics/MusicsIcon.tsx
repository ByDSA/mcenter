import { svgRawReplaceIds, svgRawToSvgJsx } from "#modules/series/SeriesIcon";
import svg from "./MusicsIcon.svg?raw";

export const MusicsIcon = () => {
  const raw = svgRawReplaceIds(svg);

  return svgRawToSvgJsx(raw);
};
