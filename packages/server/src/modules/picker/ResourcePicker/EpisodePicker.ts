import { Resource } from "#shared/models/resource";

export default interface ResourcePicker {
  pick(n: number): Promise<Resource[]>;
}