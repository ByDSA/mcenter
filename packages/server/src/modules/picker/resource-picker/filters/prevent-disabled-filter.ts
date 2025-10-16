import { Filter } from "./filter";

export abstract class PreventDisabledFilter<R> implements Filter<R> {
  // eslint-disable-next-line require-await
  async filter(self: R): Promise<boolean> {
    return this.isDisabled(self) !== true;
  }

  abstract isDisabled(self: R): boolean;
}
