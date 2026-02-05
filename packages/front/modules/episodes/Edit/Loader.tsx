import { useCallback, useState } from "react";
import { EpisodeEntity } from "$shared/models/episodes";
import { assertIsNotEmpty } from "$shared/utils/validation";
import { FetchApi } from "#modules/fetching/fetch-api";
import { EpisodesApi } from "#modules/episodes/requests";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { EditEpisodeForm } from "./Form";

type Props = {
  initialData: EpisodeEntity;
  onSuccess?: (data: EpisodeEntity)=> void;
};

export function EditEpisodeLoader( { initialData, onSuccess }: Props) {
  const { closeModal } = useModal(true);
  const fetchData = useCallback(async () => {
    const api = FetchApi.get(EpisodesApi);
    const result = await api.getManyByCriteria( {
      filter: {
        seriesKey: initialData.compKey.seriesKey,
        episodeKey: initialData.compKey.episodeKey,
      },
      expand: ["userInfo", "fileInfos", "series"],
    } );

    assertIsNotEmpty(result.data);

    return result.data[0] as EpisodeEntity;
  }, [initialData.compKey.seriesKey, initialData.compKey.episodeKey]);
  const [loadedData, setLoadedData] = useState<EpisodeEntity | null>(null);

  return (
    <AsyncLoader
      errorElement={<div>Error al cargar el episodio</div>}
      action={fetchData}
      onSuccess={d=>setLoadedData(d)}
    >
      <EditEpisodeForm
        initialData={loadedData!}
        onSuccess={(d) => {
          onSuccess?.(d);
          closeModal();
        }}
      />
    </AsyncLoader>
  );
}
