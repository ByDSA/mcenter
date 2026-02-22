import { AnchorHTMLAttributes } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./Anchor.module.css";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  theme?: "black" | "default" | "text" | "white";
  disabled?: boolean;
};
export const DaAnchor = ( { theme = "default", className = "",
  children, disabled, href, onClick, ...props }: Props) => {
  const Tag = (!!href || onClick) && !disabled ? "a" : "span";
  const isAnchor = Tag === "a";
  const finalHref = isAnchor ? href : undefined;
  const finalOnClick = isAnchor ? onClick : undefined;

  return (
    <Tag
      className={classes(
        theme === "white" && styles.white,
        theme === "black" && styles.black,
        theme === "text" && styles.text,
        styles.anchor,
        disabled && styles.disabled,
        className,
      )}
      {...props}
      href={finalHref}
      onClick={finalOnClick}
    >
      {children}
    </Tag>
  );
};
