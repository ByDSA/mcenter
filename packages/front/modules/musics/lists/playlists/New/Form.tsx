import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { DaInputText } from "#modules/ui-kit/form/input/Text/InputText";
import { FetchApi } from "#modules/fetching/fetch-api";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { DaErrorView } from "#modules/ui-kit/form/Error";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
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
      <DaLabel>Nombre</DaLabel>
      <DaInputText
        {...register("name")}
        autoFocus
      />
      <DaErrorView errors={errors} keyName="name" touchedFields={touchedFields} />

      <DaLabel>Visibilidad</DaLabel>
      <FormVisibility
        value={currentVisibility}
        setValue={(newVal) => {
          setValue("visibility", newVal, {
            shouldValidate: true,
          } );
        }}
      />
      <DaErrorView errors={errors} keyName="visibility" touchedFields={touchedFields} />

      <DaFooterButtons>
        <DaButton
          type="submit"
          theme="white"
          isSubmitting={isSubmitting}
          disabled={!isValid}
        >
          Crear
        </DaButton>
      </DaFooterButtons>
    </form>
  );
};
