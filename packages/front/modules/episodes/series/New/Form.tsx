import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { SeriesEntity } from "$shared/models/episodes/series";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { FetchApi } from "#modules/fetching/fetch-api";
import { SeriesApi } from "#modules/episodes/series/requests";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { DaErrorView } from "#modules/ui-kit/form/Error";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
import { DaInputText } from "#modules/ui-kit/form/input/Text/InputText";
import { ImageCoverSelectorButton } from "#modules/image-covers/Selector/Button";
import { DaSaveButton } from "#modules/ui-kit/form/SaveButton";
import { DaCloseModalButton } from "#modules/ui-kit/modal/CloseButton";
import { DaForm } from "#modules/ui-kit/form/Form";
import { DaInputErrorWrap } from "#modules/ui-kit/form/InputErrorWrap";
import { DaInputGroup } from "#modules/ui-kit/form/InputGroup";

export const newSerieSchema = z.object( {
  name: z.string().trim()
    .min(1, "El nombre es obligatorio"),
  imageCoverId: mongoDbId.nullable(),
} );

type FormData = z.infer<typeof newSerieSchema>;

type Props = {
  onSuccess?: (newData: SeriesEntity)=> void;
};

export const NewSeriesForm = ( { onSuccess }: Props) => {
  const { register,
    handleSubmit,
    control,
    formState: { errors, isDirty, dirtyFields, isValid } } = useForm<FormData>( {
      resolver: zodResolver(newSerieSchema),
      mode: "onChange",
      defaultValues: {
        name: "",
        imageCoverId: null,
      },
    } );
  const onSubmit = async (formValues: FormData) => {
    const seriesApi = FetchApi.get(SeriesApi);
    const res = await seriesApi.createOne( {
      name: formValues.name,
      imageCoverId: formValues.imageCoverId,
    } );

    if (res.data)
      onSuccess?.(res.data);
  };

  return (
    <DaForm onSubmit={handleSubmit(onSubmit)} isDirty={isDirty} isValid={isValid}>
      <DaInputGroup>
        <DaLabel>Nombre</DaLabel>
        <DaInputErrorWrap>
          <DaInputText {...register("name")} autoFocus />
          <DaErrorView errors={errors} keyName="name" touchedFields={dirtyFields} />
        </DaInputErrorWrap>
      </DaInputGroup>

      <DaInputGroup>
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
        <DaErrorView errors={errors} keyName="imageCoverId" touchedFields={dirtyFields} />
      </DaInputGroup>

      <DaFooterButtons>
        <DaCloseModalButton />
        <DaSaveButton>Crear</DaSaveButton>
      </DaFooterButtons>
    </DaForm>
  );
};
