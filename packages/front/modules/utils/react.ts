import { useState } from "react";

export type PropsOf<T> = T extends React.ElementType
  ? React.ComponentPropsWithoutRef<T>
  : never;

export type SetState<T> = ReturnType<typeof useState<T>>[1];
