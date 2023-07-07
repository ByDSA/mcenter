import { Express } from "express";

type Initializator<O> = (app: Express, options?: O)=> void;

export type Component<O> = {
  options: O;
  initializator: Initializator<O>;
};

export function initializeComponent<O>(app: Express, component: Component<O>) {
  component.initializator(app, component.options);
}