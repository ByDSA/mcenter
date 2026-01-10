type UploadProps<M> = {
  url: string;
  file: File;
  metadata?: M;
  headers?: Record<string, string>;
  method?: "POST" | "PUT";
  timeout?: number;
  onProgress?: (event: ProgressEvent)=> void;
  withCredentials?: boolean;
  signal?: AbortSignal; // Para poder cancelar desde fuera
};

export const uploadFile = <R, M extends Record<string, any> = Record<string, any>>(
  props: UploadProps<M>,
): Promise<R> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    // 1. Construcción del FormData
    formData.append("file", props.file);

    if (props.metadata) {
      // Si el objeto es simple, podrías iterar y hacer append de cada key.
      // Pero JSON.stringify es más seguro para objetos anidados.
      formData.append("metadata", JSON.stringify(props.metadata));
    }

    // 2. Configuración de Eventos
    if (props.onProgress)
      xhr.upload.addEventListener("progress", props.onProgress);

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = xhr.responseText ? JSON.parse(xhr.responseText) : {};

          resolve(response as R);
        } catch {
          resolve( {} as R);
        }
      } else {
        const error = new Error(`Upload failed with status ${xhr.status}`);

        (error as any).status = xhr.status;
        (error as any).response = xhr.responseText;
        reject(error);
      }
    } );

    xhr.addEventListener("error", () => reject(new Error("Network Error")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));
    xhr.addEventListener("timeout", () => reject(new Error("Upload timed out")));

    // 3. Apertura y Configuración Técnica
    xhr.open(props.method || "POST", props.url);

    if (props.timeout)
      xhr.timeout = props.timeout;

    if (props.withCredentials)
      xhr.withCredentials = true;

    // 4. Headers (Muy importante para Auth)
    if (props.headers) {
      Object.entries(props.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      } );
    }

    // 5. Manejo de cancelación externa (AbortSignal)
    if (props.signal)
      props.signal.addEventListener("abort", () => xhr.abort());

    xhr.send(formData);
  } );
};
