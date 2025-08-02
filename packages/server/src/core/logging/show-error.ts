import { Logger } from "@nestjs/common";

export function showError(error: unknown): void {
  new Logger().error(error);
}
