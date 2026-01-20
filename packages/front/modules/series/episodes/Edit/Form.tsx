import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { EpisodeEntity } from "$shared/models/episodes";
import { FetchApi } from "#modules/fetching/fetch-api";
import { EpisodesApi } from "#modules/series/episodes/requests";
import { EpisodeUserInfosApi } from "#modules/series/episodes/user-info/requests";
import { EpisodeFileInfosApi } from "#modules/series/episodes/file-info/requests";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import { FormLabel } from "#modules/ui-kit/form/Label/FormLabel";
import { ErrorView } from "#modules/ui-kit/form/Error";
import { FormFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FormFooterButtons";
import { FormInputTextMultiline } from "#modules/ui-kit/form/input/Text/FormInputText";
import { FormInputGroup, FormInputGroupItem } from "#modules/ui-kit/form/FormInputGroup";
import { FormInputErrorWrap } from "#modules/ui-kit/form/FormInputErrorWrap";
import { FormInputTags } from "#modules/resources/FormInputTags/FormInputTags";
import { FormInputNumber } from "#modules/ui-kit/form/input/Number/FormInputNumber";
import { Separator } from "#modules/resources/Separator/Separator";
import { FormInputTime } from "../../../ui-kit/form/input/Time/FormInputTime";
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
      <FormInputGroup inline>
        <FormLabel>Episodio</FormLabel>
        <span>
          <span>{initialData.serie?.name ?? initialData.compKey.seriesKey}</span>
          <Separator />
          <span>{initialData.compKey.episodeKey}</span>
        </span>
      </FormInputGroup>
      <FormInputGroup inline>
        <FormLabel>Título</FormLabel>
        <FormInputErrorWrap>
          <FormInputTextMultiline
            {...register("title")}
            submitOnEnter
          />
          <ErrorView errors={errors} keyName="title" touchedFields={dirtyFields} />
        </FormInputErrorWrap>
      </FormInputGroup>

      <FormInputGroup inline>
        <FormInputGroupItem inline className={styles.weight}>
          <FormLabel>Peso</FormLabel>
          <FormInputNumber
            {...register("weight", {
              valueAsNumber: true,
            } )}
          />
        </FormInputGroupItem>
      </FormInputGroup>

      {fileInfo && (
        <FormInputGroup inline>
          <FormInputGroupItem inline>
            <FormLabel>Inicio</FormLabel>
            <Controller
              control={control}
              name="start"
              render={( { field } ) => (
                <FormInputTime
                  value={field.value}
                  onChange={field.onChange}
                  nullable
                />
              )}
            />
          </FormInputGroupItem>
          <FormInputGroupItem inline>
            <FormLabel>Fin</FormLabel>
            <Controller
              control={control}
              name="end"
              render={( { field } ) => (
                <FormInputTime
                  value={field.value}
                  onChange={field.onChange}
                  nullable
                />
              )}
            />
          </FormInputGroupItem>
        </FormInputGroup>
      )}

      <FormInputGroup inline>
        <FormLabel>Tags</FormLabel>
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
      </FormInputGroup>
      <FormInputGroup inline>
        <FormLabel>Path</FormLabel>
        <span>{initialData.fileInfos?.[0].path}</span>
      </FormInputGroup>

      <FormFooterButtons>
        <Button theme="white" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          theme="blue"
          disabled={!isDirty || !isValid || isSubmitting}
          isSubmitting={isSubmitting}
        >
          Guardar
        </Button>
      </FormFooterButtons>
    </form>
  );
};
