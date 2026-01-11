import { useState, useRef } from "react";
import { Button } from "#modules/ui-kit/input/Button";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { logger } from "#modules/core/logger";
import { useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { ImageCoverEntity } from "../models";
import { ImageCoversApi } from "../requests";
import { getMediumCoverUrl } from "../Selector/image-cover-utils";
import { ImageCoverLabelView } from "../New/Content";
import styles from "./Editor.module.css";
import { SectionLabel } from "./SectionLabel";
import { ImageCoverUpload, PreviewImage, ImageCoverUploadRef } from "./UploadImage";

export type ImageCoverEditorProps = {
  imageCover: ImageCoverEntity;
  onUpdate?: (updated: ImageCoverEntity | null)=> void;
};

export function ImageCoverEditor( { imageCover, onUpdate }: ImageCoverEditorProps) {
  const modal = useModal(true);
  const confirmModal = useConfirmModal();
  // Estado local del componente
  const [currentEntity, setCurrentEntity] = useState(imageCover);
  const [label, setLabel] = useState(imageCover.metadata.label);
  // Estados de control y UI
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasNewFile, setHasNewFile] = useState(false);
  // Referencia al componente de subida
  const uploadRef = useRef<ImageCoverUploadRef>(null);
  // Determinar si hay cambios pendientes para habilitar el botón Guardar
  const hasChanges = label !== currentEntity.metadata.label || hasNewFile;
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
        setIsProcessing(true);
        try {
          await FetchApi.get(ImageCoversApi).deleteOneById(currentEntity.id);
          onUpdate?.(null);
          modal.closeModal();
        } catch (err) {
          logger.error((err as Error).message);
          setIsProcessing(false);
        }

        return true;
      },
    } );
  };
  const handleGlobalSave = async () => {
    setIsProcessing(true);
    try {
      let updatedData: ImageCoverEntity | null | undefined = null;

      if (label !== currentEntity.metadata.label) {
        const api = FetchApi.get(ImageCoversApi);
        const res = await api.patch(currentEntity.id, {
          entity: {
            metadata: {
              label,
            },
          },
        } );

        updatedData = res.data;
      }

      // La imagen después para que devuelva el param "?t=timestamp"
      if (hasNewFile && uploadRef.current)
        updatedData = await uploadRef.current.upload();

      if (updatedData) {
        handleEntityUpdate(updatedData);
        modal.closeModal();
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      // Aquí podrías poner un toast de error
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.editor}>
      <div className={styles.mainSection}>
        <section className={styles.fieldGroup}>
          <SectionLabel>Etiqueta</SectionLabel>
          <ImageCoverLabelView
            value={label}
            onChange={(value) => setLabel(value)}

          />
        </section>
        <section className={styles.imagesSection}>
          <article className={styles.currentImageSection}>
            <SectionLabel>Actual</SectionLabel>
            <PreviewImage src={getMediumCoverUrl(currentEntity)} />
          </article>

          <article className={styles.replaceImageSection}>
            <SectionLabel>Reemplazar Imagen</SectionLabel>
            <ImageCoverUpload
              ref={uploadRef}
              entityId={currentEntity.id}
              hideUploadButton={true}
              onFileChange={(file)=>setHasNewFile(!!file)}
            />
          </article>
        </section>
      </div>

      <div className={styles.actions}>
        <aside>
          <Button
            onClick={handleDelete}
            theme="blue"
            disabled={isProcessing}
          >
            Borrar
          </Button>
        </aside>
        <aside>
          <Button onClick={modal.closeModal} theme="white">Cerrar</Button>
          <Button
            onClick={handleGlobalSave}
            theme="blue"
            disabled={isProcessing
              || !hasChanges} // Deshabilitado si no hay cambios o está guardando
          >
            {isProcessing ? "Guardando..." : "Guardar"}
          </Button>
        </aside>
      </div>
    </div>
  );
}
