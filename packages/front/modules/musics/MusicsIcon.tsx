import { svgRawReplaceIds, svgRawToSvgJsx } from "#modules/episodes/series/SeriesIcon";
import svg from "./MusicsIcon.svg?raw";

export const MusicsIcon = () => {
  const raw = svgRawReplaceIds(svg);

  return svgRawToSvgJsx(raw);
};
