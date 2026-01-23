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
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { DaErrorView } from "#modules/ui-kit/form/Error";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
import { useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { ImageCoverSelectorButton } from "#modules/image-covers/Selector/Button";
import { useFileInfosModal } from "#modules/musics/file-info/Edit/Modal";
import { classes } from "#modules/utils/styles";
import { DaInputTextMultiline } from "#modules/ui-kit/form/input/Text/InputText";
import { useMusic } from "#modules/musics/hooks";
import { DaSaveButton } from "#modules/ui-kit/form/SaveButton";
import { DaDeleteButton } from "#modules/ui-kit/DeleteButton";
import { DaCloseModalButton } from "#modules/ui-kit/modal/CloseButton";
import { DaForm } from "#modules/ui-kit/form/Form";
import { DaInputNumber } from "../../../ui-kit/form/input/Number/InputNumber";
import { DaInputBooleanCheckbox } from "../../../ui-kit/form/input/Boolean/InputBoolean";
import { DaInputGroup, DaInputGroupItem } from "../../../ui-kit/form/InputGroup";
import { DaInputErrorWrap } from "../../../ui-kit/form/InputErrorWrap";
import { FormInputTags } from "../../../resources/FormInputTags/FormInputTags";
import styles from "./styles.module.css";

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
  initialData: MusicEntity | (()=> MusicEntity);
  onSuccess?: (newData: MusicEntity)=> void;
  onDelete?: ()=> void;
};

export const EditMusicForm = ( { initialData: propInitialData, onSuccess, onDelete }: Props) => {
  const [showOptional, setShowOptional] = useState(false);
  const initialData = typeof propInitialData === "function"
    ? propInitialData()
    : propInitialData;
  const { register,
    handleSubmit,
    control,
    formState: { errors, isDirty, dirtyFields, isValid } } = useForm( {
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
        <DaInputGroup inline>
          <DaLabel>Título</DaLabel>
          <span>{initialData.title}</span>
        </DaInputGroup>
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
    <DaForm
      className={styles.container}
      onSubmit={handleSubmit(onSubmit)}
      isDirty={isDirty}
      isValid={isValid}
    >
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
        <DaLabel>Artista</DaLabel>
        <DaInputErrorWrap>
          <DaInputTextMultiline
            {...register("artist")}
          />
          <DaErrorView errors={errors} keyName="artist" touchedFields={dirtyFields} />
        </DaInputErrorWrap>
      </DaInputGroup>

      <DaInputGroup inline>
        <article>
          <DaLabel>Peso</DaLabel>
          <DaInputErrorWrap>
            <DaInputNumber
              {...register("weight", {
                valueAsNumber: true,
              } )}
              className={styles.weight}
            />
            <DaErrorView errors={errors} keyName="weight" touchedFields={dirtyFields} />
          </DaInputErrorWrap>
        </article>
        <DaInputGroupItem>
          <DaLabel>Álbum</DaLabel>
          <DaInputTextMultiline
            {...register("album")}
            nullable
          />
        </DaInputGroupItem>
      </DaInputGroup>

      <DaInputGroup>
        <DaLabel>Tags (usa # para tags globales)</DaLabel>
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
      </DaInputGroup>

      <DaInputGroup inline>
        <DaLabel>Slug</DaLabel>
        <DaInputErrorWrap>
          <DaInputTextMultiline
            {...register("slug")}
          />
          <DaErrorView errors={errors} keyName="slug" touchedFields={dirtyFields} />
        </DaInputErrorWrap>
      </DaInputGroup>

      <DaInputGroup inline>
        <DaLabel>Imagen</DaLabel>
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
      </DaInputGroup>

      <OptionalPropsButton
        isVisible={showOptional}
        onClick={() => setShowOptional(!showOptional)}
      />

      <div>
        <DaInputGroup inline>
          {(showOptional || initialData.year !== undefined || dirtyFields.year !== undefined)
          && <DaInputGroupItem className={styles.flex0}>
            <DaLabel>Año</DaLabel>
            <DaInputErrorWrap>
              <DaInputNumber
                {...register("year", {
                  setValueAs: (v) => (v === "" || isNaN(v) ? undefined : Number(v)),
                } )}
                className={styles.year}
                nullable
              />
              <DaErrorView errors={errors} keyName="year" touchedFields={dirtyFields} />
            </DaInputErrorWrap>
          </DaInputGroupItem>}
          {(showOptional || initialData.disabled !== undefined
            || dirtyFields.disabled !== undefined)
        && <DaInputGroupItem className={styles.flex0}>
          <DaLabel>Desactivado</DaLabel>
          <DaInputErrorWrap>
            <Controller
              control={control}
              name="disabled"
              render={( { field } ) => (
                <DaInputBooleanCheckbox
                  value={field.value!}
                  onChange={field.onChange}
                />
              )}
            />
          </DaInputErrorWrap>
        </DaInputGroupItem>
          }
          {(showOptional || initialData.country !== undefined || dirtyFields.country !== undefined)
        && <DaInputGroupItem>
          <DaLabel>País</DaLabel>
          <DaInputErrorWrap>
            <DaInputTextMultiline
              {...register("country")}
              nullable
            />
          </DaInputErrorWrap>
        </DaInputGroupItem>
          }
        </DaInputGroup>

        {(showOptional || initialData.game !== undefined || dirtyFields.game !== undefined)
        && <DaInputGroup inline>
          <DaLabel>Juego</DaLabel>
          <DaInputErrorWrap>
            <DaInputTextMultiline
              {...register("game")}
              nullable
            />
          </DaInputErrorWrap>
        </DaInputGroup>
        }
        {(showOptional || initialData.spotifyId !== undefined
          || dirtyFields.spotifyId !== undefined)
        && <DaInputGroup inline>
          <DaLabel>Spotify ID</DaLabel>
          <DaInputErrorWrap>
            <DaInputTextMultiline
              {...register("spotifyId")}
              nullable
            />
          </DaInputErrorWrap>
        </DaInputGroup>
        }
      </div>

      <DaFooterButtons className={styles.footer}>
        <aside>
          <EditFileInfosButton
            musicId={initialData.id}
          />
        </aside>
        <aside>
          <DaDeleteButton
            onClick={handleDelete}
          />
          <DaCloseModalButton />
          <DaSaveButton/>
        </aside>
      </DaFooterButtons>
    </DaForm>
  );
};

export function EditFileInfosButton(props: Parameters<typeof useFileInfosModal>[0]) {
  const { openModal } = useFileInfosModal(props);

  return (
    <DaButton theme="white" onClick={async () => await openModal()}>
      Editar archivos
    </DaButton>
  );
}

type OptionalPropsButtonProps = {
  onClick: ()=> void;
  isVisible: boolean;
};
export const OptionalPropsButton = ( { isVisible, onClick }: OptionalPropsButtonProps)=><span
  onClick={onClick}
  className={classes(styles.optionalButton)}>
  {!isVisible ? <ArrowRight /> : <ArrowDropDown />} Propiedades opcionales</span>;
