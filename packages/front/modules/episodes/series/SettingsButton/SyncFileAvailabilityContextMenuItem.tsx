import { PATH_ROUTES } from "$shared/routing";
import { assertIsDefined } from "$shared/utils/validation";
import z from "zod";
import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { FetchApi } from "#modules/fetching/fetch-api";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { logger } from "#modules/core/logger";
import { useLocalData } from "#modules/utils/local-data-context";
import { EpisodesApi } from "#modules/episodes/requests";
import { SeriesEntity } from "../models";

const requestSchema = z.object( {
  ids: z.string().array(),
} );
const responseSchema = z.any();

export const SyncFileAvailabilityContextMenuItem = () => {
  const { data } = useLocalData<SeriesEntity>();
  const handleClick = async () => {
    assertIsDefined(data);

    // 1. Obtener todos los episodios de la serie con sus fileInfos
    const episodesApi = FetchApi.get(EpisodesApi);
    const res = await episodesApi.getManyByCriteria( {
      filter: {
        seriesId: data.id,
      },
      expand: ["fileInfos"],
      limit: 9999,
    } );
    // 2. Recopilar todos los IDs de fileInfos de todos los episodios
    const ids = res.data.flatMap(
      (episode) => (episode.fileInfos ?? []).map((fi) => fi.id),
    );

    if (ids.length === 0) {
      logger.warn("No se encontraron archivos para comprobar en esta serie.");

      return;
    }

    // 3. Llamar al endpoint de actualización de offloaded
    const fetcher = makeFetcher<any, any>( {
      method: "POST",
      requestSchema,
      responseSchema,
    } );

    await fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.admin.fileInfoUpdateOffloaded.path),
      body: {
        ids,
      },
    } );

    logger.info(`Comprobando disponibilidad (${ids.length} archivos).`);
  };

  return (
    <ContextMenuItem
      label="Comprobar disponibilidad"
      onClick={handleClick}
    />
  );
};
