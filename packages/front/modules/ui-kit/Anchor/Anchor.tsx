import { AnchorHTMLAttributes } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./Anchor.module.css";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  theme?: "black" | "default" | "text" | "white";
};
export const DaAnchor = ( { theme = "default", className = "",
  children, ...props }: Props) => {
  const Tag = props.href!! ? "a" : "span";

  return (
    <Tag
      className={classes(
        theme === "white" && styles.white,
        theme === "black" && styles.black,
        theme === "text" && styles.text,
        styles.anchor,
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};
