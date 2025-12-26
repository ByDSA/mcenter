"use client";

import { logger } from "#modules/core/logger";
import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { Button } from "#modules/ui-kit/input/Button";
import { useInputText } from "#modules/ui-kit/input/UseInputText";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { useFormInModal } from "#modules/ui-kit/modal/useFormModal";
import MusicLayout from "./music.layout";
import styles from "./Page.module.css";

export default function Page() {
  const modal = useModal();

  return <MusicLayout>
    <section className={styles.container}>
      <Button
        theme="blue"
        onClick={async ()=> {
          await modal.openModal( {
            title: "Query",
            className: styles.modal,
            content: <PlayQueryForm onSuccess={()=>modal.closeModal()}/>,
          } );
        }}>Reproducir query</Button>
    </section>
  </MusicLayout>;
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
