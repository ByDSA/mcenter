/* eslint-disable @typescript-eslint/naming-convention */
import { JSX } from "react";
import svg from "./SeriesIcon.svg?raw";

export const SeriesIcon = () => {
  const raw = svgRawReplaceIds(svg);

  return svgRawToSvgJsx(raw);
};

export function svgRawToSvgJsx(raw: string): JSX.Element | null {
  const svgMatch = raw.match(/^\s*<svg\b([^>]*)>([\s\S]*?)<\/svg>\s*$/i);

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
}

export function getIdNTag(n: number): string {
  if (n <= 1)
    return "__ID__";

  return `__ID${n}__`;
}

export function svgRawReplaceIds(svgRaw: string) {
  let raw = svgRaw;
  let idN = 1;

  while (raw.includes(getIdNTag(idN))) {
    const originalId = getIdNTag(idN);
    const id = originalId + Math.random().toString(36)
      .slice(2, 9);

    raw = raw.replaceAll(originalId, id).trim();

    idN++;
  }

  return raw;
}
