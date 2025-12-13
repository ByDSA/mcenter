// LatestModal.tsx
import { EpisodeCompKey, EpisodeEntity } from "$shared/models/episodes";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import styles from "#modules/history/Latest/Latest.module.css";
import { EpisodeLatestViews } from "./LatestViews";

type Props = {
  episode?: EpisodeEntity;
  episodeCompKey: EpisodeCompKey;
  maxTimestamp?: number;
};

export const useEpisodeLatestViewsModal = (props: Props) => {
  const { openModal, ...usingModal } = useModal();

  return {
    ...usingModal,
    openModal: () => {
      return openModal( {
        title: "Últimas visualizaciones",
        className: styles.modal,
        content: <EpisodeLatestViews {...props} />,
      } );
    },
  };
};
