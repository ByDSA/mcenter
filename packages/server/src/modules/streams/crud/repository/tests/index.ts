import { createMockProvider } from "#utils/nestjs/tests";
import { StreamsRepository } from "..";

export const streamsRepositoryMockProvider = createMockProvider(StreamsRepository);
