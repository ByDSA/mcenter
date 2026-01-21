import { Edit } from "@mui/icons-material";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { classes } from "#modules/utils/styles";
import { ImageCoverEntity } from "../models";
import styles from "./Button.module.css";
import { ImageCoverEditorProps } from "./Form";
import { useImageCoverEditorModal } from "./Modal";

type EditProps = Pick<ImageCoverEditorProps, "onUpdate"> & {
  imageCover: ImageCoverEntity;
  className?: string;
};

export function ImageCoverEditButton(props: EditProps) {
  const { openModal } = useImageCoverEditorModal(props);

  return (
    <DaButton
      className={classes(styles.button, props.className)}
      onClick={async (e) => {
        e.stopPropagation(); // Evitar triggers padres si los hay
        await openModal();
      }}
      title="Editar Cover"
    >
      <Edit />
    </DaButton>
  );
}
