import { MusicImageCover } from "#modules/musics/MusicCover";
import { useImageCover } from "../hooks";
import styles from "./Button.module.css";
import { useImageCoverSelectorModal } from "./Modal";
import { ImageCoverSelectorProps } from "./Selector";

export function ImageCoverSelectorButton(props: ImageCoverSelectorProps) {
  const { openModal } = useImageCoverSelectorModal(props);
  const { data: current } = useImageCover(props.currentId ?? null);

  return <span
    className={styles.button}
    onClick={async ()=> {
      await openModal();
    }}
  >
    <MusicImageCover
      size="small"
      cover={current}
    />
    <span>{current?.metadata.label ?? "(Imagen no definida)"}</span>
  </span>;
}
