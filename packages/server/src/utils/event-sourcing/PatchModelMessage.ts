type PatchModelMessage<M extends Object, ID extends Object> = {
  entityId: ID;
  key: keyof M;
  value: M[keyof M];
};

export default PatchModelMessage;