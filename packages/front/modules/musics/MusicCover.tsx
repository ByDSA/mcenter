import { ImageCover, ImageCoverEntity } from "$shared/models/image-covers";
import { WithOptional } from "$shared/utils/objects/types";
import { ResourceImageCover, ResourceImageCoverProps } from "#modules/resources/ResourceCover/ResourceCover";
import { classes } from "#modules/utils/styles";
import { ImageCoverEditButton } from "#modules/image-covers/Edit/Button";
import { ImageCoverEditorProps } from "#modules/image-covers/Edit/Form";
import { getLargeCoverUrl, getMediumCoverUrl, getOriginalCoverUrl, getSmallCoverUrl } from "#modules/image-covers/Selector/image-cover-utils";
import { MusicsIcon } from "./MusicsIcon";
import styles from "./MusicCover.module.css";

type Props =
  Omit<ResourceImageCoverProps, "icon" | "img"> &
    {
      icon?: WithOptional<ResourceImageCoverProps["icon"], "element">;
      onClick?: ()=> void;
      editable?: boolean;
      onUpdate?: ImageCoverEditorProps["onUpdate"];
      cover?: ImageCover | null;
      size?: "large" | "medium" | "small";
      title?: string;
    };

export const MusicImageCover = (props?: Props) => {
  const img = props?.cover
    ? {
      url: (()=>{
        if (props.size === "small")
          return getSmallCoverUrl(props.cover);

        if (props.size === "medium")
          return getMediumCoverUrl(props.cover);

        if (props.size === "large")
          return getLargeCoverUrl(props.cover);

        return getOriginalCoverUrl(props.cover);
      } )(),
      title: props?.title,
    }
    : {
      url: undefined,
      title: props?.title,
    };

  return <span className={styles.wrap}>
    <ResourceImageCover
      className={props?.className}
      img={img}
      onClick={props?.onClick}
      icon={{
        element: props?.icon?.element ?? <MusicsIcon />,
        className: classes(styles.icon, props?.icon?.className),
      }}/>
    {props?.editable && props.cover && "id" in props.cover && <ImageCoverEditButton
      className={styles.editButton}
      imageCover={props.cover as ImageCoverEntity}
      onUpdate={props.onUpdate}
    />}
  </span>;
};
