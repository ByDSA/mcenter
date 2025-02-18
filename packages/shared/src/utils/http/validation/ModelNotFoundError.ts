import { NotFoundError } from "./found";

export const MODEL_NOT_FOUND_ERROR_NAME = "ModelNotFoundError";

type Params = {
  id: string;
  modelName?: string;
};
export class ModelNotFoundError extends NotFoundError {
  constructor(params: Params) {
    const { id } = params;
    const msg = `${params.modelName ?? "Model"} with id '${id}' not found`;

    super(msg);
    this.name = MODEL_NOT_FOUND_ERROR_NAME;
  }
}
