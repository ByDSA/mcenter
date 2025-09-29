import { Controller, Get, Query, Req, UnprocessableEntityException, UseGuards } from "@nestjs/common";
import { Request } from "express";
import z from "zod";
import { AuthGuard } from "@nestjs/passport";
import { GuestOnly } from "#core/auth/users/GuestOnly.guard";
import { googleStateSchema } from "../../users/models";
import { AuthGoogleService } from "./service";

const googleStateDtoSchema = z.string().transform((val, ctx) => {
  try {
    const parsed = JSON.parse(val);
    // Usa safeParse para evitar excepciones
    const result = googleStateSchema.safeParse(parsed);

    if (!result.success) {
      // Añade errores al contexto en lugar de lanzar excepción
      result.error.issues.forEach(issue => {
        ctx.addIssue( {
          code: z.ZodIssueCode.custom,
          message: issue.message,
          path: issue.path,
        } );
      } );

      return z.NEVER; // Indica que la validación falló
    }

    return result.data;
  } catch {
    // Error de JSON parsing
    ctx.addIssue( {
      code: z.ZodIssueCode.custom,
      message: "Invalid JSON format",
    } );

    return z.NEVER;
  }
} );

@GuestOnly()
@Controller("google")
export class GoogleController {
  constructor(
    private readonly service: AuthGoogleService,
  ) {}

  @Get("/")
  @UseGuards(AuthGuard("google"))
  // eslint-disable-next-line no-empty-function
  googleAuth() {
  }

  @Get("redirect")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(
    @Req() req: Request,
    @Query("state") stateStr: string,
  ) {
    const { success, data: state } = googleStateDtoSchema.safeParse(stateStr);

    if (!success)
      throw new UnprocessableEntityException();

    await this.service.googleRedirect(req);

    return req?.res?.redirect(state.redirect);
  }
}
