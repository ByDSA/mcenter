import { createZodDto } from "nestjs-zod";
import z from "zod";

const updateEpisodesFileRequestSchema = z.object( {
  forceHash: z.enum(["0", "1", "true", "false"]).optional(),
} );

export class UpdateEpisodesFileReqQueryDto
  extends createZodDto(updateEpisodesFileRequestSchema) {}
