import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import { FetchApi } from "#modules/fetching/fetch-api";
import { FormLabel } from "#modules/ui-kit/form/Label/FormLabel";
import { ErrorView } from "#modules/ui-kit/form/Error";
import { FormFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FormFooterButtons";
import { FormInputText, FormInputTextMultiline } from "#modules/ui-kit/form/input/Text/FormInputText";
import { MusicQueriesApi } from "../requests";
import { MusicQueryEntity } from "../models";
import { FormVisibility } from "../../FormVisibility";

type FormProps = {
  onSuccess?: (newQuery: MusicQueryEntity)=> void;
};

const schema = z.object( {
  name: z.string().trim()
    .min(1, "El nombre es obligatorio"),
  query: z.string().trim()
    .min(1, "La query es obligatoria"),
  visibility: z.enum(["public", "private"]),
} );

// eslint-disable-next-line @typescript-eslint/naming-convention
export const NewQueryForm = ( { onSuccess }: FormProps) => {
  const { register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, touchedFields, isValid, isSubmitting } } = useForm( {
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      visibility: "private" as const,
      name: "",
      query: "",
    },
  } );
  const currentVisibility = watch("visibility");
  const onSubmit = async (data: z.infer<typeof schema>) => {
    const api = FetchApi.get(MusicQueriesApi);
    const res = await api.createOne( {
      name: data.name,
      slug: data.name,
      query: data.query.toLocaleLowerCase(),
      visibility: data.visibility,
    } );

    onSuccess?.(res.data!);
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
            } );
          }} />
        <ErrorView errors={errors} keyName="visibility" touchedFields={touchedFields} />
        <FormFooterButtons>
          <Button
            type="submit"
            theme="white"
            isSubmitting={isSubmitting}
            disabled={!isValid}
          >
          Crear
          </Button>
        </FormFooterButtons>
      </form>
    </>
  );
};
