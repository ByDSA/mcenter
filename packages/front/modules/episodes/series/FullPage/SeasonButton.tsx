import { PaginationButtonProps } from "#modules/ui-kit/Pagination/Pagination";
import styles from "./Series.module.css";

export const SeasonButton = (props: PaginationButtonProps) => {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.isDisabled}
      className={`${props.isActive ? "ui-kit-pagination-active" : ""} ${styles.seasonButton}`}
      style={{
        padding: "0.5rem 1rem",
        margin: "0 0.25rem",
        borderRadius: "0.25rem",
        border: "1px solid var(--color-gray-600)",
        background: props.isActive ? "var(--color-blue-600)" : "var(--color-gray-800)",
        color: "white",
        cursor: props.isDisabled ? "default" : "pointer",
      }}
    >
      {props.pageValue}
    </button>
  );
};
