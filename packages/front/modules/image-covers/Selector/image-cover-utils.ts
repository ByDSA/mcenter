import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { ImageCover } from "../models";

export function getLargeCoverUrl(imageCover: ImageCover): string {
  const fieldUrl = imageCover.versions.large
      ?? imageCover.versions.original;

  return getUrlFromField(fieldUrl);
}

function getUrlFromField(fieldUrl: string) {
  if (fieldUrl.includes("/"))
    return fieldUrl;

  return backendUrl(
    PATH_ROUTES.imageCovers.raw.withParams(fieldUrl),
  );
}

export function getMediumCoverUrl(imageCover: ImageCover): string {
  const fieldUrl = imageCover.versions.medium
    ?? imageCover.versions.large ?? imageCover.versions.original;

  return getUrlFromField(fieldUrl);
}

export function getSmallCoverUrl(imageCover: ImageCover): string {
  const fieldUrl = imageCover.versions.small
      ?? imageCover.versions.medium ?? imageCover.versions.large ?? imageCover.versions.original;

  return getUrlFromField(fieldUrl);
}

export function getOriginalCoverUrl(imageCover: ImageCover): string {
  const fieldUrl = imageCover.versions.original;

  return getUrlFromField(fieldUrl);
}
