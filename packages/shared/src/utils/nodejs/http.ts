/* eslint-disable import/prefer-default-export */
import { Server } from "http";
import { AddressInfo } from "net";

export function getPortFromServer(server: Server): number {
  const {port} = server.address() as AddressInfo;

  return port;
}