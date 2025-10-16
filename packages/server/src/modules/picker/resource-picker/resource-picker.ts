export interface ResourcePicker<R> {
  pick(n: number): Promise<R[]>;
}
