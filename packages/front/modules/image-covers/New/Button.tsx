import { Add } from "@mui/icons-material";
import { Button } from "#modules/ui-kit/input/Button";
import { NewImageCoverProps } from "./Content";
import { useNewImageCoverModal } from "./Modal";

type Props = NewImageCoverProps;

export function NewImageCoverButton(props: Props) {
  const { openModal } = useNewImageCoverModal(props);
  const txt = "Nueva imagen";

  return (
    <Button
      theme="white"
      onClick={async (e) => {
        e.stopPropagation(); // Evitar triggers padres si los hay
        await openModal();
      }}
      title={txt}
      left={<Add />}
    >{txt}</Button>
  );
}
