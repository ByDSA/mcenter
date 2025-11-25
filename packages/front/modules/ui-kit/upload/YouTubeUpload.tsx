import { useEffect, useRef, useState } from "react";
import { YouTube } from "@mui/icons-material";
import { JSX } from "react";
import { YoutubeCrudDtos } from "$shared/models/youtube/dto/transport";
import { assertIsDefined } from "$shared/utils/validation";
import { MusicEntity } from "$shared/models/musics";
import { PATH_ROUTES } from "$shared/routing";
import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { classes } from "#modules/utils/styles";
import { backendUrl } from "#modules/requests";
import { streamTaskStatus } from "#modules/tasks";
import { Spinner } from "../spinner/Spinner";
import styles from "./YouTubeUpload.module.css";
import { UploadButton } from "./UploadButton";

type OnSubmitProps<S> = Pick<Props,
 "musicId" | "onCreateMusic" | "onCreateMusicFileInfo"
> & {
  onChangeStatus: (status: S)=> void;
  withCredentials?: boolean;
};

export type YoutubeTaskStatus = YoutubeCrudDtos.ImportOne.TaskStatus.Status
  | YoutubeCrudDtos.ImportPlaylist.TaskStatus.Status;

type InputData = {
  type: "playlist" | "video";
  id: string;
};

type Context = {
  addedMusics: MusicEntity[];
  addedMusicFileInfos: MusicFileInfoEntity[];
};

const defaultTextStatus = (s: YoutubeTaskStatus)=>(<>{ s.attempts > 1 && <span>(Intento {s.attempts}/{s.maxAttempts}) </span> }<span>{s.progress.percentage.toFixed(1)}% {s.progress.message}</span></>);
const defaultOnSubmit: Props["onSubmit"] = async (
  input,
  { onChangeStatus, onCreateMusic, onCreateMusicFileInfo, musicId, withCredentials },
)=>{
  let res: YoutubeCrudDtos.ImportOne.CreateTask.Response
        | YoutubeCrudDtos.ImportPlaylist.CreateTask.Response;

  if (input.type === "playlist") {
    const response = await fetch(
      backendUrl(PATH_ROUTES.youtube.import.music.playlist.withParams(input.id)),
      {
        credentials: withCredentials ? "include" : "omit",
      },
    ).then(r=> r.json());
    const parsedResponse = YoutubeCrudDtos.ImportPlaylist.CreateTask
      .responseSchema.parse(response);

    res = parsedResponse;
  } else {
    const response = await fetch(
      backendUrl(PATH_ROUTES.youtube.import.music.one.withParams(input.id, {
        musicId,
      } )),
      {
        credentials: withCredentials ? "include" : "omit",
      },
    ).then(r=> r.json());
    const parsedResponse = YoutubeCrudDtos.ImportOne.CreateTask
      .responseSchema.parse(response);

    res = parsedResponse;
  }

  const taskId = res.data?.job.id;

  assertIsDefined(taskId);

  await streamTaskStatus<YoutubeTaskStatus>( {
    taskName: "YouTube import music",
    url: backendUrl(PATH_ROUTES.tasks.statusStream.withParams(taskId, 10_000)),
    // eslint-disable-next-line require-await
    onListenStatus: async (taskStatus, ctx: Context) => {
      ctx.addedMusics = ctx.addedMusics ?? [];
      ctx.addedMusicFileInfos = ctx.addedMusicFileInfos ?? [];

      if (input.type === "playlist") {
        const data = YoutubeCrudDtos.ImportPlaylist.TaskStatus.statusSchema.parse(
          taskStatus,
        );

        taskStatus = data;

        if (data.progress.created) {
          for (
            const [_ytid, created] of Object.entries(data.progress.created)) {
            const { fileInfo, music } = created;

            if (music && onCreateMusic && !ctx.addedMusics.find(m=>m.id === music.id)) {
              ctx.addedMusics.push(music as MusicEntity);
              onCreateMusic?.(music as MusicEntity);
            }

            if (onCreateMusicFileInfo && !ctx.addedMusicFileInfos.find(m=>m.id === fileInfo.id)) {
              ctx.addedMusicFileInfos.push(fileInfo as MusicFileInfoEntity);
              onCreateMusicFileInfo?.(fileInfo as MusicFileInfoEntity);
            }
          }
        }
      } else {
        const data = YoutubeCrudDtos.ImportOne.TaskStatus.statusSchema.parse(
          taskStatus,
        );

        taskStatus = data;

        if (data.returnValue?.created) {
          const { fileInfo, music } = data.returnValue.created;

          if (music && onCreateMusic && !ctx.addedMusics.find(m=>m.id === music.id)) {
            ctx.addedMusics.push(music as MusicEntity);
            onCreateMusic?.(music as MusicEntity);
          }

          if (onCreateMusicFileInfo && !ctx.addedMusicFileInfos.find(m=>m.id === fileInfo.id)) {
            ctx.addedMusicFileInfos.push(fileInfo as MusicFileInfoEntity);
            onCreateMusicFileInfo?.(fileInfo as MusicFileInfoEntity);
          }
        }
      }

      onChangeStatus(taskStatus);

      return taskStatus;
    },
  } );
};

type Props = {
  onSubmit?: (input: InputData, props: OnSubmitProps<YoutubeTaskStatus>)=> Promise<void>;
  textStatus?: (status: YoutubeTaskStatus)=> JSX.Element | string;
  musicId?: string;
  withCredentials?: boolean;
  onCreateMusic?: (music: MusicEntity)=> void;
  onCreateMusicFileInfo?: (musicFileInfo: MusicFileInfoEntity)=> void;
};

export function YouTubeUpload( { onSubmit = defaultOnSubmit,
  textStatus = defaultTextStatus,
  onCreateMusic,
  onCreateMusicFileInfo,
  musicId,
  withCredentials }: Props) {
  const [doing, setDoing] = useState(false);
  const doingRef = useRef(doing);

  useEffect(() => {
    doingRef.current = doing;
  }, [doing]);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<YoutubeTaskStatus | null>(null);
  // Validar URL de YouTube
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const isValidYouTubeURL = (u: string) => {
    const patterns = [
      /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
      /^https?:\/\/(www\.)?(music\.)?youtube\.com\/watch\?v=.+/,
      /^https?:\/\/(www\.)?(music\.)?youtube\.com\/playlist\?list=.+/,
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

      let input: InputData;

      if (trimmedUrl.includes("playlist")) {
        const playlistId = new URL(trimmedUrl).searchParams.get("list");

        assertIsDefined(playlistId);
        input = {
          type: "playlist",
          id: playlistId,
        };
      } else {
        const videoId = new URL(trimmedUrl).searchParams.get("v")
                  ?? trimmedUrl.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0];

        input = {
          type: "video",
          id: videoId,
        };
      }

      await onSubmit?.(input, {
        onChangeStatus: (s) => setStatus(s),
        onCreateMusic,
        onCreateMusicFileInfo,
        musicId,
        withCredentials,
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
            placeholder="URL del vídeo o playlist"
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
            doing && <div className={styles.loading}><Spinner /></div>
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
