/* eslint-disable @typescript-eslint/naming-convention */
import { useState, useRef } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { Button } from "#modules/ui-kit/input/Button";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { UploadButton } from "#modules/ui-kit/upload/UploadButton";
import { logger } from "#modules/core/logger";
import { classes } from "#modules/utils/styles";
import { useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { ImageCoverEntity } from "../models";
import { ImageCoversApi } from "../requests";
import { getMediumCoverUrl } from "../Selector/Selector";
import styles from "./Editor.module.css";
import { SectionLabel } from "./SectionLabel";

type EntityModifierProps = {
  entityId: string;
  initialValue?: any;
  onSuccess: (updatedEntity: ImageCoverEntity)=> void;
};

export type ImageCoverEditorProps = {
  imageCover: ImageCoverEntity;
  onUpdate?: (updated: ImageCoverEntity | null)=> void;
};

export function ImageCoverEditor( { imageCover, onUpdate }: ImageCoverEditorProps) {
  const modal = useModal(true);
  const [currentEntity, setCurrentEntity] = useState(imageCover);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleEntityUpdate = (updated: ImageCoverEntity) => {
    setCurrentEntity(updated);
    onUpdate?.(updated);
  };
  const confirmModal = useConfirmModal();
  const handleDelete = async () => {
    await confirmModal.openModal( {
      content: <>
        <p>¿Borrar cover?</p>
        <p>{imageCover.metadata.label}</p>
      </>,
      action: async ()=> {
        setIsDeleting(true);
        try {
          await FetchApi.get(ImageCoversApi).deleteOneById(currentEntity.id);
          onUpdate?.(null);
          modal.closeModal();
        } catch (err) {
          logger.error((err as Error).message);
          setIsDeleting(false);
        }

        return true;
      },
    } );
  };

  return (
    <div className={styles.editor}>
      <div className={styles.mainSection}>
        <section className={styles.imagesSection}>
          <article className={styles.currentImageSection}>
            <SectionLabel>Actual</SectionLabel>

            <PreviewImage
              src={getMediumCoverUrl(currentEntity)}
            />
          </article>

          <ImageUploadManager
            entityId={currentEntity.id}
            onSuccess={handleEntityUpdate}
          />
        </section>
        <LabelManager
          entityId={currentEntity.id}
          initialValue={currentEntity.metadata.label}
          onSuccess={handleEntityUpdate}
        />
      </div>

      <div className={styles.actions}>
        <Button onClick={handleDelete} theme="blue" disabled={isDeleting}>Borrar</Button>
        <Button onClick={modal.closeModal} theme="white">Cerrar</Button>
      </div>
    </div>
  );
}

function LabelManager( { entityId, initialValue, onSuccess }: EntityModifierProps) {
  const [label, setLabel] = useState(initialValue);
  const [status, setStatus] = useState<"error" | "idle" | "saving">("idle");
  const handleSave = async () => {
    if (label === initialValue)
      return;

    setStatus("saving");
    try {
      const api = FetchApi.get(ImageCoversApi);
      const res = await api.patch(entityId, {
        entity: {
          metadata: {
            label,
          },
        },
      } );

      setStatus("idle");
      onSuccess(res.data);
    } catch (err) {
      setStatus("error");
      console.error(err);
    }
  };

  return (
    <div className={styles.fieldGroup}>
      <SectionLabel>Etiqueta</SectionLabel>
      <div className={styles.inputWithAction}>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          disabled={status === "saving"}
          placeholder="Nombre del cover..."
        />
        <Button
          onClick={handleSave}
          theme="white"
          disabled={status === "saving" || label === initialValue}
        >
          {status === "saving" ? "..." : "💾"}
        </Button>
      </div>
      {status === "error" && <span className={styles.error}>Error al guardar</span>}
    </div>
  );
}

function ImageUploadManager( { entityId, onSuccess }: EntityModifierProps) {
  return (
    <article className={styles.replaceImageSection}>
      <SectionLabel>Reemplazar Imagen</SectionLabel>

      <ImageCoverUpload entityId={entityId} onSuccess={onSuccess}/>
    </article>
  );
}

type ImageCoverUploadProps = {
  entityId?: string;
  label?: string;
  onSuccess?: (updatedEntity: ImageCoverEntity)=> void;
};
export function ImageCoverUpload( { entityId, label, onSuccess }: ImageCoverUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"error" | "idle" | "uploading">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Lógica de selección de archivo
  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setErrorMessage("El archivo debe ser una imagen");

      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setErrorMessage(null);
    setStatus("idle");
  };
  // Lógica de subida a la API
  const handleUpload = async () => {
    if (!file)
      return;

    setStatus("uploading");

    try {
      const api = FetchApi.get(ImageCoversApi);
      const res = await api.updateImage(file, {
        id: entityId ?? null,
        label,
      } );
      const resData = res.data.imageCover;

      assertIsDefined(resData);

      // Limpieza post-exito
      setFile(null);
      setPreviewUrl(null);

      for (const [k, v] of Object.entries(resData.versions))
        resData.versions[k] = v + "?t=" + new Date().getTime();

      onSuccess?.(resData);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(`Error subida: ${(err as Error).message}`);
      setStatus("error");
    } finally {
      setStatus("idle"); // Opcional: dejar en idle o mantener estado de éxito
    }
  };

  return (
    <div>
      {previewUrl && (<PreviewImage src={previewUrl} />)}

      <DragAndDropArea
        onFileReady={handleFileSelect}
        isLoading={status === "uploading"}
        onError={setErrorMessage}
      >
        {file && (
          <div className={styles.uploadAction}>
            <UploadButton onClick={handleUpload} disabled={status === "uploading"} />
          </div>
        )}
      </DragAndDropArea>

      {errorMessage && <div className={styles.error}>{errorMessage}</div>}
    </div>
  );
}

/**
 * Componente puramente de UI/Interacción para Drag&Drop y pegado de URL.
 * No sabe nada de APIs ni de modelos de negocio.
 */
function DragAndDropArea( { onFileReady, onError, isLoading, children }: any) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleUrlPaste = async () => {
    const url = window.prompt("Pega la URL:");

    if (!url?.trim())
      return;

    try {
      new URL(url);
      const res = await fetch(url);
      const blob = await res.blob();

      onFileReady(new File([blob], "pasted-image.jpg", {
        type: blob.type,
      } ));
    } catch {
      onError("URL no válida o inaccesible");
    }
  };

  return (
    <div
      className={classes(styles.dropZone, isDragging && styles.active)}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files[0])
          onFileReady(e.dataTransfer.files[0]);
      }}
    >
      <div className={styles.dropActions}>
        <p>Arrastra o selecciona...</p>
        <div className={styles.selectionButtons}>
          <Button
            onClick={() => fileInputRef.current?.click()}
            theme="white"
            disabled={isLoading}>📂 Disco</Button>
          <Button onClick={handleUrlPaste} theme="white" disabled={isLoading}>📋 URL</Button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && onFileReady(e.target.files[0])}
        />
      </div>
      {children}
    </div>
  );
}

const PreviewImage = ( { src }: {src: string} ) => {
  return <div className={styles.imageContainer}>
    <img src={src} alt="Preview" className={styles.largePreview} />
  </div>;
};
