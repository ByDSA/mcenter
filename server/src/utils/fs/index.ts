import { execPromisify } from "../process";

export function makeDir(folder: string) {
  return execPromisify(`mkdir ${folder}`);
}

export function makeDirIfNotExits(folder: string) {
  return execPromisify(`mkdir -p ${folder}`);
}

export function copyFile(from: string, to: string) {
  return execPromisify(`cp ${from} ${to}`);
}

export function moveFile(from: string, to: string) {
  return execPromisify(`mv ${from} ${to}`);
}

export function deleteFolder(folder: string) {
  return execPromisify(`rm -r ${folder}`);
}

export * from "./errors";
