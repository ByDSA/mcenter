"use client";

import { AUDIO_EXTENSIONS } from "$shared/models/musics/audio-extensions";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { MusicEntity, MusicEntityWithUserInfo } from "$shared/models/musics";
import { PATH_ROUTES } from "$shared/routing";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { assertIsDefined } from "$shared/utils/validation";
import { MusicNote } from "@mui/icons-material";
import { FileData, FileUpload, genOnUpload, OnUploadOptions } from "#modules/ui-kit/upload/FileUpload";
import { backendUrl } from "#modules/requests";
import { MusicEntryElement } from "#modules/musics/musics/ListItem/MusicEntry";
import { YouTubeUpload } from "#modules/ui-kit/upload/YouTubeUpload";
import { useUser } from "#modules/core/auth/useUser";
import { ResourceList } from "#modules/resources/List/ResourceList";
import { useMusic } from "#modules/musics/hooks";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { DaInputGroup } from "#modules/ui-kit/form/InputGroup";
import { EmptyList, EmptyListTopIconWrap } from "#modules/resources/EmptyList/EmptyList";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { useBulkSelection } from "#modules/musics/musics/BlukEdit/useBulkSelection";
import { BulkEditBar } from "#modules/musics/musics/BlukEdit/BulkEditBar";
import MusicLayout from "../music.layout";
import styles from "./page.module.css";

function injectDefaultUserInfo(music: MusicEntity, userId: string): MusicEntityWithUserInfo {
  music.userInfo = {
    id: null!,
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
  const selection = useBulkSelection();

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
    ) => {
      const parsedResponse = MusicFileInfoCrudDtos.UploadFile.responseSchema.parse(response);
      const { music } = parsedResponse.data;

      assertIsDefined(music);

      setUploaded(old => ([
        ...old,
        injectDefaultUserInfo(music, user.id),
      ]));

      useMusic.updateCacheWithMerging(music.id, music);

      options?.setSelectedFiles?.((old) => {
        return old.filter(f2 => f2.id !== fileData.id);
      } );
    },
  } ), [setUploaded]);
  const onCreateMusic = (music: MusicEntity) => {
    setUploaded(old => ([
      ...old,
      injectDefaultUserInfo(music, user.id),
    ]));
    useMusic.updateCacheWithMerging(music.id, music);
  };
  const { LL } = useI18nContext();

  return (
    <MusicLayout>
      <div className={styles.uploaders}>
        <DaInputGroup className={styles.group}>
          <DaLabel>{LL.modules.musics.upload.fromYoutube()}</DaLabel>
          <YouTubeUpload
            withCredentials
            onCreateMusic={onCreateMusic} />
          <DaLabel>{LL.modules.musics.upload.fromLocal()}</DaLabel>
          <FileUpload
            acceptedTypes={AUDIO_EXTENSIONS.map(s => `.${s}`)}
            multiple={true}
            onUpload={onUpload}
          />
        </DaInputGroup>
        <hr />
        <DaLabel>{LL.modules.musics.upload.sectionTitle()}</DaLabel>

        {/* Fix: bulk selection bar for uploaded list */}
        {uploaded.length > 0 && (
          <BulkEditBar
            isBulkMode={selection.isBulkMode}
            onActivate={selection.activateBulkMode}
            count={selection.count}
            onClear={selection.clear}
            getSelectedMusics={() => [...selection.selectedIds]
              .map((id) => useMusic.getCache(id))
              .filter(Boolean) as MusicEntityWithUserInfo[]
            }
          />
        )}

        <ResourceList>
          {uploaded.length === 0 && <EmptyList
            top={<EmptyListTopIconWrap><MusicNote /></EmptyListTopIconWrap>}
            label={LL.modules.musics.upload.noneUploaded()} />
          }
          {uploaded!.map(
            (music) => <Fragment key={`${music.id}`}>
              <MusicEntryElement
                musicId={music.id}
                playable={true}
                onDelete={() => setUploaded(old => old.filter(m => m.id !== music.id))}
                // only show checkbox when bulk mode active
                selection={selection.isBulkMode
                  ? {
                    isSelected: selection.isSelected(music.id),
                    onToggle: () => selection.toggle(music.id),
                  }
                  : undefined
                }
                onLongPress={() => {
                  selection.activateBulkMode();
                  selection.toggle(music.id);
                }}
              />
            </Fragment>,
          )}
        </ResourceList>
      </div>
    </MusicLayout>
  );
}
