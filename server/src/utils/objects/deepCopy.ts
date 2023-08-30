/* eslint-disable import/prefer-default-export */
export function deepCopy(obj: object) {
  return JSON.parse(JSON.stringify(obj));
}