import { svgRawReplaceIds, svgRawToSvgJsx } from "#modules/episodes/series/SeriesIcon/SeriesIcon";
import svg from "./MoviesIcon.svg?raw";

export const MoviesIcon = () => {
  const raw = svgRawReplaceIds(svg);

  return svgRawToSvgJsx(raw);
};
