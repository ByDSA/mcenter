import { svgRawReplaceIds, svgRawToSvgJsx } from "#modules/series/SeriesIcon";
import svg from "./MoviesIcon.svg?raw";

/* eslint-disable @typescript-eslint/naming-convention */
export const MoviesIcon = () => {
  const raw = svgRawReplaceIds(svg);

  return svgRawToSvgJsx(raw);
};
