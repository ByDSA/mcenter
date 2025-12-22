import { ResourceImageCover, ResourceImageCoverProps } from "#modules/resources/ResourceCover";
import { classes } from "#modules/utils/styles";
import { MusicsIcon } from "./MusicsIcon";
import styles from "./MusicCover.module.css";

type Props =
  Omit<ResourceImageCoverProps, "icon"> &
    {icon?: Omit<ResourceImageCoverProps["icon"], "element">};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicImageCover = (props?: Props) => {
  return <ResourceImageCover
    className={props?.className}
    img={props?.img}
    icon={{
      element: <MusicsIcon />,
      className: classes(styles.icon, props?.icon?.className),
    }}/>;
};
