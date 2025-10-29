/* eslint-disable @typescript-eslint/naming-convention */
import svg from "./SeriesIcon.svg?raw";

export const SeriesIcon = () => {
  const id = "__MASK_" + Math.random().toString(36)
    .slice(2, 9);
  const raw = svg.replaceAll("__MASK_ID__", id).trim();
  const svgMatch = raw.match(/^<svg\b([^>]*)>([\s\S]*?)<\/svg>$/i);

  if (!svgMatch)
    return null;

  const [, attrString, content] = svgMatch;
  // 👇 tiny parser: convierte key="value" → { key: value }
  const attrs: Record<string, string> = {};

  attrString.replace(/([\w:-]+)="([^"]*)"/g, (_, key, value) => {
    attrs[key] = value;

    return "";
  } );

  return (
    <svg {...attrs} dangerouslySetInnerHTML={{
      __html: content,
    }} aria-hidden />
  );
};
