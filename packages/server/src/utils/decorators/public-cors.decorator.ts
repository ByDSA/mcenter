import { Header } from "@nestjs/common";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PublicCors = () => Header("Access-Control-Allow-Origin", "*");
