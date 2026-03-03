import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useMemo } from "react";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { DaInputGroup } from "#modules/ui-kit/form/InputGroup";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
import { DaInputText } from "#modules/ui-kit/form/input/Text/InputText";
import { DaErrorView } from "#modules/ui-kit/form/Error";
import { DaInputErrorWrap } from "#modules/ui-kit/form/InputErrorWrap";
import { DaCloseModalButton } from "#modules/ui-kit/modal/CloseButton";
import { DaSaveButton } from "#modules/ui-kit/form/SaveButton";
import { DaForm } from "#modules/ui-kit/form/Form";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { ImageCoverEntity } from "../models";
import { DaLabel } from "../../ui-kit/form/Label/Label";
import { ImageCoverUpload, ImageCoverUploadRef } from "../Edit/UploadImage";

export type NewImageCoverProps = {
  onSuccess?: (created: ImageCoverEntity)=> void;
};

export function NewImageCoverForm( { onSuccess }: NewImageCoverProps) {
  const { LL } = useI18nContext();
  const schema = useMemo(() => z.object( {
    label: z.string().trim()
      .min(1, LL.uikit.forms.errors.requiredField()),
  } ), [LL]);

  type FormData = z.infer<typeof schema>;

  const modal = useModal(true);
  const uploadRef = useRef<ImageCoverUploadRef>(null);
  const [hasFile, setHasFile] = useState(false);
  const { register,
    handleSubmit,
    formState: { errors, isValid, isDirty, dirtyFields } } = useForm<FormData>( {
      resolver: zodResolver(schema),
      mode: "onChange",
      defaultValues: {
        label: "",
      },
    } );
  const onSubmit = async (formValues: FormData) => {
    if (!uploadRef.current)
      return;

    // Utilizamos el método upload del componente hijo, pasando el label validado
    const created = await uploadRef.current.upload( {
      label: formValues.label,
    } );

    if (created) {
      onSuccess?.(created);
      modal.closeModal();
    }
  };

  return (
    <DaForm
      onSubmit={handleSubmit(onSubmit)}
      isDirty={isDirty}
      isValid={isValid && hasFile}
    >
      <DaInputGroup>
        <DaLabel>{LL.modules.imageCover.label()}</DaLabel>
        <DaInputErrorWrap>
          <DaInputText
            {...register("label")}
            autoFocus
          />
          <DaErrorView errors={errors} keyName="label" touchedFields={dirtyFields} />
        </DaInputErrorWrap>
      </DaInputGroup>

      <DaInputGroup>
        <DaLabel> {LL.modules.imageCover.upload()}</DaLabel>
        <ImageCoverUpload
          ref={uploadRef}
          hideUploadButton
          // onSuccess se maneja manualmente en el onSubmit del formulario padre
          onFileChange={(file) => setHasFile(!!file)}
        />
      </DaInputGroup>

      <DaFooterButtons>
        <DaCloseModalButton />
        <DaSaveButton>
          {LL.modules.imageCover.upload()}
        </DaSaveButton>
      </DaFooterButtons>
    </DaForm>
  );
}
