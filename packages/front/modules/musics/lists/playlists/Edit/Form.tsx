import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { DaInputText } from "#modules/ui-kit/form/input/Text/InputText";
import { FetchApi } from "#modules/fetching/fetch-api";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { DaErrorView } from "#modules/ui-kit/form/Error";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
import { ImageCoverSelectorButton } from "#modules/image-covers/Selector/Button";
import { DaForm } from "#modules/ui-kit/form/Form";
import { DaSaveButton } from "#modules/ui-kit/form/SaveButton";
import { MusicPlaylistsApi } from "../requests";
import { MusicPlaylistEntity } from "../models";
import { FormVisibility } from "../../FormVisibility";
import { MusicPlaylistCrudDtos } from "../models/dto";

type Props = {
  initialValue: MusicPlaylistEntity;
  onSuccess?: (data: { previous: MusicPlaylistEntity;
current: MusicPlaylistEntity; } )=> void;
  updateLocalValue: (value: MusicPlaylistEntity)=> void;
};

const schema = z.object( {
  name: z.string().trim()
    .min(1, "El nombre es obligatorio"),
  slug: z.string().trim()
    .min(1, "El slug es obligatorio"),
  visibility: z.enum(["public", "private"]),
  imageCoverId: mongoDbId.nullable(),
} );

export const EditPlaylistForm = ( { initialValue, onSuccess, updateLocalValue }: Props) => {
  const { register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, touchedFields, isValid, isDirty } } = useForm( {
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: initialValue.name,
      slug: initialValue.slug,
      visibility: initialValue.visibility,
      imageCoverId: initialValue.imageCoverId ?? null,
    },
  } );
  const currentVisibility = watch("visibility");
  const currentImageCoverId = watch("imageCoverId");
  const onSubmit = async (data: z.infer<typeof schema>) => {
    const changes: MusicPlaylistCrudDtos.Patch.Body = {
      entity: {},
    };

    if (data.name !== initialValue.name)
      changes.entity.name = data.name;

    if (data.slug !== initialValue.slug)
      changes.entity.slug = data.slug;

    if (data.visibility !== initialValue.visibility)
      changes.entity.visibility = data.visibility;

    if (data.imageCoverId !== initialValue.imageCoverId)
      changes.entity.imageCoverId = data.imageCoverId;

    if (Object.keys(changes).length === 0)
      return;

    const api = FetchApi.get(MusicPlaylistsApi);

    await api.patchOne(initialValue.id, changes);

    const res = await api.getOneByCriteria( {
      filter: {
        id: initialValue.id,
      },
      expand: ["imageCover", "ownerUserPublic"],
    } );
    const newData = res.data as MusicPlaylistEntity;

    updateLocalValue(newData);
    onSuccess?.( {
      previous: initialValue,
      current: newData,
    } );
  };

  return (
    <>
      <DaForm
        onSubmit={handleSubmit(onSubmit)}
        isValid={isValid}
        isDirty={isDirty}
      >
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
          <DaSaveButton>
            Editar
          </DaSaveButton>
        </DaFooterButtons>
      </DaForm>
    </>
  );
};
