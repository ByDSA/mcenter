import config from "@app/config";

export const USER = `${config.routes.api}/user`;

export const GET = `${USER}/get/:userName`;

export const GET_GROUP = `${GET}/group/:groupUrl`;

export const GET_SERIE = `${GET}/serie/:serieUrl`;
