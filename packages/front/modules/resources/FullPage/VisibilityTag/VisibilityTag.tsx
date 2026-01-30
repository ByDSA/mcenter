import { Public, PublicOff } from "@mui/icons-material";
import { InfoTag } from "../DateTag";

type Props = {
  isPublic: boolean;
  iconClassName?: string;
  className?: string;
};

export const VisibilityTag = ( { isPublic, ...commonProps }: Props) => {
  if (isPublic) {
    return <InfoTag
      {...commonProps}
      icon={<Public />}
      title={"Lista pública"}>
    Pública
    </InfoTag>;
  }

  return <InfoTag
    {...commonProps}
    icon={<PublicOff />}
    title={"Lista privada"}
  >
    Privada
  </InfoTag>;
};
