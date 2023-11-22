import { Component } from "./common";

type DatabaseOptions = {
  useDBTest?: boolean;
};

export type DatabaseComponent = Component<DatabaseOptions>;