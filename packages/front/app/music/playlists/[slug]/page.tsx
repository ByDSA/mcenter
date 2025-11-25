"use client";

import { ResultResponse } from "$shared/utils/http/responses";
import { assertIsDefined } from "$shared/utils/validation";
import { MusicPlaylist } from "#modules/musics/playlists/Playlist";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicPlaylistsApi } from "#modules/musics/playlists/requests";
import { useCrudData } from "#modules/fetching";
import MusicLayout from "app/music/music.layout";
import { PageSpinner } from "#modules/ui-kit/spinner/Spinner";
import { useUser } from "#modules/core/auth/useUser";
import { PageItemNotFound } from "#modules/utils/ItemNotFound";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function Page( { params }: PageProps) {
  const api = FetchApi.get(MusicPlaylistsApi);
  const { user } = useUser();
  const userId = user?.id;

  assertIsDefined(userId);
  const { isLoading, data, error, setData } = useCrudData( {
    initialFetch: async ()=> {
      const response = await api.getOneByUserAndSlug(
        userId,
        (await params).slug,
        {
          silentErrors: true,
        },
      );
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
        {isLoading && <PageSpinner />}
        {data
      && <MusicPlaylist value={data} setValue={(d)=>setData(d)}/>
        }
      </>
    );
  } )();

  return (
    <MusicLayout>{ret}</MusicLayout>
  );
}
