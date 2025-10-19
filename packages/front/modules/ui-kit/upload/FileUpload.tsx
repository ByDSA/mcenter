import React, { useState, useRef } from "react";
import { CloudUpload, InsertDriveFile, Close, CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
import { showError } from "$shared/utils/errors/showError";
import { classes } from "#modules/utils/styles";
import { Button } from "../input/Button";
import styles from "./FileUpload.module.css";
import { UploadButton } from "./UploadButton";

export type FileDataMetadata = Record<string, any>;

type FileDataWithoutMetadata = {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
  uploadProgress?: number;
  uploadStatus?: "completed" | "error" | "pending" | "uploading";
};
export type FileData = FileDataWithoutMetadata & {
  metadata: FileDataMetadata;
};

type ProvideMetadataFn = (fileDatas: FileDataWithoutMetadata)=> FileDataMetadata;

export type OnUploadOptions = {
  setSelectedFiles?: React.Dispatch<React.SetStateAction<FileData[]>>;
  setItemValidationErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
};

type GenOnUploadOptions = {
  url: string;
  withCredentials?: boolean;
  onEachUpload?: (response: unknown, fileData: FileData, options?: OnUploadOptions)=> Promise<void>;
};

interface FileUploadProps {
  buttonText?: string;
  maxFileSize?: number;
  acceptedTypes?: string[];
  multiple?: boolean;
  provideMetadata?: ProvideMetadataFn;
  onUpload?: ((files: FileData[], options?: OnUploadOptions)=> Promise<void>);
}

function extensionsToDisplay(extensions: string[]): string[] {
  const mapped = extensions
    .map(s=>{
      if (s.startsWith("."))
        s = s.substring(1);

      return s.toUpperCase();
    } );
  const set = new Set(mapped);

  return [...set];
}

export function FileUpload<M extends Record<string, any>>( { maxFileSize,
  onUpload,
  provideMetadata,
  acceptedTypes = [],
  multiple = true,
  buttonText = "Añadir archivo" + (multiple ? "(s)" : "") }: FileUploadProps) {
  const acceptedTypesDisplay = extensionsToDisplay(acceptedTypes).join(", ");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [itemValidationErrors, setItemValidationErrors] = useState<Record<string, string>>( {} );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const acceptString = acceptedTypes.join(",");
  const isFileValid = (fileToValidate: File): string[] => {
    const fileErrors: string[] = [];

    if (maxFileSize !== undefined && fileToValidate.size > maxFileSize) {
      fileErrors.push(
        `El archivo ${fileToValidate.name} excede el tamaño máximo de \
${formatFileSize(maxFileSize)}`,
      );
    }

    if (acceptedTypes.length > 0) {
      const fileExtension = "." + fileToValidate.name.split(".").pop()
        ?.toLowerCase();
      const isValidExtension = acceptedTypes.some(
        acceptedType => acceptedType.toLowerCase() === fileExtension,
      );

      if (!isValidExtension) {
        fileErrors.push(
          `El archivo ${fileToValidate.name} no es un tipo de archivo válido. Solo se aceptan: \
${acceptedTypesDisplay}`,
        );
      }
    }

    return fileErrors;
  };
  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover")
      setDragActive(true);
    else if (e.type === "dragleave")
      setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0])
      handleFileSelection(e.dataTransfer.files);
  };
  const handleFileSelection = (fileList: FileList): void => {
    const newValidationErrors: string[] = [];
    const validFiles: FileData[] = [];

    Array.from(fileList).forEach(fileItem => {
      const fileErrors = isFileValid(fileItem);

      if (fileErrors.length > 0)
        newValidationErrors.push(...fileErrors);
      else {
        const fileDataWithoutMetadata: FileDataWithoutMetadata = {
          file: fileItem,
          id: Math.random().toString(36)
            .substring(2, 9),
          name: fileItem.name,
          size: fileItem.size,
          type: fileItem.type,
          uploadProgress: 0,
          uploadStatus: "pending",
        };
        const metadata = provideMetadata?.(fileDataWithoutMetadata) ?? {} as M;

        validFiles.push( {
          ...fileDataWithoutMetadata,
          metadata,
        } );
      }
    } );

    setValidationErrors(newValidationErrors);

    if (multiple)
      setSelectedFiles(prev => [...prev, ...validFiles]);
    else
      setSelectedFiles(validFiles.slice(0, 1));
  };
  const onButtonClick = (): void => {
    inputRef.current?.click();
  };
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0])
      handleFileSelection(e.target.files);
  };
  const removeFile = (fileId: string): void => {
    setSelectedFiles(prev => prev.filter(fileData => fileData.id !== fileId));
  };
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0)
      return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / (k ** i)).toFixed(2)) + " " + sizes[i];
  };
  const uploadFiles = async (): Promise<void> => {
    if (selectedFiles.length === 0 || isUploading)
      return;

    const pendingFiles = selectedFiles.filter(f => f.uploadStatus === "pending");

    if (pendingFiles.length === 0)
      return;

    setIsUploading(true);
    setValidationErrors([]);
    setItemValidationErrors( {} );

    try {
      await onUpload?.(pendingFiles, {
        setSelectedFiles,
        setItemValidationErrors,
      } );
    } catch (uploadError) {
      const errorMessage = uploadError instanceof Error
        ? uploadError.message
        : "Error desconocido";

      setValidationErrors([`Error al subir archivos: ${errorMessage}`]);
    } finally {
      setIsUploading(false);
    }
  };
  const hasCompletedFiles = selectedFiles.some(f => f.uploadStatus === "completed");
  const hasPendingFiles = selectedFiles.some(f => f.uploadStatus === "pending");

  return (
    <div className={`${styles.container}`}>
      <div
        className={`${styles.dropzone} ${dragActive ? styles.active : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className={styles.hiddenInput}
          multiple={multiple}
          accept={acceptedTypes.length > 0 ? acceptString : undefined}
          onChange={onInputChange}
        />

        <UploadButton
          disabled={!(hasPendingFiles && !isUploading)}
          onClick={uploadFiles}
        />

        <Button
          className={styles.selectButton}
          onClick={onButtonClick}
          disabled={isUploading}
        >
          {buttonText}
        </Button>
        <span className={styles.dragText}>o arrastra y suelta</span>
        {acceptedTypes.length > 0 && (
          <p className={styles.fileRestrictions}>
            {acceptedTypesDisplay}
          </p>
        )}
        {maxFileSize !== undefined && (
          <p className={styles.fileRestrictions}>
            hasta {formatFileSize(maxFileSize)}
          </p>
        )}
      </div>

      {validationErrors.length > 0 && (
        <div className={styles.errorContainer}>
          {validationErrors.map((errorMessage, index) => (
            <span key={index}>{errorMessage}</span>
          ))}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className={styles.filesSection}>
          <div className={styles.filesList}>
            {selectedFiles.map((fileObj) => (
              <div key={fileObj.id} className={styles.fileItem}>
                <div className={styles.fileInfo}>
                  {getFileIconFromUploadStatus(fileObj.uploadStatus)}
                  <div className={styles.fileDetails}>
                    <p className={styles.fileName}>{fileObj.name}</p>
                    <p className={styles.fileSize}>
                      {formatFileSize(fileObj.size)} • {fileObj.type ?? "Tipo desconocido"}
                    </p>

                    <div className={classes(
                      styles.statusContainer,
                      styles[fileObj.uploadStatus as string],
                    )}>
                      {fileObj.uploadStatus === "pending" && (
                        <span>Pendiente de subir</span>
                      )}
                      {fileObj.uploadStatus === "uploading" && (
                        <span>
                          {fileObj.uploadProgress || 0}%
                        </span>
                      )}

                      {fileObj.uploadStatus === "completed" && (
                        <span>¡Subido!</span>
                      )}

                      {fileObj.uploadStatus === "error" && (
                        <span>Error al subir{itemValidationErrors[fileObj.id]
                          ? `: ${itemValidationErrors[fileObj.id]}`
                          : ""}</span>
                      )}
                    </div>
                  </div>
                </div>

                {fileObj.uploadStatus !== "completed" && (
                  <button
                    onClick={() => removeFile(fileObj.id)}
                    className={styles.removeButton}
                    disabled={fileObj.uploadStatus === "uploading"}
                  >
                    <Close className={styles.removeIcon} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {hasCompletedFiles && (
        <button
          className={styles.clearCompletedButton}
          onClick={() => setSelectedFiles(prev => prev.filter(f => f.uploadStatus !== "completed"))}
        >
          Limpiar archivos subidos
        </button>
      )}
    </div>
  );
}

type Options = Omit<GenOnUploadOptions, "url"> & OnUploadOptions;
export const uploadSingleFileWithProgress = (
  url: string,
  fileData: FileData,
  options?: Options,
): Promise<void> => {
  const setSelectedFiles = options?.setSelectedFiles;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append("file", fileData.file);

    if (fileData.metadata)
      formData.append("metadata", JSON.stringify(fileData.metadata));

    if (setSelectedFiles) {
      // Actualizar estado a "uploading"
      setSelectedFiles(prev => prev.map(f => f.id === fileData.id
        ? {
          ...f,
          uploadStatus: "uploading" as const,
          uploadProgress: 0,
        }
        : f));
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);

          setSelectedFiles(prev => prev.map(f => f.id === fileData.id
            ? {
              ...f,
              uploadProgress: percentComplete,
            }
            : f));
        }
      } );
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setSelectedFiles?.(prev => prev.map(f => f.id === fileData.id
          ? {
            ...f,
            uploadStatus: "completed" as const,
            uploadProgress: 100,
          }
          : f));

        const onEachUpload = options?.onEachUpload;

        if (onEachUpload) {
          let response: unknown;

          try {
            response = JSON.parse(xhr.responseText);
          } catch {
            // Si no se puede parsear como JSON, pasar el texto plano
            response = xhr.responseText;
          }

          onEachUpload(response, fileData, options)
            .catch(showError);
        }

        resolve();
      } else {
        setSelectedFiles?.(prev => prev.map(f => f.id === fileData.id
          ? {
            ...f,
            uploadStatus: "error" as const,
          }
          : f));
        let errorMessage = `HTTP ${xhr.status} ${xhr.statusText}`;

        try {
          const response = JSON.parse(xhr.responseText);

          if (response.message)
            errorMessage += `: ${response.message}`;
          else
            errorMessage += `: ${xhr.responseText}`;
        } catch {
          if (xhr.responseText)
            errorMessage += `: ${xhr.responseText}`;
        }

        const err = new Error(errorMessage);

        // eslint-disable-next-line no-underscore-dangle
        (err as any)._fileId = fileData.id;
        reject(err);
      }
    } );

    xhr.addEventListener("error", () => {
      setSelectedFiles?.(prev => prev.map(f => f.id === fileData.id
        ? {
          ...f,
          uploadStatus: "error" as const,
        }
        : f));
      const err = new Error("Upload failed");

      // eslint-disable-next-line no-underscore-dangle
      (err as any)._fileId = fileData.id;
      reject(err);
    } );

    xhr.open("POST", url);

    if (options?.withCredentials)
      xhr.withCredentials = true;

    xhr.send(formData);
  } );
};

function getFileIconFromUploadStatus(uploadStatus: string | undefined) {
  switch (uploadStatus) {
    case "completed": return <CheckCircle className={styles.fileIcon} />;
    case "error": return <ErrorIcon className={styles.fileIcon} />;
    case "uploading": return <CloudUpload className={styles.fileIcon} />;
    default: return <InsertDriveFile className={styles.fileIcon} />;
  }
}

export const genOnUpload = (
  genOptions: GenOnUploadOptions,
) =>async (files: FileData[], options?: OnUploadOptions) =>{
  for (const fileData of files) {
    try {
      await uploadSingleFileWithProgress(
        genOptions.url,
        fileData,
        {
          ...options,
          withCredentials: genOptions.withCredentials,
          onEachUpload: genOptions?.onEachUpload,
        },
      );
    } catch (uploadError) {
      if (options?.setItemValidationErrors) {
        const errorMessage = uploadError instanceof Error
          ? uploadError.message
          : "Error desconocido";

        if ("_fileId" in uploadError) {
          options.setItemValidationErrors(old=> ( {
            ...old,
            // eslint-disable-next-line no-underscore-dangle
            [uploadError._fileId]: errorMessage,
          } ));
        }
      } else
        throw uploadError;
    }
  }
};
