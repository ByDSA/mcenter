import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { EpisodeEntity } from "$shared/models/episodes";
import { FetchApi } from "#modules/fetching/fetch-api";
import { EpisodesApi } from "#modules/series/episodes/requests";
import { EpisodeUserInfosApi } from "#modules/series/episodes/user-info/requests";
import { EpisodeFileInfosApi } from "#modules/series/episodes/file-info/requests";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { DaErrorView } from "#modules/ui-kit/form/Error";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
import { DaInputTextMultiline } from "#modules/ui-kit/form/input/Text/InputText";
import { DaInputGroup, DaInputGroupItem } from "#modules/ui-kit/form/InputGroup";
import { DaInputErrorWrap } from "#modules/ui-kit/form/InputErrorWrap";
import { FormInputTags } from "#modules/resources/FormInputTags/FormInputTags";
import { DaInputNumber } from "#modules/ui-kit/form/input/Number/InputNumber";
import { Separator } from "#modules/resources/Separator/Separator";
import { DaInputTime } from "../../../ui-kit/form/input/Time/InputTime";
import styles from "./style.module.css";

const schema = z.object( {
  title: z.string().trim()
    .min(1, "El título es obligatorio"),
  tags: z.array(z.string()),
  weight: z.number().default(0),
  start: z.number().nullable()
    .optional(),
  end: z.number().nullable()
    .optional(),
} );

type FormData = z.infer<typeof schema>;

type Props = {
  initialData: EpisodeEntity;
  onSuccess?: (newData: EpisodeEntity)=> void;
  onCancel?: ()=> void;
};

export const EditEpisodeForm = ( { initialData, onSuccess, onCancel }: Props) => {
  // Asumimos que editamos el primer archivo si existe, igual que en la versión anterior
  const fileInfo = initialData.fileInfos?.[0];
  const { register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting, dirtyFields, isValid } } = useForm( {
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      title: initialData.title,
      tags: initialData.tags ?? [],
      weight: initialData.userInfo?.weight ?? 0,
      start: fileInfo?.start ?? null,
      end: fileInfo?.end ?? null,
    },
  } );
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
      ? episodesApi.patch(initialData.compKey, {
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

    onSuccess?.(newEpisodeData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.container}>
      <DaInputGroup inline>
        <DaLabel>Episodio</DaLabel>
        <span>
          <span>{initialData.serie?.name ?? initialData.compKey.seriesKey}</span>
          <Separator />
          <span>{initialData.compKey.episodeKey}</span>
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
                  value={field.value}
                  onChange={field.onChange}
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
                  value={field.value}
                  onChange={field.onChange}
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
        <DaButton theme="white" onClick={onCancel}>
          Cancelar
        </DaButton>
        <DaButton
          type="submit"
          theme="blue"
          disabled={!isDirty || !isValid || isSubmitting}
          isSubmitting={isSubmitting}
        >
          Guardar
        </DaButton>
      </DaFooterButtons>
    </form>
  );
};
