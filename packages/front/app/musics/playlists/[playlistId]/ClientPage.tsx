"use client";

import type { Params as SlugPageParams } from "../slug/[userSlug]/[playlistSlug]/page";
import type { Params } from "./page";
import { useState } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import MusicLayout from "app/musics/music.layout";
import { MusicPlaylist } from "#modules/musics/playlists/Playlist/Playlist";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicPlaylistsApi } from "#modules/musics/playlists/requests";
import { PageItemNotFound } from "#modules/utils/ItemNotFound";
import { useUser } from "#modules/core/auth/useUser";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { PlaylistEntity } from "#modules/musics/playlists/Playlist/types";

interface PageProps {
  params: Promise<Params | SlugPageParams>;
}

export function ClientPage( { params }: PageProps) {
  const api = FetchApi.get(MusicPlaylistsApi);
  const { user } = useUser();
  const [data, setData] = useState<PlaylistEntity>();
  const ret = <AsyncLoader
    onSuccess={(d)=>setData(d)}
    errorElement={<PageItemNotFound />}
    action={async ()=> {
      const p = (await params);
      let d: PlaylistEntity | undefined = undefined;

      if ("userSlug" in p) {
        const { userSlug, playlistSlug } = p;
        const response = await api.getOneByUserAndSlug(
          {
            playlistSlug,
            userSlug,
          },
          {
            silentErrors: true,
          },
        );

        d = response.data as PlaylistEntity;

        if (d.ownerUserId !== user?.id && d.visibility === "public" && !d.ownerUser) {
          d.ownerUser = {
            slug: userSlug,
          } as any;
        }
      } else if ("playlistId" in p) {
        const response = await api.getOneByCriteria( {
          filter: {
            id: p.playlistId,
          },
          expand: ["musics", "ownerUserPublic", ...(user ? ["musicsFavorite" as const] : [])],
        } );

        d = response.data as PlaylistEntity;
      }

      assertIsDefined(d);

      return {
        ...d,
        list: d.list?.map(e=> ( {
          ...e,
          music: e.music
            ? {
              ...e.music,
            }
            : undefined,
        } )),
      } as PlaylistEntity;
    }}>
    <MusicPlaylist value={data!} setValue={setData}/>
  </AsyncLoader>;

  return (
    <MusicLayout>{ret}</MusicLayout>
  );
}
