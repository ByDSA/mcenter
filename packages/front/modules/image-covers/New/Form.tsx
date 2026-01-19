import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { FormInputGroup } from "#modules/ui-kit/form/FormInputGroup";
import { FormFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FormFooterButtons";
import { FormInputText } from "#modules/ui-kit/form/input/Text/FormInputText";
import { ErrorView } from "#modules/ui-kit/form/Error";
import { FormInputErrorWrap } from "#modules/ui-kit/form/FormInputErrorWrap";
import { ImageCoverEntity } from "../models";
import { FormLabel } from "../../ui-kit/form/Label/FormLabel";
import { ImageCoverUpload, ImageCoverUploadRef } from "../Edit/UploadImage";
import styles from "./Content.module.css";

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
    formState: { errors, isValid, isSubmitting, dirtyFields } } = useForm<FormData>( {
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
    <form className={styles.content} onSubmit={handleSubmit(onSubmit)}>
      <FormInputGroup>
        <FormLabel>Etiqueta</FormLabel>
        <FormInputErrorWrap>
          <FormInputText
            {...register("label")}
          />
          <ErrorView errors={errors} keyName="label" touchedFields={dirtyFields} />
        </FormInputErrorWrap>
      </FormInputGroup>

      <FormInputGroup>
        <FormLabel>Subir Imagen</FormLabel>
        <ImageCoverUpload
          ref={uploadRef}
          hideUploadButton
          // onSuccess se maneja manualmente en el onSubmit del formulario padre
          onFileChange={(file) => setHasFile(!!file)}
        />
      </FormInputGroup>

      <FormFooterButtons>
        <Button onClick={modal.closeModal} theme="white" disabled={isSubmitting}>
          Cerrar
        </Button>
        <Button
          type="submit"
          theme="blue"
          disabled={!hasFile || !isValid || isSubmitting}
          isSubmitting={isSubmitting}
        >
          Subir
        </Button>
      </FormFooterButtons>
    </form>
  );
}
