import { MediaElement } from "./media-element";

export * from "./media-element";

export * from "./adapters";

export function mediaElementWithAbsolutePath(
  mediaElement: MediaElement,
  prefix: string,
): MediaElement {
  const currentPath = mediaElement.path;
  const isRemoteUrl = currentPath.startsWith("http://") || currentPath.startsWith("https://");
  const isAbsoluteLocalPath = currentPath.startsWith("file://")
                              || /^[A-Za-z]:\\/.test(currentPath); // Windows (C:\, D:\, etc.)

  if (isRemoteUrl || isAbsoluteLocalPath)
    throw new Error(`MediaElement already has an absolute path: ${currentPath}`);

  return {
    ...mediaElement,
    path: new URL(currentPath, prefix).toString(),
  };
}
