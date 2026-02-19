import { PATH_ROUTES } from "$shared/routing";
import { assertIsDefined } from "$shared/utils/validation";
import { useLocalData } from "#modules/utils/local-data-context";
import { frontendUrl } from "#modules/requests";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useUser } from "#modules/core/auth/useUser";
import { ShareContextMenuItem } from "../../../../resources/share/ShareLinkContextMenuItem";
import { MusicSmartPlaylistEntity } from "../models";
import { MusicSmartPlaylistsApi } from "../requests";

export const ShareSmartPlaylistContextMenuItem = () => {
  const { data } = useLocalData<MusicSmartPlaylistEntity>();
  const { user } = useUser();

  return (
    <ShareContextMenuItem
      buildUrl={async ( { autoplay, includeToken } ) => {
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

        const base = frontendUrl(
          PATH_ROUTES.musics.frontend.smartPlaylists.slug.withParams(
            ownerUserPublic.slug,
            data.slug,
          ),
        );
        const url = new URL(base);

        if (autoplay)
          url.searchParams.set("autoplay", "1");

        if (includeToken && user?.id)
          url.searchParams.set("token", user.id);

        return url.toString();
      }}
      showAutoplay
      showIncludeToken={!!user}
    />
  );
};
