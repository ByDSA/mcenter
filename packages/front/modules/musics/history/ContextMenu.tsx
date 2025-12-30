import { UserPayload } from "$shared/models/auth";
import { logger } from "#modules/core/logger";
import { FetchApi } from "#modules/fetching/fetch-api";
import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { SetState } from "#modules/utils/resources/useCrud";
import { useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { getLongDateStr } from "#modules/utils/dates";
import { DeleteHistoryEntryModalContentWrapper } from "#modules/series/episodes/history/entry/HistoryEntry";
import { EditMusicContextMenuItem } from "../musics/EditMusic/ContextMenu";
import { AddToPlaylistContextMenuItem } from "../playlists/AddToPlaylistContextMenuItem";
import { CopyMusicMenuItem } from "../musics/MusicEntry/ContextMenu";
import { MusicLatestViewsContextMenuItem } from "./LatestViews/ContextMenuItem";
import { MusicHistoryApi } from "./requests";

type Data = MusicHistoryApi.GetManyByCriteria.Data;

type Props<T> = {
  value: T;
  user: UserPayload | null;
  setValue: SetState<T>;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const HistoryEntryContextMenu = ( { value,
  user,
  setValue }: Props<Data>) => (
  <>
    <AddToPlaylistContextMenuItem
      musicId={value.resourceId}
      user={user}
    />
    <CopyMusicMenuItem
      music={value.resource}
      token={user?.id}
    />
    <EditMusicContextMenuItem
      initialData={value.resource}
    />
    <MusicLatestViewsContextMenuItem
      music={value.resource}
      musicId={value.resourceId}
      maxTimestamp={value.date.timestamp}
    />
    <DeleteHistoryEntryContextMenuItem value={value} setValue={setValue}/>

  </>
);

function DeleteHistoryEntryContextMenuItem( { setValue, value }: Omit<Props<Data>, "user">) {
  const { openModal } = useConfirmModal();

  return <ContextMenuItem
    label="Eliminar del historial"
    theme="danger"
    onClick={async () => {
      await openModal( {
        title: "Confirmar borrado",
        content: <DeleteHistoryEntryModalContentWrapper>
          <p>Fecha: {getLongDateStr(new Date(value.date.timestamp * 1_000), "datetime")}</p>
          <p>Título: {value.resource.title}</p>
          <p>Artista: {value.resource.artist}</p>
        </DeleteHistoryEntryModalContentWrapper>,
        action: async ()=> {
          const api = FetchApi.get(MusicHistoryApi);

          await api.deleteOneById(value.id);
          logger.info("Entrada de historial eliminada");
          setValue(undefined);

          return true;
        },
      } );
    }}
  />;
}
