import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { EpisodeEntity, episodeSchema, episodeUserInfoSchema } from "$shared/models/episodes";
import { FetchApi } from "#modules/fetching/fetch-api";
import { EpisodesApi } from "#modules/episodes/requests";
import { EpisodeUserInfosApi } from "#modules/episodes/user-info/requests";
import { EpisodeFileInfosApi } from "#modules/episodes/file-info/requests";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { DaErrorView } from "#modules/ui-kit/form/Error";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
import { DaInputTextMultiline } from "#modules/ui-kit/form/input/Text/InputText";
import { DaInputGroup, DaInputGroupItem } from "#modules/ui-kit/form/InputGroup";
import { DaInputErrorWrap } from "#modules/ui-kit/form/InputErrorWrap";
import { FormInputTags } from "#modules/resources/FormInputTags/FormInputTags";
import { DaInputNumber } from "#modules/ui-kit/form/input/Number/InputNumber";
import { Separator } from "#modules/resources/Separator/Separator";
import { DaCloseModalButton } from "#modules/ui-kit/modal/CloseButton";
import { DaSaveButton } from "#modules/ui-kit/form/SaveButton";
import { DaForm } from "#modules/ui-kit/form/Form";
import { DaInputTime } from "#modules/ui-kit/form/input/Time/InputTime";
import { ContentSpinner } from "#modules/ui-kit/Spinner/Spinner";
import { episodeFileInfoSchema } from "../file-info/models";
import { useEpisode } from "../hooks";
import { useSeries } from "../series/hooks";
import styles from "./style.module.css";

const schema = z.object( {
  title: z.string().trim()
    .min(1, "El título es obligatorio"),
} )
  .merge(episodeSchema.pick( {
    tags: true,
  } ))
  .merge(episodeUserInfoSchema.pick( {
    weight: true,
  } ))
  .merge(episodeFileInfoSchema.pick( {
    start: true,
    end: true,
  } ));

type FormData = z.infer<typeof schema>;

type Props = {
  initialData: EpisodeEntity;
  onSuccess?: (newData: EpisodeEntity)=> void;
};

export const EditEpisodeForm = ( { initialData, onSuccess }: Props) => {
  const { data: series } = useSeries(initialData.seriesId, {
    notExpandCountEpisodes: true,
    notExpandCountSeasons: true,
    notExpandImageCover: true,
  } );
  // Asumimos que editamos el primer archivo si existe, igual que en la versión anterior
  const fileInfo = initialData.fileInfos?.[0];
  const { register,
    handleSubmit,
    control,
    getValues,
    formState: { errors, isDirty, dirtyFields, isValid } } = useForm( {
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      title: initialData.title,
      tags: initialData.tags ?? [],
      weight: initialData.userInfo?.weight ?? 0,
      start: fileInfo?.start,
      end: fileInfo?.end,
    },
  } );

  if (!series)
    return <ContentSpinner />;

  const onSubmit = async (formValues: FormData) => {
    const episodesApi = FetchApi.get(EpisodesApi);
    const userInfoApi = FetchApi.get(EpisodeUserInfosApi);
    const fileInfosApi = FetchApi.get(EpisodeFileInfosApi);
    // --- PATCH EPISODE ---
    const episodePatch: Parameters<typeof episodesApi.patch>[1]["entity"] = {};
    let hasEpisodeChanges = false;

    if (dirtyFields.title) {
      episodePatch.title = formValues.title;
      hasEpisodeChanges = true;
    }

    if (dirtyFields.tags) {
      episodePatch.tags = formValues.tags;
      hasEpisodeChanges = true;
    }

    const episodePromise = hasEpisodeChanges
      ? episodesApi.patch(initialData.id, {
        entity: episodePatch,
      } )
      : Promise.resolve( {
        data: initialData,
      } );
    // --- PATCH USER INFO ---
    let userInfoPromise: Promise<any> = Promise.resolve();

    if (initialData.userInfo && dirtyFields.weight) {
      userInfoPromise = userInfoApi.fetch(initialData.id, {
        entity: {
          weight: formValues.weight,
        },
      } );
    }

    // --- PATCH FILE INFO ---
    let fileInfoPromise: Promise<any> = Promise.resolve();

    if (fileInfo && (dirtyFields.start || dirtyFields.end)) {
      const fileInfoEntity: any = {};
      const fileInfoUnset: string[][] = [];

      if (dirtyFields.start) {
        if (formValues.start !== null && formValues.start !== undefined)
          fileInfoEntity.start = formValues.start;
        else
          fileInfoUnset.push(["start"]);
      }

      if (dirtyFields.end) {
        if (formValues.end !== null && formValues.end !== undefined)
          fileInfoEntity.end = formValues.end;
        else
          fileInfoUnset.push(["end"]);
      }

      if (Object.keys(fileInfoEntity).length > 0 || fileInfoUnset.length > 0) {
        fileInfoPromise = fileInfosApi.fetch(fileInfo.id, {
          entity: fileInfoEntity,
          unset: fileInfoUnset.length > 0 ? fileInfoUnset : undefined,
        } );
      }
    }

    // --- EXECUTE ---
    const [episodeRes, userInfoRes, fileInfoRes] = await Promise.all([
      episodePromise,
      userInfoPromise,
      fileInfoPromise,
    ]);
    // Reconstruir objeto actualizado para la UI
    const updatedFileInfos = [...(initialData.fileInfos ?? [])];

    if (fileInfo && fileInfoRes?.data) {
      updatedFileInfos[0] = {
        ...fileInfo,
        ...fileInfoRes.data,
      };
    }

    const newEpisodeData: EpisodeEntity = {
      ...initialData,
      ...episodeRes.data!,
      userInfo: userInfoRes?.data ?? initialData.userInfo,
      fileInfos: updatedFileInfos,
    };

    useEpisode.updateCache(initialData.id, ()=>newEpisodeData);
    onSuccess?.(newEpisodeData);
  };

  return (
    <DaForm
      className={styles.container}
      onSubmit={handleSubmit(onSubmit)}
      isDirty={isDirty}
      isValid={isValid}
    >
      <DaInputGroup inline>
        <DaLabel>Episodio</DaLabel>
        <span>
          <span>{series.name}</span>
          <Separator />
          <span>{initialData.episodeKey}</span>
        </span>
      </DaInputGroup>
      <DaInputGroup inline>
        <DaLabel>Título</DaLabel>
        <DaInputErrorWrap>
          <DaInputTextMultiline
            {...register("title")}
          />
          <DaErrorView errors={errors} keyName="title" touchedFields={dirtyFields} />
        </DaInputErrorWrap>
      </DaInputGroup>

      <DaInputGroup inline>
        <DaInputGroupItem inline className={styles.weight}>
          <DaLabel>Peso</DaLabel>
          <DaInputNumber
            {...register("weight", {
              valueAsNumber: true,
            } )}
          />
        </DaInputGroupItem>
      </DaInputGroup>

      {fileInfo && (
        <DaInputGroup inline>
          <DaInputGroupItem inline>
            <DaLabel>Inicio</DaLabel>
            <Controller
              control={control}
              name="start"
              render={( { field } ) => (
                <DaInputTime
                  value={getValues(field.name) ?? null}
                  onChange={newValue=>field.onChange(newValue ?? undefined)}
                  nullable
                />
              )}
            />
          </DaInputGroupItem>
          <DaInputGroupItem inline>
            <DaLabel>Fin</DaLabel>
            <Controller
              control={control}
              name="end"
              render={( { field } ) => (
                <DaInputTime
                  value={getValues(field.name) ?? null}
                  onChange={e=>field.onChange(e ?? undefined)}
                  nullable
                />
              )}
            />
          </DaInputGroupItem>
        </DaInputGroup>
      )}

      <DaInputGroup inline>
        <DaLabel>Tags</DaLabel>
        <Controller
          control={control}
          name="tags"
          render={( { field } ) => (
            <FormInputTags
              value={field.value ?? []}
              onChange={(newVal) => field.onChange(newVal)}
              onEmptyEnter={(e) => e.currentTarget.form?.requestSubmit()}
            />
          )}
        />
      </DaInputGroup>
      <DaInputGroup inline>
        <DaLabel>Path</DaLabel>
        <span>{initialData.fileInfos?.[0].path}</span>
      </DaInputGroup>

      <DaFooterButtons>
        <DaCloseModalButton />
        <DaSaveButton />
      </DaFooterButtons>
    </DaForm>
  );
};
