"use client";

import { AUDIO_EXTENSIONS } from "$shared/models/musics/audio-extensions";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { MusicEntity } from "$shared/models/musics";
import { PATH_ROUTES } from "$shared/routing";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { assertIsDefined } from "$shared/utils/validation";
import { YoutubeCrudDtos } from "$shared/models/youtube/dto/transport";
import { FileData, FileUpload, genOnUpload, OnUploadOptions } from "#modules/ui-kit/upload/FileUpload";
import { backendUrl } from "#modules/requests";
import { MusicEntryElement } from "#musics/musics/entry/MusicEntry";
import { YouTubeUpload } from "#modules/ui-kit/upload/YouTubeUpload";
import { streamTaskStatus } from "#modules/tasks";

import "#styles/resources/resource-list-entry.css";
import "#styles/resources/resource-list-musics.css";
import "#styles/resources/music.css";
import MusicLayout from "../music.layout";

export default function Upload() {
  const [uploaded, setUploaded] = useState<MusicEntity[]>([]);
  const uploadedRef = useRef<MusicEntity[]>(uploaded);

  useEffect(() => {
    uploadedRef.current = uploaded;
  }, [uploaded]);
  const onUpload = useCallback(genOnUpload( {
    url: backendUrl(PATH_ROUTES.musics.fileInfo.upload.path),
    // eslint-disable-next-line require-await
    onEachUpload: async (
      response: unknown,
      fileData: FileData,
      options: OnUploadOptions,
    )=> {
      const parsedResponse = MusicFileInfoCrudDtos.UploadFile.responseSchema.parse(response);
      const { music } = parsedResponse.data;

      assertIsDefined(music);

      setUploaded(old => ([
        ...old,
        music,
      ]));

      options?.setSelectedFiles?.((old)=> {
        return old.filter(
          f2=> f2.id !== fileData.id,
        );
      } );
    },
  } ), [setUploaded]);

  type Status = YoutubeCrudDtos.ImportOne.TaskStatus.Status
                  | YoutubeCrudDtos.ImportPlaylist.TaskStatus.Status;

  return (
    <MusicLayout>
      <h2>Upload</h2>
      <FileUpload
        acceptedTypes={AUDIO_EXTENSIONS.map(s=>`.${s}`)}
        multiple={true}
        onUpload={onUpload}
      />
      <YouTubeUpload
        textStatus={(s: Status)=>(<>{ s.attempts > 1 && <span>(Intento {s.attempts}/{s.maxAttempts}) </span> }<span>{s.progress.percentage}% {s.progress.message}</span></>)}
        onSubmit={async (input, { onChangeStatus } )=>{
          let res: YoutubeCrudDtos.ImportOne.CreateTask.Response
        | YoutubeCrudDtos.ImportPlaylist.CreateTask.Response;
          let isPlayListRequest = false;

          if (input.includes("playlist")) {
            const playlistId = new URL(input).searchParams.get("list");

            assertIsDefined(playlistId);
            const response = await fetch(
              backendUrl(PATH_ROUTES.youtube.import.music.playlist.withParams(playlistId)),
            ).then(r=> r.json());
            const parsedResponse = YoutubeCrudDtos.ImportPlaylist.CreateTask
              .responseSchema.parse(response);

            res = parsedResponse;
            isPlayListRequest = true;
          } else {
            const videoId = new URL(input).searchParams.get("v")
            ?? input.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0];

            assertIsDefined(videoId);
            const response = await fetch(
              backendUrl(PATH_ROUTES.youtube.import.music.one.withParams(videoId)),
            ).then(r=> r.json());
            const parsedResponse = YoutubeCrudDtos.ImportOne.CreateTask
              .responseSchema.parse(response);

            res = parsedResponse;
          }

          const taskId = res.data?.job.id;

          assertIsDefined(taskId);

          await streamTaskStatus<Status>( {
            taskName: "YouTube import music",
            url: backendUrl(PATH_ROUTES.tasks.statusStream.withParams(taskId, 10_000)),
            // eslint-disable-next-line require-await
            onListenStatus: async (taskStatus) => {
              if (isPlayListRequest) {
                const data = YoutubeCrudDtos.ImportPlaylist.TaskStatus.statusSchema.parse(
                  taskStatus,
                );

                taskStatus = data;
                const newMusics: MusicEntity[] = [];

                if (data.progress.created) {
                  for (
                    const [_ytid, created] of Object.entries(data.progress.created)) {
                    if (!uploadedRef.current.find(m=>m.id === created.music.id))
                      newMusics.push(created.music as MusicEntity);
                  }
                }

                if (newMusics.length > 0) {
                  setUploaded(old => ([
                    ...old,
                    ...newMusics]));
                }
              } else {
                const data = YoutubeCrudDtos.ImportOne.TaskStatus.statusSchema.parse(
                  taskStatus,
                );

                taskStatus = data;

                const music = data.returnValue?.created?.music as MusicEntity | undefined;

                if (music && !uploadedRef.current.find(m=>m.id === music.id)) {
                  setUploaded(old => ([
                    ...old,
                    music,
                  ]));
                }
              }

              onChangeStatus(taskStatus);

              return taskStatus;
            },
          } );
        }}/>
      <hr/>
      <span className="resource-list">
        {
                uploaded!.map(
                  (music) => <Fragment key={`${music.id}`}>
                    <MusicEntryElement data={music} shouldFetchFileInfo={false} />
                  </Fragment>,
                )
        }
      </span>
    </MusicLayout>
  );
}
