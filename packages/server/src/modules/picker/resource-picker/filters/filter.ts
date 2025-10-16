export interface Filter<R> {
  filter(resource: R): Promise<boolean>;
}
