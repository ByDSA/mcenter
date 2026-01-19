import { Add } from "@mui/icons-material";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import { NewImageCoverProps } from "./Form";
import { useNewImageCoverModal } from "./Modal";

type Props = NewImageCoverProps & {
  className?: string;
};

export function NewImageCoverButton(props: Props) {
  const { openModal } = useNewImageCoverModal(props);
  const txt = "Nueva imagen";

  return (
    <Button
      theme="white"
      className={props.className}
      onClick={async (e) => {
        e.stopPropagation(); // Evitar triggers padres si los hay
        await openModal();
      }}
      title={txt}
      left={<Add />}
    >{txt}</Button>
  );
}
