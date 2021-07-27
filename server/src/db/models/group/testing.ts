/* eslint-disable import/prefer-default-export */
import { checkResource } from "../resource";
import Doc from "./document";
import Interface from "./interface";

export function check(actual: Doc | null, expected: Interface) {
  checkResource(actual, expected);

  // TODO: check visibility, type...
  // TODO: check content
}
