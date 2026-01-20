import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { logger } from "#modules/core/logger";
import { useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { FormInputGroup, FormInputGroupItem } from "#modules/ui-kit/form/FormInputGroup";
import { FormFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FormFooterButtons";
import { FormInputText } from "#modules/ui-kit/form/input/Text/FormInputText";
import { ErrorView } from "#modules/ui-kit/form/Error";
import { FormInputErrorWrap } from "#modules/ui-kit/form/FormInputErrorWrap";
import { ImageCoverEntity } from "../models";
import { ImageCoversApi } from "../requests";
import { getMediumCoverUrl } from "../Selector/image-cover-utils";
import { FormLabel } from "../../ui-kit/form/Label/FormLabel";
import styles from "./Editor.module.css";
import { ImageCoverUpload, PreviewImage, ImageCoverUploadRef } from "./UploadImage";

const schema = z.object( {
  label: z.string().trim()
    .min(1, "La etiqueta es obligatoria"),
} );

type FormData = z.infer<typeof schema>;

export type ImageCoverEditorProps = {
  imageCover: ImageCoverEntity;
  onUpdate?: (updated: ImageCoverEntity | null)=> void;
};

export function ImageCoverEditorForm( { imageCover, onUpdate }: ImageCoverEditorProps) {
  const modal = useModal(true);
  const confirmModal = useConfirmModal();
  // Estado local para visualizar cambios inmediatos (opcional, pero útil para la imagen actual)
  const [currentEntity, setCurrentEntity] = useState(imageCover);
  const [hasNewFile, setHasNewFile] = useState(false);
  const uploadRef = useRef<ImageCoverUploadRef>(null);
  const { register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, dirtyFields, isValid } } = useForm<FormData>( {
      resolver: zodResolver(schema),
      mode: "onChange",
      defaultValues: {
        label: imageCover.metadata.label,
      },
    } );
  const handleEntityUpdate = (updated: ImageCoverEntity) => {
    setCurrentEntity(updated);
    onUpdate?.(updated);
  };
  const handleDelete = async () => {
    await confirmModal.openModal( {
      content: (
        <>
          <p>¿Borrar cover?</p>
          <p>{currentEntity.metadata.label}</p>
        </>
      ),
      action: async () => {
        try {
          await FetchApi.get(ImageCoversApi).deleteOneById(currentEntity.id);
          onUpdate?.(null);
          modal.closeModal();
        } catch (err) {
          logger.error((err as Error).message);
        }

        return true;
      },
    } );
  };
  const onSubmit = async (formValues: FormData) => {
    try {
      let updatedData: ImageCoverEntity | null | undefined = currentEntity;
      let hasChanges = false;

      // 1. PATCH de metadatos (si cambiaron)
      if (dirtyFields.label) {
        const api = FetchApi.get(ImageCoversApi);
        const res = await api.patch(currentEntity.id, {
          entity: {
            metadata: {
              label: formValues.label,
            },
          },
        } );

        updatedData = res.data;
        hasChanges = true;
      }

      // 2. Subida de nueva imagen (si la hay)
      // La imagen después para que el backend devuelva el param "?t=timestamp" actualizado
      if (hasNewFile && uploadRef.current) {
        const uploadedData = await uploadRef.current.upload();

        if (uploadedData) {
          updatedData = uploadedData;
          hasChanges = true;
        }
      }

      if (hasChanges && updatedData) {
        handleEntityUpdate(updatedData);
        modal.closeModal();
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      // Aquí podrías poner un toast de error si tienes un sistema de notificaciones
    }
  };
  // Se habilita si el formulario está 'dirty' (texto cambiado) O si hay un nuevo archivo
  const canSave = (isDirty && isValid) || hasNewFile;

  return (
    <form className={styles.editor} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.mainSection}>
        <FormInputGroup className={styles.fieldGroup}>
          <FormLabel>Etiqueta</FormLabel>
          <FormInputErrorWrap>
            <FormInputText
              {...register("label")}
            />
            <ErrorView errors={errors} keyName="label" touchedFields={dirtyFields} />
          </FormInputErrorWrap>
        </FormInputGroup>

        <FormInputGroup className={styles.imagesSection}>
          <FormInputGroupItem>
            <FormLabel>Actual</FormLabel>
            <div className={styles.currentCoverWrap}>
              <PreviewImage src={getMediumCoverUrl(currentEntity)} />
            </div>
          </FormInputGroupItem>

          <FormInputGroupItem>
            <FormLabel>Reemplazar Imagen</FormLabel>
            <ImageCoverUpload
              ref={uploadRef}
              entityId={currentEntity.id}
              hideUploadButton={true}
              onFileChange={(file) => setHasNewFile(!!file)}
            />
          </FormInputGroupItem>
        </FormInputGroup>
      </div>

      <FormFooterButtons>
        <aside>
          <Button
            onClick={handleDelete}
            theme="red"
            disabled={isSubmitting}
            type="button" // Importante para no disparar el submit del form
          >
            Borrar
          </Button>
        </aside>
        <aside>
          <Button onClick={modal.closeModal} theme="white" type="button" disabled={isSubmitting}>
            Cerrar
          </Button>
          <Button
            type="submit"
            theme="blue"
            disabled={!canSave || isSubmitting}
            isSubmitting={isSubmitting}
          >
            Guardar
          </Button>
        </aside>
      </FormFooterButtons>
    </form>
  );
}
