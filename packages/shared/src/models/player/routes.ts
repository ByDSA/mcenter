const PLAYER = "/api/player";
const PLAYER_PLAY = `${PLAYER}/play`;

type PlayerEpisodeParams = {
  remotePlayerId: string;
} & (
  | { seriesKey: string;
episodeKey?: string; }
  | { seriesKey?: never;
episodeKey?: never; }
);

export const playerRoutes = {
  path: PLAYER,
  play: {
    episode: {
      withParams: ( { remotePlayerId, episodeKey, seriesKey }: PlayerEpisodeParams) => `${PLAYER_PLAY}/${remotePlayerId}/episode${seriesKey ? "/" + seriesKey : ""}${episodeKey ? "/" + episodeKey : ""}`,
    },
    music: {
      withParams: (remotePlayerId: string, slug: string) => `${PLAYER_PLAY}/${remotePlayerId}/music/${slug}`,
    },
    stream: {
      withParams: (remotePlayerId: string, streamId: string) => `${PLAYER_PLAY}/${remotePlayerId}/stream/${streamId}`,
    },
  },
  remotePlayers: {
    path: `${PLAYER}/remote-players`,
    stream: {
      path: `${PLAYER}/remote-players/stream`,
    },
  },
};
