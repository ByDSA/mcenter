import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { UserPayload } from "$shared/models/auth";
import { ResponseFormat } from "$shared/models/resources";
import { assertFoundClient } from "#utils/validation/found";
import { MusicResponseFormatterService } from "#musics/renderer/formatter.service";
import { MusicHistoryRepository } from "./history/crud/repository";
import { MusicEntity } from "./models";

interface ProcessOptions {
  req: Request;
  user: UserPayload | null;
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

    this.determineResponseFormat();
    await this.fetchMusic(fetcher);
    await this.updateHistoryIfNeeded();

    return this.currentMusic;
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

    const userId = this.currentOptions.user?.id;

    if (!userId || this.currentOptions.shouldNotAddToHistory)
      return;

    await this.historyRepo.createNewEntryNowIfShouldFor( {
      musicId: this.currentMusic.id,
      userId,
    } );
  }
}
