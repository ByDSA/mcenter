import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { MusicEntity } from "../../models";
import styles from "./EditModal.module.css";
import { EditMusic } from "./EditMusic";

type Props = {
  initialData: MusicEntity;
};
export function useEditMusicModal( { initialData }: Props) {
  const { openModal, ...usingModal } = useModal();

  return {
    ...usingModal,
    openModal: () => {
      return openModal( {
        title: "Editar música",
        className: styles.modal,
        content: <EditMusic
          initialData={initialData}
        />,
      } );
    },
  };
}
