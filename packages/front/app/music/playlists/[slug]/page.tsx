"use client";

import { use } from "react";
import { ResultResponse } from "$shared/utils/http/responses";
import { MusicPlaylist } from "#modules/musics/playlists/Playlist";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicPlaylistsApi } from "#modules/musics/playlists/requests";
import { LoadingSpinner, useCrudData } from "#modules/fetching";
import MusicLayout from "app/music/music.layout";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function Page( { params }: PageProps) {
  const resolvedParams = use(params);
  const api = FetchApi.get(MusicPlaylistsApi);
  const { isLoading, data, error, setData } = useCrudData( {
    initialFetch: async ()=> {
      const response = await api.getOneByUserAndSlug("test", resolvedParams.slug);
      const d = response.data;

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

  return (
    <>
      <MusicLayout>
        <h2>Playlist</h2>
        {error && <pre>{(()=>{
          try {
            const response: ResultResponse = JSON.parse((error as any).message);

            return JSON.stringify(response.errors?.[0], null, 2);
          } catch {
            return error.toString();
          }
        } )()}</pre>}
        {isLoading && LoadingSpinner}
        {data
      && <MusicPlaylist value={data} setValue={(d)=>setData(d)}/>
        }
      </MusicLayout>
    </>
  );
}
