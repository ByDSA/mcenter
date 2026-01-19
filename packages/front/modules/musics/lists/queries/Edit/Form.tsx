import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import { FetchApi } from "#modules/fetching/fetch-api";
import { FormLabel } from "#modules/ui-kit/form/Label/FormLabel";
import { ErrorView } from "#modules/ui-kit/input/Error";
import { FormFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FormFooterButtons";
import { ImageCoverSelectorButton } from "#modules/image-covers/Selector/Button";
import { FormInputText, FormInputTextMultiline } from "#modules/ui-kit/form/input/Text/FormInputText";
import { MusicQueriesApi } from "../requests";
import { MusicQueryEntity } from "../models";
import { FormVisibility } from "../../FormVisibility";

type Props = {
  initialData: MusicQueryEntity;
  onSuccess?: (data: { previous: MusicQueryEntity;
current: MusicQueryEntity; } )=> void;
  updateLocalData: (value: MusicQueryEntity)=> void;
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

// eslint-disable-next-line @typescript-eslint/naming-convention
export const EditQueryForm = ( { initialData, onSuccess, updateLocalData }: Props) => {
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
    const changes: MusicQueriesApi.PatchOne.Body = {
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

    const api = FetchApi.get(MusicQueriesApi);

    await api.patchOne(initialData.id, changes);
    const res = await api.getOneByCriteria( {
      filter: {
        id: initialData.id,
      },
      expand: ["imageCover", "ownerUser"],
    } );
    const newData: MusicQueryEntity = {
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
        <FormLabel>Nombre</FormLabel>
        <FormInputText
          {...register("name")}
          autoFocus
        />
        <ErrorView errors={errors} keyName="name" touchedFields={touchedFields} />

        <FormLabel>Url slug</FormLabel>
        <FormInputText
          {...register("slug")}
        />
        <ErrorView errors={errors} keyName="slug" touchedFields={touchedFields} />

        <FormLabel>Query</FormLabel>
        <FormInputTextMultiline
          {...register("query")}
        />
        <ErrorView errors={errors} keyName="query" touchedFields={touchedFields} />

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
