import { MusicEntity } from "$shared/models/musics";
import { MusicLatestViews } from "#modules/musics/history/LatestViews/LatestViews";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import styles from "#modules/history/Latest/Latest.module.css";

type Props = {
  music?: MusicEntity;
  musicId: string;
  maxTimestamp?: number;
};

export const useMusicLatestViewsModal = (props: Props) => {
  const { openModal, ...usingModal } = useModal();

  return {
    ...usingModal,
    openModal: () => {
      return openModal( {
        title: "Últimas visualizaciones",
        className: styles.modal,
        content: <MusicLatestViews {...props} />,
      } );
    },
  };
};
