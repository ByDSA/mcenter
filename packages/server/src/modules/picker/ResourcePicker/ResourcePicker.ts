import { ResourceVO } from "#modules/resources/models";

export interface ResourcePicker<R extends ResourceVO = ResourceVO> {
  pick(n: number): Promise<R[]>;
}
