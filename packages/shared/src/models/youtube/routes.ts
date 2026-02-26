const YOUTUBE = "/api/youtube";

type YoutubeImportMusicOneOptions = {
  musicId?: string;
};

export const youtubeRoutes = {
  path: YOUTUBE,
  import: {
    music: {
      path: `${YOUTUBE}/import/music`,
      one: {
        withParams: (youtubeId: string, options?: YoutubeImportMusicOneOptions) => `${YOUTUBE}/import/music/one/${youtubeId}${options?.musicId ? `?musicId=${options.musicId}` : ""}`,
      },
      playlist: {
        withParams: (playlistId: string) => `${YOUTUBE}/import/music/playlist/${playlistId}`,
      },
    },
  },
};
