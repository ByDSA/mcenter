import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import { FormInputText } from "#modules/ui-kit/form/input/Text/FormInputText";
import { FetchApi } from "#modules/fetching/fetch-api";
import { FormLabel } from "#modules/ui-kit/form/Label/FormLabel";
import { ErrorView } from "#modules/ui-kit/input/Error";
import { FormFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FormFooterButtons";
import { MusicPlaylistsApi } from "../requests";
import { FormVisibility } from "../../FormVisibility";

type FormProps = {
  onSuccess?: (newPlaylist: any)=> void;
};

const schema = z.object( {
  name: z.string().trim()
    .min(1, "El nombre es obligatorio"),
  visibility: z.enum(["public", "private"]),
} );

// eslint-disable-next-line @typescript-eslint/naming-convention
export const NewPlaylistForm = ( { onSuccess }: FormProps) => {
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
    },
  } );
  const currentVisibility = watch("visibility");
  const onSubmit = async (data: z.infer<typeof schema>) => {
    const api = FetchApi.get(MusicPlaylistsApi);
    const res1 = await api.createOne( {
      name: data.name,
      slug: data.name,
      visibility: data.visibility,
    } );
    const res = await api.getManyByCriteria( {
      expand: ["ownerUserPublic"],
      filter: {
        id: res1.data!.id,
      },
    } );

    onSuccess?.(res.data[0]);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormLabel>Nombre</FormLabel>
      <FormInputText
        {...register("name")}
        autoFocus
      />
      <ErrorView errors={errors} keyName="name" touchedFields={touchedFields} />

      <FormLabel>Visibilidad</FormLabel>
      <FormVisibility
        value={currentVisibility}
        setValue={(newVal) => {
          setValue("visibility", newVal, {
            shouldValidate: true,
          } );
        }}
      />
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
  );
};
