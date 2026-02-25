import { Body, Controller, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { movieEntitySchema } from "$shared/models/movies";
import { MovieCrudDtos } from "$shared/models/movies/dto/transport";
import { UserPayload } from "$shared/models/auth";
import { IdParamDto } from "#utils/validation/dtos";
import { GetOneById, GetManyCriteria, UserCreateOne, AdminPatchOne, AdminDeleteOne, GetAll } from "#utils/nestjs/rest";
import { User } from "#core/auth/users/User.decorator";
import { MovieRepository } from "./repositories/movie";

class GetManyBodyDto extends createZodDto(MovieCrudDtos.GetMany.criteriaSchema) {}
class CreateBodyDto extends createZodDto(MovieCrudDtos.CreateOne.bodySchema) {}
class PatchBodyDto extends createZodDto(MovieCrudDtos.Patch.bodySchema) {}

const schema = movieEntitySchema;

@Controller("/")
export class MovieCrudController {
  constructor(
    private readonly repo: MovieRepository,
  ) {}

  @GetOneById(schema)
  getOneById(
    @Param() params: IdParamDto,
  ) {
    return this.repo.getOneById(params.id);
  }

  @GetManyCriteria(schema)
  getManyByCriteria(
    @Body() body: GetManyBodyDto,
  ) {
    return this.repo.getManyByCriteria(body);
  }

  @GetAll(schema)
  async getAll() {
    return await this.repo.getAll();
  }

  @UserCreateOne(schema)
  createOne(
    @Body() body: CreateBodyDto,
    @User() user: UserPayload,
  ) {
    return this.repo.createOneAndGet( {
      ...body,
      uploaderUserId: user.id,
    } );
  }

  @AdminPatchOne(schema)
  patchOne(
    @Param() params: IdParamDto,
    @Body() body: PatchBodyDto,
  ) {
    return this.repo.patchOneByIdAndGet(params.id, body);
  }

  @AdminDeleteOne(schema)
  deleteOne(
    @Param() params: IdParamDto,
  ) {
    return this.repo.deleteOneByIdAndGet(params.id);
  }
}
