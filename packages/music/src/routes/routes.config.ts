/* eslint-disable import/prefer-default-export */
import { assertEnv } from "../env";

assertEnv();
export const {SERVER} = process.env;
