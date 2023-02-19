export default interface CanFindById<T, IdType = string> {
  findOneById(id: IdType): Promise<T | null>;
}