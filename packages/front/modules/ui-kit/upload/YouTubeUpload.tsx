import { useEffect, useRef, useState } from "react";
import { YouTube } from "@mui/icons-material";
import { TasksCrudDtos } from "$shared/models/tasks";
import { JSX } from "react";
import { LoadingSpinner } from "#modules/fetching";
import { classes } from "#modules/utils/styles";
import styles from "./YouTubeUpload.module.css";
import { UploadButton } from "./UploadButton";

type OnSubmitProps<S> = {
  onChangeStatus: (status: S)=> void;
};
type Props<S> = {
  onSubmit: (input: string, props: OnSubmitProps<S>)=> Promise<void>;
  textStatus?: (status: S)=> JSX.Element | string;
};

export function YouTubeUpload<
  S extends TasksCrudDtos.TaskStatus.TaskStatus<unknown>
>( { onSubmit, textStatus }: Props<S>) {
  const [doing, setDoing] = useState(false);
  const doingRef = useRef(doing);

  useEffect(() => {
    doingRef.current = doing;
  }, [doing]);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<S | null>(null);
  // Validar URL de YouTube
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const isValidYouTubeURL = (u: string) => {
    const patterns = [
      /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=.+/,
      /^https?:\/\/(www\.)?youtube\.com\/playlist\?list=.+/,
      /^https?:\/\/youtu\.be\/.+/,
    ];

    return patterns.some(pattern => pattern.test(u));
  };
  const handleSubmit = async () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl)
      return;

    try {
      setDoing(true);

      if (!isValidYouTubeURL(trimmedUrl))
        throw new Error("URL de YouTube no válida");

      await onSubmit?.(trimmedUrl, {
        onChangeStatus: (s) => setStatus(s),
      } );
    } finally {
      setDoing(false);
    }
  };
  const getInputClasses = () => {
    const baseClass = styles.input;

    if (url.trim() && !isValidYouTubeURL(url.trim()))
      return `${baseClass} ${styles.inputInvalid}`;

    return `${baseClass} ${styles.inputValid}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.firstRow}>
        <div className={styles.inputWrapper}>
          <YouTubeLogo />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Pega aquí la URL del vídeo o playlist de YouTube..."
            className={getInputClasses()}
            disabled={doing}
          />
        </div>

        <div className={styles.actions}>
          {!doing
      && <UploadButton
        onClick={handleSubmit}
        className={styles.uploadButton}
        titleAccess={"Subir"}
        disabled={!url.trim() || !isValidYouTubeURL(url.trim())}
      />
          }
          {
            doing && <div className={styles.loading}>{LoadingSpinner}</div>
          }
        </div>
      </div>
      <div className={classes(
        styles.status,
        status?.status === "failed" && styles.statusError,
        status?.status === "completed" && styles.statusCompleted,
      )}>
        {status && status.status === "failed" && <span>{status.failedReason}</span>}
        {status && status.status !== "failed"
            && (textStatus?.(status) ?? <span>Processing task</span>)}
      </div>
    </div>
  );
}

function YouTubeLogo() {
  return (
    <div className={styles.logoContainer}>
      <YouTube className={styles.youtubeLogo}/>
    </div>
  );
}
