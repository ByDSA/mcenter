"use client";

import type { EpisodeEntity } from "#modules/episodes/models";
import { getFirstAvailableFileInfoOrFirst } from "$shared/models/file-info-common/file-info";
import { showError } from "$shared/utils/errors/showError";
import { ProgressBarView, TimeView } from "../common/ProgressBarView";
import { useRemotePlayer, useRemoteStatus } from "./RemotePlayerContext";

// ---------------------------------------------------------------------------
// Helper: calcular start y length reales del recurso actual
// ---------------------------------------------------------------------------
function calcStartLength(
  statusLength: number,
  resource: EpisodeEntity | null,
): { start: number;
length: number; } {
  const fileInfo = resource?.fileInfos
    ? getFirstAvailableFileInfoOrFirst(resource.fileInfos)
    : undefined;
  const resourceEnd = (fileInfo as any)?.end ?? statusLength;
  const resourceStart = (fileInfo as any)?.start ?? 0;

  return {
    start: resourceStart,
    length: resourceEnd - resourceStart,
  };
}

type Props = {
  className?: string;
};

export const RemoteProgressBar = ( { className }: Props) => {
  const { resource, player } = useRemotePlayer();
  const status = useRemoteStatus();
  const rawLength = status?.length ?? 0;
  const rawTime = status?.time ?? 0;
  const { start, length } = calcStartLength(rawLength, resource);
  const currentTime = Math.max(0, rawTime - start);
  const duration = length > 0 ? length : null;

  return <ProgressBarView
    currentTime={currentTime}
    duration={duration}
    className={className}
    onSeek={(time)=>{
      player.seek(Math.round(start + time)).catch(showError);
    }}
  />;
};

// ---------------------------------------------------------------------------
// Etiquetas de tiempo
// ---------------------------------------------------------------------------
export const RemoteCurrentTime = () => {
  const { resource } = useRemotePlayer();
  const status = useRemoteStatus();
  const rawLength = status?.length ?? 0;
  const rawTime = status?.time ?? 0;
  const { start } = calcStartLength(rawLength, resource);

  return <TimeView time={rawTime - start}/>;
};

export const RemoteDuration = () => {
  const { resource } = useRemotePlayer();
  const status = useRemoteStatus();
  const rawLength = status?.length ?? 0;
  const { length } = calcStartLength(rawLength, resource);

  return <TimeView time={length}/>;
};
