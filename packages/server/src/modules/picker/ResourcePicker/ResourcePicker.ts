import { ResourceVO } from "#shared/models/resource";

export default interface ResourcePicker<R extends ResourceVO = ResourceVO> {
  pick(n: number): Promise<R[]>;
}