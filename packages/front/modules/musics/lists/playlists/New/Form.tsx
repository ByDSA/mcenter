import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { DaInputText } from "#modules/ui-kit/form/input/Text/InputText";
import { FetchApi } from "#modules/fetching/fetch-api";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { DaErrorView } from "#modules/ui-kit/form/Error";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
import { DaForm } from "#modules/ui-kit/form/Form";
import { DaSaveButton } from "#modules/ui-kit/form/SaveButton";
import { MusicPlaylistsApi } from "../requests";
import { FormVisibility } from "../../FormVisibility";

type FormProps = {
  onSuccess?: (newPlaylist: any)=> void;
};

export const NewPlaylistForm = ( { onSuccess }: FormProps) => {
  const { LL } = useI18nContext();
  const schema = useMemo(() => z.object( {
    name: z.string().trim()
      .min(1, LL.uikit.forms.errors.requiredField()),
    visibility: z.enum(["public", "private"]),
  } ), [LL]);
  const { register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, touchedFields, isValid, isDirty } } = useForm( {
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
    <DaForm
      onSubmit={handleSubmit(onSubmit)}
      isValid={isValid}
      isDirty={isDirty}
    >
      <DaLabel>{LL.uikit.forms.labels.name()}</DaLabel>
      <DaInputText
        {...register("name")}
        autoFocus
      />
      <DaErrorView errors={errors} keyName="name" touchedFields={touchedFields} />

      <DaLabel>{LL.modules.resources.labels.visibility()}</DaLabel>
      <FormVisibility
        value={currentVisibility}
        setValue={(newVal) => {
          setValue("visibility", newVal, {
            shouldValidate: true,
            shouldDirty: true,
          } );
        }}
      />
      <DaErrorView errors={errors} keyName="visibility" touchedFields={touchedFields} />

      <DaFooterButtons>
        <DaSaveButton>
          {LL.uikit.actions.create()}
        </DaSaveButton>
      </DaFooterButtons>
    </DaForm>
  );
};
