import { PATH_ROUTES } from "$shared/routing";
import { assertIsDefined } from "$shared/utils/validation";
import { useLocalData } from "#modules/utils/local-data-context";
import { frontendUrl } from "#modules/requests";
import { FetchApi } from "#modules/fetching/fetch-api";
import { CopyLinkContextMenuItem } from "../../CopyLinkContextMenuItem";
import { MusicQueryEntity } from "../models";
import { MusicQueriesApi } from "../requests";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CopyQueryLinkContextMenuItem = ()=> {
  const { data } = useLocalData<MusicQueryEntity>();

  return <CopyLinkContextMenuItem
    txt={async ()=> {
      let { ownerUserPublic } = data;

      if (!ownerUserPublic) {
        const api = FetchApi.get(MusicQueriesApi);
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
        PATH_ROUTES.musics.frontend.queries.slug.withParams(
          ownerUserPublic.slug,
          data.slug,
        ),
      );
    }}
  />;
};
