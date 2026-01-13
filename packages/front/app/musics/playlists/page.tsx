"use client";

import { MusicPlaylistEntity } from "$shared/models/musics/playlists";
import { logger } from "#modules/core/logger";
import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { Button } from "#modules/ui-kit/input/Button";
import { useInputText } from "#modules/ui-kit/input/UseInputText";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { useFormInModal } from "#modules/ui-kit/modal/useFormModal";
import { PlayListsList } from "#modules/musics/playlists";
import { useMusicPlaylists } from "#modules/musics/playlists/list/List";
import { useNewPlaylistButton } from "#modules/musics/playlists/NewPlaylistButton";
import { ArrayDataProvider } from "#modules/utils/array-data-context";
import MusicLayout from "../music.layout";
import styles from "./styles.module.css";

export default function MusicPlaylistsPage() {
  const usingMusicPlaylist = useMusicPlaylists();
  const newPlaylistButton = useNewPlaylistButton( {
    theme: "dark-gray",
    onSuccess: (newPlaylist: MusicPlaylistEntity) => {
      usingMusicPlaylist.addItem(newPlaylist);
      logger.debug("Nueva lista creada: " + newPlaylist.name);
    },
  } );
  const modal = useModal();

  return (
    <MusicLayout>
      <div>
        <section className={styles.newPlaylistSection}>
          <Button
            theme="blue"
            onClick={async ()=> {
              await modal.openModal( {
                title: "Query",
                className: styles.playQueryModal,
                content: <PlayQueryForm onSuccess={()=>modal.closeModal()}/>,
              } );
            }}>Reproducir query</Button>
          {newPlaylistButton.element}
        </section>
      </div>
      <ArrayDataProvider
        data={usingMusicPlaylist.data ?? []}
        addItem={usingMusicPlaylist.addItem}
        removeItemByIndex={usingMusicPlaylist.removeItemByIndex}
        setItemByIndex={usingMusicPlaylist.setItemByIndex}
      >
        <PlayListsList {...usingMusicPlaylist} />
      </ArrayDataProvider>
    </MusicLayout>
  );
}

type FormProps = {
  onSuccess?: (newPlaylist: any)=> void;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const PlayQueryForm = ( { onSuccess }: FormProps) => {
  const { element, value } = useInputText( {
    nullChecked: false,
    autofocus: true,
    defaultValue: useBrowserPlayer.getState().query,
    onPressEnter: () => form.submit(),
  } );
  const form = useFormInModal( {
    canSubmit: ()=> value.trim().length > 0,
    onSuccess,
    onSubmit: async () => {
      await useBrowserPlayer.getState().playQuery(value.toLowerCase());

      if (useBrowserPlayer.getState().status === "stopped")
        logger.error("Query inválida");
    },
  } );

  return (
    <>
      <section>
        <p>Query:</p>
        {element}
      </section>
      <footer>
        <Button
          theme="white"
          onClick={form.submit}
          disabled={!form.canSubmit}
        >
          Reproducir
        </Button>
      </footer>
    </>
  );
};
