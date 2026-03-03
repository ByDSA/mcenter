import { Fragment } from "react/jsx-runtime";

export function phraseCase(str: string) {
  if (!str)
    return str;

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function interpolateJSX(
  template: string,
  replacements: Record<string, React.ReactNode>,
): React.ReactNode[] {
  const parts = template.split(/(\[[^\]]+\])/g);

  return parts.map((part, i) => {
    const match = part.match(/^\[(.+)\]$/);

    if (match) {
      const key = match[1];
      const replacement = replacements[key];

      if (replacement === undefined) {
        // Placeholder sin reemplazo — lo deja tal cual para que sea visible en dev
        console.warn(`interpolateJSX: no replacement found for [${key}]`);

        return part;
      }

      return <Fragment key={i}>{replacement}</Fragment>;
    }

    return part;
  } );
}
