import { Spinner } from "#modules/ui-kit/spinner";
import styles from "./styles.module.css";

type ScrollStatusProps = {
  ref: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  error?: unknown;
};
export function ScrollStatus( { ref, isLoading, error }: ScrollStatusProps) {
  return <div ref={ref} className={styles.content}>
    {isLoading && !error
      ? <Spinner/>
      : null}
    {
      !!error
        && error instanceof Error
        && <span>{error.message}</span>
    }
  </div>;
}
