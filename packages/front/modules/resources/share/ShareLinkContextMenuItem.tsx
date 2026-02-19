"use client";

import type { ShareLinkOptions } from "./ShareLinkModal";
import { ReactNode } from "react";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { ShareModalContent } from "./ShareLinkModal";
import styles from "./ShareLinkModal.module.css";

type Props = {
  buildUrl: (opts: ShareLinkOptions)=> Promise<string> | string;
  showAutoplay?: boolean;
  showIncludeToken?: boolean;
  topNode?: ReactNode;
};

const TITLE = "Compartir enlace";

export const ShareContextMenuItem = (props: Props) => {
  const { openModal, closeModal } = useModal();
  const handleOpen = () => openModal( {
    title: TITLE,
    className: styles.modal,
    content: (
      <ShareModalContent
        buildUrl={props.buildUrl}
        showAutoplay={props.showAutoplay}
        showIncludeToken={props.showIncludeToken}
        onCopy={() => closeModal()}
        topNode={props.topNode}
      />
    ),
  } );

  return <ContextMenuItem label={TITLE} onClick={handleOpen} />;
};
