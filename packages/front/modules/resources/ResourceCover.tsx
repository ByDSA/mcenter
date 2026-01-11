import { ReactNode } from "react";
import Image from "next/image";
import { classes } from "#modules/utils/styles";
import styles from "./ResourceCover.module.css";

export type ResourceImageCoverProps = {
  className?: string;
  img?: {
    url?: string;
    alt?: string;
    title?: string;
    className?: string;
  };
  icon: {
    element: ReactNode;
    className?: string;
  };
  onClick?: ()=> Promise<void> | void;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ResourceImageCover = (props: ResourceImageCoverProps) => {
  return <div className={classes(styles.cover, props.className)}>
    {props.img?.url
      ? (
        <Image
          src={props.img.url}
          alt={props.img.alt ?? "Cover"}
          title={props.img.title}
          onClick={props.onClick}
          fill
          unoptimized
          className={classes(styles.image, props.img.className)}
        />
      )
      : (
        <span
          className={classes(styles.icon, props.icon.className)}
          onClick={props.onClick}
        >
          {props.icon.element}
        </span>
      )}
  </div>;
};
