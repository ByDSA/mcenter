import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { Button } from "#modules/ui-kit/input/Button";
import { InputTextLineView } from "#modules/ui-kit/input/UseInputText";
import { FetchApi } from "#modules/fetching/fetch-api";
import { FormLabel } from "#modules/ui-kit/form/Label/FormLabel";
import { ErrorView } from "#modules/ui-kit/input/Error";
import { FormFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FormFooterButtons";
import { ImageCoverSelectorButton } from "#modules/image-covers/Selector/Button";
import { MusicPlaylistsApi } from "../requests";
import { MusicPlaylistEntity } from "../models";
import { FormVisibility } from "../../FormVisibility";

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

// eslint-disable-next-line @typescript-eslint/naming-convention
export const EditPlaylistForm = ( { initialValue, onSuccess, updateLocalValue }: Props) => {
  const { register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, touchedFields, isValid, isSubmitting, isDirty } } = useForm( {
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
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Evitar salto de línea
      await handleSubmit(onSubmit)();
    }
  };
  const onSubmit = async (data: z.infer<typeof schema>) => {
    const changes: MusicPlaylistsApi.PatchOne.Body = {};

    if (data.name !== initialValue.name)
      changes.name = data.name;

    if (data.slug !== initialValue.slug)
      changes.slug = data.slug;

    if (data.visibility !== initialValue.visibility)
      changes.visibility = data.visibility;

    if (data.imageCoverId !== initialValue.imageCoverId)
      changes.imageCoverId = data.imageCoverId;

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
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormLabel>Nombre</FormLabel>
        <InputTextLineView
          {...register("name")}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <ErrorView errors={errors} keyName="name" touchedFields={touchedFields} />

        <FormLabel>Url slug</FormLabel>
        <InputTextLineView
          {...register("slug")}
          onKeyDown={handleKeyDown}
        />
        <ErrorView errors={errors} keyName="slug" touchedFields={touchedFields} />

        <FormLabel>Visibilidad</FormLabel>
        <FormVisibility
          value={currentVisibility}
          setValue= {(newVal) => {
            setValue("visibility", newVal, {
              shouldValidate: true,
              shouldDirty: true,
            } );
          }} />
        <ErrorView errors={errors} keyName="visibility" touchedFields={touchedFields} />

        <FormLabel>Imagen</FormLabel>
        <ImageCoverSelectorButton
          onSelect={(imageCover) => {
            setValue("imageCoverId", imageCover?.id ?? null, {
              shouldValidate: true,
              shouldDirty: true,
            } );
          }}
          currentId={currentImageCoverId}
        />
        <ErrorView errors={errors} keyName="imageCoverId" touchedFields={touchedFields} />

        <FormFooterButtons>
          <Button
            type="submit"
            theme="white"
            isSubmitting={isSubmitting}
            disabled={!isValid || !isDirty}
          >
            Editar
          </Button>
        </FormFooterButtons>
      </form>
    </>
  );
};
