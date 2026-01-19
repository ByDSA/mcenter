import { JSX, useState } from "react";

export type PropsOf<T extends (props: unknown)=> JSX.Element> = Parameters<T>[0];

export type SetState<T> = ReturnType<typeof useState<T>>[1];
