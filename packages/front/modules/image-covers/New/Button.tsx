import { Add } from "@mui/icons-material";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { NewImageCoverProps } from "./Form";
import { useNewImageCoverModal } from "./Modal";

type Props = NewImageCoverProps & {
  className?: string;
};

export function NewImageCoverButton(props: Props) {
  const { LL } = useI18nContext();
  const { openModal } = useNewImageCoverModal(props);

  return (
    <DaButton
      theme="white"
      className={props.className}
      onClick={async (e) => {
        e.stopPropagation(); // Evitar triggers padres si los hay
        await openModal();
      }}
      title={LL.modules.imageCover.new()}
      left={<Add />}
    >{LL.modules.imageCover.new()}</DaButton>
  );
}
