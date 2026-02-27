import { BreadcrumbItem } from "./BreadcrumbsView/Breadcrumbs";

export type BreadcrumbResult = {
  items: BreadcrumbItem[];

  /**
   * When true, the orchestrator stops walking up the path tree.
   * Use this when your handler already resolves the full ancestor chain.
   */
  stopChain?: boolean;
};

type Params = {
  pathname: string;
  segment: string;
};
export type GetBreadcrumb = (params: Params)=> Promise<BreadcrumbResult>;

export type BreadcrumbRegistryEntry = {
  readonly matcher: (params: Params)=> boolean;
  readonly handler: GetBreadcrumb;
};
