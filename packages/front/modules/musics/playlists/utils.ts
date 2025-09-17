import { secsToMmss, pad2 } from "#modules/utils/dates";

export const formatDurationHeader = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);

  if (hours > 0) {
    const minutes = Math.round(seconds / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}:${pad2(remainingMinutes)} horas`;
  }

  const mins = Math.round(seconds / 60);

  if (mins === 1)
    return `${mins} min`;

  return `${mins} mins`;
};

export const formatDurationItem = (seconds: number): string => {
  return secsToMmss(seconds);
};
