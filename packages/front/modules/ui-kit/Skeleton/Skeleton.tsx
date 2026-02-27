import { classes } from "#modules/utils/styles";
import styles from "./Skeleton.module.css";

interface SkeletonProps {

  /** Override width (e.g. "60%", "120px"). Defaults vary by variant. */
  width?: number | string;

  /** Override height. Defaults vary by variant. */
  height?: number | string;

  /** Border radius override */
  rounded?: boolean | string;

  /** Extra className */
  className?: string;
}
export function Skeleton( { width,
  height,
  rounded,
  className }: SkeletonProps) {
  const style: React.CSSProperties = {};

  if (width !== undefined)
    style.width = typeof width === "number" ? `${width}px` : width;

  if (height !== undefined)
    style.height = typeof height === "number" ? `${height}px` : height;

  if (rounded === true)
    style.borderRadius = "9999px";
  else if (rounded === false)
    style.borderRadius = "0";
  else if (rounded !== undefined)
    style.borderRadius = rounded;

  return (
    <span
      role="status"
      aria-busy="true"
      aria-label="Cargando…"
      style={style}
      className={classes(
        styles.skeleton,
        className,
      )}
    />
  );
}
