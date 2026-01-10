import { MusicImageCover } from "#modules/musics/MusicCover";
import styles from "./Button.module.css";
import { useImageCoverSelectorModal } from "./Modal";
import { getSmallCoverUrl, ImageCoverSelectorProps } from "./Selector";

export function ImageCoverSelectorButton(props: ImageCoverSelectorProps) {
  const { openModal } = useImageCoverSelectorModal(props);

  return <span
    className={styles.button}
    onClick={async ()=> {
      await openModal();
    }}
  >
    <MusicImageCover
      img={{
        url: props.current ? getSmallCoverUrl(props.current) : undefined,
      }} />
    <span>{props.current?.metadata.label}</span>
  </span>;
}
