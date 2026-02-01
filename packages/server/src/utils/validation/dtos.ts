import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { createZodDto } from "nestjs-zod";
import z from "zod";

export class IdParamDto extends createZodDto(
  z.object( {
    id: mongoDbId,
  } ),
) {}
