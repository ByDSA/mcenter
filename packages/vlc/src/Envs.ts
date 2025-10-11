import dotenv from "dotenv";
import z from "zod";

const pathSchema = z
  .string()
  .refine(
    (path) => path.length > 0 && !path.includes("\0"),
    {
      message: "Invalid path",
    },
  );

export const envsSchema = z.object( {
  VLC_HTTP_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int()
      .min(1)
      .max(65535)),
  VLC_HTTP_PASSWORD: z.string(),
  SERVER: z.string().url(),
  SECRET_TOKEN: z.string(),
  MEDIA_PATH: pathSchema,
  TMP_PATH: pathSchema,
} );

export type Envs = z.infer<typeof envsSchema>;
let envs: Envs;

function loadEnvs(): Envs {
  dotenv.config();

  envs = envsSchema.parse(process.env);

  return envs;
}

export function getEnvs() {
  if (!envs)
    loadEnvs();

  return envs;
}
