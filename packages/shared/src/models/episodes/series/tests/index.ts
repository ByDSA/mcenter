import { Series, SeriesEntity } from "../series";

export function expectSeries(actual: Series, expeted: Series) {
  if (actual.name !== expeted.name && actual.key !== expeted.key)
    throw new Error(`Series name mismatch: ${actual.name} !== ${expeted.name}`);
}

export function expectSeriesEntity(actual: SeriesEntity, expeted: SeriesEntity) {
  if (actual.id !== expeted.id)
    throw new Error(`Series id mismatch: ${actual.id} !== ${expeted.id}`);

  expectSeries(actual, expeted);
}
