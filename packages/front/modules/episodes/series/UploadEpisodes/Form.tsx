import { SeriesEntity } from "$shared/models/episodes/series";
import { getEpisodeKeyFromBasename } from "$shared/models/episodes/episode-code";
import { VIDEO_EXTENSIONS } from "$shared/models/episodes/video-extensions";
import { PATH_ROUTES } from "$shared/routing";
import { useState } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
import { DaCloseModalButton } from "#modules/ui-kit/modal/CloseButton";
import { DaInputGroup, DaInputGroupItem } from "#modules/ui-kit/form/InputGroup";
import { backendUrl } from "#modules/requests";
import { FileData, FileDataWithoutMetadata, FileUpload, genOnUpload, OnUploadOptions } from "#modules/ui-kit/upload/FileUpload";
import { useLocalData } from "#modules/utils/local-data-context";
import { EpisodeFileInfoCrudDtos } from "#modules/episodes/file-info/models/dto";
import { PropsOf } from "#modules/utils/react";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { UploadEpisodesContextMenuItemCurrentCtx } from "./ContextMenuItem";

type Props = PropsOf<typeof UploadEpisodesContextMenuItemCurrentCtx>;

export const UploadEpisodesForm = ( { onUploadEachEpisode }: Props) => {
  const { data: series } = useLocalData<SeriesEntity>();
  const [lastEpisodeKey, setLastEpisodeKey] = useState<string | undefined>();
  const usingModal = useModal();

  assertIsDefined(series);

  return (
    <>
      <DaInputGroup>
        <DaInputGroupItem>
          <DaLabel>Desde local</DaLabel>
          <FileUpload
            acceptedTypes={VIDEO_EXTENSIONS.map(s => `.${s}`)}
            multiple={true}
            provideMetadata={async (fileDatas) => {
              const episodeKeyParts = getEpisodeKeyPartsFrom(fileDatas, lastEpisodeKey);

              if (episodeKeyParts.episode === null || episodeKeyParts.season === null) {
                await usingModal.openModal( {
                  content: <>
                    <div>{episodeKeyParts.season}</div>
                    <div>{episodeKeyParts.episode}</div>
                  </>,
                } );

                episodeKeyParts.season ??= "0";
                episodeKeyParts.episode ??= 0;
              }

              assertIsDefined(episodeKeyParts.season);
              assertIsDefined(episodeKeyParts.episode);

              const episodeKey = joinEpisodeKeyParts(episodeKeyParts as EpisodeKeyPartsSecure);

              setLastEpisodeKey(episodeKey);

              return {
                episodeKey,
                seriesId: series.id,
              } satisfies EpisodeFileInfoCrudDtos.UploadFile.RequestBody["metadata"];
            }}
            onUpload={genOnUpload( {
              url: backendUrl(PATH_ROUTES.episodes.fileInfo.upload.path),
              withCredentials: true,
              onEachUpload: async (
                response: unknown,
                fileData: FileData,
                options: OnUploadOptions,
              ) => {
                const parsedResponse = EpisodeFileInfoCrudDtos.UploadFile
                  .responseSchema.parse(response);

                options?.setSelectedFiles?.((old) => ([
                  ...old.filter(f => f.id !== fileData.id),
                ]));
                await onUploadEachEpisode( {
                  episode: parsedResponse.data.episode,
                  fileInfo: parsedResponse.data.fileInfo,
                } );
                // add(parsedResponse.data.fileInfo);
              },
            } )}
          />
        </DaInputGroupItem>
      </DaInputGroup>

      <DaFooterButtons>
        <DaCloseModalButton />
      </DaFooterButtons>
    </>
  );
};

function getEpisodeKeyPartsFrom(fileDatas: FileDataWithoutMetadata, lastEpisodeKey?: string) {
  const episodeKey = getEpisodeKeyFromBasename(fileDatas.name);
  const episodeNumber = episodeKey?.episode ?? null;
  const lastEpisodeKeySeason = lastEpisodeKey === undefined
    ? undefined
    : lastEpisodeKey.split("x")[0];
  const season = episodeKey?.season ?? lastEpisodeKeySeason ?? null;

  return {
    season,
    episode: episodeNumber,
  };
}

type EpisodeKeyPartsSecure = {
  episode: NonNullable<ReturnType<typeof getEpisodeKeyPartsFrom>["episode"]>;
  season: NonNullable<ReturnType<typeof getEpisodeKeyPartsFrom>["season"]>;
};

function joinEpisodeKeyParts( { episode, season }: EpisodeKeyPartsSecure) {
  return season + "x" + episode?.toString().padStart(2, "0");
}
