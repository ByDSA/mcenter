import { Edit } from "@mui/icons-material";
import { Button } from "#modules/ui-kit/input/Button";
import { ImageCoverEntity } from "../models";
import styles from "./Button.module.css";
import { ImageCoverEditorProps } from "./Editor";
import { useImageCoverEditorModal } from "./Modal";

type EditProps = Pick<ImageCoverEditorProps, "onUpdate"> & {
  imageCover: ImageCoverEntity;
};

export function ImageCoverEditButton(props: EditProps) {
  const { openModal } = useImageCoverEditorModal(props);

  return (
    <Button
      className={styles.button}
      onClick={async (e) => {
        e.stopPropagation(); // Evitar triggers padres si los hay
        await openModal();
      }}
      title="Editar Cover"
    >
      <Edit />
    </Button>
  );
}
