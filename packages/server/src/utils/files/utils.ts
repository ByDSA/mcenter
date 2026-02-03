import { extname } from "path";
import { v4 as uuidv4 } from "uuid";
import * as mime from "mime-types";

export function generateUniqueFilename(filename: string): string {
  const originalName = Buffer.from(filename, "latin1").toString("utf8");
  // Generar nombre único para el archivo
  const uniqueName = `${removeFilenameExtension(originalName)}\
[${uuidv4()}]${extname(originalName)}`;

  return uniqueName;
}

export function removeFilenameEndUuid(str: string): string {
  const uuidRegex = /\[[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\]$/;

  return str.replace(uuidRegex, "");
}

export function removeFilenameExtension(str: string): string {
  const lastDotIndex = str.lastIndexOf(".");

  if (lastDotIndex <= 0)
    return str;

  return str.substring(0, lastDotIndex);
}

export function getImageMime(ext: string): string {
  switch (ext) {
    case "jpeg":
    case "jpg": return "image/jpeg";
    case "png": return "image/png";
    case "gif": return "image/gif";
    case "bmp": return "image/bmp";
    default: return mime.lookup(ext).toString();
  }
}
