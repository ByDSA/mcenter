import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { SetState } from "#modules/utils/react";
import { EpisodeEntity } from "../models";
import { EditEpisodeLoader } from "./Loader";
import styles from "./EditModal.module.css";

type Props = {
  initialData: EpisodeEntity;
  setData: SetState<EpisodeEntity>;
};

export function useEditEpisodeModal( { initialData, setData }: Props) {
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
            onSuccess={(updated) => {
              setData((old) => {
                if (!old)
                  return old;

                return {
                  ...old,
                  ...updated,
                };
              } );
            }}
          />
        ),
      } );
    },
  };
}
