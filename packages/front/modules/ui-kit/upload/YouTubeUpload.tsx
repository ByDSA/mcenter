import { useState } from "react";
import { YouTube } from "@mui/icons-material";
import styles from "./YouTubeUpload.module.css";
import { UploadButton } from "./UploadButton";

type Props = {
  onSubmit: (input: string)=> void;
};

export function YouTubeUpload( { onSubmit }: Props) {
  const [url, setUrl] = useState("");
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
  const handleSubmit = () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl)
      return;

    if (!isValidYouTubeURL(trimmedUrl))
      return;

    onSubmit?.(trimmedUrl);
  };
  const getInputClasses = () => {
    const baseClass = styles.input;

    if (url.trim() && !isValidYouTubeURL(url.trim()))
      return `${baseClass} ${styles.inputInvalid}`;

    return `${baseClass} ${styles.inputValid}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <YouTubeLogo />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Pega aquí la URL del vídeo o playlist de YouTube..."
          className={getInputClasses()}
        />
      </div>

      <UploadButton
        onClick={handleSubmit}
        className={styles.uploadButton}
        titleAccess={"Subir"}
        disabled={!url.trim() || !isValidYouTubeURL(url.trim())}
      />
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
