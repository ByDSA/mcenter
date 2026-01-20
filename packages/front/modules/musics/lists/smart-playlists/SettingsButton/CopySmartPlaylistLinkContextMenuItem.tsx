import { PATH_ROUTES } from "$shared/routing";
import { assertIsDefined } from "$shared/utils/validation";
import { useLocalData } from "#modules/utils/local-data-context";
import { frontendUrl } from "#modules/requests";
import { FetchApi } from "#modules/fetching/fetch-api";
import { CopyLinkContextMenuItem } from "../../CopyLinkContextMenuItem";
import { MusicSmartPlaylistEntity } from "../models";
import { MusicSmartPlaylistsApi } from "../requests";

export const CopySmartPlaylistLinkContextMenuItem = ()=> {
  const { data } = useLocalData<MusicSmartPlaylistEntity>();

  return <CopyLinkContextMenuItem
    txt={async ()=> {
      let { ownerUserPublic } = data;

      if (!ownerUserPublic) {
        const api = FetchApi.get(MusicSmartPlaylistsApi);
        const res = await api.getOneByCriteria( {
          filter: {
            id: data.id,
          },
          expand: ["ownerUserPublic"],
        } );

        ownerUserPublic = res.data?.ownerUserPublic;
      }

      assertIsDefined(ownerUserPublic);

      return frontendUrl(
        PATH_ROUTES.musics.frontend.smartPlaylists.slug.withParams(
          ownerUserPublic.slug,
          data.slug,
        ),
      );
    }}
  />;
};
