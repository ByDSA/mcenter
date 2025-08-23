import { Spinner } from "#modules/ui-kit/spinner";
import style from "./fetching.style.module.css";

const L = function Loading() {
  return (
    <div style={{
      fontSize: "8vw",
      textAlign: "center",
      margin: "0",
      padding: "0",
    }}>Loading...
    </div>
  );
};

export {
  L as Loading,
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const LoadingSpinner = <span className={style.loading}><Spinner /></span>;
