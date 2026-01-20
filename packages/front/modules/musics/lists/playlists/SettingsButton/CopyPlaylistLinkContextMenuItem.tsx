import { assertIsDefined } from "$shared/utils/validation";
import { PATH_ROUTES } from "$shared/routing";
import { useUser } from "#modules/core/auth/useUser";
import { useLocalData } from "#modules/utils/local-data-context";
import { frontendUrl } from "#modules/requests";
import { CopyLinkContextMenuItem } from "../../CopyLinkContextMenuItem";
import { MusicPlaylistEntity } from "../models";

export const CopyPlaylistLinkContextMenuItem = ()=> {
  const { user } = useUser();
  const { data } = useLocalData<MusicPlaylistEntity>();

  return <CopyLinkContextMenuItem
    txt={()=> {
      assertIsDefined(data.ownerUserPublic);

      return frontendUrl(
        PATH_ROUTES.musics.frontend.playlists.slug.withParams( {
          playlistSlug: data.slug,
          userSlug: data.ownerUserPublic.slug,
          token: user?.id,
        } ),
      );
    }}
  />;
};
