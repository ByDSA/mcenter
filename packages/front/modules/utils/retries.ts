interface RetryOptions {
  retries: number;
  delay?: number; // milisegundos entre intentos
  // Función para decidir si reintentar según el error
  shouldRetry?: (state: State)=> Promise<boolean>;
  // Acción a ejecutar si se agotan los intentos
  onFailure?: (error: unknown)=> Promise<void>;
}

type State = {
  attempt: number;
  lastError: unknown;
};

export async function withRetries<T>(
  fn: (state: State)=> Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const { retries, delay = 1000, shouldRetry, onFailure } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn( {
        lastError,
        attempt,
      } );
    } catch (error) {
      lastError = error;

      // Si tenemos una condición de reintento y no se cumple, lanzamos el error de inmediato
      if (shouldRetry && await !shouldRetry( {
        lastError: error,
        attempt,
      } ))
        throw error;

      // Si es el último intento, no esperamos y salimos del bucle
      if (attempt === retries)
        break;

      console.warn(`Intento ${attempt + 1} fallido. Reintentando en ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Si llegamos aquí, es que se agotaron los reintentos
  if (onFailure)
    await onFailure(lastError);

  throw lastError;
}
