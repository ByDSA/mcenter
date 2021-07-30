import { API } from "../routes.config";

export const USER = `${API}/user`;

export const GET = `${USER}/get/:username`;

export const GET_GROUP = `${GET}/group/:group`;
