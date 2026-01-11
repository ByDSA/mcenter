import { Edit } from "@mui/icons-material";
import { Button } from "#modules/ui-kit/input/Button";
import { classes } from "#modules/utils/styles";
import { ImageCoverEntity } from "../models";
import styles from "./Button.module.css";
import { ImageCoverEditorProps } from "./Editor";
import { useImageCoverEditorModal } from "./Modal";

type EditProps = Pick<ImageCoverEditorProps, "onUpdate"> & {
  imageCover: ImageCoverEntity;
  className?: string;
};

export function ImageCoverEditButton(props: EditProps) {
  const { openModal } = useImageCoverEditorModal(props);

  return (
    <Button
      className={classes(styles.button, props.className)}
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
