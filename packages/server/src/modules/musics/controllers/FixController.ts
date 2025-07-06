import { Controller, Param } from "@nestjs/common";
import { container } from "tsyringe";
import { musicVoSchema } from "#shared/models/musics/VO";
import { GetOne } from "#utils/nestjs/rest";
import { MusicRepository } from "../repositories";

const API = "/api";
const CREATE = `${API}/create`;
const ROUTE_CREATE_YT = `${CREATE}/yt`;

@Controller("/update/fix")
export class MusicFixController {
  constructor(
    private readonly musicRepository: MusicRepository = container.resolve(MusicRepository),
  ) {
  }

  @GetOne(`${ROUTE_CREATE_YT}/:id`, musicVoSchema)
  get(@Param() params: any) {
    const { id } = params;

    return this.musicRepository.findOrCreateOneFromYoutube(id);
  }
}
