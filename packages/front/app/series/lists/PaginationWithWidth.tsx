import type { ComponentProps } from "react";
import type PaginationWithWidthClient from "./PaginationWithWidthClient";
import dynamic from "next/dynamic";

const PaginationWithWidth = dynamic<ComponentProps<typeof PaginationWithWidthClient>>(
  () => import("./PaginationWithWidthClient"),
  {
    ssr: false,
  },
);

export {
  PaginationWithWidth,
};
