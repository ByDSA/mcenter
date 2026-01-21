import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { FetchApi } from "#modules/fetching/fetch-api";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { DaErrorView } from "#modules/ui-kit/form/Error";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
import { DaInputText, DaInputTextMultiline } from "#modules/ui-kit/form/input/Text/InputText";
import { MusicSmartPlaylistsApi } from "../requests";
import { MusicSmartPlaylistEntity } from "../models";
import { FormVisibility } from "../../FormVisibility";

type FormProps = {
  onSuccess?: (newSmartPlaylist: MusicSmartPlaylistEntity)=> void;
};

const schema = z.object( {
  name: z.string().trim()
    .min(1, "El nombre es obligatorio"),
  query: z.string().trim()
    .min(1, "La query es obligatoria"),
  visibility: z.enum(["public", "private"]),
} );

export const NewSmartPlaylistForm = ( { onSuccess }: FormProps) => {
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
    const api = FetchApi.get(MusicSmartPlaylistsApi);
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
        <DaLabel>Nombre</DaLabel>
        <DaInputText
          {...register("name")}
          autoFocus
        />
        <DaErrorView errors={errors} keyName="name" touchedFields={touchedFields} />
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
            } );
          }} />
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
    </>
  );
};
