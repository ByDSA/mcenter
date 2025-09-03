import { musicEntitySchema } from "../music";
import { A_AOT4 } from "./fixtures";

it("parsing", () => {
  const test = musicEntitySchema.parse(A_AOT4);

  expect(test).toBeDefined();

  expect(test.timestamps.createdAt).toBeInstanceOf(Date);
} );
