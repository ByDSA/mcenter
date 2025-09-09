import { Controller, Get } from "@nestjs/common";
import { ValidateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { TaskService } from "#core/tasks/task.service";
import { UpdateRemoteTreeService, UpdateResult, updateResultSchema } from "./service";

@Controller("/update-remote")
export class MusicUpdateRemoteController {
  constructor(
    private readonly updateRemoteTreeService: UpdateRemoteTreeService,
    private readonly tasksService: TaskService,
  ) {
  }

  @Get("/")
  @ValidateResponseWithZodSchema(updateResultSchema)
  all(): Promise<UpdateResult> {
    return this.updateRemoteTreeService.update();
  }
}
