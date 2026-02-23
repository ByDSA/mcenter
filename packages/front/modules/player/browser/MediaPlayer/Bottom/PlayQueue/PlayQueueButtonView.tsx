import { QueueMusic } from "@mui/icons-material";
import { ComponentProps } from "react";
import { ControlButtonView } from "#modules/player/common/ControlButtonsView";

type Props = Omit<ComponentProps<typeof ControlButtonView>, "children" | "title">;

export const PlayQueueButtonView = (props: Props) => {
  return <ControlButtonView
    title="Lista de reproducción"
    {...props}
  >
    <QueueMusic />
  </ControlButtonView>;
};
