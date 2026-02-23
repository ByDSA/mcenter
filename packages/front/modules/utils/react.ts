import { useState } from "react";

export type SetState<T> = ReturnType<typeof useState<T>>[1];
