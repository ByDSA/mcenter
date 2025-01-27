import { assertIsDefined } from "#shared/utils/validation";
import dotenv from "dotenv";

export type Envs = Readonly<{
  VLC_HTTP_PORT: number;
  VLC_HTTP_PASSWORD: string;
  WS_SERVER_HOST: string;
  WS_SERVER_PATH: string;
  WS_SERVER_PORT: number;
  MEDIA_PATH: string;
  TMP_PATH: string;
}>;

let envs: Envs;

function loadEnvs(): Envs {
  dotenv.config();

  const password = process.env.VLC_HTTP_PASSWORD;
  const port = process.env.VLC_HTTP_PORT;

  assertIsDefined(password, "VLC_HTTP_PASSWORD");

  assertIsDefined(port, "VLC_HTTP_PORT");

  const { WS_SERVER_HOST, WS_SERVER_PATH } = process.env;
  const WS_SERVER_PORT = Number(process.env.WS_SERVER_PORT);

  assertIsDefined(WS_SERVER_HOST, "WS_SERVER_HOST is not defined");
  assertIsDefined(WS_SERVER_PATH, "WS_SERVER_PATH is not defined");
  assertIsDefined(WS_SERVER_PORT, "WS_SERVER_PORT is not defined");

  if (Number.isNaN(WS_SERVER_PORT))
    throw new Error("WS_SERVER_PORT is not a number");

  const { MEDIA_PATH } = process.env;

  assertIsDefined(MEDIA_PATH, "MEDIA_PATH is not defined");

  const { TMP_PATH } = process.env;

  assertIsDefined(TMP_PATH, "TMP_PATH is not defined");

  envs = Object.freeze( {
    VLC_HTTP_PASSWORD: password,
    VLC_HTTP_PORT: +port,
    WS_SERVER_HOST,
    WS_SERVER_PATH,
    WS_SERVER_PORT,
    MEDIA_PATH,
    TMP_PATH,
  } );

  return envs;
}

export function getEnvs() {
  if (!envs)
    loadEnvs();

  return envs;
}
