/* eslint-disable import/prefer-default-export */
import { loadEnv } from "../env";

loadEnv();
export const {SERVER} = process.env;
