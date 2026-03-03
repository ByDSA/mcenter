"use client";

import { assertIsDefined } from "$shared/utils/validation";
import { useState } from "react";
import { MusicPlaylistEntity } from "$shared/models/musics/playlists";
import { useUser } from "#modules/core/auth/useUser";
import { usePlaylistSelectorModal } from "#modules/musics/lists/playlists/Selector/modal";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { UsersApi } from "#modules/core/users/requests";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicPlaylistsApi } from "#modules/musics/lists/playlists/requests";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { InlineSpinner } from "#modules/ui-kit/Spinner/Spinner";
import { useI18nContext } from "#modules/core/i18n/i18n-react";

export default function UserPage() {
  const { user } = useUser();
  const { LL } = useI18nContext();

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
    {favPlaylist?.name ?? LL.core.user.profile.favoritePlaylist.none()}
  </AsyncLoader>;

  return (
    <div>
      <h1>{LL.core.user.profile.title()}</h1>
      <p>{LL.core.user.profile.publicName()}: {user.publicName}</p>
      <p>{LL.uikit.forms.labels.email()}: {user.email}</p>
      <p>{LL.core.user.profile.firstName()}: {user.firstName}</p>
      <p>{LL.core.user.profile.lastName()}: {user.lastName}</p>
      <p>{LL.core.user.profile.roles()}: {user.roles.map(r=>r.name).join(", ")}</p>

      <h3>{LL.main.menu.music()}</h3>
      <p>{LL.core.user.profile.favoritePlaylist.favoritePlaylist()}: {element}</p>
      <div>
        <DaButton onClick={async ()=>await openModal( {
          onSelect: async (playlist) => {
            const api = FetchApi.get(UsersApi);

            await api.setFavoritePlaylist(playlist?.id ?? null);

            setFavPlaylist(playlist);
          },
        } )}>{LL.uikit.actions.change()}</DaButton>
      </div>
    </div>);
}
