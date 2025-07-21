import { Controller, Get } from "@nestjs/common";
import { ValidateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { UpdateRemoteTreeService, UpdateResult, updateResultSchema } from "../services";

@Controller("/update/remote")
export class MusicUpdateRemoteController {
  constructor(
    private readonly updateRemoteTreeService: UpdateRemoteTreeService,
  ) {
  }

  @Get("/")
  @ValidateResponseWithZodSchema(updateResultSchema)
  all(): Promise<UpdateResult> {
    return this.updateRemoteTreeService.update();
  }
}
