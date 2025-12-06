"use client";

import { AUDIO_EXTENSIONS } from "$shared/models/musics/audio-extensions";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { MusicEntity, MusicEntityWithUserInfo } from "$shared/models/musics";
import { PATH_ROUTES } from "$shared/routing";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { assertIsDefined } from "$shared/utils/validation";
import { FileData, FileUpload, genOnUpload, OnUploadOptions } from "#modules/ui-kit/upload/FileUpload";
import { backendUrl } from "#modules/requests";
import { MusicEntryElement } from "#musics/musics/entry/MusicEntry";
import { YouTubeUpload } from "#modules/ui-kit/upload/YouTubeUpload";
import { classes } from "#modules/utils/styles";
import musicListStyles from "#modules/musics/musics/styles.module.css";
import { useUser } from "#modules/core/auth/useUser";
import MusicLayout from "../music.layout";
import styles from "./page.module.css";

import "#styles/resources/resource-list-entry.css";

function injectDefaultUserInfo(music: MusicEntity, userId: string): MusicEntityWithUserInfo {
  music.userInfo = {
    createdAt: music.createdAt,
    lastTimePlayed: 0,
    musicId: music.id,
    updatedAt: music.updatedAt,
    userId: userId,
    weight: 0,
  };

  return music as MusicEntityWithUserInfo;
}

export default function Upload() {
  const { user } = useUser();

  assertIsDefined(user);
  const [uploaded, setUploaded] = useState<MusicEntityWithUserInfo[]>([]);
  const uploadedRef = useRef<MusicEntity[]>(uploaded);

  useEffect(() => {
    uploadedRef.current = uploaded;
  }, [uploaded]);
  const onUpload = useCallback(genOnUpload( {
    url: backendUrl(PATH_ROUTES.musics.fileInfo.upload.path),
    withCredentials: true,
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
        injectDefaultUserInfo(music, user.id),
      ]));

      options?.setSelectedFiles?.((old)=> {
        return old.filter(
          f2=> f2.id !== fileData.id,
        );
      } );
    },
  } ), [setUploaded]);
  const onCreateMusic = (music: MusicEntity) => {
    setUploaded(old => ([
      ...old,
      injectDefaultUserInfo(music, user.id)]));
  };

  return (
    <MusicLayout>
      <h2>Upload</h2>
      <div className={styles.uploaders}>
        <YouTubeUpload
          withCredentials
          onCreateMusic={onCreateMusic}/>
        <FileUpload
          acceptedTypes={AUDIO_EXTENSIONS.map(s=>`.${s}`)}
          multiple={true}
          onUpload={onUpload}
        />
        <hr/>
        <span className={classes("resource-list", musicListStyles.list)}>
          {
          uploaded!.map(
            (music) => <Fragment key={`${music.id}`}>
              <MusicEntryElement data={music} setData={(newMusic: MusicEntityWithUserInfo) => {
                const index = uploaded.findIndex(m=>m.id === music.id);

                if (index === -1)
                  return;

                setUploaded((old: MusicEntityWithUserInfo[]) => ([
                  ...old.slice(0, index),
                  newMusic,
                  ...old.slice(index + 1),
                ]));
              }
              } shouldFetchFileInfo={false} />
            </Fragment>,
          )
          }
        </span>
      </div>
    </MusicLayout>
  );
}
