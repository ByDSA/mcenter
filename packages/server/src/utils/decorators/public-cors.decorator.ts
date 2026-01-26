import { Header } from "@nestjs/common";

export const PublicCors = () => Header("Access-Control-Allow-Origin", "*");
