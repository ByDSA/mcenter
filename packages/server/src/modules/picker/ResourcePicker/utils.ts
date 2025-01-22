export function secondsElapsedFrom(epoch: number): number {
  return (Date.now() / 1000) - epoch;
}
