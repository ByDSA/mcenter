import { Body, Controller, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { MusicEntity, musicEntitySchema } from "#musics/models";
import { DeleteOne, GetManyCriteria, GetOne, PatchOne } from "#utils/nestjs/rest";
import { MusicsRepository } from "./repository";

class GetOneByIdParamsDto extends createZodDto(MusicCrudDtos.GetOne.ById.paramsSchema) {}
class GetManyByCriteriaDto extends createZodDto(MusicCrudDtos.GetMany.criteriaSchema) {}
class PatchParamsDto extends createZodDto(MusicCrudDtos.PatchOneById.paramsSchema) {}
class DeleteOneParamsDto extends createZodDto(MusicCrudDtos.DeleteOneById.paramsSchema) {}
class PatchBodyDto extends createZodDto(MusicCrudDtos.PatchOneById.bodySchema) {}

@Controller("/")
export class MusicCrudController {
  constructor(
    private readonly musicRepo: MusicsRepository,
  ) {
  }

  @GetManyCriteria("/search", musicEntitySchema)
  async getManyByCriteria(
    @Body() criteria: GetManyByCriteriaDto,
  ): Promise<MusicEntity[]> {
    return await this.musicRepo.getManyByCriteria(criteria);
  }

  @PatchOne(":id", musicEntitySchema)
  async patchOneByIdAndGet(
    @Param() params: DeleteOneParamsDto,
    @Body() body: PatchBodyDto,
  ) {
    const { id } = params;

    return await this.musicRepo.patchOneByIdAndGet(id, body);
  }

  @DeleteOne(":id", musicEntitySchema)
  async deleteOneByIdAndGet(
    @Param() params: PatchParamsDto,
  ) {
    const { id } = params;

    return await this.musicRepo.deleteOneByIdAndGet(id);
  }

  @GetOne("/:id", musicEntitySchema)
  async getOneById(
    @Param() params: GetOneByIdParamsDto,
  ): Promise<MusicEntity | null> {
    const { id } = params;

    return await this.musicRepo.getOneById(id);
  }
}
