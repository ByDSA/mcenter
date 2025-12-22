"use client";

import type { Params } from "./page";
import { ResultResponse } from "$shared/utils/http/responses";
import MusicLayout from "app/musics/music.layout";
import { MusicPlaylist } from "#modules/musics/playlists/Playlist/Playlist";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicPlaylistsApi } from "#modules/musics/playlists/requests";
import { useCrudData } from "#modules/fetching";
import { ContentSpinner } from "#modules/ui-kit/spinner/Spinner";
import { PageItemNotFound } from "#modules/utils/ItemNotFound";
import { useUser } from "#modules/core/auth/useUser";

interface PageProps {
  params: Promise<Params>;
}

export function ClientPage( { params }: PageProps) {
  const api = FetchApi.get(MusicPlaylistsApi);
  const { user } = useUser();
  const { isLoading, data, error, setData } = useCrudData( {
    initialFetch: async ()=> {
      const { playlistSlug, userSlug } = (await params);
      const response = await api.getOneByUserAndSlug(
        {
          playlistSlug,
          userSlug,
        },
        {
          silentErrors: true,
        },
      );
      const d = response.data;

      if (d && d.ownerUserId !== user?.id && d.visibility === "public" && !d.ownerUser) {
        d.ownerUser = {
          slug: userSlug,
        } as any;
      }

      if (d) {
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
        } as any;
      }
    },
  } );
  let ret = (() => {
    if (!data && error)
      return <PageItemNotFound />;

    return (
      <>
        {error && <pre>{(()=>{
          try {
            const response: ResultResponse = JSON.parse((error as any).message);

            return JSON.stringify(response.errors?.[0], null, 2);
          } catch {
            return error.toString();
          }
        } )()}</pre>}
        {isLoading && <ContentSpinner />}
        {data
      && <MusicPlaylist value={data} setValue={setData}/>
        }
      </>
    );
  } )();

  return (
    <MusicLayout>{ret}</MusicLayout>
  );
}
