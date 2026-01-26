import { Type, DynamicModule, Provider, ForwardReference } from "@nestjs/common";
import "reflect-metadata";
import { createMockProvider } from "./providers";

type NestModuleType =
  DynamicModule | ForwardReference | Promise<DynamicModule> | Type;

/** Comprueba si es una clase instanciable */
function isClass(token: any): token is Type {
  return (
    typeof token === "function"
    && /^\s*class\s/.test(token.toString())
  );
}

/**
 * Extrae los exports de un módulo (tanto de metadatos como de DynamicModule)
 */
function getModuleExports(moduleLike: any, originalModule: Type): any[] {
  // Si es DynamicModule y tiene exports explícitos
  if (typeof moduleLike === "object" && "exports" in moduleLike)
    return (moduleLike as DynamicModule).exports || [];

  // Si no, lee de metadatos de Reflect
  return Reflect.getMetadata("exports", originalModule) || [];
}

/**
 * Crea un DynamicModule "wrapper" que:
 * - importa el módulo original (para cargar metadatos, controllers...)
 * - importa recursivamente las versiones mockeadas de sus imports
 * - redeclara todos sus providers como mocks (override)
 * - los exporta para que otros módulos vean sólo los mocks
 */
export async function createMockedModule(
  moduleOrDynamic: NestModuleType,
  visited = new Set<Type>(),
): Promise<DynamicModule> {
  // 1) Resuelve si viene un Promise
  const resolved = moduleOrDynamic instanceof Promise
    ? await moduleOrDynamic
    : moduleOrDynamic;
  // 2) Desenvuelve ForwardRef
  const moduleLike = (
    typeof resolved === "object"
    && "forwardRef" in resolved
    && typeof resolved.forwardRef === "function"
  )
    ? resolved.forwardRef()
    : resolved;
  // 3) Obtiene el token real del módulo
  const originalModule: Type = (
    typeof moduleLike === "object"
    && "module" in moduleLike
  )
    ? (moduleLike as DynamicModule).module
    : (moduleLike as Type);

  // 4) Evita ciclos
  if (visited.has(originalModule)) {
    return {
      module: originalModule,
    };
  }

  visited.add(originalModule);

  // 5) Lee sus imports y providers
  const importsList: NestModuleType[] = typeof moduleLike === "object" && "imports" in moduleLike
    ? (moduleLike as DynamicModule).imports || []
    : Reflect.getMetadata("imports", originalModule) || [];
  const provList: Provider[] = typeof moduleLike === "object" && "providers" in moduleLike
    ? (moduleLike as DynamicModule).providers || []
    : Reflect.getMetadata("providers", originalModule) || [];
  // 6) Procesa imports recursivamente y extrae sus exports
  const mockImports: DynamicModule[] = [];
  const importedMocks: Provider[] = [];

  for (const importItem of importsList) {
    // Crea versión mockeada del import
    const mockedImport = await createMockedModule(importItem, visited);

    mockImports.push(mockedImport);

    // Si el import original tenía exports, los agregamos como providers mockeados
    const resolvedImport = importItem instanceof Promise ? await importItem : importItem;
    const importModuleLike = (
      typeof resolvedImport === "object"
      && "forwardRef" in resolvedImport
      && typeof resolvedImport.forwardRef === "function"
    )
      ? resolvedImport.forwardRef()
      : resolvedImport;
    const importOriginalModule: Type = (
      typeof importModuleLike === "object"
      && "module" in importModuleLike
    )
      ? (importModuleLike as DynamicModule).module
      : (importModuleLike as Type);
    // Obtiene los exports del módulo importado
    const importExports = getModuleExports(importModuleLike, importOriginalModule);

    // Convierte exports a mocks y los agrega a la lista
    for (const exportedProvider of importExports) {
      // Solo procesa exports que sean clases o providers con token de clase
      if (isClass(exportedProvider))
        importedMocks.push(createMockProvider(exportedProvider));
      else if (
        exportedProvider
        && typeof exportedProvider === "object"
        && "provide" in exportedProvider
        && isClass((exportedProvider as any).provide)
      )
        importedMocks.push(createMockProvider((exportedProvider as any).provide));

      // Ignora strings, símbolos, y otros tipos que no podemos mockear directamente
    }
  }

  // 7) Prepara los mocks de providers
  const mocks: Provider[] = provList.map((prov) => {
    // class provider directo
    if (isClass(prov))
      return createMockProvider(prov);

    // { provide: X, useClass/useFactory/useValue... }
    if (
      prov
      && typeof prov === "object"
      && "provide" in prov
      && isClass((prov as any).provide)
    )
      return createMockProvider((prov as any).provide);

    // deja pasar otros (InjectionToken, ValueProvider, etc.)
    return prov;
  } );
  // Combina mocks propios + mocks importados
  const allMocks = [...mocks, ...importedMocks];
  // 8) Crea wrapper dinámico
  const Wrapper = class {};

  Object.defineProperty(Wrapper, "name", {
    value: `${originalModule.name}MockModule`,
  } );

  // 9) Devuelve el DynamicModule compuesto
  return {
    module: Wrapper,
    imports: [
    ],
    providers: allMocks, // override: mocks en este wrapper
    exports: allMocks, // sólo se exportan mocks
  };
}
