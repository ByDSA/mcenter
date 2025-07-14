import { Serie, SerieEntity } from "../serie";

export function expectSerie(actual: Serie, expeted: Serie) {
  if (actual.name !== expeted.name)
    throw new Error(`Serie name mismatch: ${actual.name} !== ${expeted.name}`);
}

export function expectSerieEntity(actual: SerieEntity, expeted: SerieEntity) {
  if (actual.id !== expeted.id)
    throw new Error(`Serie id mismatch: ${actual.id} !== ${expeted.id}`);

  expectSerie(actual, expeted);
}
