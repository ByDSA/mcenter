import { MusicImageCover } from "#modules/musics/MusicCover";
import styles from "./Button.module.css";
import { useImageCoverSelectorModal } from "./Modal";
import { ImageCoverSelectorProps } from "./Selector";

export function ImageCoverSelectorButton(props: ImageCoverSelectorProps) {
  const { openModal } = useImageCoverSelectorModal(props);

  return <span
    className={styles.button}
    onClick={async ()=> {
      await openModal();
    }}
  >
    <MusicImageCover
      size="small"
      cover={props.current}
    />
    <span>{props.current?.metadata.label}</span>
  </span>;
}
