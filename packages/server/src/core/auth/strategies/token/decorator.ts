import { applyDecorators, UseGuards } from "@nestjs/common";
import { TokenAuthGuard } from "./guard";

export function TokenAuth() {
  return applyDecorators(
    UseGuards(TokenAuthGuard),
  );
}
