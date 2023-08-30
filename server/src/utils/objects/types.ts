/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */
export type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];

export type RequiredKeys<T> = Exclude<KeysOfType<T, Exclude<T[keyof T], undefined>>, undefined>;

export type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

export type OnlyWithRequiredKeys<T> = Pick<T, RequiredKeys<T>>;