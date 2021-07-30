import { loadEnv } from "@actions/utils/env";

loadEnv();
export const PORT = +(process.env.PORT ?? 8081);

export const HOST = process.env.HOST ?? "192.168.1.2";
