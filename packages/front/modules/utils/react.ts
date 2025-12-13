import { JSX } from "react";

export type PropsOf<T extends (props: unknown)=> JSX.Element> = Parameters<T>[0];
