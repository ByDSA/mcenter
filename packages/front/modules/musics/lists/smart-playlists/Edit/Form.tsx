import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { FetchApi } from "#modules/fetching/fetch-api";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { DaErrorView } from "#modules/ui-kit/form/Error";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
import { ImageCoverSelectorButton } from "#modules/image-covers/Selector/Button";
import { DaInputText, DaInputTextMultiline } from "#modules/ui-kit/form/input/Text/InputText";
import { MusicSmartPlaylistsApi } from "../requests";
import { MusicSmartPlaylistEntity } from "../models";
import { FormVisibility } from "../../FormVisibility";

type Props = {
  initialData: MusicSmartPlaylistEntity;
  onSuccess?: (data: { previous: MusicSmartPlaylistEntity;
current: MusicSmartPlaylistEntity; } )=> void;
  updateLocalData: (value: MusicSmartPlaylistEntity)=> void;
};

const schema = z.object( {
  name: z.string().trim()
    .min(1, "El nombre es obligatorio"),
  slug: z.string().trim()
    .min(1, "El slug es obligatorio"),
  query: z.string().trim()
    .min(1, "La query es obligatoria"),
  visibility: z.enum(["public", "private"]),
  imageCoverId: mongoDbId.nullable(),
} );

export const EditSmartPlaylistForm = ( { initialData, onSuccess, updateLocalData }: Props) => {
  const { register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, touchedFields, isValid, isSubmitting, isDirty } } = useForm( {
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: initialData.name,
      slug: initialData.slug,
      query: initialData.query,
      visibility: initialData.visibility,
      imageCoverId: initialData.imageCoverId ?? null,
    },
  } );
  const currentVisibility = watch("visibility");
  const currentImageCoverId = watch("imageCoverId");
  const onSubmit = async (data: z.infer<typeof schema>) => {
    const changes: MusicSmartPlaylistsApi.PatchOne.Body = {
      entity: {},
    };

    if (data.name !== initialData.name)
      changes.entity.name = data.name;

    if (data.slug !== initialData.slug)
      changes.entity.slug = data.slug;

    if (data.query !== initialData.query)
      changes.entity.query = data.query;

    if (data.visibility !== initialData.visibility)
      changes.entity.visibility = data.visibility;

    if (data.imageCoverId !== initialData.imageCoverId)
      changes.entity.imageCoverId = data.imageCoverId;

    if (Object.keys(changes).length === 0)
      return;

    const api = FetchApi.get(MusicSmartPlaylistsApi);

    await api.patchOne(initialData.id, changes);
    const res = await api.getOneByCriteria( {
      filter: {
        id: initialData.id,
      },
      expand: ["imageCover", "ownerUser"],
    } );
    const newData: MusicSmartPlaylistEntity = {
      ...initialData,
      ...res.data!,
    };

    if (newData.imageCover && newData.imageCoverId !== newData.imageCover.id)
      newData.imageCover = undefined;

    updateLocalData(newData);
    onSuccess?.( {
      previous: initialData,
      current: newData,
    } );
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DaLabel>Nombre</DaLabel>
        <DaInputText
          {...register("name")}
          autoFocus
        />
        <DaErrorView errors={errors} keyName="name" touchedFields={touchedFields} />

        <DaLabel>Url slug</DaLabel>
        <DaInputText
          {...register("slug")}
        />
        <DaErrorView errors={errors} keyName="slug" touchedFields={touchedFields} />

        <DaLabel>Query</DaLabel>
        <DaInputTextMultiline
          {...register("query")}
        />
        <DaErrorView errors={errors} keyName="query" touchedFields={touchedFields} />

        <DaLabel>Visibilidad</DaLabel>
        <FormVisibility
          value={currentVisibility}
          setValue= {(newVal) => {
            setValue("visibility", newVal, {
              shouldValidate: true,
              shouldDirty: true,
            } );
          }} />
        <DaErrorView errors={errors} keyName="visibility" touchedFields={touchedFields} />
        <DaLabel>Imagen</DaLabel>
        <ImageCoverSelectorButton
          onSelect={(imageCover) => {
            setValue("imageCoverId", imageCover?.id ?? null, {
              shouldValidate: true,
              shouldDirty: true,
            } );
          }}
          currentId={currentImageCoverId}
        />
        <DaErrorView errors={errors} keyName="imageCoverId" touchedFields={touchedFields} />

        <DaFooterButtons>
          <DaButton
            type="submit"
            theme="white"
            isSubmitting={isSubmitting}
            disabled={!isValid || !isDirty}
          >
            Editar
          </DaButton>
        </DaFooterButtons>
      </form>
    </>
  );
};
