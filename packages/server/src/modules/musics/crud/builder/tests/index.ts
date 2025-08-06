import { Provider } from "@nestjs/common";
import { createMockClass } from "$sharedTests/jest/mocking";
import { MusicBuilderService } from "../music-builder.service";

class Mock extends createMockClass(MusicBuilderService) {}

export const musicBuilderServiceMockProvicer: Provider = {
  provide: MusicBuilderService,
  useClass: Mock,
};
