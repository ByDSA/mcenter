import config from "@app/config";

export const USER = `${config.routes.api}/user`;

export const GET = `${USER}/get/:username`;

export const GET_GROUP = `${GET}/group/:group`;
