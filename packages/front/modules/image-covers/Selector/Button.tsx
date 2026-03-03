import { MusicImageCover } from "#modules/musics/MusicCover";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { useImageCover } from "../hooks";
import styles from "./Button.module.css";
import { useImageCoverSelectorModal } from "./Modal";
import { ImageCoverSelectorProps } from "./Selector";

export function ImageCoverSelectorButton(props: ImageCoverSelectorProps) {
  const { LL } = useI18nContext();
  const { openModal } = useImageCoverSelectorModal(props);
  const { data: current } = useImageCover(props.currentId ?? null);

  return <button
    type="button"
    className={styles.button}
    onClick={async ()=> {
      await openModal();
    }}
  >
    <MusicImageCover
      size="small"
      cover={current}
    />
    <span>{current?.metadata.label ?? LL.modules.imageCover.undefined()}</span>
  </button>;
}
