import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { UserPayload } from "$shared/models/auth";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import z from "zod";
import { ResponseFormat } from "$shared/models/resources";
import { assertFoundClient } from "#utils/validation/found";
import { MusicResponseFormatterService } from "#musics/renderer/formatter.service";
import { MusicHistoryRepository } from "./history/crud/repository";
import { MusicEntity } from "./models";

interface ProcessOptions {
  req: Request;
  user: UserPayload | null;
  token?: string;
  shouldNotAddToHistory?: boolean;
}

@Injectable()
export class MusicFlowService {
  private currentOptions!: ProcessOptions;

  private currentFormat!: ResponseFormat;

  private currentMusic!: MusicEntity;

  constructor(
    private readonly historyRepo: MusicHistoryRepository,
    private readonly responseFormatter: MusicResponseFormatterService,
  ) {}

  async validateParamsAndFetchMusicAndUpdateHistory(
    fetcher: (format: ResponseFormat)=> Promise<MusicEntity | null>,
    options: ProcessOptions,
  ) {
    this.currentOptions = options;

    this.validateToken(options.token);
    this.determineResponseFormat();
    await this.fetchMusic(fetcher);
    await this.updateHistoryIfNeeded();

    return this.currentMusic;
  }

  /**
   * Fase 1: Validación de seguridad del token
   */
  private validateToken(token: string | undefined): void {
    mongoDbId.or(z.undefined()).parse(token);
  }

  /**
   * Fase 2: Determinar formato de respuesta
   */
  private determineResponseFormat(): void {
    this.currentFormat = this.responseFormatter.getResponseFormatByRequest(
      this.currentOptions.req,
    );
  }

  /**
   * Fase 3: Obtener la música usando el callback inyectado
   */
  private async fetchMusic(
    fetcher: (format: ResponseFormat)=> Promise<MusicEntity | null>,
  ): Promise<void> {
    const music = await fetcher(this.currentFormat);

    assertFoundClient(music);
    this.currentMusic = music;
  }

  /**
   * Fase 4: Actualizar historial si corresponde
   */
  private async updateHistoryIfNeeded(): Promise<void> {
    if (this.currentFormat !== ResponseFormat.RAW)
      return;

    const userId = this.getUserIdForHistory();

    if (!userId || this.currentOptions.shouldNotAddToHistory)
      return;

    await this.historyRepo.createNewEntryNowIfShouldFor( {
      musicId: this.currentMusic.id,
      userId,
    } );
  }

  /**
   * Obtiene el ID de usuario para el historial (user.id o token)
   */
  private getUserIdForHistory(): string | undefined {
    return this.currentOptions.user?.id ?? this.currentOptions.token;
  }
}
