import { Express } from "express";
import { GlobalConfigOptions } from "../config";
import { initializeComponent } from "./common";
import { CronComponent } from "./cron";
import { DatabaseComponent } from "./database";
import { DocsComponent } from "./docs";
import { I18nComponent } from "./i18n";
import { RoutesComponent } from "./routes";

export type Components = {
  database?: DatabaseComponent;
  i18n?: I18nComponent;
  docs?: DocsComponent;
  cron?: CronComponent;
  routes?: RoutesComponent;
};

type Params = {
  app: Express;
  components: Components;
  config?: GlobalConfigOptions;
};
export function initializeComponents( {app, components}: Params) {
  const {database, i18n, docs, cron} = components;

  if (database)
    initializeComponent(app, database);

  if (i18n)
    initializeComponent(app, i18n);

  if (docs)
    initializeComponent(app, docs);

  if (cron)
    initializeComponent(app, cron);
}