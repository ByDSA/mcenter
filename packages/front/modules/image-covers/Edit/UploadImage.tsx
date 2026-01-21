import { useState, useRef, forwardRef, useImperativeHandle, useCallback, useEffect } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { FetchApi } from "#modules/fetching/fetch-api";
import { UploadButton } from "#modules/ui-kit/upload/UploadButton";
import { classes } from "#modules/utils/styles";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { ImageCover, ImageCoverEntity } from "../models";
import { ImageCoversApi } from "../requests";
import styles from "./UploadImage.module.css";

export type ImageCoverUploadRef = {
  upload: (props?: {label?: string} )=> Promise<ImageCoverEntity | null>;
};

type ImageCoverUploadProps = {
  entityId?: string;
  hideUploadButton?: boolean;
  onSuccess?: (updatedEntity: ImageCoverEntity)=> void;
  onFileChange?: (file: File | null)=> void;
};
export const ImageCoverUpload = forwardRef<ImageCoverUploadRef, ImageCoverUploadProps>(
  ( { entityId, onSuccess, hideUploadButton, onFileChange }, ref) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<"error" | "idle" | "uploading">("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    if (onFileChange) {
      useEffect(() => {
        onFileChange(file);
      }, [file]);
    }

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
    const clear = () => {
      setFile(null);
      setPreviewUrl(null);
      setErrorMessage(null);
      setStatus("idle");
    };
    // Lógica de subida a la API
    const handleUpload = async (label: string | undefined) => {
      if (!file)
        return null;

      setStatus("uploading");

      try {
        const api = FetchApi.get(ImageCoversApi);
        const res = await api.updateImage(file, {
          id: entityId ?? null,
          label,
        } );
        const resData = res.data.imageCover;

        assertIsDefined(resData);

        for (const [k, v] of Object.entries(resData.versions))
          resData.versions[k] = v + "?t=" + new Date().getTime();

        clear();
        onSuccess?.(resData);

        return resData;
      } catch (err) {
        setErrorMessage(`Error subida: ${(err as Error).message}`);
        setStatus("error");

        return null;
      } finally {
        setStatus("idle");
      }
    };
    const canUpload = useCallback(()=> !!file && status !== "uploading", [file, status]);

    useImperativeHandle(ref, () => ( {
      upload: (props)=>handleUpload(props?.label),
    } ));

    return (
      <div className={styles.imageCoverUpload}>
        <div className={styles.previewWithActions}>
          <PreviewImage src={previewUrl ?? undefined} />
          {file && <DaButton onClick={()=>clear()} theme="red">Quitar</DaButton> }
        </div>
        <DragAndDropArea
          onFileReady={handleFileSelect}
          isLoading={status === "uploading"}
          onError={setErrorMessage}
        >
          {!hideUploadButton && <div className={styles.uploadAction}>
            <UploadButton onClick={()=>handleUpload(undefined)} disabled={!canUpload()} />
          </div>
          }
        </DragAndDropArea>

        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
      </div>
    );
  },
);

// Agregamos displayName para debugging
ImageCoverUpload.displayName = "ImageCoverUpload";

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
          <DaButton
            onClick={() => fileInputRef.current?.click()}
            theme="white"
            left={<span>📂</span>}
            disabled={isLoading}
          >Disco</DaButton>
          <DaButton
            onClick={handleUrlPaste}
            theme="white"
            disabled={isLoading}
            left={<span>📋</span>}
          >URL</DaButton>
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

export const PreviewImage = ( { src }: {src?: string} ) => {
  return <div className={styles.imageContainer}>
    <MusicImageCover
      cover={src
        ? {
          metadata: {
            label: "Preview",
          },
          versions: {
            original: src,
          },
        } as ImageCover
        : undefined}
    />
  </div>;
};
