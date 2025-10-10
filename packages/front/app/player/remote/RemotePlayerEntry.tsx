import { RemotePlayerDtos } from "$shared/models/player/remote-player/dto/domain";
import { useRouter } from "next/navigation";
import { classes } from "#modules/utils/styles";
import styles from "./RemotePlayerEntry.module.css";

type Props = {
  value: RemotePlayerDtos.Front.Dto;
};

const getStatusInfo = (status: RemotePlayerDtos.Front.Dto["status"]) => {
  switch (status) {
    case "offline":
      return {
        label: "Offline",
        className: styles.offline,
      };
    case "closed":
      return {
        label: "Closed",
        className: styles.idle,
      };
    case "open":
      return {
        label: "Open",
        className: styles.playing,
      };
    default:
      return {
        label: "Desconocido",
        className: styles.unknown,
      };
  }
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const RemotePlayerEntry = ( { value }: Props) => {
  const router = useRouter();
  const statusInfo = getStatusInfo(value.status);

  return (
    <button
      className={classes(styles.playerEntry, statusInfo.className)}
      type="button"
      onClick={value.status === "open"
        ? ()=> {
          router.push("/player/remote/" + value.id);
        }
        : undefined}
    >
      <div className={styles.statusContainer}>
        <span
          className={styles.statusIndicator}
          title={statusInfo.label}
        />
        <span className={styles.statusLabel}>{statusInfo.label}</span>
      </div>

      <div className={styles.playerInfo}>
        <span className={styles.playerName}>{value.publicName}</span>
        <span className={styles.playerId}>ID: {value.id}</span>
      </div>
    </button>
  );
};
