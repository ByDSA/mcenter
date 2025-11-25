export function bytesToStr(bytes: number, format: "auto" | "KB" | "MB" = "auto"): string {
  if (format === "KB")
    return bytesToKbStr(bytes);

  if (format === "MB")
    return bytesToMbStr(bytes);

  // auto
  if (bytes < (2 ** 20))
    return bytesToKbStr(bytes);

  return bytesToMbStr(bytes);
}

function bytesToKbStr(bytes: number) {
  return (bytes / (2 ** 10)).toFixed(2).toString() + " KB";
}

export function bytesToMbStr(bytes: number) {
  return (bytes / (2 ** 20)).toFixed(2).toString() + " MB";
}
