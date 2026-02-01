import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { SeriesEntity } from "$shared/models/episodes/series";
import { FetchApi } from "#modules/fetching/fetch-api";
import { SeriesApi } from "#modules/episodes/series/requests";
import { ImageCoversApi } from "#modules/image-covers/requests";
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
import { newSerieSchema } from "../New/Form";
import { SeriesCrudDtos } from "../models/dto";

const schema = newSerieSchema.extend( {
  key: z.string().trim()
    .min(1, "El slug es obligatorio"),
} );

type FormData = z.infer<typeof schema>;

type Props = {
  initialData: SeriesEntity;
  onSuccess?: (newData: SeriesEntity)=> void;
};

export const EditSeriesForm = ( { initialData, onSuccess }: Props) => {
  const { register,
    handleSubmit,
    control,
    formState: { errors, isDirty, dirtyFields, isValid } } = useForm<FormData>( {
      resolver: zodResolver(schema),
      mode: "onChange",
      defaultValues: {
        name: initialData.name,
        key: initialData.key,
        imageCoverId: initialData.imageCoverId ?? null,
      },
    } );
  const onSubmit = async (formValues: FormData) => {
    const seriesApi = FetchApi.get(SeriesApi);
    const changes: SeriesCrudDtos.Patch.Body = {
      entity: {},
    };

    if (dirtyFields.name)
      changes.entity.name = formValues.name;

    if (dirtyFields.key)
      changes.entity.key = formValues.key;

    if (dirtyFields.imageCoverId)
      changes.entity.imageCoverId = formValues.imageCoverId;

    if (Object.keys(changes.entity).length === 0)
      return;

    const res = await seriesApi.patch(initialData.id, changes);
    let newData = {
      ...initialData,
      ...res.data!,
    };

    // Si cambió el imageCoverId, necesitamos actualizar el objeto imageCover completo si es posible
    // o dejar que el componente padre recargue. Aquí intentaremos obtener la cover si cambió.
    if (dirtyFields.imageCoverId && formValues.imageCoverId) {
      const coverApi = FetchApi.get(ImageCoversApi);
      const coverRes = await coverApi.getOneByCriteria( {
        filter: {
          id: formValues.imageCoverId,
        },
      } );

      if (coverRes.data)
        newData.imageCover = coverRes.data;
    } else if (dirtyFields.imageCoverId && !formValues.imageCoverId) {
      newData.imageCoverId = null;
      newData.imageCover = undefined;
    }

    onSuccess?.(newData);
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
        <DaLabel>Slug (Key)</DaLabel>
        <DaInputErrorWrap>
          <DaInputText {...register("key")} />
          <DaErrorView errors={errors} keyName="key" touchedFields={dirtyFields} />
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
        <DaSaveButton>Guardar</DaSaveButton>
      </DaFooterButtons>
    </DaForm>
  );
};
