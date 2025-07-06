import { Controller, Get } from "@nestjs/common";
import { container } from "tsyringe";
import { UpdateRemoteTreeService, UpdateResult } from "../services";

@Controller("/update/remote")
export class MusicUpdateRemoteController {
  constructor(
    // eslint-disable-next-line max-len
    private readonly updateRemoteTreeService: UpdateRemoteTreeService = container.resolve(UpdateRemoteTreeService),
  ) {
  }

  @Get("/")
  all(): Promise<UpdateResult> {
    return this.updateRemoteTreeService.update();
  }
}
