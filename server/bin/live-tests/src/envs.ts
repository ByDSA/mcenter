import { CustomErrorParams, z } from "zod";

export const envSchema = z.object( {
  SMTP_HOST: z.string(),
  SMTP_USER: z.string().email(),
  SMTP_PASSWORD: z.string(),
  SMTP_DEFAULT_TO: z.string().email(),
} );
const envs: z.infer<typeof envSchema> = process.env as any;

export default envs;

function isPort(port: string): boolean {
  const p = Number(port);

  return p.toString() === port && Number.isInteger(p) && p >= 0 && p <= 65535;
}

type Refinement = [(s: string)=> boolean, CustomErrorParams | string];
function isAbsolutePathFileRefine(): Refinement {
  return [
    (path) => path.startsWith("/") && path.split("/").length > 1,
    "Absolute path file",
  ];
}

function isStringPositiveIntegerRefine(): Refinement {
  return [
    (str: string) => {
      const n = Number(str);

      return n.toString() === str && Number.isInteger(n) && n >= 0;
    },
    {
      message: "String positive integer",
    },
  ];
}
function isStringIntegerRefine(): Refinement {
  return [
    (str: string) => {
      const n = Number(str);

      return n.toString() === str && Number.isInteger(n);
    },
    {
      message: "String positive integer",
    },
  ];
}

export const serverEnvSchema = z.object( {
  PORT: z.string().refine(isPort),
  MONGO_HOSTNAME: z.string(),
  MONGO_DB: z.string(),
  MONGO_PORT: z.string().refine(isPort),
  MONGO_USER: z.string(),
  MONGO_PASSWORD: z.string(),

  FRONTEND_URL: z.string().url(),

  SCHEDULE_FILE: z.string().refine(...isAbsolutePathFileRefine()),
  TAG_FILE: z.string().refine(...isAbsolutePathFileRefine()),
  CALENDAR_FILE: z.string().refine(...isAbsolutePathFileRefine()),

  PICKER_MIN_DAYS: z.string().refine(...isStringPositiveIntegerRefine()),
  PICKER_MIN_WEIGHT: z.string().refine(...isStringIntegerRefine()),

  MEDIA_PATH: z.string().url(),
  MEDIA_FOLDER_PATH: z.string().refine(...isAbsolutePathFileRefine()),
  TMP_PATH: z.string(),

  VLC_HTTP_PORT: z.string().refine(isPort),
  VLC_HTTP_PASSWORD: z.string(),
} );

export const serverEnvs: z.infer<typeof serverEnvSchema> = process.env as any;
