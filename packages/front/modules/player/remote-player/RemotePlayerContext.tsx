"use client";

import { createContext, useContext, type ReactNode } from "react";
import { PlayerPlaylistElement, PlayerStatusResponse } from "$shared/models/player";
import { PlayerActions } from "$shared/models/player";
import { EpisodeEntity } from "#modules/episodes/models";
import { useImageCover } from "#modules/image-covers/hooks";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
export type RemotePlayerState = {

  /** El status completo recibido por WebSocket */
  statusResponse: PlayerStatusResponse | undefined;

  /** El recurso (episode) que está sonando actualmente (puede ser null si es un
   *  fichero genérico sin resourceId en BD) */
  resource: EpisodeEntity | null;

  /** El objeto que ejecuta las acciones sobre el player remoto */
  player: PlayerActions;
};

// ---------------------------------------------------------------------------
// Contexto
// ---------------------------------------------------------------------------
const RemotePlayerCtx = createContext<RemotePlayerState | null>(null);

export function RemotePlayerProvider( { children,
  value }: {
  children: ReactNode;
  value: RemotePlayerState;
} ) {
  return (
    <RemotePlayerCtx.Provider value={value}>
      {children}
    </RemotePlayerCtx.Provider>
  );
}

export function useRemotePlayer(): RemotePlayerState {
  const ctx = useContext(RemotePlayerCtx);

  if (!ctx)
    throw new Error("useRemotePlayer must be used inside <RemotePlayerProvider>");

  return ctx;
}

// ---------------------------------------------------------------------------
// Helpers derivados (similares a los selectores de BrowserPlayerContext)
// ---------------------------------------------------------------------------
export function useRemoteStatus() {
  const { statusResponse } = useRemotePlayer();

  return statusResponse?.status;
}

export function useRemoteCover() {
  const { resource } = useRemotePlayer();
  const { data } = useImageCover(resource?.imageCoverId ?? resource?.series?.imageCoverId ?? null);

  return data;
}

export function useRemoteTitle(): string {
  const { statusResponse, resource } = useRemotePlayer();
  const status = statusResponse?.status;

  if (resource)
    return resource.title;

  if (status?.meta?.title)
    return status.meta.title;

  const uri = status?.playlist?.current?.uri;

  if (uri)
    return uri.slice(uri.lastIndexOf("/") + 1);

  return "–";
}

export function useRemoteArtist(): string {
  const { statusResponse, resource } = useRemotePlayer();

  if (resource)
    return `${resource.episodeKey}${resource.series ? `, ${resource.series.name}` : ""}`;

  const status = statusResponse?.status;
  const uri = status?.playlist?.current?.uri;

  if (uri)
    return uri.slice(uri.lastIndexOf("/") + 1);

  return "–";
}

/** Playlist anterior y siguiente en bruto, tal como llega del player remoto */
export function useRemotePlaylist(): {
  previous: PlayerPlaylistElement[];
  current: PlayerPlaylistElement | undefined;
  next: PlayerPlaylistElement[];
  } {
  const { statusResponse } = useRemotePlayer();
  const playlist = statusResponse?.status?.playlist;

  return {
    previous: playlist?.previous ?? [],
    current: playlist?.current,
    next: playlist?.next ?? [],
  };
}
