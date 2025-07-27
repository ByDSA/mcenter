import { ResultResponse, ErrorElementResponse, errorToErrorElementResponse } from "../http/responses";

export async function safeArray<T>(
  operation: ()=> Promise<T[]>,
): Promise<ResultResponse<T[]>> {
  try {
    const data = await operation();

    return {
      data,
      errors: [],
    };
  } catch (e) {
    return {
      data: [] as T[],
      errors: [errorToErrorElementResponse(e)],
    };
  }
}

export async function safeOne<T>(
  operation: ()=> Promise<T | null>,
): Promise<ResultResponse<T | null>> {
  try {
    const data = await operation();

    return {
      data,
      errors: [],
    };
  } catch (e) {
    return {
      data: null,
      errors: [errorToErrorElementResponse(e)],
    };
  }
}

type Options = {
  stopOnError?: boolean;
};

// Función común para ejecutar operaciones secuencialmente
async function executeSequential<T, R>(
  operations: (()=> Promise<T>)[],
  safeExecutor: (operation: ()=> Promise<T>)=> Promise<ResultResponse<T>>,
  dataAccumulator: (allData: R, newData: T)=> R,
  initialData: R,
  options?: Options,
): Promise<ResultResponse<R>> {
  const stopOnError = options?.stopOnError ?? false;
  let allData: R = initialData;
  const allErrors: ErrorElementResponse[] = [];

  for (const operation of operations) {
    const result = await safeExecutor(operation);

    allData = dataAccumulator(allData, result.data);

    if (result.errors) {
      allErrors.push(...result.errors);

      // Si hay errores, se detiene
      if (result.errors.length > 0 && stopOnError)
        break;
    }
  }

  return {
    data: allData,
    errors: allErrors,
  };
}

export async function safeArraySequential<T>(
  operations: (()=> Promise<T[]>)[],
  options?: Options,
): Promise<ResultResponse<T[]>> {
  return await executeSequential(
    operations,
    safeArray,
    (allData: T[], newData: T[]) => [...allData, ...newData],
    [] as T[],
    options,
  );
}

export async function safeOneSequential<T>(
  operations: (()=> Promise<T | null>)[],
  options?: Options,
): Promise<ResultResponse<(T | null)[]>> {
  return await executeSequential(
    operations,
    safeOne,
    (allData: (T | null)[], newData: T | null) => [...allData, newData],
    [] as (T | null)[],
    options,
  );
}

// Función común para ejecutar operaciones concurrentemente
async function executeConcurrent<T, R>(
  operations: (()=> Promise<T>)[],
  safeExecutor: (operation: ()=> Promise<T>)=> Promise<ResultResponse<T>>,
  dataAccumulator: (allData: R, newData: T, index: number)=> R,
  initialData: R,
): Promise<ResultResponse<R>> {
  // Ejecutar todas las operaciones concurrentemente
  const results = await Promise.all(
    operations.map(operation => safeExecutor(operation)),
  );
  let allData: R = initialData;
  const allErrors: ErrorElementResponse[] = [];

  // Procesar los resultados en orden
  results.forEach((result, index) => {
    allData = dataAccumulator(allData, result.data, index);

    if (result.errors)
      allErrors.push(...result.errors);
  } );

  return {
    data: allData,
    errors: allErrors,
  };
}

export async function safeArrayConcurrent<T>(
  operations: (()=> Promise<T[]>)[],
): Promise<ResultResponse<T[]>> {
  return await executeConcurrent(
    operations,
    safeArray,
    (allData: T[], newData: T[]) => [...allData, ...newData],
    [] as T[],
  );
}

export async function safeOneConcurrent<T>(
  operations: (()=> Promise<T | null>)[],
): Promise<ResultResponse<(T | null)[]>> {
  return await executeConcurrent(
    operations,
    safeOne,
    (allData: (T | null)[], newData: T | null) => [...allData, newData],
    [] as (T | null)[],
  );
}

export async function safeSequential(
  operations: (()=> Promise<ResultResponse<any> | void>)[],
  options?: Options,
): Promise<ResultResponse<null>> {
  const stopOnError = options?.stopOnError ?? false;
  const allErrors: ErrorElementResponse[] = [];

  for (const operation of operations) {
    try {
      const result = await operation();

      // Si la operación devuelve un ResultResponse, procesamos sus errores
      if (result && typeof result === "object" && "errors" in result) {
        if (result.errors && result.errors.length > 0) {
          allErrors.push(...result.errors);

          // Si hay errores y stopOnError está activado, se detiene
          if (stopOnError)
            break;
        }
      }
    } catch (e) {
      // Error lanzado por excepción tradicional
      allErrors.push(errorToErrorElementResponse(e));

      // Si hay errores y stopOnError está activado, se detiene
      if (stopOnError)
        break;
    }
  }

  return {
    data: null,
    errors: allErrors,
  };
}
