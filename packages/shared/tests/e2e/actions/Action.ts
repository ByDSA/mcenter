import { Page } from "@playwright/test";

type Props = {
  page: Page;
};
export type Action<T = object, R = unknown> = (props: Props & T)=> Promise<R>;
