/**
 * PROTOTIPO PARA `repository.globalmock.ts`
 * * PROPÓSITO:
 * Definir la clase Mock por defecto para un repositorio y registrarla en el sistema de DI de tests.
 * Esto permite usar `getOrCreateMockProvider(Repo)` en cualquier test y obtener esta instancia pre-configurada.
 * * UBICACIÓN:
 * Generalmente en la carpeta `tests/` dentro del módulo del repositorio, o junto al archivo `repository.ts`.
 */

import { createMockClass } from "$sharedTests/jest/mocking";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { Types } from "mongoose";

// Importar la entidad y el repositorio real
import { MyEntity } from "../../models"; // Ajustar path
import { MyRepository } from "../repository"; // Ajustar path

// 1. Definir un objeto de muestra (Sample) válido
// Usar fixtures existentes si es posible, o crear uno mínimo válido y exportarlo
export const SAMPLE_ENTITY: MyEntity = {
  id: new Types.ObjectId().toString(),
  name: "Sample Name",
  createdAt: new Date(),
  updatedAt: new Date(),
  // ... otras propiedades obligatorias
};

// 2. Crear la clase Mock extendiendo la utilidad createMockClass
export class MockMyRepository extends createMockClass(MyRepository) {
  constructor() {
    super();

    // 3. Mockear todos los métodos del repository

    // Ejemplos de métodos
    this.getOneById.mockResolvedValue(SAMPLE_ENTITY);

    this.getAll.mockResolvedValue([SAMPLE_ENTITY]);

    this.deleteOneByIdAndGet.mockResolvedValue(SAMPLE_ENTITY);

    this.createOneAndGet.mockResolvedValue(SAMPLE_ENTITY);

    this.patchOneByIdAndGet.mockResolvedValue(SAMPLE_ENTITY);

    this.findByName.mockResolvedValue(SAMPLE_ENTITY);
  }
}

// 4. REGISTRO OBLIGATORIO
registerMockProviderInstance(MyRepository, new MockMyRepository());