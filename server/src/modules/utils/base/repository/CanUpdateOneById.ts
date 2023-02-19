export default interface CanUpdateOneById<T, IdType = string> {
  updateOneById(id: IdType, entity: T): Promise<void>;
}