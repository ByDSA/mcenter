import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { SetState } from "#modules/utils/resources/useCrud";
import { MusicEntity } from "../../models";
import styles from "./EditModal.module.css";
import { EditMusic } from "./EditMusic";

type Props = {
  initialData: MusicEntity;
  setData?: SetState<MusicEntity>;
};
export function useEditMusicModal( { initialData, setData }: Props) {
  const { openModal, ...usingModal } = useModal();

  return {
    ...usingModal,
    openModal: () => {
      return openModal( {
        title: "Editar música",
        className: styles.modal,
        content: <EditMusic
          initialData={initialData}
          setData={setData}
        />,
      } );
    },
  };
}
