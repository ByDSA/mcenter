import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./Pagination.module.css";

export type PaginationButtonProps = {
  pageIndex: number;
  pageValue: number | string;
  isActive: boolean;
  isDisabled: boolean;
  onClick: ()=> void;
  label?: ReactNode | string;
};

export const DefaultPageButton = ( { pageValue,
  isActive,
  isDisabled,
  onClick,
  label }: PaginationButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isActive || isDisabled}
      className={classes(
        styles.button,
        isActive && styles.active,
        isDisabled && styles.disabled,
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {label || pageValue}
    </button>
  );
};
