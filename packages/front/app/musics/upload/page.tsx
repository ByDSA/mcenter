"use client";

import { AUDIO_EXTENSIONS } from "$shared/models/musics/audio-extensions";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { MusicEntity, MusicEntityWithUserInfo } from "$shared/models/musics";
import { PATH_ROUTES } from "$shared/routing";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { assertIsDefined } from "$shared/utils/validation";
import { FileData, FileUpload, genOnUpload, OnUploadOptions } from "#modules/ui-kit/upload/FileUpload";
import { backendUrl } from "#modules/requests";
import { MusicEntryElement } from "#modules/musics/musics/ListItem/MusicEntry";
import { YouTubeUpload } from "#modules/ui-kit/upload/YouTubeUpload";
import { useUser } from "#modules/core/auth/useUser";
import { ResourceList } from "#modules/resources/List/ResourceList";
import { useMusic } from "#modules/musics/hooks";
import { FormLabel } from "#modules/ui-kit/form/Label/FormLabel";
import { FormInputGroup } from "#modules/ui-kit/form/FormInputGroup";
import MusicLayout from "../music.layout";
import styles from "./page.module.css";

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

      useMusic.updateCacheWithMerging(music.id, music);

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
    useMusic.updateCacheWithMerging(music.id, music);
  };

  return (
    <MusicLayout>
      <h2>Subir músicas</h2>
      <div className={styles.uploaders}>
        <FormInputGroup className={styles.group}>
          <FormLabel>Desde YouTube</FormLabel>
          <YouTubeUpload
            withCredentials
            onCreateMusic={onCreateMusic}/>
          <FormLabel>Desde local</FormLabel>
          <FileUpload
            acceptedTypes={AUDIO_EXTENSIONS.map(s=>`.${s}`)}
            multiple={true}
            onUpload={onUpload}
          />
        </FormInputGroup>
        <hr/>
        <ResourceList>
          {
          uploaded!.map(
            (music) => <Fragment key={`${music.id}`}>
              <MusicEntryElement
                musicId={music.id}
                playable={true}
              />
            </Fragment>,
          )
          }
        </ResourceList>
      </div>
    </MusicLayout>
  );
}
