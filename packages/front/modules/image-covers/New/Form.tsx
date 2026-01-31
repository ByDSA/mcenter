import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { DaInputGroup } from "#modules/ui-kit/form/InputGroup";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
import { DaInputText } from "#modules/ui-kit/form/input/Text/InputText";
import { DaErrorView } from "#modules/ui-kit/form/Error";
import { DaInputErrorWrap } from "#modules/ui-kit/form/InputErrorWrap";
import { DaCloseModalButton } from "#modules/ui-kit/modal/CloseButton";
import { DaSaveButton } from "#modules/ui-kit/form/SaveButton";
import { DaForm } from "#modules/ui-kit/form/Form";
import { ImageCoverEntity } from "../models";
import { DaLabel } from "../../ui-kit/form/Label/Label";
import { ImageCoverUpload, ImageCoverUploadRef } from "../Edit/UploadImage";

// Asegúrate de que este import sea correcto o ajusta la ruta según tu estructura
const schema = z.object( {
  label: z.string().trim()
    .min(1, "La etiqueta es obligatoria"),
} );

type FormData = z.infer<typeof schema>;

export type NewImageCoverProps = {
  onSuccess?: (created: ImageCoverEntity)=> void;
};

export function NewImageCoverForm( { onSuccess }: NewImageCoverProps) {
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
        <DaLabel>Etiqueta</DaLabel>
        <DaInputErrorWrap>
          <DaInputText
            {...register("label")}
            autoFocus
          />
          <DaErrorView errors={errors} keyName="label" touchedFields={dirtyFields} />
        </DaInputErrorWrap>
      </DaInputGroup>

      <DaInputGroup>
        <DaLabel>Subir Imagen</DaLabel>
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
          Subir
        </DaSaveButton>
      </DaFooterButtons>
    </DaForm>
  );
}
