import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { EpisodeEntity } from "../models";
import { EditEpisodeLoader } from "./Loader";
import styles from "./EditModal.module.css";

type Props = {
  initialData: EpisodeEntity;
};

export function useEditEpisodeModal( { initialData }: Props) {
  const { openModal, ...usingModal } = useModal();

  return {
    ...usingModal,
    openModal: () => {
      return openModal( {
        title: "Editar episodio",
        className: styles.modal,
        content: (
          <EditEpisodeLoader
            initialData={initialData}
          />
        ),
      } );
    },
  };
}
