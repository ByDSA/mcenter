import NotFoundError from "./NotFoundError";

export const ModelNotFoundErrorName = "ModelNotFoundError";

type Params = {
  id: string;
  modelName?: string;
};
export default class ModelNotFoundError extends NotFoundError {
  constructor(params: Params) {
    const { id } = params;
    const msg = `${params.modelName ?? "Model"} with id '${id}' not found`;

    super(msg);
    this.name = ModelNotFoundErrorName;
  }
}
