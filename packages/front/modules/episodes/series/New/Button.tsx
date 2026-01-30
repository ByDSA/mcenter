import { Add } from "@mui/icons-material";
import { SeriesEntity } from "$shared/models/episodes/series";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { useNewSeriesModal } from "#modules/episodes/series/New/Modal";

type Props = {
  onSuccess: (newValue: SeriesEntity)=> void;
};

export const NewSeriesButton = (props: Props) => {
  const { openModal } = useNewSeriesModal( {
    onSuccess: props.onSuccess,
  } );

  return (
    <DaButton
      theme="dark-gray"
      left={
        <Add />
      }
      onClick={() => openModal()}
    >
      Nueva
    </DaButton>
  );
};
