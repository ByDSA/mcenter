import { useCallback } from "react";
import { MusicEntity } from "$shared/models/musics";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicsApi } from "#modules/musics/requests";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { useLocalData } from "#modules/utils/local-data-context";
import { useMusic } from "#modules/musics/hooks";
import { EditMusicForm } from "./Form";

export function EditMusicLoader() {
  const { data: initialData } = useLocalData<MusicEntity>();
  const { closeModal } = useModal(true);
  const fetchData = useCallback(async () => {
    const api = FetchApi.get(MusicsApi);
    const result = await api.getOneByCriteria( {
      filter: {
        id: initialData.id,
      },
      expand: ["userInfo", "fileInfos", "imageCover"],
    } );

    return result.data as MusicEntity;
  }, [initialData.id]);

  return (
    <AsyncLoader
      errorElement={<div>Error al cargar la música</div>}
      action={fetchData}
    >
      <EditMusicForm
        initialData={()=>useMusic.getCache(initialData.id)!}
        onSuccess={() => {
          closeModal();
        }}
        onDelete={() => {
          closeModal();
        }}
      />
    </AsyncLoader>
  );
}
