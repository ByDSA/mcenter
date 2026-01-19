"use client";

import { assertIsDefined } from "$shared/utils/validation";
import { useState } from "react";
import { MusicPlaylistEntity } from "$shared/models/musics/playlists";
import { useUser } from "#modules/core/auth/useUser";
import { usePlaylistSelectorModal } from "#modules/musics/lists/playlists/Selector/modal";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import { UsersApi } from "#modules/core/users/requests";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicPlaylistsApi } from "#modules/musics/lists/playlists/requests";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { InlineSpinner } from "#modules/ui-kit/Spinner/Spinner";

export default function UserPage() {
  const { user } = useUser();

  assertIsDefined(user);

  const [favPlaylist, setFavPlaylist] = useState<MusicPlaylistEntity | null>(null);
  const { openModal } = usePlaylistSelectorModal( {
    nullable: true,
  } );
  const element = <AsyncLoader
    onSuccess={r=>setFavPlaylist(r)}
    loadingElement={<InlineSpinner />}
    // Para que no muestre el spinner si id=null
    // initialStatus={!user.musics.favoritesPlaylistId ? "iddle" : undefined}
    action={async () => {
      if (!user.musics.favoritesPlaylistId)
        return null;

      const api = FetchApi.get(MusicPlaylistsApi);
      const res = await api.getOneByCriteria( {
        filter: {
          id: user.musics.favoritesPlaylistId,
        },
      } );

      return res.data ?? null;
    }}
  >
    {favPlaylist?.name ?? "<Ninguna>"}
  </AsyncLoader>;

  return (
    <div>
      <h1>Profile</h1>
      <p>Public Name: {user.publicName}</p>
      <p>Email: {user.email}</p>
      <p>First name: {user.firstName}</p>
      <p>Last name: {user.lastName}</p>
      <p>Roles: {user.roles.map(r=>r.name).join(", ")}</p>

      <h3>Música</h3>
      <p>Playlist favorita: {element}</p>
      <div>
        <Button onClick={async ()=>await openModal( {
          onSelect: async (playlist) => {
            const api = FetchApi.get(UsersApi);

            await api.setFavoritePlaylist(playlist?.id ?? null);

            setFavPlaylist(playlist);
          },
        } )}>Cambiar</Button>
      </div>
    </div>);
}
