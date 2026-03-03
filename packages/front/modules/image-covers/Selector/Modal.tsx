import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { ImageCoverSelector, type ImageCoverSelectorProps } from "./Selector";
import styles from "./Modal.module.css";

export function useImageCoverSelectorModal(props: ImageCoverSelectorProps) {
  const { LL } = useI18nContext();
  const { openModal, ...usingModal } = useModal();

  return {
    ...usingModal,
    openModal: ()=> {
      return openModal( {
        title: LL.modules.imageCover.select(),
        className: styles.modal,
        content: <ImageCoverSelector {...props}/>,
      } );
    },
  };
}
