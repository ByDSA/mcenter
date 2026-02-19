import { Body, Controller, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { GetOneById, GetManyCriteria, UserCreateOne, AdminCreateOne, UserPatchOne, AdminPatchOne, UserDeleteOne, AdminDeleteOne, GetAll } from "#utils/nestjs/rest";
import { IdParamDto } from "#utils/validation/dtos";
import { myEntityEntitySchema } from "../../models";
import { MyEntityRepository } from "./repositories/my-entity";
// DTOs come from $shared — define schemas there first
import { MyEntityCrudDtos } from "$shared/models/my-entity/dto/transport";

class GetManyBodyDto extends createZodDto(MyEntityCrudDtos.GetMany.criteriaSchema) {}
class CreateBodyDto extends createZodDto(MyEntityCrudDtos.CreateOne.bodySchema) {}
class PatchBodyDto extends createZodDto(MyEntityCrudDtos.Patch.bodySchema) {}

@Controller("/")
export class MyEntityCrudController {
  constructor(
    private readonly repo: MyEntityRepository
  ) {}

  @GetOneById(myEntityEntitySchema)
  getOneById(
    @Param() params: IdParamDto
  ) {
    return this.repo.getOneById(params.id);
  }

  @GetManyCriteria(myEntityEntitySchema)
  getManyByCriteria(
    @Body() body: GetManyBodyDto
  ) {
    return this.repo.getMany(body);
  }

  @GetAll(myEntityEntitySchema)
  async getAll() {
    return await this.repo.getAll();
  }

  @UserCreateOne(myEntityEntitySchema)
  // or
  @AdminCreateOne(myEntityEntitySchema)
  createOne(
    @Body() body: CreateBodyDto
  ) {
    return this.repo.createOneAndGet(body);
  }

  @UserPatchOne(myEntityEntitySchema)
  // or
  @AdminPatchOne(myEntityEntitySchema)
  patchOne(
    @Param() params: IdParamDto,
    @Body() body: PatchBodyDto
  ) {
    return this.repo.patchOneByIdAndGet(params.id, body);
  }

  @UserDeleteOne(myEntityEntitySchema)
  // or
  @AdminDeleteOne(myEntityEntitySchema)
  deleteOne(
    @Param() params: IdParamDto
  ) {
    return this.repo.deleteOneByIdAndGet(params.id);
  }
}