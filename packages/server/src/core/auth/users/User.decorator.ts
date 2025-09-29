import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { HAS_AUTHENTICATED_DECORATOR_KEY } from "./Authenticated.guard";
import { UserPayload } from "./models";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const User = createParamDecorator((_data, ctx: ExecutionContext): UserPayload | null => {
  const req = ctx.switchToHttp().getRequest();
  const user = req?.auth?.user as UserPayload | undefined;

  if (!user) {
    const reflector = new Reflector();
    // Obtener el handler (método) actual
    const handler = ctx.getHandler();
    // Verificar si tiene la metadata de autenticación
    const hasAuthenticatedDecorator = reflector.get<boolean>(
      HAS_AUTHENTICATED_DECORATOR_KEY,
      handler,
    );

    if (hasAuthenticatedDecorator)
      throw new InternalServerErrorException();
  }

  return user ?? null;
} );
