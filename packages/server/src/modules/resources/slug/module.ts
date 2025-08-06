import { Module } from "@nestjs/common";
import { ResourceSlugService } from "./service";

@Module( {
  imports: [
  ],
  controllers: [
  ],
  providers: [
    ResourceSlugService,
  ],
  exports: [ResourceSlugService],
} )
export class ResourcesSlugModule {}
