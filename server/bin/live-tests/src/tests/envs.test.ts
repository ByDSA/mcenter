import { envSchema, serverEnvSchema } from "../envs";

it("live test envs", () => {
  envSchema.parse(process.env);
} );
it("server envs", () => {
  serverEnvSchema.parse(process.env);
} );