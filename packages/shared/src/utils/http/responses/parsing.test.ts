import { MusicEntity, musicEntitySchema } from "../../../models/musics";
import { A_AOT4 } from "../../../models/musics/tests/fixtures";
import { createPaginatedResultResponseSchema, PaginatedResult } from "./data-response";

it("parsing", () => {
  const schema = createPaginatedResultResponseSchema(musicEntitySchema);
  const obj: PaginatedResult<MusicEntity> = {
    data: [A_AOT4],
  };
  const test = schema.parse(obj);

  expect(test).toBeDefined();

  expect(test.data[0].timestamps.createdAt).toBeInstanceOf(Date);
} );
