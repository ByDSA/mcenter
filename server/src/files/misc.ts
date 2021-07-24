import path from "path";

export function getTitleFromFilename(relativePath: string): string {
  const title = path.basename(relativePath);

  return removeExtension(title);
}

export function removeExtension(str: string, possibleExtensions?: string[]): string {
  if (possibleExtensions) {
    for (const ext of possibleExtensions) {
      const index = str.lastIndexOf(`.${ext}`);

      if (index >= 0)
        return str.substr(0, index);
    }
  } else {
    const index = str.lastIndexOf(".");
    const lastSlashIndex = str.lastIndexOf("/");

    if (lastSlashIndex <= index || lastSlashIndex === -1)
      return str.substr(0, index);
  }

  return str;
}

export function getValidUrl(title: string) {
  const uri = title
    .toLowerCase()
    .replace(/(-\s-)/g, "-")
    .replace(/(\s-)|(-\s)/g, "-")
    .replace(/\s/g, "-")
    .replace(/&|\?|\[|\]|:|"|#/g, "");

  return uri;
}
