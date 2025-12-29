import { Injectable } from "@nestjs/common";
import { Response, Request } from "express";
import { UserPayload } from "$shared/models/auth";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import z from "zod";
import { ResponseFormat } from "$shared/models/resources";
import { assertFoundClient } from "#utils/validation/found";
import { ResponseFormatterService } from "#modules/resources/response-formatter";
import { MusicHistoryRepository } from "./history/crud/repository";
import { MusicEntity } from "./models";
import { MusicRendererService } from "./renderer/render.service";

interface ProcessOptions {
  req: Request;
  res: Response;
  user: UserPayload | null;
  token?: string;
  shouldNotAddToHistory?: boolean;
}

@Injectable()
export class MusicFlowService {
  constructor(
    private readonly historyRepo: MusicHistoryRepository,
    private readonly renderer: MusicRendererService,
    private readonly responseFormatter: ResponseFormatterService,
  ) {}

  /**
   * Ejecuta el flujo común: Validar -> Buscar -> Historial -> Renderizar
   */
  async fetchAndRender(
    fetcher: (format: ResponseFormat)=> Promise<MusicEntity | null>,
    options: ProcessOptions,
  ) {
    const { req, res, user, token, shouldNotAddToHistory } = options;

    // 1. Validación de seguridad del token
    mongoDbId.or(z.undefined()).parse(token);

    // 2. Determinar formato
    const format = this.responseFormatter.getResponseFormatByRequest(req);
    // 3. Obtener la música usando el callback inyectado
    const got = await fetcher(format);

    assertFoundClient(got);

    // 4. Lógica de historial (solo si es RAW)
    if (format === ResponseFormat.RAW) {
      const userId = user?.id ?? token;

      if (userId && !shouldNotAddToHistory) {
        await this.historyRepo.createNewEntryNowIfShouldFor( {
          musicId: got.id,
          userId,
        } );
      }
    }

    // 5. Renderizado final
    return this.renderer.render( {
      music: got,
      format,
      request: req,
      response: res,
    } );
  }
}
