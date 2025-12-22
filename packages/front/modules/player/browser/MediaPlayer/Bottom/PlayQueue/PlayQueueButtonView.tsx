import { QueueMusic } from "@mui/icons-material";
import { ControlButton } from "../../OtherButtons";

type Props = Omit<Parameters<typeof ControlButton>[0], "children" | "title">;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PlayQueueButtonView = (props: Props) => {
  return <ControlButton
    title="Lista de reproducción"
    {...props}
  >
    <QueueMusic />
  </ControlButton>;
};
