import { Add } from "@mui/icons-material";
import { MusicPlaylistEntity } from "$shared/models/musics/playlists";
import { MusicQueryEntity } from "$shared/models/musics/queries";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { NewQueryContextMenuItem } from "#modules/musics/lists/queries/New/ContextMenuItem";
import { NewPlaylistContextMenuItem } from "#modules/musics/lists/playlists/New/ContextMenuItem";
import { PlayQueryContextMenuItem } from "#modules/musics/lists/queries/PlayQuery";
import styles from "./styles.module.css";

type Props = {
  onSuccess: (newValue: MusicPlaylistEntity | MusicQueryEntity, type: "playlist" | "query")=> void;
};
export const NewListButton = (props: Props) => {
  const { openMenu } = useContextMenuTrigger();

  return <Button
    theme="dark-gray"
    left={<span className={styles.left}><Add /></span>}
    onClick={(e)=>openMenu( {
      event: e,
      content: <>
        <NewQueryContextMenuItem onSuccess={v=>props.onSuccess(v, "query")}/>
        <NewPlaylistContextMenuItem onSuccess={v=>props.onSuccess(v, "playlist")}/>
        <PlayQueryContextMenuItem />
      </>,
    } )}
  >Nueva</Button>;
};
