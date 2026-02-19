import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MyEntityCrudController } from "./controller";
import { MyEntityRepository } from "./repositories/my-entity";

@Module({
  imports: [DomainEventEmitterModule],
  controllers: [MyEntityCrudController],
  providers: [MyEntityRepository],
  exports: [MyEntityRepository],
})
export class MyEntityCrudModule {}