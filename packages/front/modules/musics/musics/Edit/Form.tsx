import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { MusicEntity, MusicEntityWithUserInfo, musicSchema } from "$shared/models/musics";
import { ArrowDropDown, ArrowRight } from "@mui/icons-material";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicsApi } from "#modules/musics/requests";
import { MusicUserInfosApi } from "#modules/musics/user-info.requests";
import { ImageCoversApi } from "#modules/image-covers/requests";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import { FormLabel } from "#modules/ui-kit/form/Label/FormLabel";
import { ErrorView } from "#modules/ui-kit/input/Error";
import { FormFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FormFooterButtons";
import { useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { ImageCoverSelectorButton } from "#modules/image-covers/Selector/Button";
import { useFileInfosModal } from "#modules/musics/file-info/EditFileInfos/Modal";
import { classes } from "#modules/utils/styles";
import { FormInputTextMultiline } from "#modules/ui-kit/form/input/Text/FormInputText";
import { useMusic } from "#modules/musics/hooks";
import { FormInputNumber } from "../../../ui-kit/form/input/Number/FormInputNumber";
import { FormInputBooleanCheckbox } from "../../../ui-kit/form/input/Boolean/FormInputBoolean";
import { FormInputTags } from "./FormInputTags";
import styles from "./styles.module.css";
import { FormInputGroup, FormInputGroupItem } from "./FormInputGroup";
import { FormInputErrorWrap } from "./FormInputErrorWrap";

const schema = musicSchema.pick( {
  album: true,
  country: true,
  game: true,
  spotifyId: true,
  year: true,
  imageCoverId: true,
} ).extend( {
  title: z.string().trim()
    .min(1, "El título es obligatorio"),
  artist: z.string().trim()
    .min(1, "El artista es obligatorio"),
  slug: z.string().trim()
    .min(1, "El slug es obligatorio"),
  weight: z.number().default(0),
  tags: z.array(z.string()),
  disabled: z.boolean().default(false),
} );

type FormData = z.infer<typeof schema>;

type Props = {
  initialData: MusicEntity;
  onSuccess?: (newData: MusicEntity)=> void;
  onDelete?: ()=> void;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const EditMusicForm = ( { initialData, onSuccess, onDelete }: Props) => {
  const [showOptional, setShowOptional] = useState(false);
  const { register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting, dirtyFields, isValid } } = useForm( {
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      title: initialData.title,
      artist: initialData.artist,
      slug: initialData.slug,
      album: initialData.album ?? "",
      year: initialData.year,
      country: initialData.country ?? "",
      game: initialData.game ?? "",
      spotifyId: initialData.spotifyId ?? "",
      weight: initialData.userInfo?.weight ?? 0,
      disabled: initialData.disabled ?? false,
      imageCoverId: initialData.imageCoverId ?? null,
      tags: [
        ...(initialData.tags?.map((t) => (t.startsWith("#") ? t : `#${t}`)) ?? []),
        ...(initialData.userInfo?.tags ?? []),
      ],
    } satisfies z.infer<typeof schema>,
  } );
  const confirmModal = useConfirmModal();
  const onSubmit = async (formValues: FormData) => {
    const musicApi = FetchApi.get(MusicsApi);
    const userInfoApi = FetchApi.get(MusicUserInfosApi);
    // --- PATCH MUSIC ---
    const musicUnset: Parameters<typeof musicApi.patch>[1]["unset"] = [];
    const musicEntity: Parameters<typeof musicApi.patch>[1]["entity"] = {};
    let hasMusicChanges = false;

    // Campos simples
    if (dirtyFields.title) {
      musicEntity.title = formValues.title;
      hasMusicChanges = true;
    }

    if (dirtyFields.artist) {
      musicEntity.artist = formValues.artist;
      hasMusicChanges = true;
    }

    if (dirtyFields.slug) {
      musicEntity.slug = formValues.slug;
      hasMusicChanges = true;
    }

    // Opcionales Strings (si está vacío string -> unset)
    if (dirtyFields.album) {
      hasMusicChanges = true;

      if (!formValues.album)
        musicUnset.push(["album"]);
      else
        musicEntity.album = formValues.album;
    }

    if (dirtyFields.country) {
      hasMusicChanges = true;

      if (!formValues.country)
        musicUnset.push(["country"]);
      else
        musicEntity.country = formValues.country;
    }

    if (dirtyFields.game) {
      hasMusicChanges = true;

      if (!formValues.game)
        musicUnset.push(["game"]);
      else
        musicEntity.game = formValues.game;
    }

    if (dirtyFields.spotifyId) {
      hasMusicChanges = true;

      if (!formValues.spotifyId)
        musicUnset.push(["spotifyId"]);
      else
        musicEntity.spotifyId = formValues.spotifyId;
    }

    // Opcionales Números
    if (dirtyFields.year) {
      hasMusicChanges = true;

      if (formValues.year === null || formValues.year === undefined)
        musicUnset.push(["year"]);
      else
        musicEntity.year = formValues.year;
    }

    // Opcionales Booleanos (Disabled)
    // Lógica: Si es true -> guardar true. Si es false -> unset(
    //  para no ensuciar la DB con false por defecto
    // )
    if (dirtyFields.disabled) {
      hasMusicChanges = true;

      if (formValues.disabled)
        musicEntity.disabled = true;
      else
        musicUnset.push(["disabled"]);
    }

    // Tags de música (empiezan con #)
    if (dirtyFields.tags) {
      hasMusicChanges = true;
      musicEntity.tags = formValues.tags.filter((t) => t.startsWith("#"));
    }

    // Image Cover
    if (dirtyFields.imageCoverId) {
      hasMusicChanges = true;
      musicEntity.imageCoverId = formValues.imageCoverId;
    }

    const musicPromise = hasMusicChanges
      ? musicApi.patch(initialData.id, {
        entity: musicEntity,
        unset: musicUnset,
      } )
      : Promise.resolve( {
        data: initialData as MusicEntity,
      } ); // Retornar data actual si no hay cambios
    // --- PATCH USER INFO ---
    let userInfoPromise: Promise<any> = Promise.resolve();
    let hasUserInfoChanges = false;
    const userInfoEntity: any = {};

    if (initialData.userInfo) {
      if (dirtyFields.weight) {
        userInfoEntity.weight = formValues.weight;
        hasUserInfoChanges = true;
      }

      if (dirtyFields.tags) {
        userInfoEntity.tags = formValues.tags.filter((t) => !t.startsWith("#"));
        hasUserInfoChanges = true;
      }

      if (hasUserInfoChanges) {
        userInfoPromise = userInfoApi.patch(initialData.id, {
          entity: userInfoEntity,
        } );
      }
    }

    // --- EXECUTE ---
    if (!hasMusicChanges && !hasUserInfoChanges) {
      // No hay nada que guardar
      return;
    }

    const [musicRes, userInfoRes] = await Promise.all([musicPromise, userInfoPromise]);
    // Construct New Data
    const newMusicData: MusicEntityWithUserInfo = {
      ...initialData,
      ...musicRes.data!,
      userInfo: userInfoRes?.data ?? initialData.userInfo,
    };

    // Actualizar Image Cover en caché local si cambió
    if (dirtyFields.imageCoverId) {
      if (formValues.imageCoverId) {
        const coverApi = FetchApi.get(ImageCoversApi);
        const coverRes = await coverApi.getOneByCriteria( {
          filter: {
            id: formValues.imageCoverId,
          },
        } );

        if (coverRes.data)
          newMusicData.imageCover = coverRes.data;
      } else {
        newMusicData.imageCover = undefined;
        newMusicData.imageCoverId = null;
      }
    }

    useMusic.updateCacheWithMerging(initialData.id, newMusicData);

    onSuccess?.(newMusicData);
  };
  const handleDelete = async () => {
    await confirmModal.openModal( {
      title: "Confirmar borrado",
      content: <>
        <p>¿Estás seguro de borrar esta música?</p>
        <FormInputGroup inline>
          <FormLabel>Título</FormLabel>
          <span>{initialData.title}</span>
        </FormInputGroup>
      </>,
      action: async () => {
        const api = FetchApi.get(MusicsApi);

        await api.deleteOneById(initialData.id);
        onDelete?.();

        return true;
      },
    } );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.container}>
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
        <FormLabel>Artista</FormLabel>
        <FormInputErrorWrap>
          <FormInputTextMultiline
            {...register("artist")}
            submitOnEnter
          />
          <ErrorView errors={errors} keyName="artist" touchedFields={dirtyFields} />
        </FormInputErrorWrap>
      </FormInputGroup>

      <FormInputGroup inline>
        <article>
          <FormLabel>Peso</FormLabel>
          <FormInputErrorWrap>
            <FormInputNumber
              {...register("weight", {
                valueAsNumber: true,
              } )}
              className={styles.weight}
            />
            <ErrorView errors={errors} keyName="weight" touchedFields={dirtyFields} />
          </FormInputErrorWrap>
        </article>
        <FormInputGroupItem>
          <FormLabel>Álbum</FormLabel>
          <FormInputTextMultiline
            {...register("album")}
            submitOnEnter
            nullable
          />
        </FormInputGroupItem>
      </FormInputGroup>

      <FormInputGroup>
        <FormLabel>Tags (usa # para tags globales)</FormLabel>
        <Controller
          control={control}
          name="tags"
          render={( { field } ) => (
            <FormInputTags
              value={field.value ?? []}
              onChange={(newVal) => field.onChange(newVal)}
              onEmptyEnter={(e) => {
                e.currentTarget.form?.requestSubmit();
              }}
            />
          )}
        />
      </FormInputGroup>

      <FormInputGroup inline>
        <FormLabel>Slug</FormLabel>
        <FormInputErrorWrap>
          <FormInputTextMultiline
            {...register("slug")}
            submitOnEnter
          />
          <ErrorView errors={errors} keyName="slug" touchedFields={dirtyFields} />
        </FormInputErrorWrap>
      </FormInputGroup>

      <FormInputGroup inline>
        <FormLabel>Imagen</FormLabel>
        <Controller
          control={control}
          name="imageCoverId"
          render={( { field } ) => (
            <ImageCoverSelectorButton
              currentId={field.value}
              onSelect={(selected) => field.onChange(selected?.id ?? null)}
            />
          )}
        />
      </FormInputGroup>

      <OptionalPropsButton
        isVisible={showOptional}
        onClick={() => setShowOptional(!showOptional)}
      />

      <div>
        <FormInputGroup inline>
          {(showOptional || initialData.year !== undefined || dirtyFields.year !== undefined)
          && <FormInputGroupItem className={styles.flex0}>
            <FormLabel>Año</FormLabel>
            <FormInputErrorWrap>
              <FormInputNumber
                {...register("year", {
                  setValueAs: (v) => (v === "" || isNaN(v) ? undefined : Number(v)),
                } )}
                className={styles.year}
                nullable
              />
              <ErrorView errors={errors} keyName="year" touchedFields={dirtyFields} />
            </FormInputErrorWrap>
          </FormInputGroupItem>}
          {(showOptional || initialData.disabled !== undefined
            || dirtyFields.disabled !== undefined)
        && <FormInputGroupItem className={styles.flex0}>
          <FormLabel>Desactivado</FormLabel>
          <FormInputErrorWrap>
            <Controller
              control={control}
              name="disabled"
              render={( { field } ) => (
                <FormInputBooleanCheckbox
                  value={field.value!}
                  onChange={field.onChange}
                />
              )}
            />
          </FormInputErrorWrap>
        </FormInputGroupItem>
          }
          {(showOptional || initialData.country !== undefined || dirtyFields.country !== undefined)
        && <FormInputGroupItem>
          <FormLabel>País</FormLabel>
          <FormInputErrorWrap>
            <FormInputTextMultiline
              {...register("country")}
              submitOnEnter
              nullable
            />
          </FormInputErrorWrap>
        </FormInputGroupItem>
          }
        </FormInputGroup>

        {(showOptional || initialData.game !== undefined || dirtyFields.game !== undefined)
        && <FormInputGroup inline>
          <FormLabel>Juego</FormLabel>
          <FormInputErrorWrap>
            <FormInputTextMultiline
              {...register("game")}
              submitOnEnter
              nullable
            />
          </FormInputErrorWrap>
        </FormInputGroup>
        }
        {(showOptional || initialData.spotifyId !== undefined
          || dirtyFields.spotifyId !== undefined)
        && <FormInputGroup inline>
          <FormLabel>Spotify ID</FormLabel>
          <FormInputErrorWrap>
            <FormInputTextMultiline
              {...register("spotifyId")}
              submitOnEnter
              nullable
            />
          </FormInputErrorWrap>
        </FormInputGroup>
        }
      </div>

      <FormFooterButtons className={styles.footer}>
        <aside>
          <EditFileInfosButton
            musicId={initialData.id}
            actions={{
              add: () => { /* cache update handled internally */ },
              remove: () => { /* cache update handled internally */ },
            }}
          />
        </aside>
        <aside>
          <Button theme="red"
            onClick={handleDelete}
            disabled={isSubmitting}>
            Eliminar
          </Button>
          <Button
            type="submit"
            theme="blue"
            disabled={!isDirty || !isValid || isSubmitting}
            isSubmitting={isSubmitting}
          >
            Guardar
          </Button>
        </aside>
      </FormFooterButtons>
    </form>
  );
};

export function EditFileInfosButton(props: Parameters<typeof useFileInfosModal>[0]) {
  const { openModal } = useFileInfosModal(props);

  return (
    <Button theme="white" onClick={async () => await openModal()}>
      Editar archivos
    </Button>
  );
}

type OptionalPropsButtonProps = {
  onClick: ()=> void;
  isVisible: boolean;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const OptionalPropsButton = ( { isVisible, onClick }: OptionalPropsButtonProps)=><span
  onClick={onClick}
  className={classes(styles.optionalButton)}>
  {!isVisible ? <ArrowRight /> : <ArrowDropDown />} Propiedades opcionales</span>;
