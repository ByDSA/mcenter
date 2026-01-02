export const DEFAULT_TTL = 60; // SECS

export const DEFAULT_FFMPEG_TTL = 300; // SECS
const PREFETCHING_TIME = 15; // SECS

export function shouldPrefetch(currentTime: number, duration: number) {
  return currentTime + PREFETCHING_TIME >= duration;
}
