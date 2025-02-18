export type PatchModelMessage<M extends object, ID extends unknown> = {
  entityId: ID;
  key: keyof M;
  value: M[keyof M];
};
