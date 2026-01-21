import { Add } from "@mui/icons-material";
import { MusicPlaylistEntity } from "$shared/models/musics/playlists";
import { MusicSmartPlaylistEntity } from "$shared/models/musics/smart-playlists";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { NewSmartPlaylistContextMenuItem } from "#modules/musics/lists/smart-playlists/New/ContextMenuItem";
import { NewPlaylistContextMenuItem } from "#modules/musics/lists/playlists/New/ContextMenuItem";
import { PlaySmartPlaylistContextMenuItem } from "#modules/musics/lists/smart-playlists/Play";
import styles from "./styles.module.css";

type Props = {
  onSuccess: (newValue: MusicPlaylistEntity | MusicSmartPlaylistEntity, type: "playlist" |
    "smart-playlist")=> void;
};
export const NewListButton = (props: Props) => {
  const { openMenu } = useContextMenuTrigger();

  return <DaButton
    theme="dark-gray"
    left={<span className={styles.left}><Add /></span>}
    onClick={(e)=>openMenu( {
      event: e,
      content: <>
        <NewPlaylistContextMenuItem onSuccess={v=>props.onSuccess(v, "playlist")}/>
        <NewSmartPlaylistContextMenuItem onSuccess={v=>props.onSuccess(v, "smart-playlist")}/>
        <PlaySmartPlaylistContextMenuItem />
      </>,
    } )}
  >Nueva</DaButton>;
};
