import { PATH_ROUTES } from "$shared/routing";
import { ImageCover } from "../models";
import { backendUrl } from "#modules/requests";

export function getLargeCoverUrl(imageCover: ImageCover): string {
  const fieldUrl = imageCover.versions.large
      ?? imageCover.versions.original;

  return getUrlFromField(fieldUrl, imageCover.updatedAt);
}

function getUrlFromField(fieldUrl: string, updatedAt: Date) {
  const t = new Date(updatedAt).getTime();
  const base = fieldUrl.includes("/")
    ? fieldUrl
    : backendUrl(PATH_ROUTES.imageCovers.raw.withParams(fieldUrl));

  return `${base}?t=${t}`;
}

export function getMediumCoverUrl(imageCover: ImageCover): string {
  const fieldUrl = imageCover.versions.medium
    ?? imageCover.versions.large ?? imageCover.versions.original;

  return getUrlFromField(fieldUrl, imageCover.updatedAt);
}

export function getSmallCoverUrl(imageCover: ImageCover): string {
  const fieldUrl = imageCover.versions.small
      ?? imageCover.versions.medium ?? imageCover.versions.large ?? imageCover.versions.original;

  return getUrlFromField(fieldUrl, imageCover.updatedAt);
}

export function getOriginalCoverUrl(imageCover: ImageCover): string {
  const fieldUrl = imageCover.versions.original;

  return getUrlFromField(fieldUrl, imageCover.updatedAt);
}
