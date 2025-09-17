"use client";

import { AUDIO_EXTENSIONS } from "$shared/models/musics/audio-extensions";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { MusicEntity } from "$shared/models/musics";
import { PATH_ROUTES } from "$shared/routing";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { assertIsDefined } from "$shared/utils/validation";
import { FileData, FileUpload, genOnUpload, OnUploadOptions } from "#modules/ui-kit/upload/FileUpload";
import { backendUrl } from "#modules/requests";
import { MusicEntryElement } from "#musics/musics/entry/MusicEntry";
import { YouTubeUpload } from "#modules/ui-kit/upload/YouTubeUpload";
import MusicLayout from "../music.layout";
import styles from "./page.module.css";

import "#styles/resources/resource-list-entry.css";
import "#styles/resources/resource-list-musics.css";
import "#styles/resources/music.css";

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
  const onCreateMusic = (music: MusicEntity) => {
    setUploaded(old => ([
      ...old,
      music]));
  };

  return (
    <MusicLayout>
      <h2>Upload</h2>
      <div className={styles.uploaders}>
        <YouTubeUpload
          onCreateMusic={onCreateMusic}/>
        <FileUpload
          acceptedTypes={AUDIO_EXTENSIONS.map(s=>`.${s}`)}
          multiple={true}
          onUpload={onUpload}
        />
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
      </div>
    </MusicLayout>
  );
}
