import { Controller, Get, Param, Query } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { PlayService } from "../play.service";

class ParamsDto extends createZodDto(z.object( {
  id: z.string(),
  number: z.coerce.number(),
} )) {}

const booleanFromString = z.preprocess((val) => {
  if (typeof val === "string") {
    const normalized = val.toLowerCase();

    if (normalized === "true" || normalized === "1")
      return true;

    if (normalized === "false" || normalized === "0")
      return false;

    throw new Error(`Invalid boolean string: ${val}. Expected 'true', 'false', '1', or '0'`);
  }

  return val;
}, z.boolean());

export class QueryDto extends createZodDto(z.object( {
  force: booleanFromString.optional(),
} )) {}

@Controller("play/stream")
export class PlayStreamController {
  constructor(
    private readonly playService: PlayService,
  ) { }

    @Get("/:id")
  async playStreamDefault(
    @Param("id") id: string,
    @Query() query: QueryDto,
  ) {
    return await this.playService.playEpisodeStream(id, 1, query);
  }

  @Get("/:id/:number")
    async playStream(
    @Param() params: ParamsDto,
    @Query() query: QueryDto,
    ) {
      const { id, number = 1 } = params;

      return await this.playService.playEpisodeStream(id, number, query);
    }
}
