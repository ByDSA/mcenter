import { Add } from "@mui/icons-material";
import { useCallback } from "react";
import { Button } from "#modules/ui-kit/input/Button";
import { useModal } from "#modules/ui-kit/modal/useModal";
import { useInputText } from "#modules/ui-kit/input/UseInputText";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicPlaylistsApi } from "./requests";
import { PlaylistEntity } from "./Playlist";

type ButtonProps = {
  onClick: ()=> void;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
const NewPlaylistButton = ( { onClick }: ButtonProps) => {
  return <Button
    onClick={onClick}
    left={<Add />}>
    Nueva playlist
  </Button>;
};

type Props = {
  onSuccess?: (newPlaylist: any)=> void;
};
export function useNewPlaylistButton(props: Props) {
  const { element, open } = useNewPlaylistModal(props);

  return {
    element: <>
      <NewPlaylistButton onClick={()=>open()} />
      {element}
    </>,
  };
}

function useNewPlaylistModal( { onSuccess }: Props) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { Modal, ...modal } = useModal( {
    title: "Nueva playlist",
  } );
  const { element: inputNameElement, ref, setValue: setName, value: nameValue } = useInputText( {
    nullChecked: false,
    onPressEnter: ()=>send(),
  } );
  const canSend = useCallback(
    ()=>nameValue.trim().length > 0,
    [nameValue],
  );
  const send = useCallback(async () => {
    if (!canSend())
      return;

    const api = FetchApi.get(MusicPlaylistsApi);
    const body = {
      name: nameValue.trim(),
      slug: nameValue.trim(),
    };
    const res = await api.createOne(body);
    const newPlaylist = res.data as PlaylistEntity | null;

    onSuccess?.(newPlaylist);
    await modal.close();
  }, [canSend]);

  return {
    ...modal,
    open: () => {
      modal.open();

      setName("");

      setTimeout(() => {
        if (!ref.current)
          return;

        ref.current.focus();
      }, 0);
    },
    element:
      <Modal>
        <section>
          <p>Nombre:</p>
          {inputNameElement}
        </section>
        <footer>
          <Button onClick={send}
            disabled={!canSend()}
          >Crear</Button>
        </footer>
      </Modal>,
  };
}
