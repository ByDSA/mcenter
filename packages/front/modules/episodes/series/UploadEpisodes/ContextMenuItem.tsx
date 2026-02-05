import { EpisodeEntity } from "$shared/models/episodes";
import { EpisodeFileInfoEntity } from "$shared/models/episodes/file-info";
import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useUploadEpisodesModal } from "./Modal";

type UploadResult = {
  episode: EpisodeEntity;
  fileInfo: EpisodeFileInfoEntity;
};

type Props = {
  onUploadEachEpisode: (uploadResult: UploadResult)=> Promise<void> | void;
};
export const UploadEpisodesContextMenuItemCurrentCtx = (props: Props) => {
  const { openModal } = useUploadEpisodesModal(props);

  return <ContextMenuItem label="Subir episodios" onClick={()=>openModal()}/>;
};
