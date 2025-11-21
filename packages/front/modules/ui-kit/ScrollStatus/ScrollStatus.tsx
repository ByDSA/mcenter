import { PageSpinner } from "../spinner/Spinner";
import styles from "./styles.module.css";

type ScrollStatusProps = {
  ref: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  error?: unknown;
};
export function ScrollStatus( { ref, isLoading, error }: ScrollStatusProps) {
  return <div ref={ref} className={styles.content}>
    {isLoading && !error
      ? <PageSpinner/>
      : null}
    {
      !!error
        && error instanceof Error
        && <span>{error.message}</span>
    }
  </div>;
}
