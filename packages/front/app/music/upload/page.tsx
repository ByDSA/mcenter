"use client";

import { AUDIO_EXTENSIONS } from "$shared/models/musics/audio-extensions";
import { Fragment, useState } from "react";
import { MusicEntity } from "$shared/models/musics";
import { PATH_ROUTES } from "$shared/routing";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { assertIsDefined } from "$shared/utils/validation";
import { FileData, FileUpload, OnUploadOptions, uploadSingleFileWithProgress } from "#modules/ui-kit/upload/FileUpload";
import { backendUrl } from "#modules/requests";
import { MusicEntryElement } from "#modules/musics/musics/entry/MusicEntry";

import "#styles/resources/history-entry.css";
import "#styles/resources/history-musics.css";
import "#styles/resources/music.css";

export default function Upload() {
  const [uploaded, setUploaded] = useState<MusicEntity[]>([]);

  async function onUpload(files: FileData[], options?: OnUploadOptions) {
    for (const f of files) {
      await uploadSingleFileWithProgress(
        backendUrl(PATH_ROUTES.musics.fileInfo.upload.path),
        f,
        {
          ...options,
          // eslint-disable-next-line require-await
          onEachUpload: async (response: unknown) => {
            const parsedResponse = MusicFileInfoCrudDtos.UploadFile.responseSchema.parse(response);
            const { music } = parsedResponse.data;

            assertIsDefined(music);

            setUploaded(old => ([
              ...old,
              music,
            ]));
          },
        },
      );
    }
  }

  return (
    <>
      <h2>Upload</h2>
      <FileUpload
        acceptedTypes={AUDIO_EXTENSIONS.map(s=>`.${s}`)}
        multiple={true}
        onUpload={onUpload}
      />
      <hr/>
      <span className="history-list">
        {
                uploaded!.map(
                  (music) => <Fragment key={`${music.id}`}>
                    <MusicEntryElement data={music} shouldFetchFileInfo={false} />
                  </Fragment>,
                )
        }
      </span>
    </>
  );
}
